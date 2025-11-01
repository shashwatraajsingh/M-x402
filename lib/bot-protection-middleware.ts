import { NextRequest, NextResponse } from 'next/server';

/**
 * Common patterns to detect any type of bot
 */
const BOT_PATTERNS = [
  // Search Engine Bots
  /bot/i,
  /crawler/i,
  /spider/i,
  /crawling/i,
  
  // Common Bot Names
  /googlebot/i,
  /bingbot/i,
  /slurp/i,             // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /ia_archiver/i,       // Alexa
  
  // AI Crawlers
  /GPTBot/i,
  /ChatGPT/i,
  /Claude/i,
  /Google-Extended/i,
  /anthropic/i,
  /PerplexityBot/i,
  /CCBot/i,
  /Bytespider/i,
  
  // Scraping & Monitoring
  /scrapy/i,
  /wget/i,
  /curl/i,
  /httpie/i,
  /python-requests/i,
  /go-http-client/i,
  /java/i,
  /okhttp/i,
  /axios/i,
  /node-fetch/i,
  
  // SEO & Analytics
  /Screaming Frog/i,
  /Semrush/i,
  /Ahrefs/i,
  /Majestic/i,
  /Moz/i,
  
  // Social Media Bots
  /facebookexternalhit/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /TelegramBot/i,
  /WhatsApp/i,
  /Discordbot/i,
  
  // Headless Browsers (often used for scraping)
  /HeadlessChrome/i,
  /PhantomJS/i,
  /Selenium/i,
  /Puppeteer/i,
  /Playwright/i,
];

/**
 * Additional checks for bot behavior
 */
function hasNoJavaScript(request: NextRequest): boolean {
  // Check for common headers that browsers send but bots often don't
  const acceptHeader = request.headers.get('accept') || '';
  const hasHtmlAccept = acceptHeader.includes('text/html');
  const hasImageAccept = acceptHeader.includes('image/');
  
  // Real browsers accept multiple content types
  return !hasHtmlAccept && !hasImageAccept;
}

function hasSuspiciousHeaders(request: NextRequest): boolean {
  // Bots often don't send these headers
  const referer = request.headers.get('referer');
  const acceptLanguage = request.headers.get('accept-language');
  const acceptEncoding = request.headers.get('accept-encoding');
  
  // Most real browsers send these
  return !acceptLanguage || !acceptEncoding;
}

/**
 * Detect if the request is from any bot
 */
export function isBot(userAgent: string, request?: NextRequest): boolean {
  if (!userAgent) return true; // No user agent = likely a bot
  
  // Check user agent patterns
  const matchesPattern = BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  if (matchesPattern) return true;
  
  // Additional behavior checks if request is provided
  if (request) {
    if (hasNoJavaScript(request)) return true;
    if (hasSuspiciousHeaders(request)) return true;
  }
  
  return false;
}

/**
 * Get bot type from user agent
 */
export function getBotType(userAgent: string): string {
  if (!userAgent) return 'Unknown Bot';
  
  // Search Engines
  if (/googlebot/i.test(userAgent)) return 'Google Bot';
  if (/bingbot/i.test(userAgent)) return 'Bing Bot';
  if (/yandex/i.test(userAgent)) return 'Yandex Bot';
  if (/baidu/i.test(userAgent)) return 'Baidu Bot';
  
  // AI Crawlers
  if (/GPTBot/i.test(userAgent)) return 'OpenAI GPTBot';
  if (/Claude/i.test(userAgent)) return 'Anthropic Claude';
  if (/Google-Extended/i.test(userAgent)) return 'Google Gemini';
  if (/Perplexity/i.test(userAgent)) return 'Perplexity Bot';
  
  // Social Media
  if (/facebookexternalhit/i.test(userAgent)) return 'Facebook Bot';
  if (/Twitterbot/i.test(userAgent)) return 'Twitter Bot';
  if (/LinkedInBot/i.test(userAgent)) return 'LinkedIn Bot';
  
  // Scrapers
  if (/scrapy/i.test(userAgent)) return 'Scrapy';
  if (/wget/i.test(userAgent)) return 'Wget';
  if (/curl/i.test(userAgent)) return 'cURL';
  if (/python-requests/i.test(userAgent)) return 'Python Requests';
  
  // Headless
  if (/HeadlessChrome/i.test(userAgent)) return 'Headless Chrome';
  if (/Puppeteer/i.test(userAgent)) return 'Puppeteer';
  if (/Playwright/i.test(userAgent)) return 'Playwright';
  
  // SEO Tools
  if (/Semrush/i.test(userAgent)) return 'Semrush Bot';
  if (/Ahrefs/i.test(userAgent)) return 'Ahrefs Bot';
  if (/Screaming Frog/i.test(userAgent)) return 'Screaming Frog';
  
  return 'Bot';
}

