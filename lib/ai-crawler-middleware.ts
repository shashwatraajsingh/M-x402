import { NextRequest, NextResponse } from 'next/server';

/**
 * Common AI crawler user agents
 */
const AI_CRAWLER_PATTERNS = [
  /GPTBot/i,           // OpenAI GPT crawler
  /ChatGPT-User/i,     // ChatGPT
  /Claude-Web/i,       // Anthropic Claude
  /ClaudeBot/i,        // Anthropic Claude Bot
  /Google-Extended/i,  // Google Bard/Gemini
  /anthropic-ai/i,     // Anthropic AI
  /cohere-ai/i,        // Cohere AI
  /PerplexityBot/i,    // Perplexity AI
  /Omgilibot/i,        // Omgili
  /FacebookBot/i,      // Meta AI
  /Applebot-Extended/i,// Apple AI
  /Bytespider/i,       // ByteDance (TikTok)
  /CCBot/i,            // Common Crawl (used by many AI companies)
  /anthropic/i,        // Anthropic variants
  /AI2Bot/i,           // Allen Institute for AI
  /YouBot/i,           // You.com AI search
];

/**
 * Detect if the request is from an AI crawler
 */
export function isAICrawler(userAgent: string): boolean {
  if (!userAgent) return false;
  return AI_CRAWLER_PATTERNS.some(pattern => pattern.test(userAgent));
}

/**
 * Get the AI crawler name from user agent
 */
export function getAICrawlerName(userAgent: string): string | null {
  if (!userAgent) return null;
  
  if (/GPTBot/i.test(userAgent)) return 'OpenAI GPTBot';
  if (/ChatGPT-User/i.test(userAgent)) return 'ChatGPT';
  if (/Claude/i.test(userAgent)) return 'Anthropic Claude';
  if (/Google-Extended/i.test(userAgent)) return 'Google Gemini';
  if (/PerplexityBot/i.test(userAgent)) return 'Perplexity';
  if (/CCBot/i.test(userAgent)) return 'Common Crawl';
  if (/Bytespider/i.test(userAgent)) return 'ByteDance';
  
  return 'AI Crawler';
}

export interface AICrawlerConfig {
  enabled: boolean;
  price: string;  // Price in wei
  recipientAddress: string;
  network?: 'testnet' | 'mainnet';
  facilitatorUrl?: string;
  allowedCrawlers?: string[];  // Optional whitelist
  description?: string;
}

interface VerificationResponse {
  valid: boolean;
  transactionHash?: string;
}

/**
 * Middleware to monetize AI crawler access
 * 
 * @example
 * ```typescript
 * // middleware.ts
 * import { aiCrawlerMiddleware } from 'monad-x402';
 * 
 * export const middleware = aiCrawlerMiddleware({
 *   enabled: true,
 *   price: '1000000000000000',  // 0.001 MON
 *   recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
 *   network: 'testnet',
 *   description: 'AI Crawler Access Fee'
 * });
 * 
 * export const config = {
 *   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
 * };
 * ```
 */
export function aiCrawlerMiddleware(config: AICrawlerConfig) {
  return async (request: NextRequest) => {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Skip if AI crawler protection is disabled
    if (!config.enabled) {
      return NextResponse.next();
    }
    
    // Check if this is an AI crawler
    if (!isAICrawler(userAgent)) {
      return NextResponse.next();
    }
    
    const crawlerName = getAICrawlerName(userAgent);
    
    // Check if this crawler is whitelisted
    if (config.allowedCrawlers && config.allowedCrawlers.length > 0) {
      const isAllowed = config.allowedCrawlers.some(allowed => 
        userAgent.toLowerCase().includes(allowed.toLowerCase())
      );
      if (isAllowed) {
        return NextResponse.next();
      }
    }
    
    // Check for payment header
    const paymentHeader = request.headers.get('X-PAYMENT');
    
    if (!paymentHeader) {
      // Return 402 Payment Required with x402 payment details
      const x402Response = {
        x402Version: 1,
        accepts: [{
          scheme: 'exact',
          network: config.network === 'mainnet' ? 'monad-mainnet' : 'monad-testnet',
          maxAmountRequired: config.price,
          payTo: config.recipientAddress,
          description: config.description || `AI Crawler Access Fee - ${crawlerName}`,
          resource: request.url,
          crawlerDetected: crawlerName,
        }]
      };
      
      return new NextResponse(JSON.stringify(x402Response), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-AI-Crawler-Detected': crawlerName || 'Unknown',
          'X-Payment-Required': 'true',
        },
      });
    }
    
    // Payment header exists - verify it with facilitator
    try {
      const facilitatorUrl = config.facilitatorUrl || 'https://monad-x402.vercel.app/api/facilitator';
      const verifyResponse = await fetch(`${facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: paymentHeader,
          expectedAmount: config.price,
          expectedRecipient: config.recipientAddress,
          network: config.network || 'testnet',
        }),
      });
      
      if (!verifyResponse.ok) {
        return new NextResponse('Payment verification failed', { status: 402 });
      }
      
      const verification = await verifyResponse.json() as VerificationResponse;
      
      if (!verification.valid) {
        return new NextResponse('Invalid payment', { status: 402 });
      }
      
      // Payment verified - allow access
      const response = NextResponse.next();
      response.headers.set('X-Payment-Verified', 'true');
      response.headers.set('X-Transaction-Hash', verification.transactionHash || '');
      response.headers.set('X-AI-Crawler-Paid', crawlerName || 'Unknown');
      
      return response;
      
    } catch (error) {
      console.error('Payment verification error:', error);
      return new NextResponse('Payment verification failed', { status: 500 });
    }
  };
}

/**
 * Helper to block all AI crawlers without payment
 * 
 * @example
 * ```typescript
 * import { blockAICrawlers } from 'monad-x402';
 * 
 * export const middleware = blockAICrawlers(
 *   process.env.PAYMENT_RECIPIENT_ADDRESS!,
 *   '1000000000000000'  // 0.001 MON
 * );
 * ```
 */
export function blockAICrawlers(recipientAddress: string, price: string = '1000000000000000') {
  return aiCrawlerMiddleware({
    enabled: true,
    price,
    recipientAddress,
    network: 'testnet',
    description: 'AI Crawler Access Fee - Support content creators',
  });
}

/**
 * Helper to allow specific crawlers while blocking others
 * 
 * @example
 * ```typescript
 * import { allowSpecificCrawlers } from 'monad-x402';
 * 
 * // Only allow Google and Bing, charge everyone else
 * export const middleware = allowSpecificCrawlers(
 *   process.env.PAYMENT_RECIPIENT_ADDRESS!,
 *   ['Google-Extended', 'Bingbot'],
 *   '1000000000000000'
 * );
 * ```
 */
export function allowSpecificCrawlers(
  recipientAddress: string,
  allowedCrawlers: string[],
  price: string = '1000000000000000'
) {
  return aiCrawlerMiddleware({
    enabled: true,
    price,
    recipientAddress,
    network: 'testnet',
    allowedCrawlers,
    description: 'Restricted AI Crawler Access',
  });
}
