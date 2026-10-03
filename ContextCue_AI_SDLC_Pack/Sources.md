# Sources — Verified External Context

## How to use this file

These links were checked while preparing the handoff on 2026-10-02 and rechecked the same day before implementation. Time-sensitive rules, SDK versions, protocol requirements, reviewer lists, and deadlines must be rechecked before final submission.

Recheck on 2026-10-02:

- Rules page still says the submission deadline is October 23, 2026 at 12:00 PM Pacific, judging is November 9–20, 2026, and the demo video must be under three minutes.
- Alexa+ still requires MCP spec 2025-11-25 or later over Streamable HTTP, or an explicitly allowed simulation. Hackathon entrants still do not get the gated Alexa+ tools.
- Vega SDK 0.24 install docs still say Windows and WSL are unsupported. This host is Windows 11, so the runnable Fire TV app is Fire OS. The hackathon FAQ accepts an Android TV emulator.
- Account `293653898909` can use S3 and DynamoDB in `us-west-2`. `amazon.nova-lite-v1:0` is on-demand there, but `Converse` was denied while the account was being verified.

Official Amazon/Devpost sources override third-party guidance.

## Hackathon — authoritative

### Official rules

https://amazonappdev2026.devpost.com/rules

Key facts currently verified:

- deadline and judging dates;
- judging criteria and tie-break ordering;
- primary and mini-challenge prizes;
- friction-log bonus;
- Fire TV runtime/demo requirement;
- Alexa+ MCP/simulation submission paths;
- GitHub repository requirement;
- product feedback requirements;
- multiple-submission rule;
- judges may evaluate from text/images/video without running the app.

### Official FAQ

https://amazonappdev2026.devpost.com/details/faqs

Key facts currently verified:

- hackathon entrants do not get gated Alexa+ Category SDK/MCP Toolkit/CLI/Web Simulator;
- Fire TV simulator is acceptable; physical device not required;
- Alexa+ simulated experience is acceptable;
- GitHub private-repo collaborator guidance;
- GitHub is required;
- AWS resources do not need to remain continuously running before judging.

### Organizer clarification — same project in Fire TV + Alexa+

https://amazonappdev2026.devpost.com/forum_topics/45333-can-one-project-be-submitted-to-both-fire-tv-and-alexa-tracks

Current organizer response: one project can select and be judged for both tracks, but can win only one primary track prize.

### Hackathon resources

https://amazonappdev2026.devpost.com/resources

Check again during implementation for new samples/tools.

## Fire TV / Vega — authoritative

### Getting started with Vega OS development

https://developer.amazon.com/apps-and-games/blogs/2026/07/guide-to-building-for-fire-tv-on-vega-os

Current useful facts:

- Vega uses React Native;
- Mac or Linux currently required for the documented Vega toolchain; Windows/WSL not supported in this guide;
- Vega Virtual Device is installed with the SDK and can replace physical hardware for development;
- Amazon recommends ADBT for AI-assisted workflows;
- ADBT works with Claude Code, Cursor, GitHub Copilot, Kiro, and other coding agents.

### Amazon Devices Builder Tools

https://developer.amazon.com/docs/adbt/home

https://developer.amazon.com/docs/adbt/get-started

ADBT is an MCP server plus agent skills that provides Amazon-device-specific tooling/context to AI coding assistants.

### React Native for Vega architecture

https://developer.amazon.com/docs/vega/0.24/vega-rn-arch

### Vega focus management

https://developer.amazon.com/docs/vega/0.23/focus-management

### Vega media player

https://www.developer.amazon.com/docs/vega/0.22/media-player

### Vega docs home/get started

https://developer.amazon.com/docs/vega/0.22/vega-get-started

## Alexa+ — authoritative design/technical references

### Alexa+ developer docs home

https://developer.amazon.com/docs/alexaplus/add-ons/home.html

Important: page currently states Category SDK and MCP Toolkit are available to select partners only. Hackathon-specific Devpost rules/FAQ define the entrant path.

### MCP QuickStart / requirements

https://www.developer.amazon.com/docs/alexaplus/add-ons/mcp-toolkit-quickstart.html

Useful reference for current production-facing MCP expectations such as Streamable HTTP and tool/server behavior. Do not assume entrant access to gated tooling.

### MCP add-on design guide

https://www.developer.amazon.com/zh/docs/alexaplus/add-ons/mcp-addon-design-guide.html

### Visual foundations

https://developer.amazon.com/zh/docs/alexaplus/add-ons/mcp-addon-visual-foundations.html

Current guidance emphasizes larger typography, reduced density, and glanceability.

### Conversation surface

https://developer.amazon.com/docs/alexaplus/add-ons/mcp-addon-conversation-surface.html

Current guidance describes turn-based conversation, continuity, and voice/screen behavior.

### Display modes

https://developer.amazon.com/docs/alexaplus/add-ons/mcp-addon-display-modes.html

### Components and patterns

https://developer.amazon.com/zh/docs/alexaplus/add-ons/mcp-addon-components-and-patterns.html

### Tools/schema/data design

https://developer.amazon.com/ja/docs/alexaplus/add-ons/mcp-addon-tools-schema-data-design.html

Current guidance: tools should map to meaningful intents, have clear descriptions, avoid overlapping functions, and expose only parameters actually honored.

## MCP standard

https://modelcontextprotocol.io/

Before finalizing MCP implementation, confirm the exact current spec/SDK behavior against the version required by the hackathon rules.

## Supplied vibe-coding workflow article

https://www.kazi-rahamatullah.com/blog/vibe-coding-md-files

Useful idea adopted:

- persistent `PRD.md`, `Architecture.md`, `Rules.md`, `Phases.md`, `Design.md`, and `Memory.md` provide shared context across AI-assisted sessions;
- `Rules.md` is especially important for preventing drift;
- `Memory.md` is the handoff state.

This project adds `Evals.md`, `Competition.md`, `Submission.md`, `FrictionLog.md`, `ProductFeedback.md`, and `Sources.md` because hackathon compliance, autonomous quality loops, and submission evidence are material requirements.

## Supplied hackathon guide repository

https://github.com/udaysharmadev/Hackathon-Starter-Pack-Complete-Guide-Roadmap

Sections reviewed while preparing this handoff include:

- problem selection;
- AI/vibe coding tools;
- build-fast framework;
- UI/UX;
- deployment;
- presentation;
- GitHub/repository presentation;
- winning details.

Useful principles adopted:

- clear pain + fast understandable demo;
- choose demoability over gratuitous complexity;
- reserve real effort for polish/testing/deployment/presentation;
- graceful loading/error states;
- repository as a judge-facing asset;
- smooth short demo;
- avoid vague AI claims and giant scope.

Third-party hackathon advice is not authoritative over the actual Amazon judging criteria.
