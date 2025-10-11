/**
 * CDP 远程连接测试示例
 *
 * 使用方法:
 * 1. 确保后端服务运行: cd backend && npm run dev
 * 2. 安装依赖: npm install puppeteer-core
 * 3. 运行测试:
 *    - 匿名连接: node examples/test-cdp-connection.js
 *    - JWT 认证: node examples/test-cdp-connection.js --token YOUR_TOKEN
 *    - API Key 认证: node examples/test-cdp-connection.js --apiKey YOUR_API_KEY
 */

const puppeteer = require('puppeteer-core');

async function testCdpConnection() {
  console.log('🚀 开始测试 CDP 远程连接...\n');

  // 解析命令行参数
  const args = process.argv.slice(2);
  let wsUrl = 'ws://localhost:3001/ws';
  let authType = '匿名';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--token' && args[i + 1]) {
      wsUrl = `ws://localhost:3001/ws?token=${args[i + 1]}`;
      authType = 'JWT Token';
      break;
    } else if (args[i] === '--apiKey' && args[i + 1]) {
      wsUrl = `ws://localhost:3001/ws?apiKey=${args[i + 1]}`;
      authType = 'API Key';
      break;
    }
  }

  console.log(`📡 连接地址: ${wsUrl}`);
  console.log(`🔐 认证方式: ${authType}\n`);

  let browser;
  try {
    // 连接到远程浏览器
    console.log('⏳ 正在连接到远程浏览器...');
    browser = await puppeteer.connect({
      browserWSEndpoint: wsUrl,
    });

    console.log('✅ 成功连接到远程浏览器!\n');

    // 获取浏览器版本
    const version = await browser.version();
    console.log(`🌐 浏览器版本: ${version}`);

    // 创建新页面
    console.log('\n📄 创建新页面...');
    const page = await browser.newPage();
    console.log('✅ 页面创建成功');

    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });

    // 测试 1: 访问网页
    console.log('\n🔗 测试 1: 访问 example.com');
    await page.goto('https://example.com', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    const title = await page.title();
    console.log(`   页面标题: ${title}`);
    console.log('✅ 测试 1 通过');

    // 测试 2: 截图
    console.log('\n📸 测试 2: 生成截图');
    await page.screenshot({
      path: '/tmp/cdp-test-screenshot.png',
      fullPage: true,
    });
    console.log('   截图保存到: /tmp/cdp-test-screenshot.png');
    console.log('✅ 测试 2 通过');

    // 测试 3: 执行 JavaScript
    console.log('\n⚡ 测试 3: 执行 JavaScript');
    const result = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.innerText.substring(0, 100),
      };
    });
    console.log('   执行结果:', JSON.stringify(result, null, 2));
    console.log('✅ 测试 3 通过');

    // 测试 4: 提取链接
    console.log('\n🔍 测试 4: 提取页面链接');
    const links = await page.$$eval('a', (anchors) =>
      anchors.slice(0, 5).map((a) => ({
        text: a.innerText,
        href: a.href,
      }))
    );
    console.log(`   找到 ${links.length} 个链接:`);
    links.forEach((link, i) => {
      console.log(`   ${i + 1}. ${link.text || '(无文本)'} -> ${link.href}`);
    });
    console.log('✅ 测试 4 通过');

    // 测试 5: PDF 生成
    console.log('\n📄 测试 5: 生成 PDF');
    await page.pdf({
      path: '/tmp/cdp-test-document.pdf',
      format: 'A4',
      printBackground: true,
    });
    console.log('   PDF 保存到: /tmp/cdp-test-document.pdf');
    console.log('✅ 测试 5 通过');

    // 测试 6: 导航到另一个页面
    console.log('\n🔗 测试 6: 访问 GitHub');
    await page.goto('https://github.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    const githubTitle = await page.title();
    console.log(`   页面标题: ${githubTitle}`);
    console.log('✅ 测试 6 通过');

    // 关闭页面
    await page.close();
    console.log('\n📄 页面已关闭');

    // 所有测试通过
    console.log('\n🎉 所有测试通过!');
    console.log('\n📊 测试总结:');
    console.log('   ✅ 远程连接');
    console.log('   ✅ 页面导航');
    console.log('   ✅ 截图生成');
    console.log('   ✅ JavaScript 执行');
    console.log('   ✅ 元素提取');
    console.log('   ✅ PDF 生成');
    console.log('   ✅ 多页面导航');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  } finally {
    if (browser) {
      console.log('\n🔌 断开连接...');
      await browser.disconnect();
      console.log('✅ 已断开连接');
    }
  }
}

// 运行测试
testCdpConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
