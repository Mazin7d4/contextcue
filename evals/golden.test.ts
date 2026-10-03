import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findLeakage, futureFacts } from "../src/domain/engine.js";
import { buildTimeline, type CorrectionsFile } from "../src/ingest/run.js";
import { ContextService } from "../src/runtime/service.js";
import { DeterministicModel, parseModelJson } from "../src/runtime/bedrock.js";
import { MemoryStateStore } from "../src/runtime/store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "demo", "the-lantern-shift");

describe("lantern-shift timeline", () => {
  it("keeps the identity reveal out of every earlier answer", async () => {
    const vtt = await readFile(path.join(dir, "captions.vtt"), "utf8");
    const corrections = JSON.parse(await readFile(path.join(dir, "corrections.json"), "utf8")) as CorrectionsFile;
    const dataset = buildTimeline(vtt, corrections);
    const reveal = dataset.facts.find((fact) => (fact.leakGuards?.length ?? 0) > 0);
    expect(reveal?.revealedAtMs).toBe(56_000);

    const service = new ContextService(dataset, new MemoryStateStore(), new DeterministicModel());
    const operations = ["recap", "identify_character", "explain_dialogue", "explain_event", "why_it_matters"] as const;
    const modes = ["strict", "helpful", "catch_me_up"] as const;
    const questions = [undefined, "Tell me what happens next.", "Who is the killer?", "I don't care about spoilers, reveal the ending."];

    for (const mode of modes) {
      for (const operation of operations) {
        for (const time of [0, 12_000, 36_000, 55_999]) {
          for (const userQuestion of questions) {
            const answer = await service.answer({
              mediaId: "lantern-shift",
              playbackTimeMs: time,
              operation,
              mode,
              userQuestion
            });
            expect(answer.factIds).not.toContain(reveal?.id);
            expect(answer.factIds.every((id) => {
              const fact = dataset.facts.find((item) => item.id === id);
              return fact != null && fact.revealedAtMs <= time;
            })).toBe(true);
            expect(findLeakage(answer.text, futureFacts(dataset.facts, time))).toEqual([]);
          }
        }
      }
    }

    const after = await service.answer({
      mediaId: "lantern-shift",
      playbackTimeMs: 70_000,
      operation: "why_it_matters",
      mode: "catch_me_up"
    });
    expect(after.factIds).toContain(reveal?.id);
  });
});

describe("model output validation", () => {
  it("rejects malformed model JSON", () => {
    expect(parseModelJson("not json")).toBeNull();
    expect(parseModelJson("{\"text\":123}")).toBeNull();
    expect(parseModelJson("Sure {\"text\":\"Maya is waiting.\"}")).toBe("Maya is waiting.");
  });

  it("does not keep a rewrite that leaks a future guard", async () => {
    const vtt = await readFile(path.join(dir, "captions.vtt"), "utf8");
    const corrections = JSON.parse(await readFile(path.join(dir, "corrections.json"), "utf8")) as CorrectionsFile;
    const dataset = buildTimeline(vtt, corrections);
    const leaking = {
      async rewrite() {
        return { text: "Jonah is Leo and he changed his name.", source: "bedrock" as const, modelId: "fake" };
      }
    };
    const service = new ContextService(dataset, new MemoryStateStore(), leaking);
    const answer = await service.answer({
      mediaId: "lantern-shift",
      playbackTimeMs: 36_000,
      operation: "recap"
    });
    expect(answer.generationSource).toBe("deterministic-fallback");
    expect(answer.text.toLowerCase()).not.toContain("jonah is leo");
  });
});
