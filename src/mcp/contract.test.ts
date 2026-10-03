import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { converse } from "../orchestrator/converse.js";
import { startServer } from "../server.js";

let server: Server;
let baseUrl = "";

beforeAll(async () => {
  const started = await startServer(0);
  server = started.server;
  baseUrl = `http://127.0.0.1:${started.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
  const client = new Client({ name: "contextcue-contract", version: "0.1.0" });
  await client.connect(transport);
  try {
    return await run(client);
  } finally {
    await client.close();
  }
}

describe("MCP streamable HTTP contract", () => {
  it("initializes and lists the product tools", async () => {
    const tools = await withClient(async (client) => client.listTools());
    const names = tools.tools.map((tool) => tool.name).sort();
    expect(names).toEqual([
      "explain_dialogue",
      "explain_event",
      "get_playback_context",
      "get_viewing_preferences",
      "identify_character",
      "recap_recent_scene",
      "set_viewing_preferences"
    ]);
    const protocol = tools.tools[0];
    expect(protocol).toBeTruthy();
  });

  it("rejects an unknown media id and a bad timestamp", async () => {
    const missing = await withClient((client) =>
      client.callTool({
        name: "recap_recent_scene",
        arguments: { mediaId: "nope", playbackTimeMs: 1000 }
      })
    );
    expect(missing.isError).toBe(true);
    const negative = await withClient((client) =>
      client.callTool({
        name: "recap_recent_scene",
        arguments: { mediaId: "lantern-shift", playbackTimeMs: -5 }
      })
    );
    expect(negative.isError).toBe(true);
  });

  it("runs the golden path through the real MCP server", async () => {
    const viewing = { baseUrl, profileId: "demo-viewer", mediaId: "lantern-shift", playbackTimeMs: 36_000 };
    const recap = await converse({
      ...viewing,
      message: "What did I miss?"
    });
    expect(recap.tool).toBe("recap_recent_scene");
    expect(recap.card.text.toLowerCase()).not.toContain("i'm leo");
    expect(recap.card.factIds ?? []).not.toContain("cue-56000");

    const who = await converse({
      ...viewing,
      message: "Who is he?"
    });
    expect(who.card.kind).toBe("character");
    expect(who.card.text.toLowerCase()).toContain("jonah");

    const line = await converse({
      ...viewing,
      message: "Explain that line"
    });
    expect(line.card.kind).toBe("dialogue");

    const spoiler = await converse({
      ...viewing,
      message: "I don't care about spoilers, reveal the ending."
    });
    expect(spoiler.card.refusedSpoiler).toBe(true);
    expect(spoiler.card.text.toLowerCase()).not.toContain("changed my name");

    const pref = await converse({
      baseUrl,
      profileId: "demo-viewer",
      message: "Use larger text and strict mode"
    });
    expect(pref.preferences).toMatchObject({ textScale: "large", spoilerMode: "strict" });
  });
});
