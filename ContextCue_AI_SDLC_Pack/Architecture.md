# Architecture — ContextCue

## Architectural goals

The architecture exists to maximize four outcomes simultaneously:

1. a convincing Fire TV/Vega implementation;
2. a technically credible Alexa+ submission path;
3. a meaningful AWS Builder integration;
4. provable spoiler safety.

Prefer simple, observable systems over architectural theater. Every service must have a runtime or development reason.

## Platform decisions

### Fire TV

Use **Fire OS** for the app that must actually build and run on this machine. Vega OS with React Native for Vega remains the preferred Amazon path, but the Vega SDK requires native macOS or Ubuntu and does not support Windows or WSL. This host is Windows 11, so the runnable Fire TV app is a Fire OS app. Revisit Vega only if a supported Mac or Ubuntu host becomes available.

Reasons:

- Amazon currently recommends Vega + Amazon Devices Builder Tools for AI-assisted Fire TV development;
- Vega provides the Vega Virtual Device for local testing;
- React Native for Vega supports TV focus/navigation patterns and standard media APIs;
- the Fire TV hackathon requirement is satisfied by running the project on Fire OS or Vega OS and showing it in the demo.

Preserve the structure and assumptions of the current official Vega scaffold/sample. Do not force a generic web/monorepo convention onto the Vega app if it conflicts with the SDK.

### Alexa+

Build both:

1. a **real self-hosted MCP server** implementing the current hackathon-required MCP specification over Streamable HTTP;
2. a **polished web-based Alexa+ simulation** that uses the real ContextCue backend/MCP workflows.

Hackathon entrants do not receive the gated Alexa+ Category SDK, MCP Toolkit, CLI, or Web Simulator. Do not block on those tools.

The simulation should imitate the interaction model, not falsely claim to be an Amazon-provided Alexa+ simulator.

### AWS

Use AWS for meaningful product behavior. The preferred pattern is:

- S3 for source media/derived media artifacts;
- Amazon Transcribe or another appropriate AWS transcription path when useful for transcript generation;
- Amazon Bedrock for narrative extraction, grounded explanation, and/or other model inference;
- DynamoDB for timeline facts, media metadata, playback/session state, and preferences;
- API Gateway + Lambda or another appropriate AWS compute layer for remote APIs;
- CDK in TypeScript for reproducible infrastructure.

The implementation agent may substitute an AWS service if current docs, cost, latency, region availability, or SDK support make another option clearly better. Any substitution must preserve the judging story and be recorded in `Memory.md`.

Do not add an AWS service solely to increase the number of logos in the architecture diagram.

## Core domain model

The central object is a **temporally available narrative fact**.

Minimum conceptual shape:

```ts
type TimelineFact = {
  id: string;
  mediaId: string;
  kind: "event" | "character" | "relationship" | "location" | "dialogue" | "goal";
  text: string;
  revealedAtMs: number;
  sceneId?: string;
  startsAtMs?: number;
  endsAtMs?: number;
  entityIds?: string[];
  confidence?: number;
  sourceRefs?: string[];
};
```

Related domain objects should include, as needed:

- `MediaAsset`
- `Scene`
- `Character`
- `DialogueCue`
- `PlaybackState`
- `ViewerPreferences`
- `ContextRequest`
- `ContextResponse`

The implementation may refine schemas, but must not weaken the temporal invariant.

## Non-negotiable temporal invariant

For playback timestamp `T`:

```text
eligible facts = all candidate facts where revealedAtMs <= T
```

This eligibility filter must run **before** prompt/model context construction.

The LLM must never receive future facts in Strict mode.

Helpful and Catch Me Up modes may change selection, summarization, or inference depth, but they must never bypass the future-fact filter.

This invariant must be covered by unit and integration tests, including adversarial questions that explicitly ask for spoilers.

## Media ingestion pipeline

The production-quality hackathon pipeline should work approximately as follows:

1. Rights-cleared demo video and subtitle/transcript source are stored or registered.
2. Audio is transcribed if a transcript is not already available.
3. Scene boundaries and/or timed subtitle cues are created.
4. Frames may be sampled at useful scene points.
5. Bedrock processes transcript segments and optional frame context to extract:
   - events;
   - characters;
   - relationships;
   - locations;
   - goals/motives already knowable at that point;
   - dialogue references;
   - `revealedAtMs` values.
6. The extraction output is validated against a schema.
7. Timeline facts are stored in the database.
8. The demo dataset may be manually corrected if automated extraction is wrong; corrections must preserve provenance and the final runtime integration must remain real.

For a short hackathon film, precomputing media understanding is preferable to doing expensive scene analysis live during the demo.

## Runtime context engine

Inputs:

- media ID;
- current playback timestamp;
- recent playback window;
- current scene and subtitle cue where available;
- viewer request/action;
- spoiler mode;
- viewer preferences.

Processing:

1. Load candidate timeline facts relevant to the media/current scene/request.
2. Apply the hard temporal cutoff.
3. Rank/select the smallest useful set of eligible facts.
4. Construct a grounded model request containing only eligible context.
5. Ask Bedrock for a concise response suited to the surface.
6. Validate response shape/length.
7. Return structured response plus provenance metadata useful for debugging/tests.

For demo reliability, support deterministic fallback responses derived from already-generated eligible facts if live generation fails. The fallback must not be presented as a live Bedrock response if it is not one.

## Fire TV application responsibilities

The Fire TV app owns:

- video playback;
- playback timestamp;
- current subtitle cue if available;
- remote/D-pad interaction;
- focus management;
- contextual overlays/cards;
- local UI state;
- loading/error/retry behavior;
- syncing preferences/playback state with the backend.

