export const FACT_KINDS = [
  "event",
  "character",
  "relationship",
  "location",
  "dialogue",
  "goal"
] as const;

export type FactKind = (typeof FACT_KINDS)[number];

export type TimelineFact = {
  id: string;
  mediaId: string;
  kind: FactKind;
  text: string;
  revealedAtMs: number;
  sceneId?: string;
  startsAtMs?: number;
  endsAtMs?: number;
  entityIds?: string[];
  confidence?: number;
  sourceRefs?: string[];
  /** Phrases that must not appear in any answer while this fact is ineligible. */
  leakGuards?: string[];
};

export type Scene = {
  id: string;
  mediaId: string;
  title: string;
  startsAtMs: number;
  endsAtMs: number;
};

export type Character = {
  id: string;
  mediaId: string;
  name: string;
};

export type DialogueCue = {
  id: string;
  mediaId: string;
  startsAtMs: number;
  endsAtMs: number;
  speaker?: string;
  text: string;
};

export type MediaAsset = {
  id: string;
  title: string;
  durationMs: number;
  rights: string;
};

export type TimelineDataset = {
  media: MediaAsset;
  scenes: Scene[];
  characters: Character[];
  cues: DialogueCue[];
  facts: TimelineFact[];
};

export const SPOILER_MODES = ["strict", "helpful", "catch_me_up"] as const;
export type SpoilerMode = (typeof SPOILER_MODES)[number];

export const OPERATIONS = [
  "recap",
  "identify_character",
  "explain_dialogue",
  "explain_event",
  "why_it_matters"
] as const;
export type ContextOperation = (typeof OPERATIONS)[number];

export type Verbosity = "concise" | "standard";
export type TextScale = "default" | "large";

export type ViewerPreferences = {
  profileId: string;
  spoilerMode: SpoilerMode;
  verbosity: Verbosity;
  textScale: TextScale;
};

export type PlaybackState = {
  profileId: string;
  mediaId: string;
  positionMs: number;
  updatedAt: string;
  currentCueText?: string;
};

export type ContextAnswer = {
  title: string;
  text: string;
  operation: ContextOperation;
  mode: SpoilerMode;
  playbackTimeMs: number;
  cutoffMs: number;
  factIds: string[];
  insufficient: boolean;
  refusedSpoiler: boolean;
};
