import { NextResponse } from "next/server";
import { calculateDeposit } from "@/lib/deposit";
import { packagePrices } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, package: pkg, bookingId } = body;

    // Validate required fields
    if (!email || !pkg || !bookingId) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Get price from backend (not frontend)
    const price = packagePrices[pkg];

    if (!price) {
      return NextResponse.json(
        { error: "Invalid package" }, 
        { status: 400 }
      );
    }

    // Calculate deposit using secure logic
    const deposit = calculateDeposit(pkg, price);

    // Initialize Paystack transaction
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: deposit * 100, // Paystack expects amount in kobo
        metadata: {
          bookingId,
          package: pkg,
          fullPrice: price,
          depositAmount: deposit
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success`,
      })
    });

    const data = await res.json();

    if (!data.status) {
      return NextResponse.json(
        { error: "Payment initialization failed" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.authorization_url,
      reference: data.data.reference
    });

  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}