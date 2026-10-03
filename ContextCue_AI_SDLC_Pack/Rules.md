# Rules — Model-Agnostic Autonomous Development Contract

## Purpose

These rules exist so any capable coding agent can enter the repository, understand the project, continue the work, validate its own output, and hand the repository to another agent without architectural drift.

No vendor-specific instruction file is authoritative. These Markdown files are the shared project memory.

## Mandatory read order at the start of every new coding session

Read completely before making material changes:

1. `Rules.md`
2. `PRD.md`
3. `Competition.md`
4. `Architecture.md`
5. `Design.md`
6. `Evals.md`
7. `Phases.md`
8. `Memory.md`
9. `Submission.md`
10. `Sources.md`

Also inspect the actual repository and current test/build state. Repository reality overrides stale statements in `Memory.md`; when a mismatch is found, correct `Memory.md`.

## Operating mode

Work autonomously.

Do not ask the human for routine implementation choices, library selection, refactors, test design, naming decisions, architecture details already covered by these documents, or permission to continue from one phase to the next.

When a normal engineering uncertainty appears:

1. inspect existing code and these documents;
2. inspect current official documentation when the answer may have changed;
3. choose the strongest reasonable approach;
4. implement it;
5. execute/build/test it;
6. fix failures;
7. update `Memory.md` if the decision is material.

Only stop for a truly external blocker such as:

- authentication/login that requires the human's identity;
- missing cloud credentials that cannot be obtained from the environment;
- payment/billing/legal acceptance;
- a permission grant requiring human action;
- a physical action not available through tooling;
- a product decision not covered here that would fundamentally change the project objective.

If a blocker affects only one feature, continue all independent work before asking for help.

## Primary objective

Maximize the quality of the final Amazon Developer Hackathon submission for the Fire TV and Alexa+ primary tracks, with AWS Builder as an additional target and Open Source only when it strengthens rather than distracts from the main project.

The coding task is not complete when code exists. It is complete when the project satisfies the current phase's done criteria and the relevant gates in `Evals.md`.

## Source-of-truth hierarchy

For product intent:

1. `PRD.md`
2. `Competition.md`
3. `Architecture.md`
4. `Design.md`

For current external requirements:

1. current official Devpost rules/FAQ/organizer clarifications;
2. current official Amazon developer documentation;
3. current MCP specification documentation;
4. other sources.

When an external rule has changed, update the appropriate project document and `Sources.md` before implementing around the new requirement.

## Documentation stability

Treat these documents as persistent contracts, not disposable prompts.

### Stable documents

`PRD.md`, `Architecture.md`, `Rules.md`, `Design.md`, `Competition.md`, and `Evals.md` should not be casually rewritten.

Change them only when:

- current official requirements changed;
- implementation evidence proves an assumption wrong;
- a materially better approach clearly improves the project without changing its core thesis.

When changing a stable document, record the reason in `Memory.md` under Decisions.

### Mutable documents

Update continuously:

- `Memory.md`
- `Phases.md` checkboxes/status
- `FrictionLog.md`
- `ProductFeedback.md`
- `Submission.md` placeholders/drafts

## Build the real project

Do not create throwaway prototypes when the final implementation can be built directly.

Temporary adapters, test fixtures, and stubs are permitted only when they sit behind the final interface and are necessary to unblock parallel development or testing. They must be clearly labeled and replaced/validated before final completion.

Never silently replace a required runtime integration with fake data merely because the real integration is difficult.

## Platform-specific research

For Vega/Fire TV work:

- use Amazon Devices Builder Tools when available;
- prefer current official Vega documentation and Amazon sample apps;
- verify APIs/versions instead of assuming ordinary React Native behavior applies unchanged;
- use the actual Vega Virtual Device or supported Fire TV emulator/hardware to validate TV behavior.

For Alexa+ work:

- remember that hackathon entrants do not have the gated Alexa+ developer tools;
- do not waste time trying to obtain unavailable preview access;
- implement the submission path allowed by current hackathon rules;
- keep the simulation clearly identified as a simulation.

For AWS:

- verify selected Bedrock model/feature availability in the configured region/account;
- keep infrastructure reproducible;
- avoid costly always-on resources when a serverless/temporary option is sufficient.

## Code quality rules

