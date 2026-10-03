import { composeAnswer, findLeakage, futureFacts, selectFacts } from "../domain/engine.js";
import type {
  ContextAnswer,
  ContextOperation,
  PlaybackState,
  SpoilerMode,
  TimelineDataset,
  ViewerPreferences
} from "../domain/types.js";
import { SPOILER_MODES } from "../domain/types.js";
import type { NarrativeModel } from "./bedrock.js";
import type { StateStore } from "./store.js";

export class ContextError extends Error {
  constructor(
    readonly code: "INVALID_MEDIA" | "INVALID_TIMESTAMP" | "INVALID_ARGUMENT" | "NOT_FOUND",
    message: string
  ) {
    super(message);
  }
}

export type ContextRequest = {
  profileId?: string;
  mediaId: string;
  playbackTimeMs: number;
  operation: ContextOperation;
  mode?: SpoilerMode;
  dialogueText?: string;
  userQuestion?: string;
};

export type ContextResponse = ContextAnswer & {
  generationSource: "bedrock" | "deterministic-fallback";
  modelId?: string;
  retrievalMs: number;
  generationMs: number;
  profileId: string;
};

const OPERATIONS = new Set([
  "recap",
  "identify_character",
  "explain_dialogue",
  "explain_event",
  "why_it_matters"
]);

export class ContextService {
  constructor(
    private readonly dataset: TimelineDataset,
    private readonly store: StateStore,
    private readonly model: NarrativeModel
  ) {}

  mediaId(): string {
    return this.dataset.media.id;
  }

  datasetSnapshot(): TimelineDataset {
    return this.dataset;
  }

  async getPlayback(profileId: string): Promise<PlaybackState | null> {
    return this.store.getPlayback(profileId);
  }

  async putPlayback(input: {
    profileId: string;
    mediaId: string;
    positionMs: number;
    currentCueText?: string;
  }): Promise<PlaybackState> {
    this.assertMedia(input.mediaId);
    this.assertTimestamp(input.positionMs);
    const state: PlaybackState = {
      profileId: input.profileId,
      mediaId: input.mediaId,
      positionMs: input.positionMs,
      currentCueText: input.currentCueText,
      updatedAt: new Date().toISOString()
    };
    await this.store.putPlayback(state);
    return state;
  }

  async getPreferences(profileId: string): Promise<ViewerPreferences> {
    return this.store.getPreferences(profileId);
  }

  async setPreferences(patch: Partial<ViewerPreferences> & { profileId: string }): Promise<ViewerPreferences> {
    const current = await this.store.getPreferences(patch.profileId);
    const next: ViewerPreferences = {
      ...current,
      ...patch,
      profileId: patch.profileId
    };
    if (!SPOILER_MODES.includes(next.spoilerMode)) {
      throw new ContextError("INVALID_ARGUMENT", "spoilerMode must be strict, helpful, or catch_me_up.");
    }
    if (next.verbosity !== "concise" && next.verbosity !== "standard") {
      throw new ContextError("INVALID_ARGUMENT", "verbosity must be concise or standard.");
    }
    if (next.textScale !== "default" && next.textScale !== "large") {
      throw new ContextError("INVALID_ARGUMENT", "textScale must be default or large.");
    }
    return this.store.putPreferences(next);
  }

  async answer(request: ContextRequest): Promise<ContextResponse> {
    const profileId = request.profileId?.trim() || "demo-viewer";
    this.assertMedia(request.mediaId);
    this.assertTimestamp(request.playbackTimeMs);
    if (!OPERATIONS.has(request.operation)) {
      throw new ContextError("INVALID_ARGUMENT", "Unknown context operation.");
    }
    const preferences = await this.store.getPreferences(profileId);
    const mode = request.mode ?? preferences.spoilerMode;
    if (!SPOILER_MODES.includes(mode)) {
      throw new ContextError("INVALID_ARGUMENT", "Unknown spoiler mode.");
    }

    const retrievalStarted = performance.now();
    const draft = composeAnswer({
      facts: this.dataset.facts,
      playbackTimeMs: request.playbackTimeMs,
      mode,
      operation: request.operation,
      verbosity: preferences.verbosity,
      userQuestion: request.userQuestion,
      dialogueText: request.dialogueText
    });
    const retrievalMs = performance.now() - retrievalStarted;

    const excluded = futureFacts(this.dataset.facts, request.playbackTimeMs);
    const factLines = this.dataset.facts.filter((fact) => draft.factIds.includes(fact.id)).map((fact) => fact.text);

    const generationStarted = performance.now();
    let text = draft.text;
    let generationSource: ContextResponse["generationSource"] = "deterministic-fallback";
    let modelId: string | undefined;

    if (!draft.refusedSpoiler && !draft.insufficient) {
      const rewritten = await this.model.rewrite({
        draft: draft.text,
        factLines,
        maxChars: preferences.verbosity === "concise" ? 280 : 480,
        mode,
        operation: request.operation
      });
      modelId = rewritten.modelId;
      const leaks = findLeakage(rewritten.text, excluded);
      if (rewritten.source === "bedrock" && leaks.length === 0) {
        text = rewritten.text;
        generationSource = "bedrock";
      } else {
        text = draft.text;
        generationSource = "deterministic-fallback";
      }
    }
    const generationMs = performance.now() - generationStarted;

    return {
      ...draft,
      text,
      profileId,
      generationSource,
      modelId,
      retrievalMs: Math.round(retrievalMs * 100) / 100,
      generationMs: Math.round(generationMs * 100) / 100,
      cutoffMs: request.playbackTimeMs
    };
  }

  debugSelection(playbackTimeMs: number, mode: SpoilerMode, operation: ContextOperation) {
    this.assertTimestamp(playbackTimeMs);
    return selectFacts({
      facts: this.dataset.facts,
      playbackTimeMs,
      mode,
      operation
    });
  }

  private assertMedia(mediaId: string): void {
    if (mediaId !== this.dataset.media.id) {
      throw new ContextError("INVALID_MEDIA", `Unknown media id "${mediaId}".`);
    }
  }

  private assertTimestamp(playbackTimeMs: number): void {
    if (!Number.isFinite(playbackTimeMs) || playbackTimeMs < 0) {
      throw new ContextError("INVALID_TIMESTAMP", "playbackTimeMs must be a non-negative number.");
    }
  }
}
