"use client";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur text-white">
      <div className="mx-auto max-w-6xl px-8 py-6 flex items-center justify-end">
        <Link href="/" className="font-semibold text-2xl tracking-tight text-white mr-auto">
          browser.autos
        </Link>
        
        {/* 导航菜单和操作按钮整体居右 */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8 text-lg">
            <a href="#product" className="hover:underline text-white/90 hover:text-white transition-colors">{t('nav.product')}</a>
            <span className="text-white/40">/</span>
            <a href="#features" className="hover:underline text-white/90 hover:text-white transition-colors">{t('nav.features')}</a>
            <span className="text-white/40">/</span>
            <a href="#pricing" className="hover:underline text-white/90 hover:text-white transition-colors">{t('nav.pricing')}</a>
            <span className="text-white/40">/</span>
            <a href="#docs" className="hover:underline text-white/90 hover:text-white transition-colors">{t('nav.docs')}</a>
          </nav>
          
          <Link
            href="#contact"
            className="inline-flex h-12 items-center rounded-full bg-violet-600 text-white px-10 text-lg font-medium hover:bg-violet-500 transition-colors"
          >
            {t('nav.start')}
          </Link>
          <LanguageSwitcher />
        </div>
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-700 text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="i-[menu]">☰</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95">
          <div className="mx-auto max-w-6xl px-8 py-6 grid gap-6 text-lg text-white">
            <a href="#product" className="hover:underline" onClick={() => setOpen(false)}>{t('nav.product')}</a>
            <a href="#features" className="hover:underline" onClick={() => setOpen(false)}>{t('nav.features')}</a>
            <a href="#pricing" className="hover:underline" onClick={() => setOpen(false)}>{t('nav.pricing')}</a>
            <a href="#docs" className="hover:underline" onClick={() => setOpen(false)}>{t('nav.docs')}</a>
            <Link href="#contact" className="hover:underline" onClick={() => setOpen(false)}>{t('nav.start')}</Link>
          </div>
        </div>
      )}
    </header>
  );
}