const http = require("http");

const app = require("./app");
const { registerSocket } = require("./socket");

const HOST = "127.0.0.1";
const PORT = 3001;
const server = http.createServer(app);

registerSocket(server);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
