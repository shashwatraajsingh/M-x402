import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/protected/crypto-prices
 * 
 * A demo protected API that requires x402 payment to access.
 * Fetches live cryptocurrency prices from CoinGecko API.
 * 
 * This looks like a free API! 🎉
 * All payment logic is handled in middleware.ts before the request reaches here.
 */
export async function GET(request: NextRequest) {
  // Just return your data - payment already verified by middleware!
  
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true&include_market_cap=true',
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }
    
    const data = await response.json();
    
    const cryptoData = {
      timestamp: new Date().toISOString(),
      prices: {
        bitcoin: {
          usd: data.bitcoin.usd,
          change_24h: data.bitcoin.usd_24h_change,
          market_cap: data.bitcoin.usd_market_cap,
        },
        ethereum: {
          usd: data.ethereum.usd,
          change_24h: data.ethereum.usd_24h_change,
          market_cap: data.ethereum.usd_market_cap,
        },
        solana: {
          usd: data.solana.usd,
          change_24h: data.solana.usd_24h_change,
          market_cap: data.solana.usd_market_cap,
        },
        cardano: {
          usd: data.cardano.usd,
          change_24h: data.cardano.usd_24h_change,
          market_cap: data.cardano.usd_market_cap,
        },
      },
      premium: true,
    };

    return NextResponse.json(cryptoData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    );
  }
}

