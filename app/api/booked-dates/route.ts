import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  // Only show confirmed bookings or non-expired pending bookings as booked
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { status: 'confirmed' },
        {
          status: 'pending',
          expiresAt: {
            gt: new Date() // Only pending bookings that haven't expired
          }
        }
      ]
    },
    select: {
      eventDate: true
    }
  })

  const bookedDates = bookings.map(b => b.eventDate)

  return NextResponse.json(bookedDates)
}