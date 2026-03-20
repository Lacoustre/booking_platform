import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action } = await req.json();

  const actions: Record<string, () => Promise<unknown>> = {
    approve:   () => prisma.review.update({ where: { id }, data: { approved: true } }),
    unapprove: () => prisma.review.update({ where: { id }, data: { approved: false } }),
    feature:   () => prisma.review.update({ where: { id }, data: { featured: true } }),
    unfeature: () => prisma.review.update({ where: { id }, data: { featured: false } }),
    verify:    () => prisma.review.update({ where: { id }, data: { verified: true } }),
    unverify:  () => prisma.review.update({ where: { id }, data: { verified: false } }),
    reject:    () => prisma.review.delete({ where: { id } }),
  };

  if (!actions[action]) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await actions[action]();
  return NextResponse.json({ success: true });
}
