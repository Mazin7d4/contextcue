import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDotEnv } from "./load-env.js";
import { startServer } from "./server.js";

loadDotEnv(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env"));

const { port } = await startServer();
console.log(`ContextCue API and MCP listening on http://127.0.0.1:${port}`);
console.log(`Health: http://127.0.0.1:${port}/health`);
console.log("MCP Streamable HTTP: POST /mcp");
