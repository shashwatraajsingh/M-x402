"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UniversalBotProtectionPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/docs/guides/universal-bot-protection.md')
      .then(res => res.text())
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
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <span className="font-bold text-xl text-zinc-900">monad-x402</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/docs" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                Docs Home
              </Link>
              <Link href="https://github.com/shashwatraajsingh/M-x402" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Link href="/docs" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Documentation
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              ◈
            </div>
            <div>
              <h1 className="text-4xl font-bold text-zinc-900">Universal Bot Protection</h1>
              <p className="text-lg text-zinc-600 mt-2">Block ALL bots without payment</p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
            </div>
          ) : (
            <>
              <div 
                className="markdown-content text-lg leading-relaxed"
                style={{ fontSize: '17px', lineHeight: '1.8', color: '#18181b' }}
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(content) }}
              />
              
              <style jsx global>{`
                .markdown-content h1 { font-size: 2.5rem; font-weight: 800; color: #18181b; margin-top: 2rem; margin-bottom: 1.5rem; }
                .markdown-content h2 { font-size: 2rem; font-weight: 700; color: #18181b; margin-top: 3rem; margin-bottom: 1.25rem; }
                .markdown-content h3 { font-size: 1.5rem; font-weight: 600; color: #27272a; margin-top: 2rem; margin-bottom: 1rem; }
                .markdown-content h4 { font-size: 1.25rem; font-weight: 600; color: #3f3f46; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .markdown-content p { font-size: 1.0625rem; color: #3f3f46; margin-bottom: 1.5rem; line-height: 1.8; }
                .markdown-content strong { font-weight: 700; color: #18181b; }
                .markdown-content a { color: #2563eb; text-decoration: none; font-weight: 500; }
                .markdown-content a:hover { text-decoration: underline; }
                .markdown-content ul, .markdown-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .markdown-content li { font-size: 1.0625rem; color: #3f3f46; margin-bottom: 0.75rem; line-height: 1.75; }
                .markdown-content code { background-color: #f4f4f5; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-size: 0.9375rem; color: #18181b; font-family: 'Courier New', monospace; }
                .markdown-content pre { background-color: #18181b; color: #fafafa; padding: 1.5rem; border-radius: 0.75rem; overflow-x: auto; margin-bottom: 1.5rem; }
                .markdown-content pre code { background-color: transparent; padding: 0; color: #fafafa; }
                .markdown-content blockquote { border-left: 4px solid #e4e4e7; padding-left: 1rem; margin: 1.5rem 0; color: #52525b; font-style: italic; }
              `}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const code = match.replace(/```/g, '').trim();
    return `<pre><code>${code}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  return html;
}
