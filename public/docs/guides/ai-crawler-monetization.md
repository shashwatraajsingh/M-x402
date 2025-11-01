# AI Crawler Monetization

## The Problem

When AI companies crawl your website to train their models or answer user queries, you face two problems:

1. **No Direct Compensation** - AI crawlers consume your content without paying you
2. **Lost Ad Revenue** - When AI answers questions using your content, users don't visit your site, so you lose advertising revenue

Traditional solutions like robots.txt only let you block crawlers entirely. With Monad x402, you can **monetize AI crawler access** instead.

## How It Works

Monad x402 detects AI crawlers via their User-Agent headers and requires payment before serving content. Payments settle on Monad testnet in ~1 second.

### Detected AI Crawlers

The SDK automatically detects these AI crawlers:

- **OpenAI** - GPTBot, ChatGPT-User
- **Anthropic** - Claude-Web, ClaudeBot
- **Google** - Google-Extended (Bard/Gemini)
- **Perplexity** - PerplexityBot
- **Meta** - FacebookBot
- **Apple** - Applebot-Extended
- **ByteDance** - Bytespider
- **Common Crawl** - CCBot (used by many AI companies)
- And more...

## Quick Setup

### Step 1: Install

```bash
npm install monad-x402
```

### Step 2: Create Middleware

```typescript
// middleware.ts
import { aiCrawlerMiddleware } from 'monad-x402';

export const middleware = aiCrawlerMiddleware({
  enabled: true,
  price: '1000000000000000',  // 0.001 MON per page
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  network: 'testnet',
  description: 'AI Crawler Access Fee'
});

export const config = {
  // Apply to all routes except Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### Step 3: Environment Variables

```bash
# .env.local
PAYMENT_RECIPIENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Step 4: Test It

When an AI crawler visits your site, they'll receive a 402 Payment Required response with payment instructions.

```bash
# Simulate an AI crawler
curl -H "User-Agent: GPTBot/1.0" http://localhost:3000
```

**Response:**
```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "monad-testnet",
    "maxAmountRequired": "1000000000000000",
    "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "description": "AI Crawler Access Fee - OpenAI GPTBot",
    "resource": "http://localhost:3000",
    "crawlerDetected": "OpenAI GPTBot"
  }]
}
```

## Usage Patterns

### Block All AI Crawlers (Require Payment)

Simplest setup - charge all AI crawlers:

```typescript
import { blockAICrawlers } from 'monad-x402';

export const middleware = blockAICrawlers(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '1000000000000000'  // 0.001 MON per page
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### Allow Specific Crawlers, Charge Others

Whitelist some crawlers (like Google for SEO) but charge others:

```typescript
import { allowSpecificCrawlers } from 'monad-x402';

