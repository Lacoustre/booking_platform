import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/email"
import { NextResponse } from "next/server"
import LRU from "lru-cache"

const rateLimit = new LRU({
  max: 100,
  ttl: 60 * 1000 // 1 minute
})

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous"

  const tokenCount = rateLimit.get(ip) || 0

  if (tokenCount > 5) {
    return NextResponse.json({
      success: false,
      message: "Too many requests. Please try again later."
    })
  }

  rateLimit.set(ip, tokenCount + 1)

  try {
    const data = await req.json()

    if (!data.name || !data.email || !data.eventDate) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      })
    }

    const booking = await prisma.booking.create({
      data: {
        ...data,
        status: 'pending',
        paymentStatus: 'unpaid',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      }
    })

    // Send notification email to business
    await resend.emails.send({
      from: "Trayart Booking <bookings@trayartgh.com>",
      to: "trayartgh@gmail.com",
      subject: "New Booking Request (Pending Payment)",
      html: `
        <h2>New Booking Request - Pending Payment</h2>
        <p><strong>Status:</strong> Pending Payment</p>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Date:</strong> ${data.eventDate}</p>
        <p><strong>Event:</strong> ${data.eventType}</p>
        <p><strong>Package:</strong> ${data.package}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Message:</strong> ${data.message || 'None'}</p>
        <p><em>This booking will be confirmed once payment is received.</em></p>
      `
    })

    // Send confirmation email to customer
    await resend.emails.send({
      from: "Trayart GH <bookings@trayartgh.com>",
      to: data.email,
      subject: "Complete Your Booking Payment",
      html: `
        <h2>Complete Your Trayart GH Booking</h2>
        <p>Hi ${data.name},</p>
        <p>Your booking request for <strong>${data.eventDate}</strong> has been received.</p>
        <p><strong>Next Step:</strong> Please complete your deposit payment to confirm your booking.</p>
        <p>You will be redirected to our secure payment page shortly.</p>
        <p>Once payment is confirmed, Tracy will contact you to finalize all details.</p>
        <p>Trayart GH Makeover</p>
      `
    })

    return NextResponse.json({
      success: true,
      bookingId: booking.id
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: "This date is already booked"
    })
  }
}