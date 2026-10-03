import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PlaybackState, TimelineDataset, TimelineFact, ViewerPreferences } from "../domain/types.js";

export type AppState = {
  playback: Record<string, PlaybackState>;
  preferences: Record<string, ViewerPreferences>;
};

export function defaultPreferences(profileId: string): ViewerPreferences {
  return {
    profileId,
    spoilerMode: "helpful",
    verbosity: "concise",
    textScale: "default"
  };
}

export interface StateStore {
  getPlayback(profileId: string): Promise<PlaybackState | null>;
  putPlayback(state: PlaybackState): Promise<void>;
  getPreferences(profileId: string): Promise<ViewerPreferences>;
  putPreferences(preferences: ViewerPreferences): Promise<ViewerPreferences>;
}

export class FileStateStore implements StateStore {
  constructor(private readonly filePath: string) {}

  async getPlayback(profileId: string): Promise<PlaybackState | null> {
    const state = await this.read();
    return state.playback[profileId] ?? null;
  }

  async putPlayback(playback: PlaybackState): Promise<void> {
    const state = await this.read();
    state.playback[playback.profileId] = playback;
    await this.write(state);
  }

  async getPreferences(profileId: string): Promise<ViewerPreferences> {
    const state = await this.read();
    return state.preferences[profileId] ?? defaultPreferences(profileId);
  }

  async putPreferences(preferences: ViewerPreferences): Promise<ViewerPreferences> {
    const state = await this.read();
    const next = { ...defaultPreferences(preferences.profileId), ...preferences };
    state.preferences[preferences.profileId] = next;
    await this.write(state);
    return next;
  }

  private async read(): Promise<AppState> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as AppState;
      return {
        playback: parsed.playback ?? {},
        preferences: parsed.preferences ?? {}
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { playback: {}, preferences: {} };
      }
      throw error;
    }
  }

  private async write(state: AppState): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temp = `${this.filePath}.tmp`;
    await writeFile(temp, JSON.stringify(state, null, 2));
    await rename(temp, this.filePath);
  }
}

export class MemoryStateStore implements StateStore {
  private playback = new Map<string, PlaybackState>();
  private preferences = new Map<string, ViewerPreferences>();

  async getPlayback(profileId: string): Promise<PlaybackState | null> {
    return this.playback.get(profileId) ?? null;
  }

  async putPlayback(state: PlaybackState): Promise<void> {
    this.playback.set(state.profileId, state);
  }

  async getPreferences(profileId: string): Promise<ViewerPreferences> {
    return this.preferences.get(profileId) ?? defaultPreferences(profileId);
  }

  async putPreferences(preferences: ViewerPreferences): Promise<ViewerPreferences> {
    const next = { ...defaultPreferences(preferences.profileId), ...preferences };
    this.preferences.set(preferences.profileId, next);
    return next;
  }
}

export function factsForMedia(dataset: TimelineDataset): TimelineFact[] {
  return dataset.facts.filter((fact) => fact.mediaId === dataset.media.id);
}
