# Memory — ContextCue Project State

## Purpose

This is the mutable handoff state for switching between coding agents/models. Keep it current, factual, and concise.

Do not use this file as a long diary. Preserve durable product/architecture rules in the other project documents.

## Current status

- Planning/specification: complete.
- Coding: domain, API, MCP, Alexa simulation, Fire OS app, demo film, and CDK are implemented. AWS stack is deployed. Fire OS app runs on the Pixel Tablet emulator.
- Current phase: Phase 5 polish and Phase 8 eval loop. Core path works. Submission video and Android TV system image are not done.
- Known blocker: Bedrock `Converse` is denied until AWS finishes new-account verification. Vega SDK cannot be installed on Windows.
- ADBT platform: `fire_os` in `.adbt-config.json`. `set_project_context` was called.
- Deployed API: `https://u3ne3gu6e8.execute-api.us-west-2.amazonaws.com`
- Media bucket: `contextcuestack-mediaa721a567-g236tmmznzdc`
- AWS account: `293653898909`, region `us-west-2`. Signed in with `aws login` as root. Do not commit credentials.

## Locked product decisions

- Product: ContextCue.
- Core promise: spoiler-safe story comprehension tied to current playback time.
- Primary tracks: Fire TV + Alexa+ with the same project.
- Target first-place cash prize: $25,000 primary-track first place.
- Fire TV default path: Vega OS + React Native for Vega.
- Alexa+ path: real self-hosted MCP server + custom web-based Alexa+ simulation.
- AWS Builder target: yes.
- Open Source target: conditional; only after primary project is stable.
- Hard invariant: future facts are filtered before generation.
- Memorable feature: Spoiler Dial.
- Human-review dependency: minimize; coding agent owns implementation/test/fix/eval loop.
- Vendor lock-in: none; project documents are model-agnostic.

## Verified competition facts at handoff

Verified on 2026-10-02 from current Devpost/Amazon sources:

- Submission deadline: October 23, 2026 at 12:00 PM Pacific.
- Fire TV first-place prize: $25,000 cash + AWS credits/other benefits.
- Alexa+ first-place prize: $25,000 cash + AWS credits/other benefits.
- One project may be judged in both Fire TV and Alexa+ tracks; it can win only one primary-track prize.
- Stage 2 judging criteria are equally weighted: Tech Implementation, Design, Potential Impact, Quality of Idea.
- Tech Implementation is the first tie-break criterion.
- Friction logs can contribute up to a 10% bonus to the final Stage 2 spreadsheet score.
- Fire TV must run on Fire OS or Vega OS; video must show it on actual device or simulator.
- Alexa+ may use a working Agent Skill, a self-hosted MCP server using the current required MCP spec over Streamable HTTP, or the explicitly allowed simulated-experience path.
- Hackathon entrants do not receive the gated Alexa+ preview tooling.
- Judges are not required to run the application; they may judge from text/images/video.
- Multiple submissions are allowed only when unique and substantially different.
- GitHub is required for the code repository.

Re-verify these facts before final submission because rules can change.

## Session handoff template

At the end of every meaningful coding session, replace/update the sections below.

### Completed since last handoff

- Amazon Devices Builder Tools MCP connected. Platform saved as Fire OS.
- AWS CLI logged in. CDK stack deployed: HTTP API, Lambda, DynamoDB, S3.
- Temporal engine, ingestion, MCP contract tests, and golden leakage tests pass.
- Original film *The Lantern Shift* rendered. Fire OS debug APK builds and runs. Recap overlay captured.
- Alexa simulation builds.

### Current working state

- `npm test` — 15 tests passed.
- `npm run dev` — API and MCP on `http://127.0.0.1:8787`.
- Fire OS app talks to `http://10.0.2.2:8787` from the emulator.
- Deployed `POST /v1/context` returns a time-bounded recap with `generationSource: deterministic-fallback`.
- Bedrock client is real. It is not enabled in the environment until `npm run bedrock:check` succeeds.

### Tests/builds last run

- `npx tsc --noEmit` passed.
- `npx vitest run` — 4 files, 15 tests passed, after the recap dedupe.
- `apps/alexa-sim` `npm run build` passed.
- `apps/firetv` `gradlew :app:assembleDebug` passed.
- `infra` `npm test` passed. `cdk deploy` succeeded in 82s.

### Current defects/blockers

- Bedrock invocation is blocked by account verification. Answers are honest fallbacks.
- Emulator run used Pixel Tablet, not an Android TV system image. No `sdkmanager` on this machine.
- Vega Virtual Device cannot be installed here.
- Recap card is readable but still a little long, and the stock screenshot is at the end of the film, so the reveal is allowed.
- No submission video yet.
- GitHub: https://github.com/Mazin7d4/contextcue

### Material decisions made during implementation

- 2026-10-02: Fire TV app targets Fire OS, not Vega. The Vega SDK does not support Windows or WSL. Recorded in `Architecture.md`.
- Bedrock model, once invocation works: `amazon.nova-lite-v1:0` in `us-west-2` because it is on-demand. Do not label fallback text as a model response.
- Demo story is an original short, *The Lantern Shift*. The identity reveal is at 56 seconds.

### Current phase / next highest-value actions

1. When `npm run bedrock:check` succeeds, set `BEDROCK_MODEL_ID=amazon.nova-lite-v1:0` and confirm a response is labeled `bedrock`.
2. Install an Android TV system image and recapture the golden path there.
3. Tighten the recap card so it does not repeat the burned-in subtitle.
4. Record the under-three-minute demo.
5. Push the GitHub repo and finish Devpost copy.

### Human-only actions still required

- None for AWS login. Account verification is on Amazon's side; re-run `npm run bedrock:check` later.
- Devpost submission, public video upload, and prize paperwork still need the entrant.
- A Mac or native Ubuntu machine is required only if the submission must show the Vega Virtual Device. Fire OS plus an Android TV emulator satisfies the written rule.
