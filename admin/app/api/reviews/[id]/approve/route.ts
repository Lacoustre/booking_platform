import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.review.update({
    where: { id: params.id },
    data: { approved: true },
  });
  return NextResponse.json({ success: true });
}