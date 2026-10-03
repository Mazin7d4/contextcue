import type { ViewerPreferences } from "../domain/types.js";

export type ToolIntent = {
  kind: "tool";
  name: "recap_recent_scene" | "identify_character" | "explain_dialogue" | "explain_event";
  aspect?: "event" | "why_it_matters";
  userQuestion?: string;
};

export type PreferenceIntent = {
  kind: "preference";
  patch: Partial<Pick<ViewerPreferences, "spoilerMode" | "verbosity" | "textScale">>;
  confirmation: string;
};

export type Intent = ToolIntent | PreferenceIntent | { kind: "unknown" };

export function classify(message: string): Intent {
  const text = message.trim().toLowerCase();
  if (!text) return { kind: "unknown" };

  const patch: PreferenceIntent["patch"] = {};
  const notes: string[] = [];
  if (/\b(larger text|bigger text|large text)\b/.test(text)) {
    patch.textScale = "large";
    notes.push("Text on the TV is now larger.");
  } else if (/\b(smaller text|default text|normal text)\b/.test(text)) {
    patch.textScale = "default";
    notes.push("Text on the TV is back to the standard size.");
  }
  if (/\b(shorter|more concise|keep it short|brief)\b/.test(text)) {
    patch.verbosity = "concise";
    notes.push("Answers will stay short.");
  } else if (/\b(more detail|longer answers|standard answers)\b/.test(text)) {
    patch.verbosity = "standard";
    notes.push("Answers can use a little more detail.");
  }
  if (/\bstrict\b/.test(text)) {
    patch.spoilerMode = "strict";
    notes.push("Strict mode is on. Context stays with the facts already shown.");
  } else if (/\bhelpful\b/.test(text)) {
    patch.spoilerMode = "helpful";
    notes.push("Helpful mode is on. Inferences stay inside what you have already seen.");
  } else if (/\bcatch me up\b/.test(text) && /\b(mode|setting|preference)\b/.test(text)) {
    patch.spoilerMode = "catch_me_up";
    notes.push("Catch Me Up is on. Recaps can use more of what you have already seen.");
  }
  if (notes.length > 0) {
    return { kind: "preference", patch, confirmation: notes.join(" ") };
  }

  if (/\b(what happens next|who is the killer|spoil|ending|don't care|dont care)\b/.test(text)) {
    return { kind: "tool", name: "explain_event", aspect: "event", userQuestion: message.trim() };
  }
  if (/\b(why does (this|that|it) matter|why it matters)\b/.test(text)) {
    return { kind: "tool", name: "explain_event", aspect: "why_it_matters" };
  }
  if (/\b(who('| i)?s (here|this|he|she|that)|who is (here|this|he|she|jonah|maya|leo)|who are they)\b/.test(text)) {
    return { kind: "tool", name: "identify_character" };
  }
  if (/\b(explain that line|what does that mean|what did (she|he|they) mean|explain the line)\b/.test(text)) {
    return { kind: "tool", name: "explain_dialogue" };
  }
  if (/\b(what did i miss|what did i just miss|recap|catch me up)\b/.test(text)) {
    return { kind: "tool", name: "recap_recent_scene" };
  }
  return { kind: "unknown" };
}
