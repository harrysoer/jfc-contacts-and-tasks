# JWT Authentication for Next.js (App Router) using httpOnly Cookies + Prisma

This document compiles the full authentication plan we discussed into a single, clean reference. It describes a **production-ready JWT authentication setup** for **Next.js App Router**, using **httpOnly cookies** for security and **Prisma ORM** for database access.

---

## Goals

* Protect API endpoints so only authenticated users can access them
* Store JWT securely using **httpOnly cookies**
* Prevent XSS token access
* Keep the implementation simple and framework-native

---

## Tech Stack

* Next.js (App Router)
* Prisma ORM
* JWT (`jsonwebtoken`)
* Password hashing (`bcrypt`)
* httpOnly cookies

---

## Authentication Flow

1. User logs in with email + password
2. Credentials are verified using Prisma
3. Server signs a JWT containing `userId`
4. JWT is stored in an **httpOnly cookie**
5. Browser automatically sends cookie on each request
6. Protected API routes:

   * read JWT from cookies
   * verify signature & expiration
   * fetch user via Prisma
   * allow or deny access

---

## Environment Variables

```env
JWT_SECRET=super-long-random-secret
JWT_EXPIRES_IN=7d
```

---

## JWT Utilities

**`lib/jwt.ts`**

```ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export type JwtPayload = {
  userId: string;
};

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
```

---

## Login Endpoint (Sets httpOnly Cookie)

**`app/api/auth/login/route.ts`**

```ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = signJwt({ userId: user.id });

  const response = NextResponse.json({
    id: user.id,
    email: user.email,
  });

  response.cookies.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
```

---

## Logout Endpoint (Clears Cookie)

**`app/api/auth/logout/route.ts`**

```ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "auth-token",
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
```

---

## Authentication Helper (Cookie-based)

**`lib/auth.ts`**

```ts
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function authenticate() {
  const token = cookies().get("auth-token")?.value;

  if (!token) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const payload = verifyJwt(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
    }

    return { user };
  } catch {
    return { error: NextResponse.json({ message: "Invalid token" }, { status: 401 }) };
  }
}
```

---

## Protecting API Routes

**`app/api/posts/route.ts`**

```ts
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, error } = await authenticate();
  if (error) return error;

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
  });

  return NextResponse.json(posts);
}
```

---

## Client-side Requests

Cookies are sent automatically, but explicitly including credentials is recommended:

```ts
fetch("/api/posts", {
  credentials: "include",
});
```

---

## Optional: Route Protection with Middleware

**`middleware.ts`**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

---

## Security Notes

* `httpOnly` cookies prevent XSS token theft
* `sameSite: 'lax'` protects against most CSRF attacks
* For high-risk mutations, consider:

  * CSRF tokens
  * `sameSite: 'strict'`
  * Double-submit cookie pattern

---

## Summary

* JWT is signed and verified server-side
* Stored securely in httpOnly cookies
* Prisma ensures user validity
* No token access from JavaScript
* Works cleanly with Next.js App Router

This setup is ideal for **web apps**, dashboards, and SaaS platforms.
