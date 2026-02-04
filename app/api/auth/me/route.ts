import { NextResponse } from "next/server";
import { authenticate } from "@/src/lib/auth";

export async function GET() {
  const { user, error } = await authenticate();
  if (error) return error;

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
