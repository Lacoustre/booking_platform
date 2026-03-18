import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const data = await req.json()

  if (!data.name || !data.email || !data.rating || !data.message) {
    return NextResponse.json({
      success: false,
      message: "Missing required fields"
    })
  }

  try {
    const review = await prisma.review.create({
      data
    })

    return NextResponse.json({
      success: true,
      reviewId: review.id
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: "Failed to submit review"
    })
  }
}

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: {
      approved: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return NextResponse.json(reviews)
}