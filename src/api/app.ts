import type { Express, Request, Response } from "express";
import { ContextError, type ContextService } from "../runtime/service.js";
import type { ContextOperation, SpoilerMode } from "../domain/types.js";
import { converse } from "../orchestrator/converse.js";

function sendError(res: Response, error: unknown): void {
  if (error instanceof ContextError) {
    const status = error.code === "INVALID_MEDIA" ? 404 : 400;
    res.status(status).json({ error: error.code, message: error.message });
    return;
  }
  res.status(500).json({ error: "INTERNAL", message: "ContextCue could not finish that request." });
}

export function mountApi(app: Express, service: ContextService, mcpBaseUrl: () => string): void {
  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "contextcue",
      mediaId: service.mediaId(),
      mcpProtocol: "2025-11-25",
      transport: "streamable-http"
    });
  });

  app.get("/v1/playback", async (req, res) => {
    const profileId = String(req.query.profileId ?? "demo-viewer");
    res.json({ playback: await service.getPlayback(profileId) });
  });

  app.put("/v1/playback", async (req, res) => {
    try {
      const body = req.body as {
        profileId?: string;
        mediaId?: string;
        positionMs?: number;
        currentCueText?: string;
      };
      const playback = await service.putPlayback({
        profileId: body.profileId || "demo-viewer",
        mediaId: String(body.mediaId ?? ""),
        positionMs: Number(body.positionMs),
        currentCueText: body.currentCueText
      });
      res.json({ playback });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get("/v1/preferences", async (req, res) => {
    const profileId = String(req.query.profileId ?? "demo-viewer");
    res.json({ preferences: await service.getPreferences(profileId) });
  });

  app.put("/v1/preferences", async (req, res) => {
    try {
      const body = req.body as { profileId?: string };
      const preferences = await service.setPreferences({
        ...req.body,
        profileId: body.profileId || "demo-viewer"
      });
      res.json({ preferences });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/v1/context", async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        profileId?: string;
        mediaId?: string;
        playbackTimeMs?: number;
        operation?: ContextOperation;
        mode?: SpoilerMode;
        dialogueText?: string;
        userQuestion?: string;
      };
      const response = await service.answer({
        profileId: body.profileId,
        mediaId: String(body.mediaId ?? ""),
        playbackTimeMs: Number(body.playbackTimeMs),
        operation: body.operation as ContextOperation,
        mode: body.mode,
        dialogueText: body.dialogueText,
        userQuestion: body.userQuestion
      });
      res.json(response);
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post("/v1/converse", async (req, res) => {
    try {
      const body = req.body as { profileId?: string; message?: string; mediaId?: string; playbackTimeMs?: number };
      const result = await converse({
        baseUrl: mcpBaseUrl(),
        profileId: body.profileId || "demo-viewer",
        message: String(body.message ?? ""),
        mediaId: body.mediaId,
        playbackTimeMs: body.playbackTimeMs
      });
      res.json(result);
    } catch (error) {
      sendError(res, error);
    }
  });
}
