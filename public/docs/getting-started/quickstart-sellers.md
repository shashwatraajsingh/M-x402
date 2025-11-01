# Quickstart for Sellers

Add payment requirements to your Next.js API in 5 minutes with x402 middleware.

## Prerequisites

| Requirement | Version |
|-------------|---------|
| **Next.js** | 15.0.0+ with App Router |
| **Node.js** | 20.0.0+ |
| **TypeScript** | 5.x (recommended) |

## Installation

```bash
npm install monad-x402
```

> The package uses ethers.js for EVM compatibility with Monad.

## Step 1: Configure Wallet Address

You need a Monad wallet address to receive payments. The private key stays in your wallet - only the address is needed on your server.

### Option A: Use Existing Wallet

If you have MetaMask or any EVM wallet, copy your address (starts with `0x`).

### Option B: Generate Programmatically

```bash
npx tsx -e "import { ethers } from 'ethers'; const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

## Step 2: Configure Environment

Create `.env.local` in your project root:

```
PAYMENT_RECIPIENT_ADDRESS=0xYOUR_WALLET_ADDRESS
FACILITATOR_URL=https://monad-x402.vercel.app/api/facilitator
```

| Variable | Description |
|----------|-------------|
| `PAYMENT_RECIPIENT_ADDRESS` | Your Monad wallet address (receives payments) |
| `FACILITATOR_URL` | Service that handles blockchain operations |

> **Note:** The public facilitator URL shown above is free and works on both testnet and mainnet. You can optionally [self-host](../guides/facilitator-setup.md) for custom requirements.

## Step 3: Create Middleware

Create `middleware.ts` in your project root (same level as `app/` directory):

```typescript
import { paymentMiddleware } from 'monad-x402';

export const middleware = paymentMiddleware(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  {
    '/api/premium/crypto-prices': {
      price: '1000000000000000',  // 0.001 MON in wei
      network: 'testnet',
      config: {
        description: 'Live crypto price data',
        mimeType: 'application/json'
      }
    },
    '/api/premium/signals': {
      price: '5000000000000000',  // 0.005 MON in wei
      network: 'testnet',
      config: {
        description: 'Real-time trading signals'
      }
    }
  },
  {
    url: process.env.FACILITATOR_URL!
  }
);

export const config = {
  matcher: ['/api/premium/:path*']
};
```

### Configuration Explained

| Field | Purpose |
|-------|---------|
| **Route path** | Exact API endpoint path (e.g., `/api/premium/crypto-prices`) |
| **price** | Payment amount in wei (1 MON = 10^18 wei) |
| **network** | Blockchain network (`'testnet'` or `'mainnet'`) |
| **description** | Human-readable resource description |
| **matcher** | Pattern for routes the middleware applies to |

### Wei Pricing Reference

Monad uses **wei** as the smallest unit (standard EVM denomination):

```
1 MON = 1,000,000,000,000,000,000 wei (10^18)

Common prices:
  0.001 MON → 1,000,000,000,000,000 wei
  0.01 MON  → 10,000,000,000,000,000 wei
  0.1 MON   → 100,000,000,000,000,000 wei
```

## Step 4: Create API Routes

Your API routes require **zero payment logic** - write them as normal:

```typescript
// app/api/premium/crypto-prices/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // This code ONLY executes after successful payment
  
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
  );
  const data = await response.json();
  
  return NextResponse.json({
    bitcoin: data.bitcoin.usd,
    ethereum: data.ethereum.usd,
    premium: true
  });
}
```

### Payment Flow

The middleware automatically handles:

1. **No Payment** → Returns 402 with payment instructions
2. **Invalid Payment** → Returns 403 with error details
3. **Valid Payment** → Verifies → Settles → Executes your route → Returns 200

## Step 5: Test Your Setup

### Test Without Payment

```bash
npm run dev

# In another terminal
curl http://localhost:3000/api/premium/crypto-prices
```

Expected 402 response:
```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "monad-testnet",
    "maxAmountRequired": "1000000000000000",
    "payTo": "0xYOUR_WALLET_ADDRESS",
    "description": "Live crypto price data",
    "resource": "http://localhost:3000/api/premium/crypto-prices"
  }]
}
```

If you see this 402 response, your middleware is working correctly!

### Test With Payment

Use the client from [Quickstart for Buyers](quickstart-buyers.md):

```typescript
import { x402axios } from 'monad-x402';

const response = await x402axios.get('http://localhost:3000/api/premium/crypto-prices', {
  privateKey: process.env.MONAD_PRIVATE_KEY
});

console.log(response.data);
console.log('Paid:', response.paymentInfo?.transactionHash);
```

## Response Headers

Successful payments include these headers:

| Header | Description |
|--------|-------------|
| `X-PAYMENT-RESPONSE` | Payment receipt with transaction hash |
| `X-Verification-Time` | Milliseconds for payment verification |
| `X-Settlement-Time` | Milliseconds for blockchain settlement |

## Next Steps

### For Development

- Use testnet for all testing
- Get free testnet MON from Monad faucet
- Monitor transactions on [Monad Explorer](https://testnet-explorer.monad.xyz)

### For Production

1. **Deploy Own Facilitator** - See [Facilitator Setup](../guides/facilitator-setup.md)
2. **Switch to Mainnet** - Change `network: 'mainnet'` in configuration
3. **Monitor Performance** - Track verification and settlement times
4. **Implement Error Handling** - Handle payment failures gracefully

## Additional Resources

- [Quickstart for Buyers](quickstart-buyers.md) - Consume your protected API
- [HTTP 402 Protocol](../core-concepts/http-402.md) - Deep dive into the protocol
- [Facilitator Guide](../guides/facilitator-setup.md) - Self-hosting options
