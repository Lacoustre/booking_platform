import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")

  if (!date) {
    return NextResponse.json({ available: false })
  }

  // Only confirmed bookings or non-expired pending bookings should block dates
  const booking = await prisma.booking.findFirst({
    where: {
      eventDate: date,
      OR: [
        { status: 'confirmed' },
        {
          status: 'pending',
          expiresAt: {
            gt: new Date() // Only pending bookings that haven't expired
          }
        }
      ]
    }
  })

  return NextResponse.json({
    available: !booking
  })
}