export const middleware = allowSpecificCrawlers(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  ['Google-Extended', 'Bingbot'],  // Free for Google and Bing
  '5000000000000000'  // 0.005 MON for everyone else
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### Custom Configuration

Full control over pricing and behavior:

```typescript
import { aiCrawlerMiddleware } from 'monad-x402';

export const middleware = aiCrawlerMiddleware({
  enabled: true,
  price: '2000000000000000',  // 0.002 MON
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  network: 'testnet',
  facilitatorUrl: 'https://monad-x402.vercel.app/api/facilitator',
  allowedCrawlers: ['Google-Extended'],  // Whitelist specific crawlers
  description: 'Premium Content Access Fee'
});
```

### Combine with API Payment Middleware

Use both AI crawler protection and API payment middleware:

```typescript
// middleware.ts
import { paymentMiddleware, aiCrawlerMiddleware } from 'monad-x402';
import { NextRequest, NextResponse } from 'next/server';

// AI crawler middleware
const aiMiddleware = aiCrawlerMiddleware({
  enabled: true,
  price: '1000000000000000',
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  network: 'testnet'
});

// API payment middleware
const apiMiddleware = paymentMiddleware(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  {
    '/api/premium/*': {
      price: '5000000000000000',
      network: 'testnet'
    }
  },
  { url: process.env.FACILITATOR_URL! }
);

export async function middleware(request: NextRequest) {
  // Check AI crawlers first
  if (request.nextUrl.pathname.startsWith('/blog') || 
      request.nextUrl.pathname.startsWith('/docs')) {
    return await aiMiddleware(request);
  }
  
  // Then check API routes
  if (request.nextUrl.pathname.startsWith('/api/premium')) {
    return await apiMiddleware(request);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/blog/:path*', '/docs/:path*', '/api/premium/:path*']
};
```

## Pricing Recommendations

### Content Value-Based Pricing

- **Blog Posts** - 0.0001 MON (100000000000000 wei)
- **Documentation** - 0.0005 MON (500000000000000 wei)
- **Research Papers** - 0.001 MON (1000000000000000 wei)
- **Premium Content** - 0.01 MON (10000000000000000 wei)

### High-Traffic Considerations

On Monad testnet, you can handle:
- 10,000 TPS (transactions per second)
- Sub-second finality
- Minimal transaction fees

This means even high-traffic sites can monetize AI crawler access economically.

## Detection Logic

The middleware checks the `User-Agent` header against known AI crawler patterns:

```typescript
import { isAICrawler, getAICrawlerName } from 'monad-x402';

const userAgent = request.headers.get('user-agent');

if (isAICrawler(userAgent)) {
  const crawlerName = getAICrawlerName(userAgent);
  console.log(`Detected: ${crawlerName}`);
  // Require payment
}
```

## Payment Flow

1. **AI Crawler Visits** - Makes request with identifiable User-Agent
2. **402 Response** - Server returns payment requirements
3. **Payment** - Crawler (or proxy service) pays on Monad
4. **Retry with Proof** - Crawler includes X-PAYMENT header
5. **Verification** - Facilitator verifies payment on Monad
6. **Content Delivered** - Server returns requested content

## Real-World Example

### Blog Monetization

```typescript
// middleware.ts
import { aiCrawlerMiddleware } from 'monad-x402';

export const middleware = aiCrawlerMiddleware({
  enabled: true,
  price: '500000000000000',  // 0.0005 MON per page
  recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  network: 'testnet',
  description: 'Support independent journalism - Pay per article'
});

export const config = {
  matcher: ['/blog/:path*', '/articles/:path*']
};
```

**Result:** Every time an AI company crawls your blog to train models or answer questions, you earn 0.0005 MON per page.

## FAQ

### Why would AI companies pay?

1. **Compliance** - Using copyrighted content without permission is legally risky
2. **Quality Data** - Paying for access ensures continued availability of high-quality content
3. **Fair Compensation** - Standard protocol (x402) makes it easy to implement payment

### Can I still use robots.txt?

Yes! You can use both:
- `robots.txt` - Block non-paying crawlers entirely
- Monad x402 - Monetize paying crawlers

### What about SEO?

Whitelist search engine crawlers so they can still index your site:

```typescript
allowedCrawlers: ['Googlebot', 'Bingbot']  // Free for SEO
```

### How much can I earn?

Example calculation:
- 1,000 AI crawler visits/day
- 0.0005 MON per visit
- = 0.5 MON/day = 15 MON/month

At hypothetical $10/MON = $150/month passive income

### What if an AI company refuses to pay?

They won't get your content. You can:
1. Block them entirely via robots.txt
2. Serve them limited/low-quality content
3. Let them pay the nominal fee

## Roadmap

- [ ] Analytics dashboard showing crawler activity and earnings
- [ ] Automatic pricing tiers based on content type
- [ ] Bulk payment discounts for high-volume crawlers
- [ ] Mainnet support with real MON payments

## Support

Questions or issues?
- [GitHub Issues](https://github.com/shashwatraajsingh/M-x402/issues)
- [Documentation](https://monad-x402.vercel.app/docs)

---

**Get paid when AI uses your content. Install Monad x402 today.**
