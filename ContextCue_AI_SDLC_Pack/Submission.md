# Submission — Judge-Facing Deliverables and Drafting Workspace

## Purpose

This file accumulates everything needed for the final Devpost submission so no important work is recreated from memory at the end.

Keep placeholders until real links/measurements exist. Never invent a deployment URL, metric, test result, user count, or performance number.

## Project identity

Project name: **ContextCue**

Working tagline:

**Understand what you missed — without rewinding or spoilers.**

Primary tracks:

- Fire TV
- Alexa+

Mini-challenges:

- AWS Builder — target
- Open Source — only if completed meaningfully

## Short description draft

ContextCue is a playback-aware AI comprehension layer for television. It helps viewers catch up on missed moments, understand characters and dialogue, and ask follow-up questions without revealing anything beyond their current point in the story. A Vega Fire TV app and an Alexa+-style conversational experience share the same time-bounded narrative context and preferences.

Revise after implementation so every statement reflects the actual final build.

## Problem statement draft

Viewers lose context when they get interrupted, miss a line, forget a character, or encounter a dense scene. Rewinding interrupts the experience, while searching the web can reveal spoilers. ContextCue restores understanding using only information the viewer has already reached.

## Technical differentiator draft

ContextCue does not rely on a prompt that says "don't spoil." Narrative facts are timestamped with when they become knowable. Before any LLM call, the context engine removes facts whose reveal time is later than the viewer's current playback position. Automated tests verify that future facts cannot enter model context.

## Fire TV track explanation draft

ContextCue is a video-first Fire TV experience running on Vega OS. It reads live playback position and lets viewers invoke contextual actions with TV-native remote/D-pad interaction. Recaps, character context, dialogue explanations, loading states, and the Spoiler Dial are designed as concise couch-readable overlays rather than a desktop chatbot transplanted to a television.

Update with exact Vega APIs/components used after implementation.

## Alexa+ track explanation draft

ContextCue includes a self-hosted MCP server and a custom Alexa+-style web simulation because hackathon participants do not receive access to the gated Alexa+ preview tooling. The conversational experience uses current playback context, purposeful ContextCue tools, multi-turn continuity, and persistent viewing preferences. The visible simulation uses real project workflows rather than mocked responses.

Update with exact MCP implementation/protocol/tool details after implementation.

## AWS Builder explanation draft

ContextCue uses AWS for real media understanding and runtime functionality rather than a decorative cloud call. The final description must list the exact services actually implemented, why each exists, and where it appears in the data/runtime flow.

Candidate services may include S3, Transcribe, Bedrock, DynamoDB, Lambda/API Gateway, and CDK. Remove anything not actually used.

## Open Source explanation placeholder

Only complete if the mini-challenge is genuinely pursued.

Contribution URL: `[TBD]`

Project repository URL: `[TBD]`

GitHub username: `[TBD]`

What was built: `[TBD]`

How it works: `[TBD]`

Why it matters: `[TBD]`

## Product feedback

Final answers must be derived from `ProductFeedback.md`.

Current Devpost prompts include:

- which developer tools/APIs/SDKs were used and for what;
- what worked well;
- what needs work;
- onboarding experience;
- whether you would build with the devices/services again and why.

## Friction log

Final entries must come from `FrictionLog.md` and should be selected for specificity/actionability.

Current requested structure includes:

- task attempted;
- steps taken;
- expected result;
- actual result;
- severity;
- workaround;
- actionable suggestion.

## Repository/testing instructions checklist

Final repo must make clear:

- prerequisites;
- how to configure environment safely;
- how to deploy AWS resources;
- how to run backend/API;
- how to run/test MCP server;
- how to launch Vega/VVD and run Fire TV app;
- how to run Alexa simulation;
- how to run automated tests/evals;
- what is simulated vs. real;
- how judges can test without paid/private credentials where practical.

## Final README expectations

The finished root README should be judge-facing, not agent-facing.

It should include, in a concise order:

1. project name + one-line value proposition;
2. strongest screenshot/GIF;
3. public demo video link;
4. problem;
5. how ContextCue works;
6. key features;
7. spoiler-safety explanation;
8. architecture;
9. Amazon technology used;
10. setup/run/test;
11. track/mini-challenge notes;
12. license if public.

## Demo video

Current official rules require the demonstration video to be less than three minutes, and judges are not required to watch beyond three minutes. Keep the final cut comfortably under 3:00 with safety margin, and recheck the rule before final upload.

### Recommended final timing

**0:00–0:10 — Hook**

Video already playing. One sentence establishes the pain: missed a moment; rewinding breaks flow; searching risks spoilers.

**0:10–0:35 — What did I miss?**

Trigger on Fire TV. Show immediate loading feedback, then spoiler-safe recap.

**0:35–0:55 — Character context**

Show `Who's here?`/character card.

**0:55–1:15 — Explain dialogue/event**

Show one clear comprehension win.

**1:15–1:40 — Alexa+-style continuity**

Ask a follow-up using the same story state. Show a concise card.

**1:40–1:55 — Cross-surface preference**

Change Strict mode/larger text/answer style in conversational surface; show it reflected on Fire TV.

**1:55–2:20 — Technical proof**

Very briefly prove:

- Vega app is real;
- time-bounded retrieval occurs before generation;
- leakage tests exist/pass;
- MCP server is real;
- AWS integration is real.

**2:20–2:40 — Spoiler Dial / differentiation**

Show the memorable feature or a fast before/after.

**2:40–2:55 — Close**

Return to the value proposition.

Avoid:

- team introduction at the beginning;
- long architecture narration;
- terminal debugging;
- scrolling source code for extended periods;
- generic AI claims;
- unsupported market statistics.

## Video capture checklist

- [ ] Fire TV footage visibly comes from Vega simulator/hardware.
- [ ] Mouse cursor is hidden/irrelevant during TV interaction if possible.
- [ ] D-pad/focus changes are visible.
- [ ] Text is readable after video compression.
- [ ] All latency pauses are tolerable or edited honestly without implying impossible behavior.
- [ ] Alexa simulation is clearly identifiable.
- [ ] Technical proof is legible.
- [ ] Audio/voiceover is clear.
- [ ] Final duration leaves safety margin.
- [ ] Public video URL works in incognito.

## Screenshot checklist

Capture final high-quality images of:

- Fire TV recap;
- character card;
- dialogue explanation;
- Spoiler Dial;
- Alexa contextual result;
- cross-surface preference;
- architecture/eval proof if useful.

## Final submission verification

Immediately before submission:

- [ ] Re-read current rules and FAQ.
- [ ] Confirm selected tracks/mini-challenges.
- [ ] Confirm GitHub access requirements.
- [ ] Confirm public repo license or current private reviewer access.
- [ ] Confirm all links in incognito.
- [ ] Confirm source/assets needed to run are present.
- [ ] Confirm demo video shows required platform.
- [ ] Confirm no secrets in repository/history.
- [ ] Confirm product feedback completed.
- [ ] Confirm friction log completed.
- [ ] Confirm testing instructions are realistic.
- [ ] Confirm every claim is true in final build.

## Human-only final actions

The coding agent should prepare everything possible, but these may still require the entrant:

- Devpost account/login and final submission action;
- GitHub account permissions/reviewer invitations if private;
- cloud billing/account approvals if required;
- public video upload/account action where automation is unavailable;
- final identity/prize paperwork if selected.
