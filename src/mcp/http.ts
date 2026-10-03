import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Express, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { ContextOperation, SpoilerMode } from "../domain/types.js";
import { ContextError, type ContextService } from "../runtime/service.js";

export const MCP_PROTOCOL = "2025-11-25";

const contextArgs = {
  mediaId: z.string().min(1),
  playbackTimeMs: z.number().nonnegative(),
  profileId: z.string().min(1).optional(),
  userQuestion: z.string().max(500).optional()
};

function toolText(payload: unknown, isError = false) {
  return {
    isError,
    content: [{ type: "text" as const, text: JSON.stringify(payload) }]
  };
}

function failure(error: unknown) {
  if (error instanceof ContextError) {
    return toolText({ error: error.code, message: error.message }, true);
  }
  return toolText({ error: "INTERNAL", message: "ContextCue could not finish that request." }, true);
}

async function runContext(
  service: ContextService,
  operation: ContextOperation,
  args: {
    mediaId: string;
    playbackTimeMs: number;
    profileId?: string;
    userQuestion?: string;
    dialogueText?: string;
    mode?: SpoilerMode;
  }
) {
  try {
    const response = await service.answer({ ...args, operation });
    return toolText({
      title: response.title,
      text: response.text,
      operation: response.operation,
      mode: response.mode,
      playbackTimeMs: response.playbackTimeMs,
      cutoffMs: response.cutoffMs,
      factIds: response.factIds,
      insufficient: response.insufficient,
      refusedSpoiler: response.refusedSpoiler,
      generationSource: response.generationSource,
      textScale: (await service.getPreferences(response.profileId)).textScale
    });
  } catch (error) {
    return failure(error);
  }
}

export function createMcpServer(service: ContextService): McpServer {
  const server = new McpServer({ name: "contextcue", version: "0.1.0" });

  server.tool(
    "recap_recent_scene",
    "Recap what the viewer already missed in the current story. Uses only facts revealed at or before playbackTimeMs.",
    contextArgs,
    async (args) => runContext(service, "recap", args)
  );

  server.tool(
    "identify_character",
    "Identify who is relevant right now using only facts already revealed at playbackTimeMs.",
    contextArgs,
    async (args) => runContext(service, "identify_character", args)
  );

  server.tool(
    "explain_dialogue",
    "Explain the current spoken line using only facts already revealed at playbackTimeMs.",
    { ...contextArgs, dialogueText: z.string().max(400).optional() },
    async (args) => runContext(service, "explain_dialogue", args)
  );

  server.tool(
    "explain_event",
    "Explain the current event, or why it matters, using only facts already revealed at playbackTimeMs.",
    {
      ...contextArgs,
      aspect: z.enum(["event", "why_it_matters"])
    },
    async (args) =>
      runContext(service, args.aspect === "why_it_matters" ? "why_it_matters" : "explain_event", args)
  );

  server.tool(
    "get_playback_context",
    "Read the viewer's current media id and playback position.",
    { profileId: z.string().min(1) },
    async ({ profileId }) => {
      const playback = await service.getPlayback(profileId);
      if (!playback) {
        return toolText({ error: "NOT_FOUND", message: "No playback state has been saved yet." }, true);
      }
      return toolText(playback);
    }
  );

  server.tool(
    "get_viewing_preferences",
    "Read spoiler mode, verbosity, and television text size for a viewer.",
    { profileId: z.string().min(1) },
    async ({ profileId }) => toolText(await service.getPreferences(profileId))
  );

  server.tool(
    "set_viewing_preferences",
    "Update spoiler mode, verbosity, or television text size. Every provided field is saved.",
    {
      profileId: z.string().min(1),
      spoilerMode: z.enum(["strict", "helpful", "catch_me_up"]).optional(),
      verbosity: z.enum(["concise", "standard"]).optional(),
      textScale: z.enum(["default", "large"]).optional()
    },
    async (args) => {
      if (!args.spoilerMode && !args.verbosity && !args.textScale) {
        return toolText({ error: "INVALID_ARGUMENT", message: "Provide a preference to change." }, true);
      }
      try {
        return toolText(await service.setPreferences(args));
      } catch (error) {
        return failure(error);
      }
    }
  );

  return server;
}

export function mountMcp(app: Express, service: ContextService): void {
  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.all("/mcp", async (req: Request, res: Response) => {
    try {
      const sessionHeader = req.headers["mcp-session-id"];
      const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader;
      let transport = sessionId ? transports.get(sessionId) : undefined;

      if (!transport && req.method === "POST" && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            transports.set(id, transport!);
          }
        });
        transport.onclose = () => {
          if (transport?.sessionId) transports.delete(transport.sessionId);
        };
        const server = createMcpServer(service);
        await server.connect(transport);
      }

      if (!transport) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Bad Request: no valid MCP session." },
          id: null
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: error instanceof Error ? error.message : "MCP failure" },
          id: null
        });
      }
    }
  });
}
