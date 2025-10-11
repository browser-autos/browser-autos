// 测试 Fastify WebSocket connection 对象
const Fastify = require('fastify');
const websocket = require('@fastify/websocket');

const app = Fastify({ logger: false });

app.register(websocket);

app.get('/test-ws', { websocket: true }, (connection, request) => {
  console.log('Connection object keys:', Object.keys(connection));
  console.log('Socket type:', connection.socket.constructor.name);
  console.log('Socket keys:', Object.keys(connection.socket));
  
  connection.socket.on('message', (data) => {
    console.log('Received:', data.toString());
    connection.socket.send('Echo: ' + data.toString());
  });
});

app.listen({ port: 3002 }, () => {
  console.log('Test server on 3002');
  
  // Test client
  const WebSocket = require('ws');
  const ws = new WebSocket('ws://localhost:3002/test-ws');
  
  ws.on('open', () => {
    console.log('Client connected');
    ws.send('test');
  });
  
  ws.on('message', (data) => {
    console.log('Client received:', data.toString());
    ws.close();
    setTimeout(() => process.exit(0), 100);
  });
});
