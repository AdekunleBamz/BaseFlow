import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Server-side proxy for Odos API (Base network) - returns quote with calldata for swap execution.
// Body (POST):
// - chainId: 8453 (Base)
// - inputTokens: [{ tokenAddress, amount }]
// - outputTokens: [{ tokenAddress, proportion: 1 }]
// - slippageLimitPercent
// - compact: true
export async function POST(req) {
  try {
    const body = await req.json();
    const { chainId, inputTokens, outputTokens, slippageLimitPercent, compact } = body;

    if (!chainId || !inputTokens?.[0] || !outputTokens?.[0]) {
      return NextResponse.json(
        { error: 'Missing required fields: chainId, inputTokens, outputTokens' },
        { status: 400 }
      );
    }

    const odosBody = {
      chainId,
      inputTokens,
      outputTokens,
      slippageLimitPercent: slippageLimitPercent || 0.5,
      compact: compact !== false,
      userAddr: body.userAddr || '',
    };

    const res = await fetch('https://api.odos.xyz/sor/quote/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(odosBody),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { error: text || 'Failed to parse response' };
    }

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }

    // Odos returns: { pathId, inAmount, outAmounts[], gasEstimate, data }
    // We need to call /sor/assemble to get the actual transaction calldata
    if (json.pathId) {
      try {
        const assembleRes = await fetch('https://api.odos.xyz/sor/assemble', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            pathId: json.pathId,
            userAddr: body.userAddr || '',
            receiver: body.receiver || body.userAddr || '',
            slippageLimitPercent: slippageLimitPercent || 0.5,
          }),
        });

        const assembleText = await assembleRes.text();
        let assembleJson;
        try {
          assembleJson = JSON.parse(assembleText);
        } catch {
          assembleJson = { error: assembleText };
        }

        if (assembleRes.ok && assembleJson?.transaction) {
          // Return in a format similar to 0x for compatibility
          return NextResponse.json({
            buyAmount: json.outAmounts?.[0] || '0',
            sellAmount: json.inAmount || inputTokens[0].amount,
            to: assembleJson.transaction.to,
            data: assembleJson.transaction.data,
            value: assembleJson.transaction.value || '0',
            allowanceTarget: assembleJson.transaction.to, // Odos router
            estimatedGas: json.gasEstimate,
            sources: (Array.isArray(json.path) && json.path.length > 0)
              ? json.path.map((p) => ({ name: p.name || p.dexName || 'Odos', proportion: p.proportion || 1 }))
              : (json.path ? [{ name: 'Odos', proportion: 1 }] : [{ name: 'Odos', proportion: 1 }]),
            pathId: json.pathId,
          });
        }
      } catch (assembleErr) {
        // If assemble fails, return quote without calldata
        return NextResponse.json({
          ...json,
          error: 'Failed to assemble transaction',
          assembleError: assembleErr.message,
        }, { status: 500 });
      }
    }

    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


