import { NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const { error } = await authenticate();
  if (error) return error;

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { businesses: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { error } = await authenticate();
  if (error) return error;

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json(
      { message: "Name is required" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: { name },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Category already exists" },
      { status: 409 }
    );
  }
}
