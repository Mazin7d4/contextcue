import type {
  ContextAnswer,
  ContextOperation,
  SpoilerMode,
  TimelineFact,
  Verbosity
} from "./types.js";

const SPOILER_PROBE =
  /\b(what happens next|who(?:'s| is) the killer|spoil(?:er|ers| the ending)?|reveal the ending|skip ahead|don'?t care about spoilers|tell me the ending|i don'?t care)\b/i;

const DURABLE = new Set(["character", "relationship", "goal", "location"]);

export function isSpoilerProbe(question: string | undefined): boolean {
  if (!question) return false;
  return SPOILER_PROBE.test(question);
}

/** Hard temporal cutoff. Inclusive at the reveal timestamp. */
export function eligibleFacts(facts: readonly TimelineFact[], playbackTimeMs: number): TimelineFact[] {
  return facts.filter((fact) => fact.revealedAtMs <= playbackTimeMs);
}

export function futureFacts(facts: readonly TimelineFact[], playbackTimeMs: number): TimelineFact[] {
  return facts.filter((fact) => fact.revealedAtMs > playbackTimeMs);
}

function windowMs(mode: SpoilerMode, operation: ContextOperation): number | null {
  if (mode === "catch_me_up") return null;
  if (operation === "identify_character" || operation === "why_it_matters") {
    return mode === "strict" ? null : null;
  }
  if (mode === "strict") return 45_000;
  return 120_000;
}

function limitFor(mode: SpoilerMode, operation: ContextOperation, verbosity: Verbosity): number {
  const base =
    operation === "identify_character"
      ? mode === "catch_me_up"
        ? 6
        : 4
      : mode === "strict"
        ? 3
        : mode === "helpful"
          ? 4
          : 6;
  return verbosity === "concise" ? Math.max(2, base - 1) : base;
}

export type Selection = {
  selected: TimelineFact[];
  cutoffMs: number;
  excludedFutureIds: string[];
};

/**
 * Selects facts for a product operation.
 * Helpful and Catch Me Up may widen the window or the count.
 * They never include a fact with revealedAtMs > playbackTimeMs.
 */
export function selectFacts(input: {
  facts: readonly TimelineFact[];
  playbackTimeMs: number;
  mode: SpoilerMode;
  operation: ContextOperation;
  verbosity?: Verbosity;
}): Selection {
  const verbosity = input.verbosity ?? "concise";
  const cutoffMs = input.playbackTimeMs;
  const eligible = eligibleFacts(input.facts, cutoffMs);
  const excludedFutureIds = futureFacts(input.facts, cutoffMs).map((fact) => fact.id);

  const window = windowMs(input.mode, input.operation);
  const windowStart = window == null ? Number.NEGATIVE_INFINITY : cutoffMs - window;

  const inWindow = eligible.filter((fact) => {
    if (DURABLE.has(fact.kind)) return true;
    return fact.revealedAtMs >= windowStart;
  });

  const pool =
    input.operation === "identify_character"
      ? inWindow.filter((fact) => fact.kind === "character" || fact.kind === "relationship")
      : input.operation === "explain_dialogue"
        ? inWindow.filter((fact) => fact.kind === "dialogue" || fact.kind === "event" || DURABLE.has(fact.kind))
        : inWindow;

  const limit = limitFor(input.mode, input.operation, verbosity);
  const ranked = [...pool].sort((a, b) => b.revealedAtMs - a.revealedAtMs || a.id.localeCompare(b.id));
  const unique: TimelineFact[] = [];
  for (const fact of ranked) {
    if (unique.some((other) => similarFactText(other.text, fact.text))) continue;
    unique.push(fact);
  }
  const selected = unique.slice(0, limit).sort((a, b) => a.revealedAtMs - b.revealedAtMs || a.id.localeCompare(b.id));

  return { selected, cutoffMs, excludedFutureIds };
}

export function leakGuardsFor(facts: readonly TimelineFact[]): string[] {
  const guards: string[] = [];
  for (const fact of facts) {
    for (const guard of fact.leakGuards ?? []) {
      const trimmed = guard.trim();
      if (trimmed) guards.push(trimmed.toLowerCase());
    }
  }
  return guards;
}

export function findLeakage(text: string, excluded: readonly TimelineFact[]): string[] {
  const haystack = text.toLowerCase();
  return leakGuardsFor(excluded).filter((guard) => haystack.includes(guard));
}

function words(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/\W+/).filter((word) => word.length > 3));
}

