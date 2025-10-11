const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('Connecting to ws://localhost:3001/ws');
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://localhost:3001/ws'
    });

    console.log('Connected! Getting version...');
    const version = await browser.version();
    console.log('Browser version:', version);

    console.log('Opening new page...');
    const page = await browser.newPage();

    console.log('Navigating to example.com...');
    await page.goto('https://example.com');

    console.log('Getting title...');
    const title = await page.title();
    console.log('Page title:', title);

    console.log('Closing browser...');
    await browser.close();

    console.log('✅ Test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
