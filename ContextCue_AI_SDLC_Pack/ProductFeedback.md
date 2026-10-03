# Product Feedback — Amazon Tools and Services

## Purpose

Maintain factual product feedback as development happens. This feeds the required Devpost product-feedback answers and AWS Builder explanation.

Do not fill with generic praise. Record concrete experience.

## Amazon Devices Builder Tools (ADBT)

**Used for:** Cursor MCP setup and Fire TV development context. Package `@amazon-devices/amazon-devices-buildertools-mcp` 1.0.15 via `init-context --agent cursor --force`.

**What worked well:**

- One command wrote the Cursor MCP entry, `AGENTS.md`, and the Vega skills without an Amazon account login.
- The server then appeared as a ready MCP namespace with `list_documents`, `read_document`, and `search_documentation`.
- Existing Roblox MCP config in `~/.cursor/mcp.json` was preserved.

**What needs work:**

- `check-status` reports the context document and MCP as configured, and a separate "Agent (--install-agent)" row as not installed. That second row is unexplained in the success output.
- The generated `AGENTS.md` requires a platform choice before any tool call, but `init-context` wrote `.adbt-config.json` with only a project id and no `platform.default`.

**Onboarding experience:** Fast on Windows for the MCP itself. It does not install the Vega SDK, and the SDK still cannot be installed on this host.

**Would build with it again? Why/why not?** Yes for documentation and Vega/Fire OS workflows. It is the right source for device APIs. It does not remove the need for a Mac or Ubuntu machine when the app must run in the Vega Virtual Device.

## Vega SDK / React Native for Vega / Vega Virtual Device

**Used for:** Fire TV application, TV focus/navigation, media playback, simulator testing.

**What worked well:**

- `[fill]`

**What needs work:**

- `[fill]`

**Onboarding experience:** `[fill]`

**Would build with it again? Why/why not?** `[fill]`

## Amazon Bedrock

**Exact model/API used:** `amazon.nova-lite-v1:0` through `bedrock-runtime` `Converse` in `us-west-2`. The model is listed as `ON_DEMAND` on this account. The client is `src/runtime/bedrock.ts`.

**Used for:** Optional rewrite of a deterministic, already time-filtered draft. The model is given only eligible fact lines.

**What worked well:**

- `aws bedrock list-foundation-models` succeeded and showed Nova Lite as on-demand in `us-west-2`. No inference profile is required for that model.

**What needs work:**

- `aws bedrock-runtime converse` failed on 2026-10-02 with `AccessDeniedException`: "Your account is currently being verified." The runtime therefore keeps the deterministic draft and labels it `deterministic-fallback`.

**Onboarding experience:** Listing models was immediate after `aws login`. Invoking a model is blocked until Amazon finishes new-account verification. The message says that normally takes under two hours.

**Would build with it again? Why/why not?** Yes, once invocation works. Nova Lite is the right latency/cost choice for short TV cards. The product does not pretend a fallback is a model response.

## Amazon S3

**Used for:** `[fill actual use]`

**What worked well:** `[fill]`

**What needs work:** `[fill]`

**Would build with it again?** `[fill]`

## DynamoDB

**Used for:** `[fill actual use]`

**What worked well:** `[fill]`

**What needs work:** `[fill]`

**Would build with it again?** `[fill]`

## Transcribe / other AWS ingestion service

Remove this section if not actually used.

**Used for:** `[fill]`

**What worked well:** `[fill]`

**What needs work:** `[fill]`

**Would build with it again?** `[fill]`

## Lambda / API Gateway / selected compute

Adjust to actual services used.

**Used for:** `[fill]`

**What worked well:** `[fill]`

**What needs work:** `[fill]`

**Would build with it again?** `[fill]`

## AWS CDK / IaC

**Used for:** reproducible deployment/teardown of final AWS resources.

**What worked well:** `[fill]`

**What needs work:** `[fill]`

**Would build with it again?** `[fill]`

## Alexa+ public documentation / hackathon path

Important distinction: hackathon entrants do not receive the gated Alexa+ preview toolchain. Feedback should separate public documentation quality from actual hands-on access.

**Used for:** design/architecture guidance and hackathon-compliant MCP/simulation implementation.

**What worked well:** `[fill]`

**What needs work:** `[fill]`

**Onboarding experience:** `[fill]`

**Would build for Alexa+ again? Why/why not?** `[fill]`

## Final product-feedback synthesis

Before submission, turn the notes above into concise answers to the current Devpost prompts:

1. Which developer tools/APIs/SDKs did you use and for what?
2. What worked well?
3. What needs work?
4. How was onboarding from zero to first working result?
5. Would you build with these devices/services again, and why?
6. For AWS Builder: exactly which AWS services were used and how?
