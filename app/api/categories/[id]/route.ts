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
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      businesses: {
        include: { business: { select: { id: true, name: true } } },
      },
    },
  });

  if (!category) {
    return NextResponse.json(
      { message: "Category not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(category);
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
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { message: "Category not found or name conflict" },
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
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch {
    return NextResponse.json(
      { message: "Category not found" },
      { status: 404 }
    );
  }
}
