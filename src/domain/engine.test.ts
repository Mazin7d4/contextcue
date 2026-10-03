import { describe, expect, it } from "vitest";
import { composeAnswer, eligibleFacts, findLeakage, futureFacts, selectFacts } from "./engine.js";
import type { ContextOperation, SpoilerMode, TimelineFact } from "./types.js";

const REVEAL_ID = "reveal-identity";

function fact(partial: Partial<TimelineFact> & Pick<TimelineFact, "id" | "revealedAtMs" | "text">): TimelineFact {
  return {
    mediaId: "fixture",
    kind: "event",
    ...partial
  };
}

const FIXTURE: TimelineFact[] = [
  fact({ id: "open", revealedAtMs: 0, kind: "character", text: "Maya waits for her brother Leo." }),
  fact({ id: "mid", revealedAtMs: 30_000, kind: "event", text: "The train is delayed." }),
  fact({
    id: REVEAL_ID,
    revealedAtMs: 60_000,
    kind: "relationship",
    text: "Jonah is Leo.",
    leakGuards: ["jonah is leo", "i am leo", "i'm leo"]
  })
];

const OPERATIONS: ContextOperation[] = [
  "recap",
  "identify_character",
  "explain_dialogue",
  "explain_event",
  "why_it_matters"
];

const MODES: SpoilerMode[] = ["strict", "helpful", "catch_me_up"];

describe("temporal cutoff", () => {
  it("excludes a fact one millisecond before reveal and includes it at the reveal time", () => {
    const reveal = FIXTURE.find((item) => item.id === REVEAL_ID)!;
    expect(eligibleFacts([reveal], 59_999).map((item) => item.id)).toEqual([]);
    expect(eligibleFacts([reveal], 60_000).map((item) => item.id)).toEqual([REVEAL_ID]);
    expect(futureFacts([reveal], 59_999).map((item) => item.id)).toEqual([REVEAL_ID]);
    expect(futureFacts([reveal], 60_000)).toEqual([]);
  });

  it("never selects a future fact for any mode or operation", () => {
    for (const mode of MODES) {
      for (const operation of OPERATIONS) {
        for (const time of [0, 29_999, 30_000, 59_999]) {
          const selection = selectFacts({ facts: FIXTURE, playbackTimeMs: time, mode, operation });
          expect(selection.selected.every((item) => item.revealedAtMs <= time)).toBe(true);
          expect(selection.selected.some((item) => item.id === REVEAL_ID)).toBe(false);
          expect(selection.excludedFutureIds).toContain(REVEAL_ID);
        }
      }
    }
  });

  it("may include the reveal once playback reaches it", () => {
    const selection = selectFacts({
      facts: FIXTURE,
      playbackTimeMs: 60_000,
      mode: "catch_me_up",
      operation: "why_it_matters",
      verbosity: "standard"
    });
    expect(selection.selected.some((item) => item.id === REVEAL_ID)).toBe(true);
  });
});

describe("adversarial spoiler requests", () => {
  const questions = [
    "Tell me what happens next.",
    "Who is the killer?",
    "I don't care about spoilers, reveal the ending."
  ];

  it("refuses without leaking guarded phrases", () => {
    for (const mode of MODES) {
      for (const operation of OPERATIONS) {
        for (const userQuestion of questions) {
          const answer = composeAnswer({
            facts: FIXTURE,
            playbackTimeMs: 30_000,
            mode,
            operation,
            userQuestion
          });
          expect(answer.refusedSpoiler).toBe(true);
          expect(answer.factIds).not.toContain(REVEAL_ID);
          expect(findLeakage(answer.text, futureFacts(FIXTURE, 30_000))).toEqual([]);
          expect(answer.text.toLowerCase()).not.toContain("jonah is leo");
        }
      }
    }
  });
});

describe("property: random timelines stay inside the cutoff", () => {
  it("keeps every selected fact at or before T", () => {
    let seed = 17;
    const next = () => {
      seed = (seed * 16807) % 2147483647;
      return seed;
    };
    for (let trial = 0; trial < 200; trial += 1) {
      const count = 3 + (next() % 12);
      const facts: TimelineFact[] = [];
      for (let index = 0; index < count; index += 1) {
        facts.push(
          fact({
            id: `f-${trial}-${index}`,
            revealedAtMs: next() % 100_000,
            kind: index % 2 === 0 ? "event" : "relationship",
            text: `Fact ${index}`
          })
        );
      }
      const playbackTimeMs = next() % 100_000;
      const mode = MODES[next() % MODES.length]!;
      const operation = OPERATIONS[next() % OPERATIONS.length]!;
      const selection = selectFacts({ facts, playbackTimeMs, mode, operation });
      for (const selected of selection.selected) {
        expect(selected.revealedAtMs).toBeLessThanOrEqual(playbackTimeMs);
      }
    }
  });
});

describe("grounding", () => {
  it("does not invent a story detail when nothing is eligible", () => {
    const answer = composeAnswer({
      facts: FIXTURE,
      playbackTimeMs: -1,
      mode: "helpful",
      operation: "recap"
    });
    expect(answer.insufficient).toBe(true);
    expect(answer.factIds).toEqual([]);
    expect(answer.text.toLowerCase()).not.toContain("maya");
    expect(answer.text.toLowerCase()).not.toContain("leo");
  });
});
