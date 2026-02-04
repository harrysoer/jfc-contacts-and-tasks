import { NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await authenticate();
  if (error) return error;

  const { id } = await params;
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      businesses: {
        include: { business: { select: { id: true, name: true } } },
      },
      people: {
        include: {
          person: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!tag) {
    return NextResponse.json({ message: "Tag not found" }, { status: 404 });
  }

  return NextResponse.json(tag);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await authenticate();
  if (error) return error;

  const { id } = await params;
  const { name } = await req.json();

  try {
    const tag = await prisma.tag.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(tag);
  } catch {
    return NextResponse.json(
      { message: "Tag not found or name conflict" },
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
    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ message: "Tag deleted" });
  } catch {
    return NextResponse.json({ message: "Tag not found" }, { status: 404 });
  }
}
