"use client";
import { useState, useEffect } from "react";
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';

type Tab = {
  name: string;
  code: string;
  language: string;
};

const tabs: Tab[] = [
  {
    name: "Puppeteer",
    language: "javascript",
    code: `import puppeteer from 'puppeteer';

const browser = await puppeteer.connect({
  browserWSEndpoint: 'wss://api.browser.autos?token=YOUR_TOKEN'
});
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'page.png' });
await browser.close();`,
  },
  {
    name: "Playwright",
    language: "javascript",
    code: `import { chromium } from 'playwright';

const browser = await chromium.connect('wss://api.browser.autos?token=YOUR_TOKEN');
const page = await browser.newPage();
await page.goto('https://example.com');
await page.pdf({ path: 'page.pdf' });
await browser.close();`,
  },
  {
    name: "cURL",
    language: "bash",
    code: `curl -X POST https://api.browser.autos/screenshot \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "viewport": {
      "width": 1280,
      "height": 800
    },
    "type": "png"
  }' \\
  > page.png`,
  },
  {
    name: "Python",
    language: "python",
    code: `from playwright.async_api import async_playwright
import asyncio

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp('wss://api.browser.autos?token=YOUR_TOKEN')
        page = await browser.new_page()
        await page.goto('https://example.com')
        await page.screenshot(path='page.png')
        await browser.close()

asyncio.run(main())`,
  },
];

export default function CodeTabs() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
    
    // 自定义代码高亮样式
    const style = document.createElement('style');
    style.textContent = `
      .token.comment,
      .token.prolog,
      .token.doctype,
      .token.cdata {
        color: #64748b;
      }
      
      .token.punctuation {
        color: #cbd5e1;
      }
      
      .token.property,
      .token.tag,
      .token.boolean,
      .token.number,
      .token.constant,
      .token.symbol,
      .token.deleted {
        color: #f87171;
      }
      
      .token.selector,
      .token.attr-name,
      .token.string,
      .token.char,
      .token.builtin,
      .token.inserted {
        color: #34d399;
      }
      
      .token.operator,
      .token.entity,
      .token.url,
      .language-css .token.string,
      .style .token.string {
        color: #fbbf24;
      }
      
      .token.atrule,
      .token.attr-value,
      .token.keyword {
        color: #a78bfa;
      }
      
      .token.function,
      .token.class-name {
        color: #60a5fa;
      }
      
      .token.regex,
      .token.important,
      .token.variable {
        color: #fb7185;
      }
    `;
    
    if (!document.querySelector('#custom-prism-theme')) {
      style.id = 'custom-prism-theme';
      document.head.appendChild(style);
    }
  }, [active]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tabs[active].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="flex justify-between items-center gap-2 p-4 border-b border-white/10 bg-slate-800/40 backdrop-blur-sm">
        <div className="flex gap-2">
          {tabs.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active === i
                  ? "bg-violet-600 text-white shadow-lg scale-105"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-105"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600/90 text-white hover:bg-violet-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </>
          )}
        </button>
      </div>
      <pre className="p-6 text-sm md:text-base overflow-auto bg-slate-900/50 backdrop-blur-sm min-h-[400px] text-slate-100 leading-relaxed">
        <code className={`language-${tabs[active].language} text-slate-100`} style={{
          color: '#f1f5f9',
          background: 'transparent'
        }}>
          {tabs[active].code}
        </code>
      </pre>
    </div>
  );
}