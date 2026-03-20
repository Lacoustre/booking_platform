import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const STATUS_LABELS: Record<string, string> = {
  "pending-payment": "Booking created — awaiting payment",
  "paid": "Deposit payment received",
  "confirmed": "Booking confirmed by Tracy",
  "in-progress": "Event in progress",
  "completed": "Event completed",
  "cancelled": "Booking cancelled",
  "refund-requested": "Refund requested",
};

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status, adminNotes } = await req.json();

  await prisma.booking.update({
    where: { id },
    data: {
      status,
      ...(adminNotes !== undefined && { adminNotes }),
      activity: {
        create: {
          action: STATUS_LABELS[status] || `Status changed to ${status}`,
          note: adminNotes || null,
        },
      },
    },
  });

  return NextResponse.json({ success: true });
}
