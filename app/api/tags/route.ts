import { NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET() {
  const { error } = await authenticate();
  if (error) return error;

  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { businesses: true, people: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tags);
}

export async function POST(req: Request) {
  const { error } = await authenticate();
  if (error) return error;

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  try {
    const tag = await prisma.tag.create({
      data: { name },
    });
    return NextResponse.json(tag, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Tag already exists" },
      { status: 409 }
    );
  }
}
