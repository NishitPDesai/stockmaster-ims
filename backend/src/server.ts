import http from "http";
import app from "./app";
import config from "./config";

const port = config.port || 5000;

const server = http.createServer(app);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend listening on http://localhost:${port}`);
  
  // Check SMTP configuration
  if (!config.smtpUser || !config.smtpPassword) {
    console.warn("⚠️  WARNING: SMTP credentials are not configured.");
    console.warn("   Password reset functionality will not work.");
    console.warn("   Please set SMTP_USER and SMTP_PASSWORD in your .env file.");
  } else {
    console.log("✅ SMTP configuration detected");
  }
});
