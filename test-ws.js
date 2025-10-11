const puppeteer = require('puppeteer-core');

async function testWebSocketProxy() {
  console.log('Testing WebSocket Proxy...\n');

  try {
    // 连接到我们的 WebSocket Proxy
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://localhost:3001/ws',
    });

    console.log('✅ Connected to WebSocket proxy successfully!');

    // 创建一个页面
    const page = await browser.newPage();
    console.log('✅ Created new page');

    // 访问网页
    await page.goto('https://example.com');
    console.log('✅ Navigated to https://example.com');

    // 获取页面标题
    const title = await page.title();
    console.log('✅ Page title:', title);

    // 截图
    await page.screenshot({ path: 'test-ws-screenshot.png' });
    console.log('✅ Screenshot saved to test-ws-screenshot.png');

    // 关闭浏览器
    await browser.close();
    console.log('✅ Browser closed successfully');

    console.log('\n🎉 WebSocket proxy test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testWebSocketProxy();
