import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Server-side proxy to avoid browser CORS issues and allow optional API key usage.
// Query params (required):
// - sellToken
// - buyToken
// - sellAmount
// Optional:
// - slippagePercentage
// - takerAddress
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const sellToken = searchParams.get('sellToken');
  const buyToken = searchParams.get('buyToken');
  const sellAmount = searchParams.get('sellAmount');
  const slippagePercentage = searchParams.get('slippagePercentage');
  const takerAddress = searchParams.get('takerAddress');

  if (!sellToken || !buyToken || !sellAmount) {
    return NextResponse.json(
      { error: 'Missing required params: sellToken, buyToken, sellAmount' },
      { status: 400 }
    );
  }

  const upstreamParams = new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount,
  });
  if (slippagePercentage) upstreamParams.set('slippagePercentage', slippagePercentage);
  if (takerAddress) upstreamParams.set('takerAddress', takerAddress);

  // 0x on Base uses the "swap/permit2/price/quote" v1 style but routed by host.
  const url = `https://base.api.0x.org/swap/v1/quote?${upstreamParams.toString()}`;

  const headers = {
    accept: 'application/json',
  };

  // Optional: user can set NEXT_PUBLIC / server env; keep server-side to avoid exposing keys in client bundles.
  const apiKey = process.env.ZEROX_API_KEY || process.env.NEXT_PUBLIC_ZEROX_API_KEY;
  if (apiKey) headers['0x-api-key'] = apiKey;

  const res = await fetch(url, { headers });
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { error: text };
  }

  return NextResponse.json(json, { status: res.status });
}


