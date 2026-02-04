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
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      business: { select: { id: true, name: true } },
      person: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await authenticate();
  if (error) return error;

  const { id } = await params;
  const { title, description, status, dueDate, businessId, personId } =
    await req.json();

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        businessId,
        personId,
      },
    });

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
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
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: "Task deleted" });
  } catch {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }
}
