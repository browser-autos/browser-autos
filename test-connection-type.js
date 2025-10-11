const Fastify = require('fastify');
const websocket = require('@fastify/websocket');
const WebSocket = require('ws');

const app = Fastify({ logger: false });
app.register(websocket);

app.get('/test', { websocket: true }, (connection, request) => {
  console.log('\n=== Connection Object ===');
  console.log('Type:', typeof connection);
  console.log('Keys:', Object.keys(connection));
  console.log('\n=== Connection.socket ===');
  console.log('Type:', typeof connection.socket);
  console.log('Is WebSocket?', connection.socket instanceof WebSocket);
  
  if (connection.socket) {
    console.log('Socket constructor:', connection.socket.constructor.name);
    console.log('Socket has on?', typeof connection.socket.on === 'function');
  }
  
  connection.socket.send('Test message');
});

app.listen({ port: 3003 }, () => {
  const ws = new WebSocket('ws://localhost:3003/test');
  ws.on('message', (data) => {
    console.log('\n✅ Received:', data.toString());
    ws.close();
    setTimeout(() => process.exit(0), 100);
  });
});
