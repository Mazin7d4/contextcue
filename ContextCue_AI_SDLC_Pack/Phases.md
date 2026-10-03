# Phases — ContextCue Delivery Plan

## How to use this file

This is an execution dependency map, not a calendar. A capable coding agent may complete independent work in parallel internally, but it must preserve dependencies and done criteria.

Do not pause for human approval between phases.

A phase is complete only when its done criteria and relevant `Evals.md` gates pass.

## Phase 0 — Re-verify external requirements and environment

Tasks:

- [x] Read all project Markdown files.
- [x] Inspect current Devpost rules, FAQ, relevant organizer discussion, and deadline.
- [x] Confirm Fire TV and Alexa+ track requirements have not changed.
- [x] Confirm MCP protocol/transport requirement.
- [x] Confirm current Vega/ADBT setup instructions and supported host OS.
- [x] Inspect available AWS account/region/model access.
- [ ] Verify GitHub remote or prepare repo for GitHub.
- [x] Record any changed external requirement in the appropriate docs and `Sources.md`.

Done when:

- the agent can state the current required technologies and submission constraints from official sources;
- the local environment can begin real Vega development or any missing human-only prerequisite is clearly isolated.

## Phase 1 — Final project foundation

Tasks:

- [x] Scaffold the Fire TV application. Vega was not used: the Vega SDK does not support this Windows host, so the runnable app is Fire OS (`apps/firetv`) and the debug APK builds.
- [x] Establish the backend/application service project.
- [x] Establish the Alexa+-style web simulation project.
- [x] Establish the MCP server project.
- [x] Establish AWS infrastructure-as-code project.
- [x] Establish shared domain contracts where compatible.
- [x] Add root-level commands/scripts for common build/test/eval tasks where practical.
- [x] Add secret-safe configuration templates.
- [x] Set up baseline lint/typecheck/tests compatible with each platform.

Do not spend time forcing cosmetic repository symmetry if official Vega tooling expects its own layout.

Done when:

- all major final components exist in their intended long-term form;
- each component builds or starts to the extent possible;
- there is no disposable project that will later be thrown away.

## Phase 2 — Rights-cleared demo media and narrative dataset

Tasks:

- [x] Select/create a short rights-cleared narrative video suitable for the demo.
- [x] Ensure it has enough narrative structure to demonstrate character context, missed-event recap, dialogue explanation, and a later reveal that must remain hidden earlier.
- [x] Create/generate subtitles or a timed transcript.
- [x] Define scenes and characters.
- [x] Run the real ingestion path to generate narrative facts.
- [x] Manually correct factual/timestamp errors where needed without bypassing the real pipeline.
- [x] Preserve enough source/provenance information for debugging.

Done when:

- one complete demo media asset can drive every golden-path feature;
- at least one future reveal exists specifically to test spoiler leakage;
- the media can legally be shown in the submission.

## Phase 3 — Temporal context engine

Tasks:

- [x] Implement narrative fact schema.
- [x] Implement storage/retrieval abstraction.
- [x] Implement hard `revealedAtMs <= playbackTime` filtering.
- [x] Implement recent-scene/context selection.
- [x] Implement Strict, Helpful, and Catch Me Up selection behavior without weakening the hard cutoff.
- [x] Implement provenance/debug output that can reveal which fact IDs reached generation.
- [x] Implement recap, character-context, event-explanation, and dialogue-explanation domain operations.
- [x] Add adversarial tests for future-fact leakage.

Done when:

- all temporal safety tests in `Evals.md` pass;
- future facts cannot enter generation context through any product operation;
- core domain functions are usable by both Fire TV and MCP paths.

## Phase 4 — AWS pipeline and runtime integration

Tasks:

- [x] Implement reproducible IaC.
- [x] Deploy/configure S3 and selected storage.
- [ ] Implement transcription/ingestion support using appropriate AWS services where useful.
- [x] Implement Bedrock model calls for actual product functionality.
- [x] Implement database state/timeline persistence.
- [x] Implement serverless/remote application API.
- [x] Add health checks and logging.
- [x] Validate the integration in the real configured AWS environment.
- [x] Record services used and feedback in `ProductFeedback.md`.

The AWS Builder story must be more meaningful than one Bedrock text call plus passive S3 storage.

Done when:

- the final runtime path uses documented AWS services for real functionality;
- a fresh infrastructure deployment is reproducible;
- the project has evidence for the AWS Builder mini-challenge.

## Phase 5 — Fire TV/Vega final experience

Tasks:

- [ ] Implement real media playback using current Vega-supported media APIs.
- [ ] Read current playback time reliably.
- [ ] Map current subtitle/dialogue cue if available.
- [ ] Implement remote/D-pad focus behavior using current Vega patterns.
- [ ] Implement minimal context-action entry UI.
- [ ] Implement recap overlay.
- [ ] Implement character card.
- [ ] Implement dialogue/event explanation card.
- [ ] Implement Spoiler Dial.
- [ ] Implement preference rendering such as larger text/concise mode.
- [ ] Implement loading/error/retry states that do not break playback.
- [ ] Sync playback/preferences to backend.
- [ ] Exercise the real app in Vega Virtual Device or hardware.
- [ ] Fix focus, clipping, readability, timing, and responsiveness defects found by visual inspection.

Done when:

- the full Fire TV golden path runs in the actual supported simulator/hardware;
- no mouse is required;
- D-pad focus is always understandable;
- the app looks designed for television;
- a screen recording could be used in the final submission.

## Phase 6 — MCP server

Tasks:

- [x] Implement current required MCP protocol version.
- [x] Implement Streamable HTTP transport.
- [x] Implement clear intent-specific tools backed by shared ContextCue domain services.
- [x] Validate tool schemas and argument handling.
- [x] Test initialization/tool discovery/tool calls using a suitable MCP client/inspector.
- [x] Handle malformed input and backend failure gracefully.
- [ ] Deploy the MCP server at a remote HTTPS URL if needed for final demonstration/testing.

Done when:

- MCP discovery and all demo tool calls work against the real service;
- tool calls do not duplicate product logic;
- current requirements in `Competition.md` are satisfied.

## Phase 7 — Alexa+-style conversational simulation

Tasks:

- [ ] Build a polished simulation clearly labeled as a simulated Alexa+-style experience.
- [ ] Implement conversational input.
- [ ] Implement an orchestration path that uses the project's real MCP tools/backend.
- [ ] Implement multi-turn continuity relevant to the current viewing session.
- [ ] Implement concise inline-style visual cards.
- [ ] Implement preference changes and persistence.
- [ ] Demonstrate shared current playback context from Fire TV.
- [ ] Implement clear failure/retry behavior.
- [ ] Apply current Alexa+ design guidance: low density, larger typography, glanceable information, simple cards.

Done when:

- the conversational demo is unmistakably product-specific and stateful;
- the same backend state can be observed across Fire TV and simulation;
- the experience does not resemble a generic chatbot shell.

## Phase 8 — Product hardening and autonomous eval loop

Tasks:

- [ ] Run all unit tests.
- [ ] Run integration tests.
- [ ] Run temporal leakage evals.
- [ ] Run MCP contract tests.
- [ ] Run clean-clone/build checks.
- [ ] Exercise all error states.
- [ ] Measure major interaction latency.
- [ ] Inspect Fire TV UI in target simulator/hardware.
- [ ] Inspect Alexa simulation at target dimensions.
- [ ] Run the golden path repeatedly.
- [ ] Fix the highest-impact weaknesses identified by `Evals.md`.
- [ ] Repeat until no material P0/P1 defects remain.

Done when:

- final demo path is repeatable;
- relevant eval gates pass;
- remaining limitations are non-fatal and documented.

## Phase 9 — Open Source mini-challenge decision

Decision gate:

Pursue only if the primary project is already stable and a reusable component can be extracted without threatening submission quality.

If pursued:

- [ ] Create or contribute a meaningful public open-source project during the hackathon window.
- [ ] Include recognized open-source license.
- [ ] Add tests and useful documentation.
- [ ] Ensure contribution has real functionality, not formatting-only work.
- [ ] Use/demonstrate it meaningfully in ContextCue where appropriate.
- [ ] Record contribution URL, repo URL, GitHub username placeholder, description, how it works, and why it matters in `Submission.md`.

Done when:

- it independently meets the Open Source challenge requirement and does not weaken primary-track quality.

## Phase 10 — Judge-facing repository and evidence

Tasks:

- [ ] Replace/finish root README as a judge-facing project page.
- [ ] Add product screenshots/GIFs where useful.
- [ ] Add concise architecture explanation/diagram.
- [ ] Document setup/run/test instructions.
- [ ] Document Amazon technologies and where they are called at runtime.
- [ ] Add testing instructions.
- [ ] Ensure no secrets or dead links.
- [ ] Verify repository from a clean checkout.
- [ ] Finalize `FrictionLog.md` and `ProductFeedback.md`.

Done when:

- someone opening the repo can understand the project, see it working, and understand the technical differentiator quickly without speaking to the builder.

## Phase 11 — Final demo video and submission package

Tasks:

- [ ] Lock the exact <3 minute video script in `Submission.md`.
- [ ] Capture Fire TV/Vega footage from real simulator/hardware.
- [ ] Capture Alexa simulation footage.
- [ ] Capture short technical proof footage/screenshots.
- [ ] Edit a concise final video with safety margin below three minutes.
- [ ] Ensure video is publicly accessible using a permitted host.
- [ ] Finalize project description.
- [ ] Finalize Fire TV track explanation.
- [ ] Finalize Alexa+ track explanation.
- [ ] Finalize AWS Builder explanation.
- [ ] Finalize Open Source explanation if applicable.
- [ ] Finalize product feedback.
- [ ] Finalize friction logs.
- [ ] Finalize testing instructions.
- [ ] Recheck current Devpost rules/FAQ before submission.
- [ ] If repo is private, add current required reviewers at the correct time.

Done when:

- every required Devpost field has final-ready copy/assets;
- all URLs work;
- the video alone demonstrates a functioning product on the required platform;
- final rules compliance has been rechecked against current official sources.

## Phase 12 — Freeze ContextCue, then consider second submission

Only after ContextCue is submission-ready:

- [ ] Tag/freeze a stable release.
- [ ] Preserve deployment instructions and assets.
- [ ] Generate proposals for a second substantially different project.
- [ ] Evaluate second project against current competitor landscape and remaining time.
- [ ] Start only if it can become a complete, distinct submission without endangering ContextCue.

## Full Definition of Done

ContextCue is fully done only when:

- [ ] Fire TV/Vega app runs and is visually polished.
- [ ] Demo media plays reliably.
- [ ] Context actions work from live playback state.
- [ ] Temporal spoiler invariant is enforced before generation.
- [ ] Spoiler leakage evals pass.
- [ ] AWS integration is real and documented.
- [ ] MCP server is real and passes current protocol/transport requirements.
- [ ] Alexa+-style simulation uses real project workflows and shared state.
- [ ] Relevant preferences persist across surfaces.
- [ ] Tests/build/evals pass from a clean state.
- [ ] Friction and product feedback are complete.
- [ ] Judge-facing README is complete.
- [ ] Demo video is final and under the time limit.
- [ ] Devpost copy is final.
- [ ] Current rules/FAQ have been rechecked immediately before submission.