The Fire TV app should call a stable remote application API. It should not embed LLM credentials or AWS secrets.

Use current Vega media APIs and focus-management primitives discovered through Amazon Devices Builder Tools/current documentation.

## Application API

Expose a small product-oriented API rather than raw database/model access.

Conceptual operations:

```text
GET/SET playback state
get recap at timestamp
get active/relevant characters at timestamp
explain current dialogue/event at timestamp
get/set viewer preferences
health/readiness
```

The implementation agent may choose REST/RPC conventions. The important requirement is one shared domain layer used by Fire TV and MCP tooling.

## MCP server

The MCP server must use the current hackathon-required protocol version and **Streamable HTTP**.

At time of this specification, the official hackathon requires MCP spec 2025-11-25 or later for the self-hosted MCP path.

Tools should represent clear, non-overlapping user intents. Recommended tool set:

- `recap_recent_scene`
- `identify_character`
- `explain_dialogue`
- `explain_event`
- `get_playback_context`
- `get_viewing_preferences`
- `set_viewing_preferences`

Tool descriptions and schemas are contracts. Do not expose parameters the implementation ignores.

Each tool should call shared ContextCue application/domain services rather than duplicate business logic.

Return structured data suitable for both voice summarization and visual cards.

## Alexa+-style simulation

The simulation is a web application, not the core product.

It should demonstrate:

- conversational user input;
- multi-turn continuity;
- product-specific tool use;
- structured visual cards;
- persistent preferences;
- current viewing context;
- error recovery.

A strong implementation pattern is:

- web UI receives the user's conversational input;
- an assistant/orchestration layer chooses MCP tools;
- the real ContextCue MCP server executes tools;
- returned structured data is rendered as concise Alexa-like cards;
- the same preference/state store is observed by Fire TV.

Do not build a generic chat playground.

## State model

Persist at least:

- current media ID;
- playback position or last-known playback position;
- spoiler mode;
- answer verbosity preference;
- TV text/caption preference;
- recent relevant conversation context when useful.

The project may use a fixed demo user/device identity if authentication would add no judging value. If so, document this clearly and avoid pretending it is production authentication.

## Cross-surface synchronization

The cleanest demo is a shared backend state store:

- Fire TV periodically writes playback state or updates it at meaningful events;
- Alexa simulation/MCP tools read the current playback context;
- preference changes are persisted centrally;
- Fire TV refreshes/subscribes/polls and visibly applies changes.

Choose the lowest-complexity reliable synchronization method. Real-time websockets are optional, not mandatory.

## Reliability design

The demo must survive reasonable failures.

Required behavior:

- playback continues even if context service fails;
- context UI shows a clear retry state;
- malformed model output is handled;
- request timeouts are bounded;
- precomputed timeline facts remain usable if live generation is unavailable;
- health checks exist for remote services;
- logs make failures diagnosable.

Do not introduce a "fake demo mode" that silently replaces claimed integrations. Test doubles are fine in automated tests; final claimed runtime behavior must be verifiable.

## Security and secrets

- Never embed AWS or model credentials in Fire TV/web client code.
- Never commit secrets.
- Provide `.env.example` or equivalent configuration documentation.
- Use least-privilege IAM appropriate to the hackathon.
- Validate external inputs and MCP tool arguments.
- Keep model/system prompts server-side where practical.
- Avoid logging secrets or unnecessary user data.

## Observability

At minimum, make it possible to inspect:

- request latency;
- context facts selected for a response;
- temporal cutoff used;
- model invocation success/failure;
- MCP tool name and result status;
- Fire TV/API errors;
- ingestion failures.

For temporal safety tests and debugging, it should be possible to verify exactly which fact IDs reached model context.

## Infrastructure and deployment

Use infrastructure as code for AWS resources.

Requirements:

- repeatable deployment;
- repeatable teardown where practical;
- documented region/model dependencies;
- cost-conscious defaults;
- no requirement that expensive resources stay running continuously outside testing/judging periods.

The Devpost FAQ explicitly notes that AWS resources do not need to remain continuously active before the judging period; preserve the ability to redeploy them quickly.

## Performance priorities

Optimize the user-perceived interaction:

- input acknowledgement should be immediate;
- playback should never freeze while context is generated;
- responses should be short enough to read on TV;
- precompute media analysis;
- cache stable timeline data;
- minimize model context size;
- choose an available Bedrock model appropriate for latency/quality and verify it in the deployment region.

Do not hard-code a specific Bedrock model name in product logic unless current account/region support has been verified.

## Repository architecture principle

Keep one GitHub repository for the primary project. Organize code by clear responsibility, but allow official Vega tooling to dictate the exact Fire TV project layout.

Expected logical modules are:

- Fire TV/Vega app;
- Alexa+-style simulation;
- application API/domain service;
- MCP server;
- media ingestion tooling;
- shared domain contracts where practical;
- AWS infrastructure;
- tests/evals;
- demo/submission assets.

Do not reorganize the Vega scaffold merely to make the repository look symmetrical.

## Open-source mini-challenge option

If it does not jeopardize the primary submission, extract a genuinely reusable component such as a **temporal-context MCP/library** that:

- accepts a current timestamp;
- filters future facts;
- answers/query-selects only eligible context;
- includes tests;
- has a recognized open-source license;
- is created/contributed during the hackathon window;
- is actually used or meaningfully demonstrated by ContextCue.

Do not pursue an empty README-only open-source entry; Amazon explicitly treats trivial contributions as "obvious" rather than creative.
