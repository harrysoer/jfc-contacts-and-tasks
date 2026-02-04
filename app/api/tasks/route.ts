import { NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  const { error } = await authenticate();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  console.log({status})

  const tasks = await prisma.task.findMany({
    ...(status && {where: { status: status as "PENDING" | "COMPLETED" }}),
    include: {
      business: { select: { id: true, name: true } },
      person: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const { error } = await authenticate();
  if (error) return error;

  const { title, description, status, dueDate, businessId, personId } =
    await req.json();

  if (!title) {
    return NextResponse.json(
      { message: "Title is required" },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || "PENDING",
      dueDate: dueDate ? new Date(dueDate) : null,
      businessId,
      personId,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
