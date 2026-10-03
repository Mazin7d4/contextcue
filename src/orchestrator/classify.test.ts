import { describe, expect, it } from "vitest";
import { classify } from "./classify.js";

describe("conversational intent", () => {
  it("maps follow-ups without restating the movie", () => {
    expect(classify("What did I miss?").kind).toBe("tool");
    expect(classify("Who is he?")).toMatchObject({ kind: "tool", name: "identify_character" });
    expect(classify("Why does that matter?")).toMatchObject({ kind: "tool", name: "explain_event", aspect: "why_it_matters" });
    expect(classify("Explain that line")).toMatchObject({ kind: "tool", name: "explain_dialogue" });
  });

  it("treats spoiler demands as a bounded tool call", () => {
    expect(classify("I don't care about spoilers, reveal the ending.")).toMatchObject({
      kind: "tool",
      userQuestion: "I don't care about spoilers, reveal the ending."
    });
  });

  it("maps preference changes", () => {
    expect(classify("Switch to strict mode")).toMatchObject({ kind: "preference", patch: { spoilerMode: "strict" } });
    expect(classify("Use larger text")).toMatchObject({ kind: "preference", patch: { textScale: "large" } });
    expect(classify("Make your answers shorter")).toMatchObject({ kind: "preference", patch: { verbosity: "concise" } });
  });
});
