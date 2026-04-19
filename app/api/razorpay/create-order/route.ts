import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    let amount = 0;

    switch (plan) {
      case "SILVER":
        amount = 10;
        break;
      case "GOLD":
        amount = 30;
        break;
      case "PLATINUM":
        amount = 150;
        break;
      default:
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: amount * 100, // exact amount in paise
      currency: "INR",
      receipt: `rcpt_${session.user.id.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        plan: plan,
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error: any) {
    console.error("Razorpay order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
