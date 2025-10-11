import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "browser.autos - Cloud-Native Headless Browser Platform",
  description: "Write code. Run anywhere. Scrape everything. Production-ready browser automation API powered by Playwright Chromium.",
  keywords: ["headless browser", "web scraping", "automation", "playwright", "puppeteer", "docker", "kubernetes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
