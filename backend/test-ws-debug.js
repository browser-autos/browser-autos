const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3001/ws");

ws.on("open", () => {
  console.log("Connected");
  const msg = JSON.stringify({ id: 1, method: "Browser.getVersion" });
  console.log("Sending:", msg);
  ws.send(msg);
});

ws.on("message", (data) => {
  console.log("Received:", data.toString());
  ws.close();
});

ws.on("error", (err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

ws.on("close", () => {
  console.log("Closed");
  process.exit(0);
});

setTimeout(() => { console.error("Timeout"); ws.close(); process.exit(1); }, 10000);
