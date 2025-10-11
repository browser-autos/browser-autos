'use client';

import CodeTabs from "@/components/CodeTabs";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative mx-auto max-w-8xl px-8 py-32 lg:py-40">
          <div className="text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-sm text-violet-300">
                {t('hero.badge')}
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                  {t('hero.title')}
                </span>
              </h1>
              <p className="text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <a
                  href="/playground"
                  className="px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/25 transform hover:scale-105"
                >
                  🎮 {t('hero.cta.start')}
                </a>
                <a
                  href="http://localhost:3001/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  📚 {t('hero.cta.docs')}
                </a>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-white/20 overflow-hidden backdrop-blur-lg bg-slate-900/70 shadow-2xl">
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-800/70 backdrop-blur-sm border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500/80"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-500/80"></div>
                  <div className="w-4 h-4 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-slate-300 text-base font-mono">terminal</span>
              </div>
              <CodeTabs />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-8xl px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 px-4 py-2 text-sm font-medium">
              {t('features.badge')}
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">{t('features.title')}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: t('features.api.title'), desc: t('features.api.desc'), tag: t('features.api.tag') },
            { title: t('features.concurrency.title'), desc: t('features.concurrency.desc'), tag: t('features.concurrency.tag') },
            { title: t('features.observability.title'), desc: t('features.observability.desc'), tag: t('features.observability.tag') },
            { title: t('features.screenshot.title'), desc: t('features.screenshot.desc'), tag: t('features.screenshot.tag') },
            { title: t('features.scraping.title'), desc: t('features.scraping.desc'), tag: t('features.scraping.tag') },
            { title: t('features.webhook.title'), desc: t('features.webhook.desc'), tag: t('features.webhook.tag') },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl border-2 border-slate-200 p-8 bg-white hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300"
            >
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-700">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{f.title}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-8xl px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium">
              {t('usecases.badge')}
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">{t('usecases.title')}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('usecases.subtitle')}
            </p>
          </div>
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
           {[
             { title: t('usecases.ecommerce.title'), desc: t('usecases.ecommerce.desc'), tag: t('usecases.ecommerce.tag') },
             { title: t('usecases.reports.title'), desc: t('usecases.reports.desc'), tag: t('usecases.reports.tag') },
             { title: t('usecases.seo.title'), desc: t('usecases.seo.desc'), tag: t('usecases.seo.tag') },
             { title: t('usecases.pdf.title'), desc: t('usecases.pdf.desc'), tag: t('usecases.pdf.tag') },
             { title: t('usecases.captcha.title'), desc: t('usecases.captcha.desc'), tag: t('usecases.captcha.tag') },
             { title: t('usecases.testing.title'), desc: t('usecases.testing.desc'), tag: t('usecases.testing.tag') },
           ].map((u) => (
             <div key={u.title} className="group rounded-3xl border-2 border-slate-200 p-8 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
               <div className="mb-4">
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                   {u.tag}
                 </span>
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-4">{u.title}</h3>
               <p className="text-lg text-slate-600 leading-relaxed">{u.desc}</p>
             </div>
           ))}
           </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-8xl px-8">
          <div className="text-center space-y-6 mb-20">
             <div className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-medium">
               {t('workflow.badge')}
             </div>
             <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">{t('workflow.title')}</h2>
             <p className="text-xl text-slate-600 max-w-3xl mx-auto">
               {t('workflow.subtitle')}
             </p>
          </div>
           <div className="grid lg:grid-cols-3 gap-12">
           {[
             { step: "1", title: t('workflow.token.title'), desc: t('workflow.token.desc'), tag: t('workflow.token.tag') },
             { step: "2", title: t('workflow.api.title'), desc: t('workflow.api.desc'), tag: t('workflow.api.tag') },
             { step: "3", title: t('workflow.result.title'), desc: t('workflow.result.desc'), tag: t('workflow.result.tag') },
           ].map((h, index) => (
             <div key={h.step} className="relative">
               {index < 2 && (
                 <div className="hidden lg:block absolute top-16 left-full w-12 h-0.5 bg-gradient-to-r from-violet-300 to-purple-300 z-10"></div>
               )}
               <div className="group rounded-3xl border-2 border-slate-200 p-10 bg-white hover:border-green-300 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white flex items-center justify-center text-xl font-bold">
                     {h.step}
                   </div>
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                     {h.tag}
                   </span>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-4">{h.title}</h3>
                 <p className="text-lg text-slate-600 leading-relaxed">{h.desc}</p>
               </div>
             </div>
           ))}
           </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-32 bg-slate-900 text-white">
        <div className="mx-auto max-w-8xl px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center rounded-full bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-300">
              {t('integrations.badge')}
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight">{t('integrations.title')}</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('integrations.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: t('integrations.webhook.title'), desc: t('integrations.webhook.desc'), tag: t('integrations.webhook.tag') },
            { title: t('integrations.queue.title'), desc: t('integrations.queue.desc'), tag: t('integrations.queue.tag') },
            { title: t('integrations.storage.title'), desc: t('integrations.storage.desc'), tag: t('integrations.storage.tag') },
            { title: t('integrations.database.title'), desc: t('integrations.database.desc'), tag: t('integrations.database.tag') },
            { title: t('integrations.cicd.title'), desc: t('integrations.cicd.desc'), tag: t('integrations.cicd.tag') },
            { title: t('integrations.automation.title'), desc: t('integrations.automation.desc'), tag: t('integrations.automation.tag') },
          ].map((i) => (
            <div key={i.title} className="group rounded-3xl border-2 border-slate-700 p-8 bg-slate-800/50 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                  {i.tag}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{i.title}</h3>
              <p className="text-lg text-white/70 leading-relaxed">{i.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Reliability */}
      <section id="reliability" className="py-32 bg-slate-800 text-white">
        <div className="mx-auto max-w-8xl px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center rounded-full bg-green-500/20 border border-green-500/30 px-4 py-2 text-sm font-medium text-green-300">
              {t('reliability.badge')}
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight">{t('reliability.title')}</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t('reliability.subtitle')}
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
          {[
            { title: t('reliability.logs.title'), desc: t('reliability.logs.desc'), tag: t('reliability.logs.tag') },
            { title: t('reliability.metrics.title'), desc: t('reliability.metrics.desc'), tag: t('reliability.metrics.tag') },
            { title: t('reliability.retry.title'), desc: t('reliability.retry.desc'), tag: t('reliability.retry.tag') },
          ].map((r) => (
            <div key={r.title} className="group rounded-3xl border-2 border-slate-700 p-10 bg-slate-800/50 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300">
                  {r.tag}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{r.title}</h3>
              <p className="text-lg text-white/70 leading-relaxed">{r.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-8xl px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-4 py-2 text-sm font-medium">
              {t('security.badge')}
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">{t('security.title')}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('security.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: t('security.isolation.title'), desc: t('security.isolation.desc'), tag: t('security.isolation.tag') },
            { title: t('security.ratelimit.title'), desc: t('security.ratelimit.desc'), tag: t('security.ratelimit.tag') },
            { title: t('security.permissions.title'), desc: t('security.permissions.desc'), tag: t('security.permissions.tag') },
            { title: t('security.audit.title'), desc: t('security.audit.desc'), tag: t('security.audit.tag') },
            { title: t('security.region.title'), desc: t('security.region.desc'), tag: t('security.region.tag') },
            { title: t('security.compliance.title'), desc: t('security.compliance.desc'), tag: t('security.compliance.tag') },
          ].map((s) => (
            <div key={s.title} className="group rounded-3xl border-2 border-slate-200 p-8 bg-white hover:border-red-300 hover:shadow-xl hover:shadow-red-100/50 transition-all duration-300">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  {s.tag}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{s.title}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-white">
        <div className="mx-auto max-w-8xl px-8">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 px-4 py-2 text-sm font-medium">
              {t('pricing.badge')}
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">{t('pricing.title')}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-10">
          {[
            { name: t('pricing.dev.name'), price: t('pricing.dev.price'), desc: t('pricing.dev.desc'), features: [t('pricing.dev.feature1'), t('pricing.dev.feature2'), t('pricing.dev.feature3')], popular: false },
            { name: t('pricing.pro.name'), price: t('pricing.pro.price'), desc: t('pricing.pro.desc'), features: [t('pricing.pro.feature1'), t('pricing.pro.feature2'), t('pricing.pro.feature3'), t('pricing.pro.feature4')], popular: true },
            { name: t('pricing.enterprise.name'), price: t('pricing.enterprise.price'), desc: t('pricing.enterprise.desc'), features: [t('pricing.enterprise.feature1'), t('pricing.enterprise.feature2'), t('pricing.enterprise.feature3'), t('pricing.enterprise.feature4')], popular: false },
          ].map((p) => (
            <div key={p.name} className={`relative rounded-3xl border-2 p-10 ${p.popular ? 'border-violet-300 bg-gradient-to-b from-violet-50 to-white shadow-xl shadow-violet-100/50' : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50'} transition-all duration-300`}>
              {p.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {t('pricing.popular')}
                  </div>
                </div>
              )}
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">{p.name}</h3>
                <div className="text-4xl font-bold text-slate-900">{p.price}</div>
                <p className="text-lg text-slate-600">{p.desc}</p>
                <ul className="space-y-3 text-left">
                  {p.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a 
                  href="#contact" 
                  className={`inline-flex h-12 items-center rounded-2xl px-8 text-lg font-semibold transition-all duration-300 ${
                    p.popular 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {t('pricing.cta')}
                </a>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Docs CTA */}
      <section id="docs" className="py-32 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="mx-auto max-w-8xl px-8">
          <div className="rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-12">
            <div className="text-center space-y-8">
              <h3 className="text-4xl font-bold text-white">{t('docs.title')}</h3>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {t('docs.subtitle')}
              </p>
              <a 
                href="#" 
                className="inline-flex h-14 items-center rounded-2xl bg-white text-violet-600 px-8 text-lg font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg"
              >
                {t('docs.cta')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32 bg-slate-50">
        <div className="mx-auto max-w-4xl px-8">
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-12 shadow-xl">
            <div className="text-center space-y-8">
              <h3 className="text-4xl font-bold text-slate-900">{t('contact.title')}</h3>
              <p className="text-xl text-slate-600">
                {t('contact.subtitle')}
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder={t('contact.placeholder')}
                  className="flex-1 rounded-2xl border-2 border-slate-300 px-6 h-14 bg-white text-lg focus:border-violet-500 focus:outline-none transition-colors"
                />
                <button className="inline-flex h-14 items-center rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 text-lg font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-violet-500/25">
                  {t('contact.cta')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
