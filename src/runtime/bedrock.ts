import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseCommandOutput
} from "@aws-sdk/client-bedrock-runtime";

export type RewriteRequest = {
  draft: string;
  factLines: string[];
  maxChars: number;
  mode: string;
  operation: string;
};

export type RewriteResult = {
  text: string;
  source: "bedrock" | "deterministic-fallback";
  modelId?: string;
  error?: string;
};

export interface NarrativeModel {
  rewrite(request: RewriteRequest): Promise<RewriteResult>;
}

export class DeterministicModel implements NarrativeModel {
  async rewrite(request: RewriteRequest): Promise<RewriteResult> {
    return { text: request.draft, source: "deterministic-fallback" };
  }
}

function textFromConverse(output: ConverseCommandOutput): string {
  const blocks = output.output?.message?.content ?? [];
  return blocks
    .map((block) => ("text" in block ? block.text : ""))
    .join("")
    .trim();
}

/**
 * Live Bedrock rewrite. The caller must pass only already-eligible fact lines.
 * On any failure the caller keeps the deterministic draft and must not relabel it.
 */
export class BedrockNarrativeModel implements NarrativeModel {
  private readonly client: BedrockRuntimeClient;

  constructor(
    private readonly modelId: string,
    region: string,
    private readonly timeoutMs = 8000
  ) {
    this.client = new BedrockRuntimeClient({ region });
  }

  async rewrite(request: RewriteRequest): Promise<RewriteResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.client.send(
        new ConverseCommand({
          modelId: this.modelId,
          system: [
            {
              text: [
                "You rewrite a television context card.",
                "Use only the supplied facts. Do not add story events, names, or relationships.",
                "If the facts are insufficient, say so.",
                "Do not describe anything that happens later.",
                `Mode: ${request.mode}. Operation: ${request.operation}.`,
                `Maximum length: ${request.maxChars} characters.`,
                "Return JSON only: {\"text\":\"...\"}"
              ].join(" ")
            }
          ],
          messages: [
            {
              role: "user",
              content: [
                {
                  text: `Facts:\n${request.factLines.map((line) => `- ${line}`).join("\n")}\n\nDraft:\n${request.draft}`
                }
              ]
            }
          ],
          inferenceConfig: { maxTokens: 300, temperature: 0.2 }
        }),
        { abortSignal: controller.signal }
      );
      const raw = textFromConverse(response);
      const parsed = parseModelJson(raw);
      if (!parsed) {
        return {
          text: request.draft,
          source: "deterministic-fallback",
          modelId: this.modelId,
          error: "malformed-model-output"
        };
      }
      return { text: parsed, source: "bedrock", modelId: this.modelId };
    } catch (error) {
      return {
        text: request.draft,
        source: "deterministic-fallback",
        modelId: this.modelId,
        error: error instanceof Error ? error.name : "bedrock-error"
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

export function parseModelJson(raw: string): string | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(raw.slice(start, end + 1)) as { text?: unknown };
    if (typeof value.text !== "string") return null;
    const text = value.text.trim();
    if (!text || text.length > 800) return null;
    return text;
  } catch {
    return null;
  }
}

export function createNarrativeModel(env: NodeJS.ProcessEnv = process.env): NarrativeModel {
  const modelId = env.BEDROCK_MODEL_ID?.trim();
  if (!modelId) return new DeterministicModel();
  return new BedrockNarrativeModel(modelId, env.AWS_REGION?.trim() || "us-west-2");
}
