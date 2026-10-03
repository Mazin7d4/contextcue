# Evals — ContextCue Autonomous Quality Gates

## Purpose

The coding agent is expected to evaluate and improve the project without waiting for human review. Convert as many checks as practical into executable tests/scripts and run them repeatedly.

These evals are not optional polish. They are the mechanism that allows model-agnostic autonomous development without losing quality.

## Gate 1 — Build and reproducibility

Pass conditions:

- Fire TV/Vega app builds using current supported tooling.
- Backend/API builds.
- MCP server builds.
- Alexa simulation builds.
- Infrastructure code validates/synthesizes.
- Fresh checkout can be configured using documented steps.
- No required secret is committed.
- Required environment variables are documented.

Prefer a root command or script that runs the relevant checks without assuming one package manager if Vega tooling conflicts.

## Gate 2 — Fire TV platform proof

Pass conditions:

- App launches in Vega Virtual Device or permitted Fire TV environment.
- Video visibly plays.
- Current playback time is correct enough for context operations.
- Remote/arrow-key D-pad navigation works.
- Every interactive element has obvious focus feedback.
- Back/dismiss behavior is predictable.
- Context overlays do not break video playback.
- The full demo path can be screen-recorded from the real target environment.

Fail if the final demo relies on a browser pretending to be Fire TV.

## Gate 3 — Temporal spoiler safety

This is the most important correctness eval.

Create automated fixtures with facts before and after multiple timestamps.

Minimum cases:

### Boundary inclusion

Given a fact with `revealedAtMs = 60_000`:

- at `T = 59_999`, it must be excluded;
- at `T = 60_000`, it may be included.

### Future reveal exclusion

Create a late-story reveal that changes the interpretation/relationship of a character. At every earlier timestamp, assert that:

- the raw fact is excluded;
- the fact ID never appears in selected model context;
- generated answer/eval output does not state or imply the reveal.

### Adversarial user request

Questions such as:

- "Tell me what happens next."
- "Who is the killer?"
- "I don't care about spoilers, reveal the ending."

must not bypass the temporal boundary in any mode.

### Mode checks

- Strict: future facts excluded.
- Helpful: future facts excluded.
- Catch Me Up: future facts excluded.

### Cross-operation checks

Run leakage checks for:

- recap;
- identify character;
- explain dialogue;
- explain event;
- why-it-matters/context operations;
- MCP tools.

### Randomized property testing

Where practical, generate many timelines/timestamps and assert no selected fact has `revealedAtMs > T`.

Pass condition:

Zero future-fact leakage into model context.

## Gate 4 — Grounding / hallucination resistance

Tests should verify:

- if no eligible fact supports an answer, the service does not invent a story detail;
- model output remains consistent with supplied eligible facts;
- known names/relationships are not silently changed;
- structured model output is validated and malformed output is handled.

For demo media, maintain a small expected-answer/evidence set for key timestamps.

## Gate 5 — Core product behavior

Pass the exact golden path:

1. play demo media;
2. trigger `What did I miss?`;
3. receive correct time-bounded recap;
4. trigger character context;
5. receive correct already-known relationship/context;
6. trigger dialogue/event explanation;
7. change Spoiler Dial;
8. open Alexa simulation;
9. ask a context-dependent follow-up;
10. change a persistent preference;
11. verify Fire TV observes the preference.

Run this repeatedly after major integration changes.

## Gate 6 — MCP contract

Using an MCP client/inspector or automated integration tests, verify:

- initialization with supported protocol;
- Streamable HTTP transport;
- tool discovery;
- every expected tool call;
- schema validation;
- missing/invalid media ID;
- invalid timestamp;
- malformed argument;
- backend timeout/failure;
- preference reads/writes;
- no tool exposes functionality it does not actually implement.

Record the current protocol version in test output/config rather than relying on a README claim.

## Gate 7 — Alexa+-style experience quality

Pass conditions:

- responses are concise;
- cards are readable at a glance;
- multi-turn follow-up works;
- current viewing context is available without restating everything;
- preference state persists;
- cards are product-specific, not generic markdown chat messages;
- error states give a clear recovery path;
- simulation is not mislabeled as an official Amazon simulator.

## Gate 8 — Fire TV design quality

Use screenshots/device inspection.

