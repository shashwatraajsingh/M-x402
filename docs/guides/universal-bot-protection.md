# Universal Bot Protection

## Overview

Block **ALL bots** from accessing your website without payment - including search engines, scrapers, AI crawlers, monitoring tools, and headless browsers. Only real human users can browse for free.

This is more comprehensive than [AI Crawler Monetization](./ai-crawler-monetization.md), which only targets specific AI companies. Universal Bot Protection catches **everything automated**.

## Why Use This?

### Protect Your Content

- **Stop Scrapers** - Prevent competitors from stealing your data
- **Block Unauthorized Bots** - Control who accesses your content
- **Monetize Bot Traffic** - Get paid for every automated access

### Detected Bot Types

The middleware detects and blocks:

1. **Search Engine Bots**
   - Googlebot, Bingbot, Yahoo Slurp, Baidu, Yandex, DuckDuckBot

2. **AI Crawlers**
   - GPTBot, Claude, Google-Extended, Perplexity, CCBot, Bytespider

3. **Scraping Tools**
   - Scrapy, Wget, cURL, HTTPie, Python Requests, Go HTTP Client, Axios

4. **SEO Tools**
   - Screaming Frog, Semrush, Ahrefs, Majestic, Moz

5. **Social Media Bots**
   - Facebook, Twitter, LinkedIn, Slack, Telegram, Discord, WhatsApp

6. **Headless Browsers**
   - Headless Chrome, PhantomJS, Puppeteer, Playwright, Selenium

7. **Unknown Bots**
   - Any User-Agent containing "bot", "crawler", "spider", etc.

## Quick Setup

### Basic Protection (Allow SEO Bots)

```typescript
// middleware.ts
import { blockAllBotsExceptSEO } from 'monad-x402';

export const middleware = blockAllBotsExceptSEO(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '1000000000000000'  // 0.001 MON per page
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

This allows Googlebot and Bingbot (for SEO) but charges all other bots.

### Strict Protection (Block Everything)

```typescript
// middleware.ts
import { blockAllBots } from 'monad-x402';

