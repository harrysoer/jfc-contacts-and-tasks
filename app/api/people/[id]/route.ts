import { NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

function normalizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return Array.from(new Set(ids.filter((id) => typeof id === "string" && id)));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await authenticate();
  if (error) return error;

  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      business: { select: { id: true, name: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
    },
  });

  if (!person) {
    return NextResponse.json({ message: "Person not found" }, { status: 404 });
  }

  return NextResponse.json(person);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await authenticate();
  if (error) return error;

  const { id } = await params;
  const { firstName, lastName, email, businessId, tagIds } = await req.json();
  const uniqueTagIds = normalizeIds(tagIds);
  const tagsProvided = Array.isArray(tagIds);

  try {
    const person = await prisma.person.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        businessId,
        ...(tagsProvided
          ? {
              tags: {
                deleteMany: {},
                create: uniqueTagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: {
        business: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json(person);
  } catch {
    return NextResponse.json(
      { message: "Person not found or email conflict" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await authenticate();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.person.delete({ where: { id } });
    return NextResponse.json({ message: "Person deleted" });
  } catch {
    return NextResponse.json({ message: "Person not found" }, { status: 404 });
  }
}