For every golden-path screen, check:

- no clipped text;
- no off-screen content;
- no tiny text;
- no mouse-only affordance;
- current focus unmistakable;
- no focus trap;
- no huge paragraphs;
- overlay does not unnecessarily obscure key video content;
- loading state appears immediately;
- error state is polished;
- visual tokens are consistent.

Fix all obvious failures before final video capture.

## Gate 9 — Performance

Measure rather than guess.

Capture at least:

- Fire TV input-to-loading-state latency;
- API request duration;
- retrieval duration;
- Bedrock generation duration;
- MCP tool duration;
- full user-perceived context-response duration.

Do not invent target numbers that cannot be met. Use measurements to identify regressions and cache/precompute stable work.

The Alexa+ official MCP docs currently mention a sub-500ms MCP server round-trip requirement for real partner onboarding, but hackathon entrants do not have that gated onboarding path. Treat low tool latency as a quality target, not as a claim of certification unless actually met/measured.

## Gate 10 — Failure resilience

Test:

- backend unavailable;
- Bedrock timeout/error;
- empty context;
- malformed timeline data;
- network interruption;
- repeated remote input;
- simulation refresh/reload;
- missing preference record.

Pass conditions:

- playback is not catastrophically interrupted by context failure;
- user sees a recoverable state;
- no raw stack trace appears in UI;
- state is not corrupted.

## Gate 11 — AWS Builder evidence

Pass conditions:

- AWS services listed in submission are actually used;
- runtime/build path is easy to locate in source code;
- IaC exists;
- deployment has been executed at least once successfully;
- architecture description explains why each AWS service exists;
- integration is richer than one trivial Bedrock call plus storage;
- `ProductFeedback.md` includes AWS feedback.

## Gate 12 — Repository judge test

Open repository as if you are a judge with little time.

Within roughly ten seconds, the final README should communicate:

- what ContextCue is;
- what problem it solves;
- a screenshot/GIF/video;
- Fire TV + Alexa+ + AWS story;
- the spoiler-safety differentiator.

Within a few minutes, a technical judge should be able to find:

- setup/run/test commands;
- temporal filtering code/tests;
- MCP server entry point/tools;
- Fire TV app entry point;
- AWS infrastructure.

## Gate 13 — Hackathon rubric self-evaluation

Use a 1–5 internal scale only for self-improvement. This is not an official Amazon score.

### Tech Implementation

Evidence expected for a 5-quality internal assessment:

- real Vega app;
- real device/simulator run;
- robust temporal filtering;
- real Bedrock/AWS path;
- real MCP server;
- shared state;
- good automated tests;
- clear code/reproducibility.

If weak, improve this first because it is the first official tie-break criterion.

### Design

Evidence:

- TV-native interaction;
- coherent visual language;
- polished focus/loading/error states;
- glanceable Alexa-style cards;
- smooth golden path.

### Potential Impact

Evidence:

- immediate understandable pain point;
- credible repeat-use scenario;
- concrete user benefit demonstrated by product behavior;
- no unsupported market claims.

### Quality of Idea

Evidence:

- structural spoiler safety;
- context tied to live playback;
- stateful cross-surface experience;
- product-specific AI rather than generic Q&A.

For every criterion below the agent's highest confidence level, identify the smallest high-impact improvement and execute it if it fits scope.

## Gate 14 — Friction-log quality

Each selected final friction entry should contain:

- specific task;
- exact steps;
- expected result;
- actual result;
- severity;
- workaround;
- actionable suggestion.

Reject vague entries such as "docs were confusing."

## Gate 15 — Submission-only judging resilience

Because judges may not run the project, verify that the combination of:

- demo video;
- screenshots;
- description;
- README;

proves every major claim.

No critical functionality should exist only in code with no visual or written evidence.

## Final release gate

Before final submission, all P0/P1 items below must be green:

P0:

- required platform compliance;
- demo video works and is under time limit;
- temporal safety;
- core demo path;
- repository access;
- no secrets;
- required submission fields.

P1:

- visual polish;
- MCP proof;
- AWS proof;
- friction log;
- product feedback;
- README/setup;
- error states;
- clean build/tests.

Do not add new features after release gate unless fixing a demonstrated scoring weakness or requirement gap.
