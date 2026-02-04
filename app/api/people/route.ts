import { NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

function normalizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return Array.from(new Set(ids.filter((id) => typeof id === "string" && id)));
}

export async function GET() {
  const { error } = await authenticate();
  if (error) return error;

  const people = await prisma.person.findMany({
    include: {
      business: { select: { id: true, name: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      _count: { select: { tags: true, tasks: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return NextResponse.json(people);
}

export async function POST(req: Request) {
  const { error } = await authenticate();
  if (error) return error;

  const { firstName, lastName, email, businessId, tagIds } = await req.json();

  if (!firstName || !lastName) {
    return NextResponse.json(
      { message: "First name and last name are required" },
      { status: 400 }
    );
  }

  const uniqueTagIds = normalizeIds(tagIds);

  try {
    const person = await prisma.person.create({
      data: {
        firstName,
        lastName,
        email,
        businessId,
        tags:
          uniqueTagIds.length > 0
            ? { create: uniqueTagIds.map((tagId) => ({ tagId })) }
            : undefined,
      },
      include: {
        business: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Person already exists" },
      { status: 409 }
    );
  }
}
