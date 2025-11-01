"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DocsPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from public folder
    fetch('/docs/README.md')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.text();
      })
      .then(text => {
        setContent(text);
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
              <Link
                href="https://github.com/shashwatraajsingh/M-x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="/"
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Documentation Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 md:p-12">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
            </div>
          ) : (
            <div className="prose prose-zinc max-w-none">
              <div className="mb-8 pb-8 border-b border-zinc-200">
                <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                  Documentation
                </h1>
                <p className="text-lg text-zinc-600">
                  Complete guide to building with Monad x402
                </p>
              </div>
              
              {/* Quick Links */}
              <div className="grid md:grid-cols-2 gap-4 mb-12">
                <Link
                  href="/docs/getting-started"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    ▶ Getting Started
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    Quick start guides for sellers and buyers
                  </p>
                </Link>
                
                <Link
                  href="/docs/core-concepts"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    ◆ Core Concepts
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    HTTP 402 protocol and facilitator architecture
                  </p>
                </Link>
                
                <Link
                  href="/docs/api-reference"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    ■ API Reference
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    Complete API documentation and types
                  </p>
                </Link>
                
                <Link
                  href="/docs/examples"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    ◉ Examples
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    Code examples and real-world use cases
                  </p>
                </Link>
                
                <a
                  href="https://github.com/shashwatraajsingh/M-x402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    ◈ GitHub
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    View source code and contribute
                  </p>
                </a>
                
                <Link
                  href="/docs/guides/ai-ide-integration"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    ● Integration through AI
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    Use Cursor IDE and AI assistants to integrate
                  </p>
                </Link>
                
                <Link
                  href="/docs/guides/ai-crawler-monetization"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    $ AI Crawler Monetization
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    Get paid when AI crawls your website
                  </p>
                </Link>
                
                <Link
                  href="/docs/guides/universal-bot-protection"
                  className="group block p-6 rounded-xl border-2 border-zinc-200 hover:border-zinc-900 hover:shadow-lg transition-all no-underline"
                >
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                    ◈ Universal Bot Protection
                  </h3>
                  <p className="text-zinc-600 text-sm">
                    Block ALL bots without payment
                  </p>
                </Link>
              </div>

              {/* Main Documentation Content */}
              <div className="mt-8 pt-8 border-t border-zinc-200">
                <div 
                  className="markdown-content space-y-6 text-base"
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.75',
                    color: '#18181b'
                  }}
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(content) }}
                />
              </div>
              
              <style jsx global>{`
                .markdown-content h1 {
                  font-size: 2.5rem;
                  font-weight: 800;
                  color: #18181b;
                  margin-top: 2rem;
                  margin-bottom: 1.5rem;
                  line-height: 1.2;
                }
                .markdown-content h2 {
                  font-size: 2rem;
                  font-weight: 700;
                  color: #18181b;
                  margin-top: 3rem;
                  margin-bottom: 1.25rem;
                  line-height: 1.3;
                }
                .markdown-content h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: #27272a;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  line-height: 1.4;
                }
                .markdown-content p {
                  font-size: 1.0625rem;
                  color: #3f3f46;
                  margin-bottom: 1.5rem;
                  line-height: 1.8;
                }
                .markdown-content strong {
                  font-weight: 700;
                  color: #18181b;
                }
                .markdown-content a {
                  color: #2563eb;
                  text-decoration: none;
                  font-weight: 500;
                }
                .markdown-content a:hover {
                  text-decoration: underline;
                }
                .markdown-content ul, .markdown-content ol {
                  margin-bottom: 1.5rem;
                  padding-left: 1.5rem;
                }
                .markdown-content li {
                  font-size: 1.0625rem;
                  color: #3f3f46;
                  margin-bottom: 0.75rem;
                  line-height: 1.75;
                }
                .markdown-content code {
                  background-color: #f4f4f5;
                  padding: 0.25rem 0.5rem;
                  border-radius: 0.375rem;
                  font-size: 0.9375rem;
                  color: #18181b;
                  font-family: 'Courier New', monospace;
                }
                .markdown-content pre {
                  background-color: #18181b;
                  color: #fafafa;
                  padding: 1.5rem;
                  border-radius: 0.75rem;
                  overflow-x: auto;
                  margin-bottom: 1.5rem;
                  font-size: 0.9375rem;
                  line-height: 1.6;
                }
                .markdown-content pre code {
                  background-color: transparent;
                  padding: 0;
                  color: #fafafa;
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Lists
  html = html.replace(/^\d+\) (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Code blocks (using multiline flag)
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```/g, '');
    return `<pre><code>${code}</code></pre>`;
  });
  
  return html;
}
