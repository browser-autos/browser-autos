const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  try {
    console.log('========================================');
    console.log('完整 CDP 功能测试');
    console.log('========================================\n');

    console.log('1. 连接到 WebSocket 代理...');
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://localhost:3001/ws'
    });
    console.log('✅ 已连接\n');

    console.log('2. 获取浏览器版本...');
    const version = await browser.version();
    console.log(`✅ 版本: ${version}\n`);

    console.log('3. 打开新页面...');
    const page = await browser.newPage();
    console.log('✅ 页面已创建\n');

    console.log('4. 设置视口大小...');
    await page.setViewport({ width: 1280, height: 800 });
    console.log('✅ 视口: 1280x800\n');

    console.log('5. 导航到 example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle0' });
    console.log('✅ 页面已加载\n');

    console.log('6. 获取页面标题...');
    const title = await page.title();
    console.log(`✅ 标题: "${title}"\n`);

    console.log('7. 获取页面 HTML 内容...');
    const html = await page.content();
    console.log(`✅ HTML 长度: ${html.length} 字符\n`);

    console.log('8. 提取页面文本...');
    const h1Text = await page.$eval('h1', el => el.textContent);
    console.log(`✅ H1 文本: "${h1Text}"\n`);

    console.log('9. 截取页面截图...');
    const screenshot = await page.screenshot({ fullPage: true });
    fs.writeFileSync('/tmp/cdp-test-screenshot.png', screenshot);
    console.log(`✅ 截图已保存: /tmp/cdp-test-screenshot.png (${screenshot.length} bytes)\n`);

    console.log('10. 生成 PDF...');
    const pdf = await page.pdf({ format: 'A4' });
    fs.writeFileSync('/tmp/cdp-test-document.pdf', pdf);
    console.log(`✅ PDF 已保存: /tmp/cdp-test-document.pdf (${pdf.length} bytes)\n`);

    console.log('11. 执行 JavaScript...');
    const result = await page.evaluate(() => {
      return {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
    });
    console.log(`✅ 执行结果:`, result);
    console.log('');

    console.log('12. 获取所有链接...');
    const links = await page.$$eval('a', anchors =>
      anchors.map(a => ({ text: a.textContent, href: a.href }))
    );
    console.log(`✅ 找到 ${links.length} 个链接`);
    links.forEach(link => console.log(`   - ${link.text}: ${link.href}`));
    console.log('');

    console.log('13. 导航到另一个页面 (example.org)...');
    await page.goto('https://example.org', { waitUntil: 'networkidle0' });
    const title2 = await page.title();
    console.log(`✅ 新页面标题: "${title2}"\n`);

    console.log('14. 关闭页面...');
    await page.close();
    console.log('✅ 页面已关闭\n');

    console.log('15. 打开多个页面测试...');
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();
    await page1.goto('https://example.com');
    await page2.goto('https://example.org');
    const titles = await Promise.all([page1.title(), page2.title()]);
    console.log(`✅ 页面1: "${titles[0]}"`);
    console.log(`✅ 页面2: "${titles[1]}"\n`);

    await page1.close();
    await page2.close();
    console.log('✅ 多页面测试完成\n');

    console.log('16. 关闭浏览器...');
    await browser.close();
    console.log('✅ 浏览器已关闭\n');

    console.log('========================================');
    console.log('✅ 所有测试通过！');
    console.log('========================================');
    process.exit(0);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
