const WebSocket = require('ws');

console.log('Testing basic WebSocket connection...\n');

const ws = new WebSocket('ws://localhost:3001/ws');

ws.on('open', () => {
  console.log('✅ WebSocket connected');

  // 发送一个简单的 CDP 消息
  const message = JSON.stringify({
    id: 1,
    method: 'Browser.getVersion'
  });

  console.log('📤 Sending:', message);
  ws.send(message);
});

ws.on('message', (data) => {
  console.log('📥 Received:', data.toString());

  // 收到响应后关闭连接
  setTimeout(() => {
    console.log('\n✅ Test passed! Closing connection...');
    ws.close();
  }, 1000);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 Connection closed: code=${code}, reason=${reason || 'N/A'}`);
  process.exit(0);
});

// 超时保护
setTimeout(() => {
  console.error('\n❌ Test timeout');
  ws.close();
  process.exit(1);
}, 30000);
