const PADDLE_BASE = "https://api.paddle.com";

export interface PaddleProduct {
  id: string;
  name: string;
  description: string;
}

export interface PaddlePrice {
  id: string;
  product_id: string;
  unit_price: { amount: string; currency_code: string };
  name: string;
}

export interface CreatePriceInput {
  description: string;
  productId: string;
  unitPrice: number;
  currency?: string;
  trialDays?: number;
}

async function paddleFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${PADDLE_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paddle API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createPrice(input: CreatePriceInput): Promise<PaddlePrice> {
  const body: Record<string, unknown> = {
    description: input.description,
    product_id: input.productId,
    unit_price: {
      amount: input.unitPrice.toFixed(2),
      currency_code: input.currency || "USD",
    },
  };
  if (input.trialDays && input.trialDays > 0) {
    body.trial_period = { length: input.trialDays, interval: "day" };
  }
  const data = await paddleFetch("/prices", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data.data as PaddlePrice;
}

export async function listPrices(): Promise<PaddlePrice[]> {
  const data = await paddleFetch("/prices");
  return data.data as PaddlePrice[];
}

export async function listProducts(): Promise<PaddleProduct[]> {
  const data = await paddleFetch("/products");
  return data.data as PaddleProduct[];
}

export interface CreateTransactionResult {
  id: string;
  checkoutUrl: string;
}

// Create a hosted-checkout transaction and return the Paddle buy page URL.
// No client-side token required: customer is redirected to Paddle's hosted page.
export async function createCheckoutTransaction(
  priceId: string,
  productKey: string
): Promise<CreateTransactionResult> {
  const body: Record<string, unknown> = {
    items: [{ price_id: priceId, quantity: 1 }],
    custom_data: { product: productKey },
    checkout: {
      url: `https://www.getdocforge.net/r?product=${productKey}`,
    },
  };
  const data = await paddleFetch("/transactions", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const tx = data.data as { id: string; checkout?: { url?: string } };
  return {
    id: tx.id,
    checkoutUrl: `https://buy.paddle.com/checkout/?_ptxn=${tx.id}`,
  };
}
