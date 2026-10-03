import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const region = process.env.AWS_REGION || "us-west-2";
const modelId = process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0";
const client = new BedrockRuntimeClient({ region });

try {
  const response = await client.send(
    new ConverseCommand({
      modelId,
      messages: [{ role: "user", content: [{ text: "Reply with the single word ok" }] }],
      inferenceConfig: { maxTokens: 20, temperature: 0 }
    })
  );
  const text = response.output?.message?.content?.map((block) => ("text" in block ? block.text : "")).join("") ?? "";
  console.log(`bedrock ok model=${modelId} region=${region} text=${text.trim()}`);
} catch (error) {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : String(error);
  console.error(`bedrock unavailable model=${modelId} region=${region} ${name}: ${message}`);
  process.exitCode = 1;
}