export interface BotProtectionConfig {
  enabled: boolean;
  price: string;  // Price in wei
  recipientAddress: string;
  network?: 'testnet' | 'mainnet';
  facilitatorUrl?: string;
  allowedBots?: string[];  // Whitelist specific bots (e.g., for SEO)
  description?: string;
  strictMode?: boolean;  // Use additional behavioral checks
}

interface VerificationResponse {
  valid: boolean;
  transactionHash?: string;
}

/**
 * Universal bot protection middleware - blocks ALL bots without payment
 * 
 * @example Basic usage
 * ```typescript
 * import { botProtectionMiddleware } from 'monad-x402';
 * 
 * export const middleware = botProtectionMiddleware({
 *   enabled: true,
 *   price: '1000000000000000',  // 0.001 MON
 *   recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
 *   network: 'testnet'
 * });
 * ```
 * 
 * @example With SEO whitelist
 * ```typescript
 * export const middleware = botProtectionMiddleware({
 *   enabled: true,
 *   price: '2000000000000000',
 *   recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
 *   allowedBots: ['Googlebot', 'Bingbot'],  // Free for SEO
 *   strictMode: true  // Enable behavioral detection
 * });
 * ```
 */
export function botProtectionMiddleware(config: BotProtectionConfig) {
  return async (request: NextRequest) => {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Skip if bot protection is disabled
    if (!config.enabled) {
      return NextResponse.next();
    }
    
    // Check if this is a bot
    const isBotRequest = config.strictMode 
      ? isBot(userAgent, request)
      : isBot(userAgent);
    
    if (!isBotRequest) {
      return NextResponse.next();
    }
    
    const botType = getBotType(userAgent);
    
    // Check if this bot is whitelisted
    if (config.allowedBots && config.allowedBots.length > 0) {
      const isAllowed = config.allowedBots.some(allowed => 
        userAgent.toLowerCase().includes(allowed.toLowerCase())
      );
      if (isAllowed) {
        return NextResponse.next();
      }
    }
    
    // Check for payment header
    const paymentHeader = request.headers.get('X-PAYMENT');
    
    if (!paymentHeader) {
      // Return 402 Payment Required
      const x402Response = {
        x402Version: 1,
        accepts: [{
          scheme: 'exact',
          network: config.network === 'mainnet' ? 'monad-mainnet' : 'monad-testnet',
          maxAmountRequired: config.price,
          payTo: config.recipientAddress,
          description: config.description || `Bot Access Fee - ${botType}`,
          resource: request.url,
          botDetected: botType,
          message: 'This website requires payment for bot access. Please pay to proceed.',
        }]
      };
      
      return new NextResponse(JSON.stringify(x402Response), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Bot-Detected': botType,
          'X-Payment-Required': 'true',
        },
      });
    }
    
    // Verify payment with facilitator
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
      response.headers.set('X-Bot-Paid', botType);
      
      return response;
      
    } catch (error) {
      console.error('Payment verification error:', error);
      return new NextResponse('Payment verification failed', { status: 500 });
    }
  };
}

/**
 * Block all bots except whitelisted ones for SEO
 * 
 * @example
 * ```typescript
 * import { blockAllBotsExceptSEO } from 'monad-x402';
 * 
 * export const middleware = blockAllBotsExceptSEO(
 *   process.env.PAYMENT_RECIPIENT_ADDRESS!,
 *   '1000000000000000'
 * );
 * ```
 */
export function blockAllBotsExceptSEO(
  recipientAddress: string,
  price: string = '1000000000000000'
) {
  return botProtectionMiddleware({
    enabled: true,
    price,
    recipientAddress,
    network: 'testnet',
    allowedBots: ['Googlebot', 'Bingbot', 'Yahoo', 'DuckDuckBot'],
    description: 'Bot Access Fee - Humans browse free, bots pay',
  });
}

/**
 * Block ALL bots including search engines
 * 
 * @example
 * ```typescript
 * import { blockAllBots } from 'monad-x402';
 * 
 * export const middleware = blockAllBots(
 *   process.env.PAYMENT_RECIPIENT_ADDRESS!,
 *   '2000000000000000',
 *   true  // Enable strict mode
 * );
 * ```
 */
export function blockAllBots(
  recipientAddress: string,
  price: string = '1000000000000000',
  strictMode: boolean = false
) {
  return botProtectionMiddleware({
    enabled: true,
    price,
    recipientAddress,
    network: 'testnet',
    strictMode,
    description: 'Universal Bot Protection - Payment required for all automated access',
  });
}
