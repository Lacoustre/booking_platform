import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  // Clean up expired unpaid bookings on every call
  prisma.booking.deleteMany({
    where: {
      paymentStatus: "unpaid",
      expiresAt: { lt: new Date() }
    }
  }).catch(() => {})

  // Only show confirmed bookings or non-expired pending bookings as booked
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { status: { in: ['confirmed', 'paid', 'in-progress'] } },
        {
          status: 'pending-payment',
          expiresAt: { gt: new Date() }
        }
      ]
    },
    select: { eventDate: true }
  })

  const bookedDates = bookings.map(b => b.eventDate)

  return NextResponse.json(bookedDates)
}