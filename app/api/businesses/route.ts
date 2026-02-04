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

  const businesses = await prisma.business.findMany({
    include: {
      categories: { include: { category: { select: { id: true, name: true } } } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      _count: { select: { people: true, categories: true, tags: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(req: Request) {
  const { error } = await authenticate();
  if (error) return error;

  const { name, description, tagIds, categoryIds } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  const uniqueTagIds = normalizeIds(tagIds);
  const uniqueCategoryIds = normalizeIds(categoryIds);

  try {
    const business = await prisma.business.create({
      data: {
        name,
        description,
        tags:
          uniqueTagIds.length > 0
            ? { create: uniqueTagIds.map((tagId) => ({ tagId })) }
            : undefined,
        categories:
          uniqueCategoryIds.length > 0
            ? { create: uniqueCategoryIds.map((categoryId) => ({ categoryId })) }
            : undefined,
      },
      include: {
        people: { select: { id: true, firstName: true, lastName: true, email: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        categories: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Business already exists" },
      { status: 409 }
    );
  }
}
