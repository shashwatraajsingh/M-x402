"use client";

import { useEffect, useState } from "react";
import { BGPattern } from "./components/BGPattern";

export default function LandingPage() {
  const [npmStats, setNpmStats] = useState<{
    downloads: number;
    version: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/npm-stats')
      .then(res => res.json())
      .then(data => setNpmStats(data))
      .catch(err => console.error('Failed to fetch NPM stats:', err));
  }, []);

  const displayDownloads = npmStats 
    ? (npmStats.downloads < 200 ? '20+' : npmStats.downloads.toLocaleString())
    : '200+';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Diagonal Stripes Background - Fixed at the back */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 -z-10">
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-edges"
          size={32}
          fill="#18181b15"
        />
      </div>
      
      {/* Animated gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-green-100/20 to-blue-100/20 rounded-full blur-3xl animate-pulse -z-10" style={{ animationDelay: '1s' }} />
      
      <div className="relative">
        {/* Navigation */}
        <nav className="container mx-auto px-6 pt-8 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-bold text-xl text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                monad-x402
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/shashwatraajsingh/M-x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/package/monad-x402"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors"
              >
                NPM Package
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-24 pb-16 max-w-6xl">
          <div className="text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-zinc-100 to-zinc-50 border border-zinc-200 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-zinc-700">Powered by Monad • 10,000 TPS</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] font-black" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-transparent">
                Monetize APIs
              </span>
              <br />
              <span className="text-zinc-900">& Block AI Crawlers</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto leading-relaxed font-light">
              Lightning-fast blockchain payments on Monad. Charge AI companies when they crawl your site. 1-second finality, 10,000 TPS.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-200" />
                <a href="/docs" className="relative px-8 py-4 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all duration-200 flex items-center gap-2">
                  <span>Get Started</span>
                  <span>→</span>
                </a>
              </div>
              <a href="/docs" className="px-8 py-4 bg-white border-2 border-zinc-200 text-zinc-900 rounded-xl font-semibold hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 inline-block">
                View Docs
              </a>
            </div>

            {/* Install Command */}
            <div className="pt-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-900/95 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-2xl">
                <span className="text-zinc-500 text-sm">$</span>
                <code className="font-mono text-sm text-zinc-100">npm install monad-x402</code>
                <button className="ml-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-md transition-colors">
                  Copy
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-12 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {displayDownloads}
                </div>
                <div className="text-sm text-zinc-500 mt-1">Weekly Downloads</div>
              </div>
              <div className="w-px h-12 bg-zinc-200" />
              {npmStats && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    v{npmStats.version}
                  </div>
                  <div className="text-sm text-zinc-500 mt-1">Latest Version</div>
                </div>
              )}
              <div className="w-px h-12 bg-zinc-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  1s
                </div>
                <div className="text-sm text-zinc-500 mt-1">Block Finality</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-24 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Why Monad?
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              The world's fastest EVM blockchain, purpose-built for high-performance applications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8 rounded-2xl border-2 border-zinc-200 bg-white hover:border-zinc-300 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 flex items-center justify-center mb-6 text-3xl shadow-lg">
                  💻
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  10,000 TPS
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  Monad processes 10,000 transactions per second with parallel execution. Handle massive scale effortlessly.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8 rounded-2xl border-2 border-zinc-200 bg-white hover:border-zinc-300 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 flex items-center justify-center mb-6 text-3xl shadow-lg">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  1-Second Finality
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  Instant settlement with 1-second block finality. 100x faster than Ethereum's 12-second blocks.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8 rounded-2xl border-2 border-zinc-200 bg-white hover:border-zinc-300 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 flex items-center justify-center mb-6 text-3xl shadow-lg">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  100x Cheaper
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  Ultra-low gas fees on Monad. Pay pennies for thousands of transactions compared to Ethereum.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* New Features Section */}
        <div className="container mx-auto px-6 py-24 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-50 border border-green-200 mb-6">
              <span className="text-sm font-semibold text-green-700">NEW</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Monetize Bot Traffic
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Get paid when AI companies and bots crawl your website. No more free data scraping.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Crawler Monetization */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8 rounded-2xl border-2 border-zinc-200 bg-white hover:border-zinc-300 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 text-white text-2xl font-bold shadow-lg">
                  $
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  AI Crawler Monetization
                </h3>
                <p className="text-zinc-600 leading-relaxed mb-6 flex-1">
                  Detect when AI companies (OpenAI, Anthropic, Google, Perplexity) crawl your website and require payment before serving content. Get compensated when AI trains on your data.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Detects GPTBot, Claude, Gemini, and 10+ AI crawlers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Payments settle in ~1 second on Monad</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Whitelist specific crawlers for SEO</span>
                  </div>
                </div>
                <a 
                  href="/docs/guides/ai-crawler-monetization" 
                  className="inline-flex items-center gap-2 text-zinc-900 font-semibold hover:gap-3 transition-all"
                >
                  <span>Learn more</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Universal Bot Protection */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8 rounded-2xl border-2 border-zinc-200 bg-white hover:border-zinc-300 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 text-white text-2xl font-bold shadow-lg">
                  ◈
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Universal Bot Protection
                </h3>
                <p className="text-zinc-600 leading-relaxed mb-6 flex-1">
                  Block ALL bots - scrapers, crawlers, headless browsers, SEO tools - and require payment. Protect your content from unauthorized automated access while maintaining SEO.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Blocks 60+ bot patterns across 7 categories</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Behavioral detection with strict mode</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Allow search engines, charge everything else</span>
                  </div>
                </div>
                <a 
                  href="/docs/guides/universal-bot-protection" 
                  className="inline-flex items-center gap-2 text-zinc-900 font-semibold hover:gap-3 transition-all"
                >
                  <span>Learn more</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Code Example */}
          <div className="mt-12 p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="ml-2 text-zinc-400 text-sm font-mono">middleware.ts</span>
            </div>
            <pre className="text-zinc-100 text-sm font-mono overflow-x-auto">
{`import { aiCrawlerMiddleware } from 'monad-x402';

export const middleware = aiCrawlerMiddleware({
  enabled: true,
  price: '1000000000000000',  // 0.001 MON per page
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS!,
  network: 'testnet'
});

// When GPTBot crawls your site → You get paid 💰`}
            </pre>
          </div>
        </div>

        {/* Code Example Section */}
        <div className="container mx-auto px-6 pb-24 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Three steps to monetize
            </h2>
            <p className="text-lg text-zinc-600">
              Get started in under 5 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-sm flex flex-col">
              <div className="p-5 border-b border-zinc-200 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <h3 className="font-semibold text-zinc-900">
                    Configure middleware
                  </h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="overflow-x-auto rounded-lg bg-zinc-900">
                  <pre className="text-zinc-100 p-3 text-[10px] leading-[1.4] font-mono">
{`// middleware.ts
import { paymentMiddleware }
  from 'monad-x402';

export const middleware =
  paymentMiddleware(
    process.env
      .PAYMENT_RECIPIENT_ADDRESS!,
    {
      '/api/premium/crypto-signals': {
        price: '1000000',
        network: 'testnet',
      }
    },
    { url: process.env
        .FACILITATOR_URL! }
  );`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-sm flex flex-col">
              <div className="p-5 border-b border-zinc-200 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <h3 className="font-semibold text-zinc-900">
                    Write your API route
                  </h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="overflow-x-auto rounded-lg bg-zinc-900">
                  <pre className="text-zinc-100 p-3 text-[10px] leading-[1.4] font-mono">
{`// route.ts
import { NextResponse }
  from 'next/server';

export async function GET() {
  // Payment already verified!
  
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
  );
  const data = await response.json();

  return NextResponse.json({
    bitcoin: data.bitcoin.usd,
    ethereum: data.ethereum.usd,
    premium: true
  });
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-sm flex flex-col">
              <div className="p-5 border-b border-zinc-200 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <h3 className="font-semibold text-zinc-900">
                    Client pays automatically
                  </h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="overflow-x-auto rounded-lg bg-zinc-900">
                  <pre className="text-zinc-100 p-3 text-[10px] leading-[1.4] font-mono">
{`// client.ts
import { x402axios }
  from 'monad-x402';

const result = await x402axios.get(
  'https://api.example.com/premium/crypto-signals',
  {
    privateKey: '0x...'
  }
);

// Done! Payment handled
console.log(result.data);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-6 py-24 max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-12 md:p-20">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Build on the Fastest EVM
              </h2>
              <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
                Join the Monad ecosystem. 10,000 TPS. 1-second finality. 100x cheaper than Ethereum.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a href="/docs" className="px-8 py-4 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-zinc-100 transition-all duration-200 shadow-xl inline-block">
                  Get Started Now
                </a>
                <a href="/docs" className="px-8 py-4 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 transition-all duration-200 border border-zinc-700 inline-block">
                  Read Documentation
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-16 max-w-6xl border-t border-zinc-200">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <span className="font-bold text-xl text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  monad-x402
                </span>
              </div>
              <p className="text-zinc-600 max-w-sm">
                Built on Monad - the world's most performant EVM blockchain. Enabling instant, low-cost micropayments for APIs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-zinc-600">
                <li><a href="/docs" className="hover:text-zinc-900 transition-colors">Documentation</a></li>
                <li><a href="/docs/getting-started" className="hover:text-zinc-900 transition-colors">Getting Started</a></li>
                <li><a href="/docs/api-reference" className="hover:text-zinc-900 transition-colors">API Reference</a></li>
                <li><a href="/docs/examples" className="hover:text-zinc-900 transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-4">Community</h3>
              <ul className="space-y-2 text-zinc-600">
                <li>
                  <a 
                    href="https://github.com/shashwatraajsingh/M-x402" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-zinc-900 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.npmjs.com/package/monad-x402" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-zinc-900 transition-colors"
                  >
                    NPM
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © 2025 monad-x402. Built for the Monad ecosystem.
            </p>
            <p className="text-sm text-zinc-500">
              Made with ⚡ by <span className="font-semibold text-zinc-700">Shashwat Raj Singh</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
