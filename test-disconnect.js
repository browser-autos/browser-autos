const puppeteer = require('puppeteer-core');
const WebSocket = require('ws');

(async () => {
  console.log('1. Launching browser with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const wsEndpoint = browser.wsEndpoint();
  console.log('2. Got WebSocket endpoint:', wsEndpoint);

  console.log('3. Disconnecting Puppeteer...');
  await browser.disconnect();
  console.log('4. Puppeteer disconnected');

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('5. Trying to connect with raw WebSocket...');
  const ws = new WebSocket(wsEndpoint);

  ws.on('open', () => {
    console.log('✅ WebSocket connected!');
    const msg = JSON.stringify({ id: 1, method: 'Browser.getVersion' });
    console.log('6. Sending:', msg);
    ws.send(msg);
  });

  ws.on('message', (data) => {
    console.log('✅ Received:', data.toString());
    ws.close();
    process.exit(0);
  });

  ws.on('close', () => {
    console.log('WebSocket closed');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    process.exit(1);
  });

  setTimeout(() => {
    console.error('❌ Timeout - no response received');
    process.exit(1);
  }, 10000);
})();
