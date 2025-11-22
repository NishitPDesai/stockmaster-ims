import http from "http";
import app from "./app";
import config from "./config";

const port = config.port || 5000;

const server = http.createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend listening on http://localhost:${port}`);
});
