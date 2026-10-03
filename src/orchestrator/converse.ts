import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { classify } from "./classify.js";

export type Card = {
  title: string;
  text: string;
  kind: "recap" | "character" | "dialogue" | "event" | "preference" | "error" | "help";
  factIds?: string[];
  generationSource?: string;
  refusedSpoiler?: boolean;
};

export type ConverseResult = {
  card: Card;
  preferences?: {
    spoilerMode: string;
    verbosity: string;
    textScale: string;
  };
  tool?: string;
};

type ToolPayload = {
  title?: string;
  text?: string;
  factIds?: string[];
  generationSource?: string;
  refusedSpoiler?: boolean;
  error?: string;
  message?: string;
  spoilerMode?: string;
  verbosity?: string;
  textScale?: string;
};

function readToolPayload(result: { content?: Array<{ type: string; text?: string }>; isError?: boolean }): ToolPayload {
  const text = result.content?.find((item) => item.type === "text")?.text ?? "{}";
  return JSON.parse(text) as ToolPayload;
}

async function callTool(
  client: Client,
  name: string,
  args: Record<string, unknown>
): Promise<ToolPayload> {
  const result = await client.callTool({ name, arguments: args });
  return readToolPayload(result as { content?: Array<{ type: string; text?: string }> });
}

export async function converse(input: {
  baseUrl: string;
  profileId: string;
  message: string;
  mediaId?: string;
  playbackTimeMs?: number;
}): Promise<ConverseResult> {
  const intent = classify(input.message);
  const transport = new StreamableHTTPClientTransport(new URL(`${input.baseUrl.replace(/\/$/, "")}/mcp`));
  const client = new Client({ name: "contextcue-alexa-sim", version: "0.1.0" });
  await client.connect(transport);
  try {
    const playback = input.playbackTimeMs == null
      ? await callTool(client, "get_playback_context", { profileId: input.profileId })
      : null;
    const mediaId = input.mediaId ?? (playback && "mediaId" in playback ? String((playback as { mediaId?: string }).mediaId ?? "") : "");
    const playbackTimeMs = input.playbackTimeMs ?? Number((playback as { positionMs?: number } | null)?.positionMs ?? NaN);

    if (intent.kind === "unknown") {
      return {
        card: {
          kind: "help",
          title: "CONTEXTCUE",
          text: "Ask what you missed, who is here, or what a line means. You can also say strict mode or larger text."
        }
      };
    }

    if (intent.kind === "preference") {
      const saved = await callTool(client, "set_viewing_preferences", {
        profileId: input.profileId,
        ...intent.patch
      });
      return {
        tool: "set_viewing_preferences",
        preferences: {
          spoilerMode: String(saved.spoilerMode),
          verbosity: String(saved.verbosity),
          textScale: String(saved.textScale)
        },
        card: { kind: "preference", title: "PREFERENCE SAVED", text: intent.confirmation }
      };
    }

    if (!mediaId || !Number.isFinite(playbackTimeMs)) {
      return {
        card: {
          kind: "error",
          title: "NO SHOW PLAYING",
          text: "Start The Lantern Shift on Fire TV, then ask again."
        }
      };
    }

    const args: Record<string, unknown> = {
      mediaId,
      playbackTimeMs,
      profileId: input.profileId
    };
    if (intent.userQuestion) args.userQuestion = intent.userQuestion;
    if (intent.aspect) args.aspect = intent.aspect;
    const payload = await callTool(client, intent.name, args);
    if (payload.error) {
      return {
        tool: intent.name,
        card: {
          kind: "error",
          title: "COULDN'T LOAD CONTEXT",
          text: payload.message ?? "Try that again."
        }
      };
    }
    const kind =
      intent.name === "identify_character"
        ? "character"
        : intent.name === "explain_dialogue"
          ? "dialogue"
          : intent.name === "recap_recent_scene"
            ? "recap"
            : "event";
    return {
      tool: intent.name,
      card: {
        kind,
        title: payload.title ?? "CONTEXTCUE",
        text: payload.text ?? "",
        factIds: payload.factIds,
        generationSource: payload.generationSource,
        refusedSpoiler: payload.refusedSpoiler
      }
    };
  } finally {
    await client.close();
  }
}