- Prefer TypeScript for application/backend/IaC code unless an official tool or clearly superior library requires another language.
- Match official Vega scaffold conventions inside the Vega project.
- Keep domain rules separate from UI code.
- Keep temporal filtering deterministic and independently testable.
- Share product/domain logic between Fire TV and MCP paths rather than duplicating it.
- Use clear names over clever abstractions.
- Avoid speculative abstractions for one-off hackathon needs.
- Do not refactor stable working code without a concrete benefit.
- Avoid dependency churn.
- Use current stable dependencies compatible with the platform.
- Validate third-party licenses before inclusion.
- Keep secrets out of source control.

## Testing and verification rules

For every meaningful feature:

1. implement;
2. run static checks/build;
3. run relevant automated tests;
4. run the feature in its real target environment when possible;
5. inspect logs/output;
6. visually inspect UI changes when possible;
7. fix failures;
8. rerun until clean.

Never declare a feature done because source files were written.

Never disable or weaken a failing test merely to obtain green output unless the test itself is proven invalid and is replaced by an equivalent or stronger check.

Every fix for a meaningful regression should add or strengthen a regression test where practical.

## Autonomous evaluation loop

At the end of each phase and before final submission:

1. run all executable evals/tests;
2. evaluate the product against every section of `Evals.md`;
3. identify the highest-impact deficiency;
4. fix it if cost-effective and within scope;
5. rerun the evals;
6. record material results in `Memory.md`.

Do not self-award perfect scores without evidence.

## TV UX rules

- Remote/D-pad focus must always be visible.
- Every interactive control reachable by D-pad must be operable without a mouse.
- Do not place desktop-sized text on a TV surface.
- Avoid long paragraphs over video.
- Video remains the center of the experience.
- Context overlays should be dismissible and should preserve playback unless the designed interaction explicitly pauses it.
- Loading must acknowledge the user's action immediately.
- Failure must not crash playback.

## AI behavior rules

- Never let the model see future narrative facts before their reveal time.
- Ground story answers in eligible timeline data.
- If context is insufficient, state that rather than inventing a story fact.
- Keep TV answers concise.
- Do not treat prompt instructions as the only spoiler-safety mechanism.
- Model output must be treated as untrusted structured/semantic output and validated where appropriate.

## Scope discipline

Before adding a feature, it must satisfy at least one of these:

- directly improves a required user journey;
- materially improves a judging criterion;
- materially strengthens Fire TV/Alexa+/AWS track compliance;
- materially improves demo reliability/polish;
- is required for submission.

Otherwise, do not build it.

## Hackathon evidence rule

Every major claim intended for the final submission should have evidence available in the repo or demo:

- a running UI;
- source code/runtime hook;
- a test/eval;
- a screenshot/video capture;
- a deployment/configuration artifact;
- a measured result.

Do not make unsupported performance, adoption, accessibility, or market-size claims.

## Friction logging rule

Whenever Amazon tooling, SDKs, docs, simulators, APIs, or AWS services cause meaningful friction, immediately add a concrete entry to `FrictionLog.md` while the details are fresh.

Do not fabricate friction for bonus points.

## Product feedback rule

As each Amazon technology is used, update `ProductFeedback.md` with what was used, what worked, what did not, onboarding quality, and whether it would be used again.

Do not reconstruct this from memory on submission day.

## Memory handoff rule

Before ending a coding session or handing work to a different model, update `Memory.md` with:

- what is complete;
- what is currently working;
- exact tests/builds last run and results;
- material decisions and reasons;
- known defects/blockers;
- current phase;
- next highest-value actions;
- any external setup still required.

Keep this concise enough that a new frontier model can understand current state quickly.

## Git and repository rules

- Use GitHub because the hackathon requires it.
- Keep the main branch buildable.
- Make coherent commits with descriptive messages.
- Do not commit secrets, generated cloud credentials, or large unnecessary build artifacts.
- Ensure final repo has setup/run/test instructions.
- If public, include an appropriate open-source license.
- If private, follow current Devpost reviewer-access instructions near submission time.

## Human-facing stop condition

The implementation agent should return control only when:

1. the current requested work is fully complete; or
2. the project meets the full Definition of Done in `Phases.md`/`Evals.md`; or
3. a genuine external blocker requires the human.

When returning control, provide only actionable information: what is complete, how to run/test it, what remains, and any human-only action required.
