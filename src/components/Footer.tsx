"use client";
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} browser.autos · {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            <a href="#docs" className="hover:underline">{t('footer.docs')}</a>
            <a href="#pricing" className="hover:underline">{t('footer.pricing')}</a>
            <a href="#contact" className="hover:underline">{t('footer.contact')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}