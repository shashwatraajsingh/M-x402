# MonX402

**HTTP 402 Payment Protocol Implementation for Monad**

MonX402 is a TypeScript SDK implementing the HTTP 402 Payment Required standard on Monad blockchain. It enables API monetization through cryptocurrency micropayments, leveraging Monad's high throughput (10,000 TPS) and 1-second finality for real-time payment settlement.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Monad](https://img.shields.io/badge/Monad-Testnet-purple)](https://monad.xyz/)

## Features

- **1-Second Finality** - Payments settle in under 1 second on Monad
- **EVM Compatible** - Built on ethers.js, works with existing Ethereum tooling
- **Autonomous Payments** - Designed for AI agents and machine-to-machine transactions
- **Axios-Compatible Client** - Drop-in replacement for standard HTTP clients
- **Client-Side Signing** - Private keys never leave the user's machine
- **AI Crawler Monetization** - Get paid when AI companies crawl your website
- **Universal Bot Protection** - Block ALL bots (scrapers, crawlers, etc.) without payment
- **Production Ready** - Comprehensive error handling and transaction monitoring

## Use Cases

MonX402 is designed for scenarios requiring high-frequency, low-cost API payments:

- **AI Agent Marketplaces** - Autonomous agents paying for API access without human intervention
- **High-Frequency Trading APIs** - Real-time market data with per-request pricing
- **API Monetization** - Convert any Next.js API route into a paid service
- **Microservices Architecture** - Internal API billing between services
- **Pay-Per-Use Infrastructure** - Charge for actual usage rather than subscriptions

## Installation

```bash
npm install monad-x402
```

## Quick Start

### Client Usage

The SDK provides an Axios-compatible client that handles payment flows automatically:

```typescript
import { x402axios } from 'monad-x402';

const response = await x402axios.get('https://api.example.com/premium/data', {
  privateKey: process.env.MONAD_PRIVATE_KEY
});

console.log(response.data);
console.log('Transaction hash:', response.paymentInfo?.transactionHash);
```

### Server Setup

Add payment protection to your Next.js API routes using middleware:

```typescript
// middleware.ts
import { paymentMiddleware } from 'monad-x402';

export const middleware = paymentMiddleware(
  process.env.PAYMENT_RECIPIENT_ADDRESS,
  {
    '/api/premium/crypto-prices': {
      price: '1000000000000000',  // 0.001 MON
      network: 'testnet'
    }
  },
  { url: process.env.FACILITATOR_URL }
);

export const config = {
  matcher: ['/api/premium/:path*']
};
```

Your API route remains unchanged - the middleware handles all payment logic:

```typescript
// app/api/premium/crypto-prices/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
  );
  const data = await response.json();
  
  return NextResponse.json({
    bitcoin: data.bitcoin.usd,
    ethereum: data.ethereum.usd
  });
}
```

### AI Crawler Monetization

Get paid when AI companies crawl your website:

```typescript
// middleware.ts
import { aiCrawlerMiddleware } from 'monad-x402';

export const middleware = aiCrawlerMiddleware({
  enabled: true,
  price: '1000000000000000',  // 0.001 MON per page
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS,
  network: 'testnet'
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']  
};
```

Detects and charges AI crawlers (GPTBot, Claude, Google-Extended, etc.) while allowing regular users free access.

### Universal Bot Protection

Block **ALL bots** - scrapers, crawlers, headless browsers, and automated tools:

```typescript
// middleware.ts
import { blockAllBotsExceptSEO } from 'monad-x402';

// Allow search engines for SEO, charge everything else
export const middleware = blockAllBotsExceptSEO(
  process.env.PAYMENT_RECIPIENT_ADDRESS,
  '1000000000000000'  // 0.001 MON
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']  
};
```

Detects and blocks:
- **Search engines** - Googlebot, Bingbot, Baidu, Yandex
- **AI crawlers** - GPT, Claude, Gemini, Perplexity
- **Scrapers** - Scrapy, cURL, Wget, Python Requests
- **SEO tools** - Ahrefs, Semrush, Screaming Frog
- **Headless browsers** - Puppeteer, Playwright, Selenium
- **Any automated tool** - Pattern + behavioral detection

## Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Buyer     │                    │   Seller    │
│  (Client)   │                    │  (API)      │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │  1. GET /api/premium/data       │
       │─────────────────────────────────>│
       │                                  │
       │  2. 402 Payment Required         │
       │<─────────────────────────────────│
       │     (payment requirements)       │
       │                                  │
       │  3. Build & Sign Transaction     │
       │     (client-side, secure)        │
       │                                  │
       │  4. GET with X-PAYMENT header    │
       │─────────────────────────────────>│
       │                                  │
       │              ┌──────────────┐    │
       │              │ Facilitator  │    │
       │              │   Service    │    │
       │              └──────┬───────┘    │
       │                     │            │
       │  5. Verify Payment  │            │
       │     ────────────────>            │
       │     <────────────────            │
       │                     │            │
       │  6. Return Data     │            │
       │<─────────────────────────────────│
       │                     │            │
       │  7. Settle on Chain │            │
       │     ────────────────>            │
       │                     ▼            │
       │              ┌──────────────┐    │
       │              │    Monad     │    │
       │              │  Blockchain  │    │
       │              └──────────────┘    │
```

## Configuration

### Environment Variables

```bash
# Client
MONAD_PRIVATE_KEY=0x...

# Server
PAYMENT_RECIPIENT_ADDRESS=0x...
MONAD_NETWORK=testnet
FACILITATOR_URL=http://localhost:3000/api/facilitator
```

### Network Configuration

```typescript
import { createMonadProvider } from 'monad-x402';

const provider = createMonadProvider('testnet');
```

## API Reference

### Client API

```typescript
const response = await x402axios.get(url, {
  privateKey: string,
  headers?: Record<string, string>,
  timeout?: number
});

response.paymentInfo = {
  transactionHash: string,
  amount: string,
  recipient: string,
  network: string
};
```

### Middleware API

```typescript
interface RouteConfig {
  price: string;           // Amount in wei
  network: 'testnet' | 'mainnet';
  config?: {
    description?: string;
    mimeType?: string;
    maxTimeoutSeconds?: number;
  };
}
```

### Utility Functions

```typescript
import {
  createMonadWallet,
  buildTransferTransaction,
  signTransaction,
  submitTransaction,
  formatMON,
  parseMON,
  getBalance
} from 'monad-x402';
```

## Development

```bash
npm run demo          # Run demo
npm run build:sdk     # Build SDK
npm run build         # Build all
```

## Monad Testnet

- RPC: `https://testnet-rpc.monad.xyz`
- Chain ID: `10143`
- Explorer: `https://testnet-explorer.monad.xyz`

## Security

Private keys are signed client-side and never transmitted over the network. The implementation uses ethers.js for transaction signing and is fully open source.

## Contributing

Contributions are welcome. Please submit pull requests or open issues on GitHub.

## License

MIT License - see LICENSE file for details.

## Links

- [Monad](https://monad.xyz/)
- [x402 Protocol Specification](https://github.com/coinbase/x402)
- [Documentation](https://github.com/shashwatraajsingh/M-x402)

## Roadmap

- Mainnet support
- ERC-20 token payments
- Batch payment support
- Payment streaming
- Multi-language SDK support
