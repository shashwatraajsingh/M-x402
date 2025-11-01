/**
 * monad-x402 - Official x402 Payment Protocol SDK for Monad
 * 
 * Implementation of HTTP 402 Payment Required for Monad blockchain (EVM-compatible).
 * Based on Coinbase x402 protocol: https://github.com/coinbase/x402
 * 
 * @packageDocumentation
 * 
 * @example Buyer Example - Access paid APIs (Axios-compatible)
 * ```typescript
 * import { x402axios } from 'monad-x402';
 * 
 * // Works exactly like axios
 * const response = await x402axios.get('https://api.example.com/data');
 * 
 * // With x402 payment support
 * const response = await x402axios.get('https://api.example.com/premium/data', {
 *   privateKey: process.env.PRIVATE_KEY!
 * });
 * console.log(response.data);
 * console.log(response.paymentInfo?.transactionHash);
 * ```
 * 
 * @example Seller Example - Create paid APIs
 * ```typescript
 * import { paymentMiddleware } from 'monad-x402';
 * 
 * export const middleware = paymentMiddleware(
 *   process.env.RECIPIENT_ADDRESS!,
 *   { '/api/premium/*': { price: '1000000000000000', network: 'testnet' } },
 *   { url: process.env.FACILITATOR_URL! }
 * );
 * ```
 */

// ============================================
// FOR BUYERS (Consuming Paid APIs) 🛒
// ============================================

/**
 * Main buyer function - Axios-compatible with x402 payment support
 * @recommended Use this for consuming paid APIs
 */
export { x402axios, decodeXPaymentResponse } from "./x402-axios";
export type { 
  AxiosRequestConfig,
  AxiosResponse,
  WithPaymentInterceptorOptions,
  X402Response, 
  X402PaymentResponse 
} from "./x402-axios";

// ============================================
// FOR SELLERS (Creating Paid APIs) 🏪
// ============================================

/**
 * Main seller function - Next.js middleware for payment-protected routes
 * @recommended Use this for creating paid APIs
 */
export { paymentMiddleware } from "./x402-middleware";

/**
 * AI Crawler monetization - Charge AI bots for accessing your content
 * @recommended Use this to get paid when AI crawlers access your website
 */
export {
  aiCrawlerMiddleware,
  blockAICrawlers,
  allowSpecificCrawlers,
  isAICrawler,
  getAICrawlerName,
} from "./ai-crawler-middleware";
export type { AICrawlerConfig } from "./ai-crawler-middleware";

/**
 * Universal Bot Protection - Block ALL bots without payment
 * @recommended Use this to monetize all bot traffic including scrapers and crawlers
 */
export {
  botProtectionMiddleware,
  blockAllBots,
  blockAllBotsExceptSEO,
  isBot,
  getBotType,
} from "./bot-protection-middleware";
export type { BotProtectionConfig } from "./bot-protection-middleware";

/**
 * Configuration types for sellers
 */
export type { RouteConfig, FacilitatorConfig } from "./x402-types";

/**
 * Low-level facilitator functions (advanced usage)
 */
export {
  verifyPaymentSimple,
  settlePaymentSimple,
  createPaymentResponse,
} from "./facilitator-client";

// ============================================
// UTILITIES (Advanced Usage) 🔧
// ============================================

/**
 * Monad blockchain utilities
 */
export {
  createMonadProvider,
  createMonadWallet,
  buildTransferTransaction,
  signTransaction,
  submitTransaction,
  waitForTransaction,
  verifyTransaction,
  parseSignedTransaction,
  getBalance,
  formatMON,
  parseMON,
  getExplorerUrl,
  getAddressExplorerUrl,
  generateWallet,
  isValidAddress,
  isValidPrivateKey,
  MONAD_TESTNET_RPC,
  MONAD_TESTNET_CHAIN_ID,
  MONAD_TESTNET_EXPLORER,
} from "./monad-utils";