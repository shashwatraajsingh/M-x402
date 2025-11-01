# MonX402 🚀

**HTTP 402 Payment Required Protocol for Monad Blockchain**

MonX402 is a TypeScript SDK that brings the HTTP 402 Payment Required standard to Monad, enabling seamless cryptocurrency micropayments for APIs. Built on the EVM-compatible Monad blockchain for blazing-fast, low-cost transactions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Monad](https://img.shields.io/badge/Monad-Testnet-purple)](https://monad.xyz/)

## ✨ Features

- 🔥 **Sub-3s Settlement** - Lightning-fast payments on Monad
- 💎 **EVM-Native** - Built on ethers.js for maximum compatibility
- 🤖 **AI Agent Ready** - Perfect for autonomous agent-to-agent payments
- 📦 **Axios-Compatible** - Drop-in replacement for your HTTP client
- 🔒 **Cryptographically Secure** - Client-side signing, keys never exposed
- 🌐 **Production Ready** - Comprehensive error handling and logging

## 🎯 Use Cases

- **AI Agent Payments** - Enable autonomous agents to pay for API access
- **API Monetization** - Turn any Next.js API route into a paid service
- **Micropayments** - Charge fractions of a cent per API call
- **Machine-to-Machine** - Automated payments between services
- **Pay-per-Use** - Only pay for what you consume

## 📦 Installation

```bash
npm install monad-x402
# or
yarn add monad-x402
# or
pnpm add monad-x402
```

## 🚀 Quick Start

### For API Consumers (Buyers)

Use `x402axios` - an Axios-compatible client that automatically handles payments:

```typescript
import { x402axios } from 'monad-x402';

// Regular request (no payment)
const freeData = await x402axios.get('https://api.example.com/free/data');

// Paid request (automatic payment handling)
const paidData = await x402axios.get('https://api.example.com/premium/data', {
  privateKey: process.env.MONAD_PRIVATE_KEY!
});

console.log(paidData.data);
console.log('Transaction:', paidData.paymentInfo?.transactionHash);
```

### For API Providers (Sellers)

Protect your Next.js API routes with payment middleware:

```typescript
// middleware.ts
import { paymentMiddleware } from 'monad-x402';

export const middleware = paymentMiddleware(
  process.env.PAYMENT_RECIPIENT_ADDRESS!, // Your Monad wallet address
  {
    '/api/premium/crypto-prices': {
      price: '1000000000000000',  // 0.001 MON in wei
      network: 'testnet',
      config: {
        description: 'Live crypto price data access'
      }
    }
  },
  {
    url: process.env.FACILITATOR_URL! // Your facilitator endpoint
  }
);

export const config = {
  matcher: ['/api/premium/:path*']
};
```

```typescript
// app/api/premium/crypto-prices/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // This route is now payment-protected!
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

## 🏗️ Architecture

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

## 🔧 Configuration

### Environment Variables

```bash
# For API Consumers
MONAD_PRIVATE_KEY=0x...

# For API Providers
PAYMENT_RECIPIENT_ADDRESS=0x...
MONAD_NETWORK=testnet
FACILITATOR_URL=http://localhost:3000/api/facilitator
```

### Network Configuration

```typescript
import { createMonadProvider, MONAD_TESTNET_RPC } from 'monad-x402';

// Testnet (default)
const provider = createMonadProvider('testnet');

// Mainnet (when available)
const provider = createMonadProvider('mainnet');
```

## 📚 API Reference

### Client API (`x402axios`)

```typescript
// GET request with payment
const response = await x402axios.get(url, {
  privateKey: string,        // Your Monad private key
  headers?: Record<string, string>,
  timeout?: number,
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
});

// POST request with payment
const response = await x402axios.post(url, data, {
  privateKey: string,
  // ... other options
});

// Response includes payment info
response.paymentInfo = {
  transactionHash: string,
  amount: string,
  recipient: string,
  network: string
};
```

### Middleware API

```typescript
paymentMiddleware(
  recipientAddress: string,
  routes: Record<string, RouteConfig>,
  facilitatorConfig: FacilitatorConfig
)

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
  waitForTransaction,
  formatMON,
  parseMON,
  getBalance,
  isValidAddress
} from 'monad-x402';

// Create wallet
const wallet = createMonadWallet(privateKey, 'testnet');

// Build transaction
const tx = await buildTransferTransaction(from, to, amount, 'testnet');

// Sign transaction
const signedTx = await signTransaction(wallet, tx);

// Submit to blockchain
const txResponse = await submitTransaction(signedTx, 'testnet');

// Wait for confirmation
const receipt = await waitForTransaction(txResponse.hash, 'testnet');

// Format amounts
const mon = formatMON('1000000000000000000'); // "1.0"
const wei = parseMON('1.5'); // 1500000000000000000n

// Check balance
const balance = await getBalance(address, 'testnet');
```

## 🧪 Testing

```bash
# Run the demo
npm run demo

# Build the SDK
npm run build:sdk

# Build everything
npm run build
```

## 🌐 Monad Testnet

- **RPC**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: `10143`
- **Explorer**: `https://testnet-explorer.monad.xyz`
- **Faucet**: Get testnet MON from the official Monad faucet

## 🔐 Security

- **Client-Side Signing**: Private keys never leave your machine
- **No Key Transmission**: Keys are never sent over the network
- **Secure by Design**: Built on battle-tested ethers.js
- **Open Source**: Fully auditable code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Monad Website](https://monad.xyz/)
- [x402 Protocol Spec](https://github.com/coinbase/x402)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 💡 Examples

Check out the `/scripts` directory for complete examples:
- `demo-agent.ts` - AI agent making paid API calls
- `test-x402-axios.ts` - Client usage examples

## 🚀 Roadmap

- [ ] Mainnet support
- [ ] ERC-20 token payments
- [ ] Batch payment support
- [ ] Payment streaming
- [ ] SDK for other languages (Python, Go, Rust)

---

**Built with ❤️ for the Monad ecosystem**

*Enabling the future of micropayments and AI agent economies*
