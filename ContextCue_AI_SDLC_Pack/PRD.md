# PRD — ContextCue

## Product summary

ContextCue is an AI comprehension layer for television. While a viewer watches a story on Fire TV, ContextCue can explain what the viewer missed, identify relevant characters, explain a confusing line or event, and adapt how much context it gives—without revealing information that occurs after the viewer's current playback position.

The same ContextCue state is available through an Alexa+-style conversational experience. A viewer can ask follow-up questions, change preferences, and return to the TV without losing context.

The product is being built for the 2026 Amazon Developer Hackathon with the primary goal of competing for the $25,000 first-place prize in the Fire TV track and the $25,000 first-place prize in the Alexa+ track with one coherent project. The organizer has confirmed that one project may select and be judged in both tracks, though it can win only one primary-track prize.

## One-line value proposition

**Understand what you missed — without rewinding and without spoilers.**

## Problem

Television is linear, but attention is not. Viewers get interrupted, miss dialogue, forget character relationships, or encounter dense scenes. Their current options are poor:

- rewind and disrupt the viewing experience;
- search the web and risk spoilers;
- ask another person and interrupt them;
- continue watching while confused.

ContextCue restores story comprehension at the viewer's exact point in the narrative.

## Primary user

A viewer watching narrative video on a TV who:

- missed part of a scene;
- forgot who a character is;
- wants a concise explanation of dialogue or an event;
- wants help following a complex story;
- wants context without future plot information.

Secondary use cases include language learners and people who prefer simplified or more explicit story context. Do not make medical or disability claims that are not supported by evidence.

## Core product promise

At playback timestamp `T`, ContextCue may use information revealed at or before `T`, but must not expose information revealed after `T`.

This promise must be enforced by architecture and tests, not merely by prompting an LLM to avoid spoilers.

## Core user journeys

### 1. What did I miss?

The viewer invokes a contextual action on Fire TV while media is playing. ContextCue reads the current playback position, gathers only eligible facts from the recent narrative window, and returns a short recap suitable for a TV overlay.

### 2. Who is this / who is here?

At the current playback position, ContextCue identifies the relevant on-screen or active character(s) from scene metadata and presents a concise character card containing only already-revealed information.

### 3. Explain that line

ContextCue uses the current subtitle/dialogue cue plus previously revealed narrative context to explain the line in plain language without advancing the plot.

### 4. Why does this matter?

ContextCue explains why a current event matters using already-revealed relationships, goals, and prior events.

### 5. Spoiler Dial

The viewer selects one of three safe context modes:

- **Strict** — only explicitly revealed facts at or before the current timestamp.
- **Helpful** — allows reasonable inference from already-revealed facts, but no future facts.
- **Catch Me Up** — provides a richer recap of already-revealed material while remaining time-bounded.

All modes retain the hard temporal boundary.

### 6. Continue through Alexa+-style conversation

The viewer can use the web-based Alexa+ simulation to ask ContextCue questions conversationally. The simulation uses the project's real backend and MCP server. It supports multi-turn context and persistent viewing preferences.

### 7. Cross-surface preference state

A preference changed through the conversational surface—such as Strict spoiler mode, larger text, concise answers, or explanation style—must be reflected by the Fire TV experience.

## Must-have features

- Fire TV/Vega application that runs in the Vega Virtual Device or real Fire TV hardware.
- Real video playback.
- Current playback timestamp available to the application.
- Current subtitle/dialogue cue available where possible.
- Context actions accessible by remote/D-pad.
- Time-bounded narrative fact model.
- Hard filter that excludes future facts before LLM generation.
- `What did I miss?` recap.
- Character context.
- Dialogue/event explanation.
- Spoiler Dial.
- Persistent preferences.
- Real self-hosted MCP server using the hackathon-required MCP transport/version requirements.
- Alexa+-style web simulation using real project data/workflows.
- AWS-backed functionality that is meaningful enough for the AWS Builder mini-challenge.
- Automated temporal safety tests.
- Polished loading, error, retry, and empty states.
- Demo-ready rights-cleared media.
- Product feedback and friction logs captured during development.

## Competitive differentiators

### Temporal spoiler safety is structural

Every narrative fact has a reveal time. Future facts are removed before prompt/model context construction. This turns spoiler safety into a testable systems property.

### TV-native interaction

ContextCue is not a web chatbot on a television. It is a video-first TV experience with remote focus, minimal overlays, couch-readable typography, and contextual actions tied to playback.

### Stateful cross-surface experience

The conversational experience is not single-turn Q&A. It can use current playback state, maintain preferences, and support follow-ups around the same viewing context.

### AI used where it matters

AI performs media understanding and grounded explanation. Deterministic code enforces timeline safety, state, and product rules.

## Demo story

The final demo should make the value obvious before explaining architecture.

Recommended golden path:

1. A rights-cleared short film is already playing on Fire TV/Vega.
2. Viewer triggers **What did I miss?**
3. A concise spoiler-safe recap appears.
4. Viewer triggers **Who is this?** or selects a current character.
5. A character card appears.
6. Viewer triggers **Explain that line**.
7. A simple explanation appears.
8. Switch to the Alexa+-style simulation.
9. Ask a follow-up about the same story state.
10. Change a preference such as Strict spoiler mode or larger text.
11. Return to the Fire TV surface and show the preference applied.
12. Briefly show the technical proof: Vega, temporal filter/tests, MCP, AWS.
13. Close on the product promise.

## Success criteria

The project is successful only if all of the following are true:

- A judge can understand the problem and product in under 20 seconds.
- The final demo path is reliable and visually polished.
- The Fire TV app visibly behaves like a TV application, not a desktop/web port.
- Future plot information cannot enter model context before its reveal time.
- The Alexa+-style experience is stateful and product-specific, not a generic chatbot.
- Amazon technology is central to runtime behavior and easy to verify in the repository.
- The project has a credible AWS Builder story beyond a single trivial model call.
- The README, video, screenshots, and Devpost copy can stand alone because judges are not required to run the project.
- Friction logs are concrete enough to be useful to Amazon and qualify for the available judging bonus.

## Explicit non-goals

Do not build unless required by the final experience:

- a streaming catalog;
- content recommendations;
- social features;
- watch parties;
- payments;
- full user-account product onboarding;
- production DRM;
- a generic AI assistant;
- a generic chatbot screen as the core UX;
- a large analytics dashboard;
- arbitrary support for every video on the internet;
- production-scale media ingestion;
- custom model training;
- unnecessary microservices;
- features that will not appear in the final demo or materially raise a judging criterion.

## Product constraints

- Demo media must be owned by the entrant or licensed for this use.
- All submission materials must be in English.
- The final demo video must show Fire TV functionality running on Fire OS/Vega hardware or simulator.
- The repository must contain source code, assets, setup/run instructions, and the technology hooks required by the selected track(s).
- Keep the experience usable even when model latency is nonzero.
- Do not rely on a live external system when preprocessing or caching can make the demo safer without falsifying the integration.

## Post-project strategy

Only after ContextCue is fully submission-ready may a second submission be started. Hackathon rules permit multiple submissions only when they are unique and substantially different. A second submission must solve a different problem and have materially different core functionality; it must not be a reskinned ContextCue.
