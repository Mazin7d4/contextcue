import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Character,
  DialogueCue,
  FactKind,
  MediaAsset,
  Scene,
  TimelineDataset,
  TimelineFact
} from "../domain/types.js";
import { FACT_KINDS } from "../domain/types.js";

export type CorrectionsFile = {
  media: MediaAsset;
  scenes: Scene[];
  characters: Character[];
  add: TimelineFact[];
  updates?: Array<Partial<TimelineFact> & { id: string }>;
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function parseVtt(vtt: string, mediaId: string): DialogueCue[] {
  const lines = vtt.replace(/^\uFEFF/, "").split(/\r?\n/);
  const cues: DialogueCue[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";
    const match = line.match(
      /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/
    );
    if (!match) {
      index += 1;
      continue;
    }
    const startsAtMs = stamp(match[1]!, match[2]!, match[3]!, match[4]!);
    const endsAtMs = stamp(match[5]!, match[6]!, match[7]!, match[8]!);
    index += 1;
    const textLines: string[] = [];
    while (index < lines.length && (lines[index]?.trim() ?? "") !== "") {
      textLines.push(lines[index]!.trim());
      index += 1;
    }
    const raw = textLines.join(" ").trim();
    const speakerMatch = raw.match(/^([^:]{1,40}):\s*(.+)$/);
    cues.push({
      id: `cue-${startsAtMs}`,
      mediaId,
      startsAtMs,
      endsAtMs,
      speaker: speakerMatch?.[1],
      text: speakerMatch?.[2] ?? raw
    });
  }
  return cues;
}

function stamp(h: string, m: string, s: string, ms: string): number {
  return Number(h) * 3_600_000 + Number(m) * 60_000 + Number(s) * 1_000 + Number(ms);
}

export function buildTimeline(vtt: string, corrections: CorrectionsFile): TimelineDataset {
  const mediaId = corrections.media.id;
  const cues = parseVtt(vtt, mediaId);
  const facts = new Map<string, TimelineFact>();

  for (const cue of cues) {
    const fact: TimelineFact = {
      id: cue.id,
      mediaId,
      kind: "dialogue",
      text: cue.speaker ? `${cue.speaker}: ${cue.text}` : cue.text,
      revealedAtMs: cue.startsAtMs,
      startsAtMs: cue.startsAtMs,
      endsAtMs: cue.endsAtMs,
      sourceRefs: [`vtt:${cue.id}`],
      confidence: 1
    };
    facts.set(fact.id, fact);
  }

  for (const extra of corrections.add) {
    facts.set(extra.id, { ...extra, mediaId, sourceRefs: extra.sourceRefs ?? [`corrections:${extra.id}`] });
  }

  for (const update of corrections.updates ?? []) {
    const current = facts.get(update.id);
    if (!current) {
      throw new Error(`Correction updates missing fact ${update.id}`);
    }
    facts.set(update.id, { ...current, ...update, mediaId });
  }

  const timelineFacts = [...facts.values()].sort((a, b) => a.revealedAtMs - b.revealedAtMs || a.id.localeCompare(b.id));
  validateTimeline({ media: corrections.media, scenes: corrections.scenes, characters: corrections.characters, cues, facts: timelineFacts });
  return {
    media: corrections.media,
    scenes: corrections.scenes,
    characters: corrections.characters,
    cues,
    facts: timelineFacts
  };
}

export function validateTimeline(dataset: TimelineDataset): void {
  const ids = new Set<string>();
  for (const fact of dataset.facts) {
    if (ids.has(fact.id)) throw new Error(`Duplicate fact id ${fact.id}`);
    ids.add(fact.id);
    if (!FACT_KINDS.includes(fact.kind as FactKind)) throw new Error(`Bad kind on ${fact.id}`);
    if (!Number.isFinite(fact.revealedAtMs) || fact.revealedAtMs < 0) {
      throw new Error(`Bad reveal time on ${fact.id}`);
    }
    if (!fact.text.trim()) throw new Error(`Empty fact text ${fact.id}`);
  }
  const reveal = dataset.facts.find((fact) => (fact.leakGuards?.length ?? 0) > 0);
  if (!reveal) throw new Error("Dataset needs a guarded future reveal.");
  for (const fact of dataset.facts) {
    if (fact.revealedAtMs >= reveal.revealedAtMs) continue;
    const haystack = fact.text.toLowerCase();
    for (const guard of reveal.leakGuards ?? []) {
      if (haystack.includes(guard.toLowerCase())) {
        throw new Error(`Early fact ${fact.id} contains reveal guard "${guard}"`);
      }
    }
  }
}

export async function ingestFiles(vttPath: string, correctionsPath: string, outPath: string): Promise<TimelineDataset> {
  const vtt = await readFile(vttPath, "utf8");
  const corrections = JSON.parse(await readFile(correctionsPath, "utf8")) as CorrectionsFile;
  const dataset = buildTimeline(vtt, corrections);
  await writeFile(outPath, JSON.stringify(dataset, null, 2));
  return dataset;
}

async function main(): Promise<void> {
  const dir = path.join(ROOT, "demo", "the-lantern-shift");
  const dataset = await ingestFiles(
    path.join(dir, "captions.vtt"),
    path.join(dir, "corrections.json"),
    path.join(dir, "timeline.json")
  );
  console.log(
    `Ingested ${dataset.facts.length} facts, ${dataset.cues.length} cues for ${dataset.media.title}. Bedrock extraction skipped (not configured).`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
