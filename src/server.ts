import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mountApi } from "./api/app.js";
import { mountMcp } from "./mcp/http.js";
import { createNarrativeModel } from "./runtime/bedrock.js";
import { DynamoStateStore } from "./runtime/dynamo.js";
import { ContextService } from "./runtime/service.js";
import { FileStateStore } from "./runtime/store.js";
import type { TimelineDataset } from "./domain/types.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadDataset(timelinePath = process.env.TIMELINE_PATH): Promise<TimelineDataset> {
  const resolved = path.resolve(ROOT, timelinePath || "demo/the-lantern-shift/timeline.json");
  return JSON.parse(await readFile(resolved, "utf8")) as TimelineDataset;
}

export function createService(dataset: TimelineDataset): ContextService {
  const store =
    process.env.STORE === "dynamo"
      ? new DynamoStateStore({
          region: process.env.AWS_REGION || "us-west-2",
          playbackTable: process.env.PLAYBACK_TABLE || "ContextCuePlayback",
          preferencesTable: process.env.PREFERENCES_TABLE || "ContextCuePreferences"
        })
      : new FileStateStore(path.resolve(ROOT, process.env.DATA_DIR || "data", "runtime-state.json"));
  return new ContextService(dataset, store, createNarrativeModel());
}

export function createApp(service: ContextService, portHolder: { port: number }) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  mountApi(app, service, () => `http://127.0.0.1:${portHolder.port}`);
  mountMcp(app, service);
  return app;
}

export async function startServer(port = Number(process.env.PORT || 8787)) {
  const dataset = await loadDataset();
  const service = createService(dataset);
  const existing = await service.getPlayback("demo-viewer");
  if (!existing) {
    const cue = dataset.cues.find((item) => item.startsAtMs <= 36_000 && 36_000 <= item.endsAtMs);
    await service.putPlayback({
      profileId: "demo-viewer",
      mediaId: dataset.media.id,
      positionMs: 36_000,
      currentCueText: cue?.text
    });
  }
  const portHolder = { port };
  const app = createApp(service, portHolder);
  const server = app.listen(port, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address();
  portHolder.port = typeof address === "object" && address ? address.port : port;
  return { server, service, port: portHolder.port };
}
