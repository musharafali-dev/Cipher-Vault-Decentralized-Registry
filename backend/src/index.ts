import app from "./app";
import { config } from "./config";
import { prisma } from "./utils/prisma";

const server = app.listen(config.port, () => {
  console.log("==================================================");
  console.log(`Web3 Record Registry API listening on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health Check: http://localhost:${config.port}/health`);
  console.log("==================================================");
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down server gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed successfully.");
    process.exit(0);
  });
});
