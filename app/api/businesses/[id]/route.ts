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
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      people: { select: { id: true, firstName: true, lastName: true, email: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      categories: {
        include: { category: { select: { id: true, name: true } } },
      },
    },
  });

  if (!business) {
    return NextResponse.json(
      { message: "Business not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(business);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await authenticate();
  if (error) return error;

  const { id } = await params;
  const { name, description, tagIds, categoryIds } = await req.json();
  const uniqueTagIds = normalizeIds(tagIds);
  const uniqueCategoryIds = normalizeIds(categoryIds);
  const tagsProvided = Array.isArray(tagIds);
  const categoriesProvided = Array.isArray(categoryIds);

  try {
    const business = await prisma.business.update({
      where: { id },
      data: {
        name,
        description,
        ...(tagsProvided
          ? {
              tags: {
                deleteMany: {},
                create: uniqueTagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
        ...(categoriesProvided
          ? {
              categories: {
                deleteMany: {},
                create: uniqueCategoryIds.map((categoryId) => ({
                  categoryId,
                })),
              },
            }
          : {}),
      },
      include: {
        people: { select: { id: true, firstName: true, lastName: true, email: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        categories: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json(business);
  } catch {
    return NextResponse.json(
      { message: "Business not found or name conflict" },
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
    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ message: "Business deleted" });
  } catch {
    return NextResponse.json(
      { message: "Business not found" },
      { status: 404 }
    );
  }
}