export const middleware = blockAllBots(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '2000000000000000',  // 0.002 MON
  true  // Enable strict mode (behavioral detection)
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

This blocks **everything** including search engines. Use with caution if you care about SEO.

## Advanced Configuration

### Custom Whitelist

```typescript
import { botProtectionMiddleware } from 'monad-x402';

export const middleware = botProtectionMiddleware({
  enabled: true,
  price: '1500000000000000',  // 0.0015 MON
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  network: 'testnet',
  allowedBots: [
    'Googlebot',      // Allow Google
    'Bingbot',        // Allow Bing
    'facebookexternalhit'  // Allow Facebook for link previews
  ],
  description: 'Bot Protection - Free for SEO, paid for everything else'
});
```

### Strict Mode (Behavioral Detection)

Enable additional checks beyond User-Agent:

```typescript
export const middleware = botProtectionMiddleware({
  enabled: true,
  price: '2000000000000000',
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  strictMode: true,  // Enable behavioral checks
  description: 'Advanced Bot Protection'
});
```

**Strict mode detects:**
- Missing JavaScript capability headers
- Missing Accept-Language header
- Missing Accept-Encoding header
- Suspicious request patterns

### Different Pricing for Different Sections

```typescript
import { botProtectionMiddleware } from 'monad-x402';
import { NextRequest, NextResponse } from 'next/server';

const publicBotProtection = botProtectionMiddleware({
  enabled: true,
  price: '500000000000000',  // 0.0005 MON for blog
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  allowedBots: ['Googlebot', 'Bingbot']
});

const premiumBotProtection = botProtectionMiddleware({
  enabled: true,
  price: '5000000000000000',  // 0.005 MON for premium
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  strictMode: true
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/blog')) {
    return await publicBotProtection(request);
  }
  
  if (request.nextUrl.pathname.startsWith('/premium')) {
    return await premiumBotProtection(request);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/blog/:path*', '/premium/:path*']
};
```

## Detection Examples

### Test Bot Detection

```typescript
import { isBot, getBotType } from 'monad-x402';

// Test various user agents
console.log(isBot('Mozilla/5.0 ... Chrome/120.0'));  // false - Real browser
console.log(isBot('Googlebot/2.1'));  // true
console.log(isBot('curl/7.68.0'));  // true
console.log(isBot('python-requests/2.28.0'));  // true
console.log(isBot('Scrapy/2.8.0'));  // true

// Get bot type
console.log(getBotType('Googlebot/2.1'));  // "Google Bot"
console.log(getBotType('curl/7.68.0'));  // "cURL"
console.log(getBotType('GPTBot/1.0'));  // "OpenAI GPTBot"
```

### Simulate Bot Request

```bash
# Test with cURL (will be detected as bot)
curl -H "User-Agent: curl/7.68.0" http://localhost:3000

# Test with Googlebot
curl -H "User-Agent: Googlebot/2.1" http://localhost:3000

# Test with Python scraper
curl -H "User-Agent: python-requests/2.28.0" http://localhost:3000
```

## Use Cases

### 1. Protect Proprietary Data

Block competitors from scraping your pricing, product data, or research:

```typescript
export const middleware = blockAllBots(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '10000000000000000',  // 0.01 MON - High cost to deter scrapers
  true
);

export const config = {
  matcher: ['/products/:path*', '/pricing', '/research/:path*']
};
```

### 2. Monetize Public Data

Allow bots but charge for access:

```typescript
export const middleware = blockAllBotsExceptSEO(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '1000000000000000'
);

export const config = {
  matcher: ['/api/public-data/:path*']
};
```

### 3. Premium Content Protection

Humans can access with login, bots must pay:

```typescript
import { botProtectionMiddleware } from 'monad-x402';
import { NextRequest, NextResponse } from 'next/server';

const botProtection = botProtectionMiddleware({
  enabled: true,
  price: '5000000000000000',
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!
});

export async function middleware(request: NextRequest) {
  // Check if human is logged in
  const session = request.cookies.get('session');
  if (session) {
    return NextResponse.next();  // Allow logged-in humans
  }
  
  // Check if it's a bot
  const userAgent = request.headers.get('user-agent') || '';
  if (isBot(userAgent)) {
    return await botProtection(request);  // Require payment from bots
  }
  
  // Redirect guests to login
  return NextResponse.redirect(new URL('/login', request.url));
}
```

## Pricing Strategy

### Content Value-Based

- **Public Blog** - 0.0001 MON (allow SEO bots free)
- **API Documentation** - 0.0005 MON (allow major search engines)
- **Product Data** - 0.005 MON (charge everything)
- **Proprietary Research** - 0.05 MON (block most bots)

### Volume-Based Deterrent

- **Low Value** - 0.0001 MON (profitable for frequent scraping)
- **Medium Value** - 0.001 MON (deters casual scraping)
- **High Value** - 0.01 MON (blocks most unauthorized access)
- **Critical** - 0.1 MON (effective paywall for bots)

## SEO Considerations

### Recommended: Whitelist Major Search Engines

```typescript
allowedBots: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Yahoo']
```

This ensures:
- Your site remains indexed
- Search engine rankings aren't affected
- Link previews work on social media

### Alternative: Use robots.txt

```
# robots.txt
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Disallow: /
```

Then charge the ones that ignore robots.txt:

```typescript
export const middleware = blockAllBots(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '1000000000000000'
);
```

## Performance Impact

- **Detection Time** - <1ms (pattern matching)
- **Payment Verification** - ~1 second (Monad settlement)
- **Human Users** - Zero impact (no checks applied)
- **Whitelisted Bots** - <1ms (pattern check only)

## Combining with Other Features

### Bot Protection + API Payments

```typescript
import { botProtectionMiddleware, paymentMiddleware } from 'monad-x402';

// Protect website from bots
const websiteProtection = blockAllBotsExceptSEO(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '1000000000000000'
);

// Protect API routes (everyone pays)
const apiProtection = paymentMiddleware(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  {
    '/api/premium/*': { price: '5000000000000000', network: 'testnet' }
  },
  { url: process.env.FACILITATOR_URL! }
);

export async function middleware(request: NextRequest) {
  // Apply API protection to API routes
  if (request.nextUrl.pathname.startsWith('/api/premium')) {
    return await apiProtection(request);
  }
  
  // Apply bot protection to website
  return await websiteProtection(request);
}
```

### Bot Protection + AI Crawler Monetization

```typescript
import { aiCrawlerMiddleware, botProtectionMiddleware } from 'monad-x402';

// Specific pricing for AI crawlers
const aiProtection = aiCrawlerMiddleware({
  enabled: true,
  price: '2000000000000000',  // 0.002 MON
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!
});

// General bot protection
const generalBotProtection = blockAllBotsExceptSEO(
  process.env.PAYMENT_RECIPIENT_ADDRESS!,
  '500000000000000'  // 0.0005 MON
);

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check AI crawlers first (higher price)
  if (isAICrawler(userAgent)) {
    return await aiProtection(request);
  }
  
  // Then check other bots
  return await generalBotProtection(request);
}
```

## FAQ

### Will this affect my SEO?

Only if you block search engine bots. Use `blockAllBotsExceptSEO()` or whitelist `['Googlebot', 'Bingbot']` to maintain SEO.

### Can bots bypass this?

Sophisticated bots can:
1. Fake User-Agent to look like browsers
2. Use headless browsers with realistic headers
3. Route through residential proxies

Use `strictMode: true` for additional behavioral detection, but nothing is 100% foolproof. The payment requirement itself is a strong deterrent.

### What about false positives?

Some legitimate tools may be flagged:
- Browser extensions
- Monitoring services
- Testing tools
- Mobile apps using WebView

Consider:
1. Using less strict detection for public content
2. Whitelisting known legitimate services
3. Providing a way for legitimate users to contact you

### How much can I earn?

Example for a data website:
- 10,000 bot requests/day
- 0.001 MON per request
- = 10 MON/day = 300 MON/month

At $10/MON = $3,000/month from bot monetization

## Roadmap

- [ ] Machine learning-based bot detection
- [ ] Reputation system for known bot IPs
- [ ] Automatic whitelist updates for verified services
- [ ] Analytics dashboard for bot traffic
- [ ] CAPTCHA integration for suspected bots
- [ ] Rate limiting integration

## Support

- [GitHub Issues](https://github.com/shashwatraajsingh/M-x402/issues)
- [Documentation](https://monad-x402.vercel.app/docs)
- [AI Crawler Guide](./ai-crawler-monetization.md)

---

**Protect your content. Monetize bot traffic. Control automated access.**
