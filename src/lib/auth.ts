import { cookies } from "next/headers";
import { verifyJwt } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

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
