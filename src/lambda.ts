import type { TimelineDataset } from "./domain/types.js";
import datasetJson from "../demo/the-lantern-shift/timeline.json" with { type: "json" };
import { createNarrativeModel } from "./runtime/bedrock.js";
import { DynamoStateStore } from "./runtime/dynamo.js";
import { ContextError, ContextService } from "./runtime/service.js";

const dataset = datasetJson as TimelineDataset;

type ApiEvent = {
  rawPath: string;
  body?: string;
  queryStringParameters?: Record<string, string | undefined>;
  requestContext: { http: { method: string } };
};

type ApiResult = { statusCode: number; headers: Record<string, string>; body: string };

const service = new ContextService(
  dataset,
  new DynamoStateStore({
    region: process.env.AWS_REGION || "us-west-2",
    playbackTable: process.env.PLAYBACK_TABLE || "ContextCuePlayback",
    preferencesTable: process.env.PREFERENCES_TABLE || "ContextCuePreferences"
  }),
  createNarrativeModel()
);

function json(statusCode: number, body: unknown): ApiResult {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  };
}

export async function handler(event: ApiEvent): Promise<ApiResult> {
  const method = event.requestContext.http.method;
  const route = event.rawPath;
  try {
    if (method === "GET" && route === "/health") {
      return json(200, { ok: true, service: "contextcue", mediaId: service.mediaId(), runtime: "lambda" });
    }
    const profileId = event.queryStringParameters?.profileId || "demo-viewer";
    const body = event.body ? JSON.parse(event.body) as Record<string, unknown> : {};
    if (method === "GET" && route === "/v1/preferences") return json(200, { preferences: await service.getPreferences(profileId) });
    if (method === "PUT" && route === "/v1/preferences") {
      return json(200, { preferences: await service.setPreferences({ ...body, profileId: String(body.profileId || profileId) }) });
    }
    if (method === "GET" && route === "/v1/playback") return json(200, { playback: await service.getPlayback(profileId) });
    if (method === "PUT" && route === "/v1/playback") {
      return json(200, {
        playback: await service.putPlayback({
          profileId: String(body.profileId || profileId),
          mediaId: String(body.mediaId ?? ""),
          positionMs: Number(body.positionMs),
          currentCueText: body.currentCueText ? String(body.currentCueText) : undefined
        })
      });
    }
    if (method === "POST" && route === "/v1/context") {
      return json(200, await service.answer({
        profileId: body.profileId ? String(body.profileId) : undefined,
        mediaId: String(body.mediaId ?? ""),
        playbackTimeMs: Number(body.playbackTimeMs),
        operation: body.operation as "recap",
        dialogueText: body.dialogueText ? String(body.dialogueText) : undefined,
        userQuestion: body.userQuestion ? String(body.userQuestion) : undefined
      }));
    }
    return json(404, { error: "NOT_FOUND", message: "Unknown route." });
  } catch (error) {
    if (error instanceof ContextError) return json(error.code === "INVALID_MEDIA" ? 404 : 400, { error: error.code, message: error.message });
    return json(500, { error: "INTERNAL", message: "ContextCue could not finish that request." });
  }
}
