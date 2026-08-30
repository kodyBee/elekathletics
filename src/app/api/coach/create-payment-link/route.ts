import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { SESSION_COOKIE, getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientName, description, price, billingCycle } = await request.json();

    if (!clientName || !description || !price || !billingCycle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stripe = getStripe();
    
    // 1. Create a Product
    const product = await stripe.products.create({
      name: `${description} - ${clientName}`,
      description: `Custom plan for ${clientName}`,
    });

    // 2. Create a Price
    const priceAmount = Math.round(parseFloat(price) * 100); // convert to cents
    
    const priceData: any = {
      product: product.id,
      unit_amount: priceAmount,
      currency: "usd",
    };
    
    if (billingCycle === "recurring") {
      priceData.recurring = { interval: "month" };
    }

    const stripePrice = await stripe.prices.create(priceData);

    // 3. Create a Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      metadata: {
        clientName,
      },
    });

    return NextResponse.json({ url: paymentLink.url });
  } catch (error: any) {
    console.error("[Stripe] Failed to create payment link:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment link" }, { status: 500 });
  }
}
