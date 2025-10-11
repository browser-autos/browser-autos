const puppeteer = require('puppeteer-core');
const WebSocket = require('ws');

(async () => {
  // Launch Chrome directly
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const wsEndpoint = browser.wsEndpoint();
  console.log('Chrome WebSocket endpoint:', wsEndpoint);

  // Try connecting with raw WebSocket
  console.log('\nTest 1: Connecting with raw WebSocket...');
  const ws = new WebSocket(wsEndpoint);

  ws.on('open', () => {
    console.log('✅ WebSocket connected');
    const msg = JSON.stringify({ id: 1, method: 'Browser.getVersion' });
    console.log('Sending:', msg);
    ws.send(msg);
  });

  ws.on('message', (data) => {
    console.log('✅ Received:', data.toString());
    ws.close();
  });

  await new Promise(resolve => ws.on('close', resolve));

  console.log('\nTest 2: Puppeteer still works...');
  const version = await browser.version();
  console.log('✅ Browser version via Puppeteer:', version);

  await browser.close();
  console.log('\n✅ All tests passed!');
})();