function similarFactText(left: string, right: string): boolean {
  const leftWords = words(left);
  const rightWords = words(right);
  let shared = 0;
  for (const word of leftWords) if (rightWords.has(word)) shared += 1;
  const smaller = Math.min(leftWords.size, rightWords.size);
  return smaller >= 4 && shared / smaller >= 0.7;
}

function sentences(facts: readonly TimelineFact[]): string[] {
  return facts.map((fact) => fact.text.trim()).filter(Boolean);
}

function joinProse(parts: string[], maxChars: number): string {
  const joined = parts.join(" ");
  if (joined.length <= maxChars) return joined;
  const clipped = joined.slice(0, maxChars);
  const boundary = Math.max(clipped.lastIndexOf(". "), clipped.lastIndexOf("? "));
  if (boundary > 40) return clipped.slice(0, boundary + 1).trim();
  return clipped.trim();
}

function currentDialogue(selected: readonly TimelineFact[], playbackTimeMs: number): TimelineFact | undefined {
  const lines = selected.filter((fact) => fact.kind === "dialogue");
  const covering = lines.filter((fact) => {
    const start = fact.startsAtMs ?? fact.revealedAtMs;
    const end = fact.endsAtMs ?? Number.POSITIVE_INFINITY;
    return start <= playbackTimeMs && playbackTimeMs <= end;
  });
  const pool = covering.length > 0 ? covering : lines.filter((fact) => fact.revealedAtMs <= playbackTimeMs);
  return pool.sort((a, b) => b.revealedAtMs - a.revealedAtMs)[0];
}

export function composeAnswer(input: {
  facts: readonly TimelineFact[];
  playbackTimeMs: number;
  mode: SpoilerMode;
  operation: ContextOperation;
  verbosity?: Verbosity;
  userQuestion?: string;
  dialogueText?: string;
}): ContextAnswer {
  const verbosity = input.verbosity ?? "concise";
  const selection = selectFacts({ ...input, verbosity });
  const factIds = selection.selected.map((fact) => fact.id);
  const maxChars = input.mode === "catch_me_up" && verbosity === "standard" ? 520 : verbosity === "concise" ? 280 : 400;

  const base = {
    operation: input.operation,
    mode: input.mode,
    playbackTimeMs: input.playbackTimeMs,
    cutoffMs: selection.cutoffMs,
    factIds,
    insufficient: false,
    refusedSpoiler: false
  };

  if (isSpoilerProbe(input.userQuestion)) {
    return {
      ...base,
      title: "STILL AT THIS MOMENT",
      text: "I can only use what has already happened. I won't skip ahead.",
      refusedSpoiler: true,
      insufficient: false
    };
  }

  if (selection.selected.length === 0) {
    return {
      ...base,
      title: "NOT ENOUGH YET",
      text: "I don't have enough of the story yet to answer that.",
      insufficient: true
    };
  }

  if (input.operation === "identify_character") {
    return {
      ...base,
      title: "WHO'S HERE",
      text: joinProse(sentences(selection.selected), maxChars)
    };
  }

  if (input.operation === "explain_dialogue") {
    const line = currentDialogue(selection.selected, input.playbackTimeMs);
    const quoted = (input.dialogueText ?? line?.text ?? "").trim();
    const support = selection.selected.filter((fact) => fact.id !== line?.id);
    if (!quoted && support.length === 0) {
      return {
        ...base,
        title: "THAT LINE",
        text: "I don't have enough of the story yet to explain that line.",
        insufficient: true
      };
    }
    const explanation = support.length
      ? joinProse(sentences(support), maxChars)
      : "That is all the story has made clear so far.";
    const text = quoted ? `"${quoted}" ${explanation}` : explanation;
    return { ...base, title: "THAT LINE", text: joinProse([text], maxChars + 80) };
  }

  if (input.operation === "why_it_matters" || input.operation === "explain_event") {
    return {
      ...base,
      title: input.operation === "why_it_matters" ? "WHY IT MATTERS" : "THIS MOMENT",
      text: joinProse(sentences(selection.selected), maxChars)
    };
  }

  const windowLabel = input.mode === "catch_me_up" ? "So far" : "Recent";
  return {
    ...base,
    title: "WHAT YOU MISSED",
    text: joinProse([`${windowLabel}:`, ...sentences(selection.selected)], maxChars)
  };
}

export function assertNoFutureFacts(selected: readonly TimelineFact[], playbackTimeMs: number): void {
  for (const fact of selected) {
    if (fact.revealedAtMs > playbackTimeMs) {
      throw new Error(`Future fact ${fact.id} entered selection at ${playbackTimeMs}`);
    }
  }
}
