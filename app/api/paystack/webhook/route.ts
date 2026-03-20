import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Only process successful payments
    if (event.event === "charge.success") {
      const { bookingId, package: pkg } = event.data.metadata;

      if (!bookingId) {
        console.error("No bookingId in webhook metadata");
        return NextResponse.json({ error: "No bookingId" }, { status: 400 });
      }

      try {
        // First check if booking is already paid to prevent duplicates
        const existingBooking = await prisma.booking.findUnique({
          where: { id: bookingId }
        });

        if (!existingBooking) {
          console.error(`Booking ${bookingId} not found`);
          return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (existingBooking.paymentStatus === "paid") {
          console.log(`Booking ${bookingId} already confirmed, skipping duplicate`);
          return NextResponse.json({ received: true });
        }

        // Update booking status in database
        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: "paid",
            status: "confirmed",
            paymentRef: event.data.reference,
            depositAmount: event.data.amount / 100
          }
        });

        console.log(`Payment confirmed for booking ${bookingId}`);
        
        // Send booking confirmation email to customer
        await resend.emails.send({
          from: "Trayart GH <bookings@trayartgh.com>",
          to: updatedBooking.email,
          subject: "Booking Confirmed - Payment Received",
          html: `
            <h2>🎉 Your Booking is Confirmed!</h2>
            <p>Hi ${updatedBooking.name},</p>
            <p>Great news! Your deposit payment has been received and your booking is now <strong>CONFIRMED</strong>.</p>
            <p><strong>Event Date:</strong> ${updatedBooking.eventDate}</p>
            <p><strong>Package:</strong> ${updatedBooking.package}</p>
            <p><strong>Payment Reference:</strong> ${event.data.reference}</p>
            <p>Tracy will contact you within 24 hours to discuss your vision and finalize all details.</p>
            <p>We can't wait to make you look absolutely stunning!</p>
            <p>Trayart GH Makeover</p>
          `
        });

        // Send notification to business
        await resend.emails.send({
          from: "Trayart Booking <bookings@trayartgh.com>",
          to: "trayartgh@gmail.com",
          subject: "Booking Confirmed - Payment Received",
          html: `
            <h2>✅ Booking Confirmed - Payment Received</h2>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Customer:</strong> ${updatedBooking.name}</p>
            <p><strong>Email:</strong> ${updatedBooking.email}</p>
            <p><strong>Phone:</strong> ${updatedBooking.phone}</p>
            <p><strong>Event Date:</strong> ${updatedBooking.eventDate}</p>
            <p><strong>Package:</strong> ${updatedBooking.package}</p>
            <p><strong>Amount Paid:</strong> GHS ${event.data.amount / 100}</p>
            <p><strong>Payment Reference:</strong> ${event.data.reference}</p>
            <p><em>Please contact the customer to finalize session details.</em></p>
          `
        });

      } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" }, 
      { status: 500 }
    );
  }
}