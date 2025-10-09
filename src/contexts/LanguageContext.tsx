'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 检测浏览器语言
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh';
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'zh-CN';
  return browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
};

// 翻译数据
const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Navigation
    'nav.product': '产品',
    'nav.features': '功能',
    'nav.pricing': '定价',
    'nav.docs': '文档',
    'nav.start': '开始使用',
    
    // Hero Section
    'hero.badge': '全新浏览器自动化平台',
    'hero.title': 'Browser.autos',
    'hero.subtitle': '企业级浏览器自动化 API，让截图、PDF 生成、数据抓取变得简单可靠',
    'hero.cta.start': '免费开始使用',
    'hero.cta.docs': '查看文档',
    
    // Features
    'features.badge': '核心功能',
    'features.title': '强大的功能特性',
    'features.subtitle': '从简单的截图到复杂的数据抓取，我们提供企业级的浏览器自动化解决方案',
    'features.api.title': '无头浏览器 API',
    'features.api.desc': '稳定托管的 Chrome/Playwright 实例，随时可用',
    'features.api.tag': 'API',
    'features.concurrency.title': '并发与队列',
    'features.concurrency.desc': '智能限流与任务优先级，确保系统稳定',
    'features.concurrency.tag': '性能',
    'features.observability.title': '可观测性',
    'features.observability.desc': '完整的日志、指标与失败重试机制',
    'features.observability.tag': '监控',
    'features.screenshot.title': '截图与 PDF',
    'features.screenshot.desc': '高质量全页面截图、元素截图、PDF 导出',
    'features.screenshot.tag': '输出',
    'features.scraping.title': '数据抓取',
    'features.scraping.desc': '应对验证码与反爬策略的智能采集',
    'features.scraping.tag': '采集',
    'features.webhook.title': 'Webhook 集成',
    'features.webhook.desc': '事件驱动回调，无缝连接你的系统',
    'features.webhook.tag': '集成',
    
    // Use Cases
    'usecases.badge': '应用场景',
    'usecases.title': '实际应用案例',
    'usecases.subtitle': '看看其他企业如何使用 Browser.autos 解决实际业务问题',
    'usecases.ecommerce.title': '电商采集',
    'usecases.ecommerce.desc': '批量采集商品详情、价格与库存，智能应对反爬策略',
    'usecases.ecommerce.tag': '电商',
    'usecases.reports.title': '报告截图',
    'usecases.reports.desc': '定时生成多页面仪表盘截图，自动发送到邮箱或 Slack',
    'usecases.reports.tag': '报告',
    'usecases.seo.title': 'SEO 渲染',
    'usecases.seo.desc': '为 SPA 提供预渲染服务，显著改善搜索引擎收录',
    'usecases.seo.tag': 'SEO',
    'usecases.pdf.title': 'PDF 发票',
    'usecases.pdf.desc': '将 HTML 模板渲染为专业 PDF 发票与合同，支持批量生成',
    'usecases.pdf.tag': '文档',
    'usecases.captcha.title': '验证码处理',
    'usecases.captcha.desc': '结合第三方服务与智能策略，稳定通过各类验证码',
    'usecases.captcha.tag': '安全',
    'usecases.testing.title': '自动化测试',
    'usecases.testing.desc': '运行端到端浏览器测试，详细记录日志与失败重试',
    'usecases.testing.tag': '测试',
    
    // How It Works
    'workflow.badge': '工作流程',
    'workflow.title': '三步开始使用',
    'workflow.subtitle': '简单的 API 调用，强大的浏览器自动化能力',
    'workflow.token.title': '获取令牌',
    'workflow.token.desc': '在控制台创建访问令牌并设置权限范围，几分钟即可完成',
    'workflow.token.tag': '认证',
    'workflow.api.title': '调用 API',
    'workflow.api.desc': '使用 SDK 或 HTTP 发起任务，系统自动分配浏览器实例',
    'workflow.api.tag': '执行',
    'workflow.result.title': '获取结果',
    'workflow.result.desc': '通过 Webhook、轮询或存储集成接收截图/PDF/数据',
    'workflow.result.tag': '结果',
    
    // Code Examples
    'examples.badge': '代码示例',
    'examples.title': '快速开始',
    'examples.subtitle': '选择你熟悉的编程语言，几行代码即可开始使用',
    
    // Integrations
    'integrations.badge': '系统集成',
    'integrations.title': '无缝集成',
    'integrations.subtitle': '与你现有的技术栈完美融合，快速构建自动化工作流',
    'integrations.webhook.title': 'Webhook',
    'integrations.webhook.desc': '任务完成事件回调，无缝串联你的系统',
    'integrations.webhook.tag': '回调',
    'integrations.queue.title': '队列/Kafka',
    'integrations.queue.desc': '与消息队列集成，支持重试与优先级',
    'integrations.queue.tag': '消息',
    'integrations.storage.title': '对象存储',
    'integrations.storage.desc': '截图与 PDF 输出到 S3/OSS 等存储',
    'integrations.storage.tag': '存储',
    'integrations.database.title': '数据库',
    'integrations.database.desc': '把采集结果直接写入数据库或数据仓库',
    'integrations.database.tag': '数据',
    'integrations.cicd.title': 'CI/CD',
    'integrations.cicd.desc': '与测试流水线集成，记录日志与失败报告',
    'integrations.cicd.tag': '流水线',
    'integrations.automation.title': 'Zapier/IFTTT',
    'integrations.automation.desc': '连接常见自动化平台，快速搭建工作流',
    'integrations.automation.tag': '自动化',
    
    // Reliability
    'reliability.badge': '可靠性保障',
    'reliability.title': '可观测性与稳定性',
    'reliability.subtitle': '企业级监控与告警，确保你的自动化任务稳定运行',
    'reliability.logs.title': '实时日志',
    'reliability.logs.desc': '查看浏览器与任务日志，快速定位问题根源',
    'reliability.logs.tag': '日志',
    'reliability.metrics.title': '指标与告警',
    'reliability.metrics.desc': '并发、耗时、错误率等关键指标，支持告警与通知',
    'reliability.metrics.tag': '监控',
    'reliability.retry.title': '失败重试/录屏',
    'reliability.retry.desc': '自动重试机制并可选录屏，便于排查复杂问题',
    'reliability.retry.tag': '重试',
    
    // Security
    'security.badge': '安全保障',
    'security.title': '安全与合规',
    'security.subtitle': '企业级安全标准，全方位保护你的数据与隐私',
    'security.isolation.title': '隔离运行',
    'security.isolation.desc': '实例级隔离与沙箱环境，降低相互影响风险',
    'security.isolation.tag': '隔离',
    'security.ratelimit.title': '速率限制',
    'security.ratelimit.desc': '令牌与项目级智能限流，保护后端系统稳定',
    'security.ratelimit.tag': '限流',
    'security.permissions.title': '令牌权限',
    'security.permissions.desc': '细粒度访问控制与过期策略，确保安全无忧',
    'security.permissions.tag': '权限',
    'security.audit.title': '审计日志',
    'security.audit.desc': '记录重要操作与访问轨迹，满足企业审计需求',
    'security.audit.tag': '审计',
    'security.region.title': '地区选择',
    'security.region.desc': '多区域部署选项，满足数据驻留与延迟需求',
    'security.region.tag': '地区',
    'security.compliance.title': '合规友好',
    'security.compliance.desc': '支持企业合规流程与私有部署选项',
    'security.compliance.tag': '合规',
    
    // Pricing
    'pricing.badge': '定价方案',
    'pricing.title': '选择适合的方案',
    'pricing.subtitle': '从个人开发者到企业用户，我们都有合适的定价方案',
    'pricing.dev.name': '开发版',
    'pricing.dev.price': '免费',
    'pricing.dev.desc': '适合个人开发者与小型项目测试使用',
    'pricing.dev.feature1': '每月 1000 次请求',
    'pricing.dev.feature2': '基础 API 支持',
    'pricing.dev.feature3': '社区支持',
    'pricing.pro.name': '专业版',
    'pricing.pro.price': '¥499/月',
    'pricing.pro.desc': '适合中小企业与高频使用场景',
    'pricing.pro.feature1': '每月 50000 次请求',
    'pricing.pro.feature2': '完整可观测性',
    'pricing.pro.feature3': '邮件支持',
    'pricing.pro.feature4': 'SLA 保障',
    'pricing.enterprise.name': '企业版',
    'pricing.enterprise.price': '联系销售',
    'pricing.enterprise.desc': '适合大型企业与定制化需求',
    'pricing.enterprise.feature1': '无限制请求',
    'pricing.enterprise.feature2': '私有部署选项',
    'pricing.enterprise.feature3': '专属客户经理',
    'pricing.enterprise.feature4': '定制开发',
    'pricing.popular': '最受欢迎',
    'pricing.cta': '开始使用',
    'pricing.enterprise.cta': '联系销售',
    
    // Docs section
    'docs.title': '开发者文档',
    'docs.subtitle': '详细的 API 参考、快速开始指南、最佳实践与丰富示例，助你快速上手',
    'docs.cta': '查看文档 →',
    
    // Contact
    'contact.title': '联系我们',
    'contact.subtitle': '有任何问题或需要定制方案？留下你的联系方式，我们会尽快与您取得联系',
    'contact.placeholder': 'your@email.com',
    'contact.cta': '立即联系',
    
    // Footer
    'footer.copyright': '更简单的浏览器自动化平台',
    'footer.docs': '文档',
    'footer.pricing': '定价',
    'footer.contact': '联系我们',
  },
  en: {
    // Navigation
    'nav.product': 'Product',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.docs': 'Docs',
    'nav.start': 'Get Started',
    
    // Hero Section
    'hero.badge': 'Next-Gen Browser Automation Platform',
    'hero.title': 'Browser.autos',
    'hero.subtitle': 'Enterprise-grade browser automation API that makes screenshots, PDF generation, and data scraping simple and reliable',
    'hero.cta.start': 'Get Started Free',
    'hero.cta.docs': 'View Documentation',
    
    // Features
    'features.badge': 'Core Features',
    'features.title': 'Powerful Capabilities',
    'features.subtitle': 'From simple screenshots to complex data scraping, we provide enterprise-grade browser automation solutions',
    'features.api.title': 'Headless Browser API',
    'features.api.desc': 'Stable hosted Chrome/Playwright instances, ready to use',
    'features.api.tag': 'API',
    'features.concurrency.title': 'Concurrency & Queuing',
    'features.concurrency.desc': 'Smart rate limiting and task prioritization for system stability',
    'features.concurrency.tag': 'Performance',
    'features.observability.title': 'Observability',
    'features.observability.desc': 'Complete logging, metrics, and failure retry mechanisms',
    'features.observability.tag': 'Monitoring',
    'features.screenshot.title': 'Screenshots & PDF',
    'features.screenshot.desc': 'High-quality full-page screenshots, element screenshots, PDF export',
    'features.screenshot.tag': 'Output',
    'features.scraping.title': 'Data Scraping',
    'features.scraping.desc': 'Intelligent collection that handles CAPTCHAs and anti-bot strategies',
    'features.scraping.tag': 'Scraping',
    'features.webhook.title': 'Webhook Integration',
    'features.webhook.desc': 'Event-driven callbacks, seamlessly connect to your systems',
    'features.webhook.tag': 'Integration',
    
    // Use Cases
    'usecases.badge': 'Use Cases',
    'usecases.title': 'Real-World Applications',
    'usecases.subtitle': 'See how other enterprises use Browser.autos to solve real business problems',
    'usecases.ecommerce.title': 'E-commerce Scraping',
    'usecases.ecommerce.desc': 'Batch collect product details, prices, and inventory with smart anti-bot handling',
    'usecases.ecommerce.tag': 'E-commerce',
    'usecases.reports.title': 'Report Screenshots',
    'usecases.reports.desc': 'Generate multi-page dashboard screenshots on schedule, auto-send to email or Slack',
    'usecases.reports.tag': 'Reports',
    'usecases.seo.title': 'SEO Rendering',
    'usecases.seo.desc': 'Provide pre-rendering services for SPAs, significantly improve search engine indexing',
    'usecases.seo.tag': 'SEO',
    'usecases.pdf.title': 'PDF Invoices',
    'usecases.pdf.desc': 'Render HTML templates into professional PDF invoices and contracts with batch support',
    'usecases.pdf.tag': 'Documents',
    'usecases.captcha.title': 'CAPTCHA Handling',
    'usecases.captcha.desc': 'Combine third-party services with smart strategies to reliably pass various CAPTCHAs',
    'usecases.captcha.tag': 'Security',
    'usecases.testing.title': 'Automated Testing',
    'usecases.testing.desc': 'Run end-to-end browser tests with detailed logging and failure retry',
    'usecases.testing.tag': 'Testing',
    
    // How It Works
    'workflow.badge': 'Workflow',
    'workflow.title': 'Get Started in 3 Steps',
    'workflow.subtitle': 'Simple API calls, powerful browser automation capabilities',
    'workflow.token.title': 'Get Token',
    'workflow.token.desc': 'Create access token in console and set permission scope, complete in minutes',
    'workflow.token.tag': 'Auth',
    'workflow.api.title': 'Call API',
    'workflow.api.desc': 'Use SDK or HTTP to initiate tasks, system automatically allocates browser instances',
    'workflow.api.tag': 'Execute',
    'workflow.result.title': 'Get Results',
    'workflow.result.desc': 'Receive screenshots/PDFs/data via Webhook, polling, or storage integration',
    'workflow.result.tag': 'Results',
    
    // Code Examples
    'examples.badge': 'Code Examples',
    'examples.title': 'Quick Start',
    'examples.subtitle': 'Choose your familiar programming language, start with just a few lines of code',
    
    // Integrations
    'integrations.badge': 'System Integration',
    'integrations.title': 'Seamless Integration',
    'integrations.subtitle': 'Perfect integration with your existing tech stack, quickly build automation workflows',
    'integrations.webhook.title': 'Webhook',
    'integrations.webhook.desc': 'Task completion event callbacks, seamlessly connect your systems',
    'integrations.webhook.tag': 'Callback',
    'integrations.queue.title': 'Queue/Kafka',
    'integrations.queue.desc': 'Integrate with message queues, support retry and priority',
    'integrations.queue.tag': 'Messaging',
    'integrations.storage.title': 'Object Storage',
    'integrations.storage.desc': 'Output screenshots and PDFs to S3/OSS and other storage',
    'integrations.storage.tag': 'Storage',
    'integrations.database.title': 'Database',
    'integrations.database.desc': 'Write scraping results directly to databases or data warehouses',
    'integrations.database.tag': 'Data',
    'integrations.cicd.title': 'CI/CD',
    'integrations.cicd.desc': 'Integrate with test pipelines, record logs and failure reports',
    'integrations.cicd.tag': 'Pipeline',
    'integrations.automation.title': 'Zapier/IFTTT',
    'integrations.automation.desc': 'Connect common automation platforms, quickly build workflows',
    'integrations.automation.tag': 'Automation',
    
    // Reliability
    'reliability.badge': 'Reliability Assurance',
    'reliability.title': 'Observability & Stability',
    'reliability.subtitle': 'Enterprise-grade monitoring and alerting to ensure your automation tasks run stably',
    'reliability.logs.title': 'Real-time Logs',
    'reliability.logs.desc': 'View browser and task logs, quickly locate problem sources',
    'reliability.logs.tag': 'Logs',
    'reliability.metrics.title': 'Metrics & Alerts',
    'reliability.metrics.desc': 'Key metrics like concurrency, latency, error rates with alert and notification support',
    'reliability.metrics.tag': 'Monitoring',
    'reliability.retry.title': 'Failure Retry/Recording',
    'reliability.retry.desc': 'Automatic retry mechanism with optional screen recording for complex issue troubleshooting',
    'reliability.retry.tag': 'Retry',
    
    // Security
    'security.badge': 'Security Assurance',
    'security.title': 'Security & Compliance',
    'security.subtitle': 'Enterprise-grade security standards, comprehensive protection of your data and privacy',
    'security.isolation.title': 'Isolated Execution',
    'security.isolation.desc': 'Instance-level isolation and sandbox environment, reduce mutual impact risks',
    'security.isolation.tag': 'Isolation',
    'security.ratelimit.title': 'Rate Limiting',
    'security.ratelimit.desc': 'Token and project-level smart rate limiting, protect backend system stability',
    'security.ratelimit.tag': 'Rate Limit',
    'security.permissions.title': 'Token Permissions',
    'security.permissions.desc': 'Fine-grained access control and expiration policies, ensure security',
    'security.permissions.tag': 'Permissions',
    'security.audit.title': 'Audit Logs',
    'security.audit.desc': 'Record important operations and access traces, meet enterprise audit requirements',
    'security.audit.tag': 'Audit',
    'security.region.title': 'Region Selection',
    'security.region.desc': 'Multi-region deployment options, meet data residency and latency requirements',
    'security.region.tag': 'Region',
    'security.compliance.title': 'Compliance Friendly',
    'security.compliance.desc': 'Support enterprise compliance processes and private deployment options',
    'security.compliance.tag': 'Compliance',
    
    // Pricing
    'pricing.badge': 'Pricing Plans',
    'pricing.title': 'Choose the Right Plan',
    'pricing.subtitle': 'From individual developers to enterprise users, we have suitable pricing plans',
    'pricing.dev.name': 'Developer',
    'pricing.dev.price': 'Free',
    'pricing.dev.desc': 'Perfect for individual developers and small project testing',
    'pricing.dev.feature1': '1,000 requests per month',
    'pricing.dev.feature2': 'Basic API support',
    'pricing.dev.feature3': 'Community support',
    'pricing.pro.name': 'Professional',
    'pricing.pro.price': '$69/month',
    'pricing.pro.desc': 'Perfect for SMEs and high-frequency usage scenarios',
    'pricing.pro.feature1': '50,000 requests per month',
    'pricing.pro.feature2': 'Complete observability',
    'pricing.pro.feature3': 'Email support',
    'pricing.pro.feature4': 'SLA guarantee',
    'pricing.enterprise.name': 'Enterprise',
    'pricing.enterprise.price': 'Contact Sales',
    'pricing.enterprise.desc': 'Perfect for large enterprises and custom requirements',
    'pricing.enterprise.feature1': 'Unlimited requests',
    'pricing.enterprise.feature2': 'Private deployment options',
    'pricing.enterprise.feature3': 'Dedicated account manager',
    'pricing.enterprise.feature4': 'Custom development',
    'pricing.popular': 'Most Popular',
    'pricing.cta': 'Get Started',
    'pricing.enterprise.cta': 'Contact Sales',
    
    // Docs section
    'docs.title': 'Developer Documentation',
    'docs.subtitle': 'Comprehensive API reference, quick start guides, best practices and rich examples to get you started quickly',
    'docs.cta': 'View Documentation →',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Have any questions or need a custom solution? Leave your contact information and we will get back to you soon',
    'contact.placeholder': 'your@email.com',
    'contact.cta': 'Contact Now',
    
    // Footer
    'footer.copyright': 'Simpler browser automation platform',
    'footer.docs': 'Documentation',
    'footer.pricing': 'Pricing',
    'footer.contact': 'Contact Us',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    // 检查本地存储
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
      setLanguage(savedLang);
    } else {
      // 使用浏览器语言检测
      const detectedLang = detectBrowserLanguage();
      setLanguage(detectedLang);
      localStorage.setItem('language', detectedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};