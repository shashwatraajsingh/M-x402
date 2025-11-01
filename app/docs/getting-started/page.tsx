"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GettingStartedPage() {
  const [sellerContent, setSellerContent] = useState<string>("");
  const [buyerContent, setBuyerContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/docs/getting-started/quickstart-sellers.md').then(res => res.text()),
      fetch('/docs/getting-started/quickstart-buyers.md').then(res => res.text())
    ])
      .then(([seller, buyer]) => {
        setSellerContent(seller);
        setBuyerContent(buyer);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load docs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-bold text-xl text-zinc-900">
                monad-x402
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                Docs Home
              </Link>
              <Link
                href="https://github.com/shashwatraajsingh/M-x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-8">
          <Link href="/docs" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Getting Started</h1>
          <p className="text-lg text-zinc-600">
            Quick start guides to build with Monad x402
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Sellers Guide */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl mb-4">
                  💰
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">For API Sellers</h2>
                <p className="text-zinc-600">Monetize your APIs with Monad payments</p>
              </div>
              <div 
                className="prose prose-sm prose-zinc max-w-none"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(sellerContent.slice(0, 500)) }}
              />
              <Link 
                href="/docs/getting-started/sellers"
                className="mt-6 inline-block px-6 py-3 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
              >
                Read Full Guide →
              </Link>
            </div>

            {/* Buyers Guide */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl mb-4">
                  🛒
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">For API Buyers</h2>
                <p className="text-zinc-600">Consume paid APIs with automatic payments</p>
              </div>
              <div 
                className="prose prose-sm prose-zinc max-w-none"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(buyerContent.slice(0, 500)) }}
              />
              <Link 
                href="/docs/getting-started/buyers"
                className="mt-6 inline-block px-6 py-3 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
              >
                Read Full Guide →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  return html;
}
