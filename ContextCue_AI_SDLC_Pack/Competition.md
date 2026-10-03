# Competition — Amazon Developer Hackathon Strategy and Verified Constraints

## Objective

Optimize ContextCue for first place in either of the two $25,000 primary tracks it can credibly enter:

- Fire TV
- Alexa+

The organizer has explicitly confirmed that the same project may select and be judged in both tracks, but a project can win only one primary-track prize.

Also target the AWS Builder mini-challenge if the integration remains meaningful and polished. Pursue Open Source only after the primary project is safe.

## Verified dates

As verified on 2026-10-02:

- Submission deadline: Friday, October 23, 2026 at 12:00 PM Pacific.
- Judging period: November 9–20, 2026.
- Winners announced on or around December 3, 2026.

Re-verify immediately before submission.

## Primary prize targets

As currently listed:

- Fire TV first place: $25,000 cash + $15,000 AWS credits + Amazon Developer meeting + feature on Amazon Developer channels.
- Alexa+ first place: $25,000 cash + $15,000 AWS credits + Amazon Developer meeting + feature on Amazon Developer channels.
- AWS Builder mini-challenge: $5,000 cash + AWS credits/other listed benefits.
- Open Source mini-challenge: $5,000 cash + AWS credits/other listed benefits.

A project can only win one track prize and one mini-challenge prize.

## Official judging process

Stage One is pass/fail for baseline viability and track/tool fit.

Stage Two uses four equally weighted criteria:

1. Tech Implementation
2. Design
3. Potential Impact
4. Quality of the Idea

Tie-breaking starts with the first listed criterion, making Tech Implementation particularly important when projects are otherwise close.

## What Amazon currently describes as obvious vs. creative

### Fire TV

Amazon's rules contrast basic streaming UIs/simple players/remote games with more creative uses such as AI-enhanced viewing and multimodal TV interaction.

ContextCue should therefore make the video player merely the substrate. The judged idea is the playback-aware comprehension layer, temporal spoiler system, and TV-native contextual interaction.

### Alexa+

Amazon contrasts single-turn Q&A/basic MCP wrappers with experiences that maintain context/state, orchestrate meaningful workflows, and use richer multimodal patterns.

ContextCue must therefore demonstrate:

- state across turns;
- current playback context;
- persistent preferences;
- multiple purposeful tools;
- useful visual cards;
- product-specific behavior.

### AWS Builder

Amazon contrasts a trivial single Bedrock call/S3 use with richer multi-service/agentic pipelines.

ContextCue should make AWS part of media understanding, persistence, runtime explanation, and/or orchestration rather than a decorative integration.

### Open Source

Amazon contrasts trivial documentation/formatting with meaningful features, bug fixes, or integration patterns with tests.

Do not enter Open Source with cosmetic work.

## Friction-log bonus

Current rules state that Amazon's internal review can recommend a bonus of up to **10%** based on submitted friction-log entries, which the Stage 2 panel applies to the final spreadsheet score.

This is strategically significant.

Capture high-quality friction continuously in `FrictionLog.md`.

Do not fabricate issues.

## Fire TV track compliance

Current rule:

- any framework/language is acceptable;
- project must run on Fire OS or Vega OS;
- demo video must show the project running on actual Fire TV hardware or the Fire TV/Vega simulator.

Recommended implementation: Vega OS + React Native for Vega + Vega Virtual Device + Amazon Devices Builder Tools.

## Alexa+ track compliance

Current rule allows:

- a working Agent Skill; or
- a self-hosted MCP server using the required MCP spec version over Streamable HTTP; or
- an explicitly permitted simulated Alexa+ experience built with any AI/agentic tool.

Current Devpost FAQ states that hackathon participants do not get the gated Alexa+ Category SDK, MCP Toolkit, CLI, or Web Simulator and cannot apply for access.

ContextCue should build a real MCP server anyway because it strengthens technical implementation, while using a custom web simulation for the visible experience.

## GitHub requirement

The submission must link a GitHub repository containing necessary source code, assets, and instructions.

Current rules allow either:

- public repo with visible open-source license; or
- private repo shared with required Amazon/Devpost reviewers.

If private, reviewer invitations should be handled near submission because invitations expire. Recheck the current reviewer list in the FAQ immediately before inviting.

## Demo/submission reality

Current rules explicitly state judges are not required to test the project and may judge using only the submitted text, images, and video.

Therefore:

- the video must prove the product works;
- the README must quickly establish credibility;
- every important technical differentiator needs visible/written evidence;
- do not assume judges will discover a hidden feature by cloning the repo.

## Multiple submissions

Multiple submissions are permitted only when each is unique and substantially different.

Do not create a cosmetic second ContextCue entry.

Project #2 may begin only after ContextCue is complete and frozen, and must solve a different problem with different core functionality.

## Strategic interpretation for ContextCue

### Tech Implementation

Maximize with:

- real Vega app;
- real playback timing;
- structural temporal safety;
- real AWS integration;
- real MCP server;
- cross-surface state;
- tests/evals;
- reproducible infrastructure.

### Design

Maximize with:

- TV-native D-pad/focus interaction;
- fast, readable overlays;
- minimal UI around video;
- polished states;
- Alexa-style low-density cards;
- consistent visual language.

### Potential Impact

Make the user problem concrete and believable:

- interruptions happen;
- rewinding is disruptive;
- web search can spoil narrative content;
- complex dialogue/characters create comprehension friction.

Show the benefit directly rather than relying on inflated market-size slides.

### Quality of Idea

Emphasize what is difficult to copy with a generic chatbot:

- exact playback-aware context;
- temporal reveal model;
- spoiler-safe retrieval before generation;
- stateful Fire TV + conversational continuity;
- TV-native interaction.

## Hackathon execution principles adopted from the supplied hackathon guide

Use the useful principles, not the generic stack recommendations:

- choose a problem with obvious pain and a short before/after demo;
- prefer the most demoable credible solution over the most complicated one;
- keep the core user journey clear;
- reserve meaningful effort for polish, testing, deployment, and presentation;
- make the repository itself understandable to a judge;
- use graceful loading/error states;
- make the demo smooth, short, and easy to follow;
- avoid giant scope and vague AI claims.

The supplied guide is general-purpose and not authoritative over Amazon's rules. Amazon's official criteria always win when guidance conflicts.
