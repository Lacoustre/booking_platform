import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.booking.deleteMany({
    where: {
      paymentStatus: "unpaid",
      expiresAt: { lt: new Date() }
    }
  });

  return NextResponse.json({ deleted: deleted.count });
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.booking.deleteMany({
    where: {
      paymentStatus: "unpaid",
      expiresAt: { lt: new Date() }
    }
  });

  return NextResponse.json({ deleted: deleted.count });
}
