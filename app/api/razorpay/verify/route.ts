import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment Verified! Apply plan logic.
    const userId = session.user.id;

    if (plan === "SILVER") {
      await db.user.update({
        where: { id: userId },
        data: { bonusRequests: { increment: 10 } }
      });
    } else if (plan === "GOLD") {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // Valid for 30 days
      await db.user.update({
        where: { id: userId },
        data: { plan: "GOLD", planExpires: expires }
      });
    } else if (plan === "PLATINUM") {
      const expires = new Date();
      expires.setDate(expires.getDate() + 365); // Valid for 1 Year
      await db.user.update({
        where: { id: userId },
        data: { plan: "PLATINUM", planExpires: expires }
      });
    }

    return NextResponse.json({ success: true, message: "Subscription updated successfully!" });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
