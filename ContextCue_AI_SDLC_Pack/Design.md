# Design — ContextCue

## Design objective

ContextCue should feel like a premium native viewing feature, not an AI demo pasted over a video player.

The design must communicate three ideas immediately:

1. the viewer stays inside the story;
2. ContextCue is concise and calm;
3. spoiler safety is trustworthy.

## Brand

Working product name: **ContextCue**

Primary line: **Understand what you missed — without rewinding or spoilers.**

Tone:

- calm;
- cinematic;
- intelligent;
- direct;
- never chatty or gimmicky.

Avoid visual tropes that scream "generic AI": glowing robot heads, excessive sparkles, giant gradient chat bubbles, floating orb assistants, or unnecessary "AI" labels.

## Fire TV visual principles

### Video first

The film/show is the primary surface. ContextCue appears only when needed.

Do not build a dashboard around the player.

### Ten-foot readability

All text must be readable from a couch.

Use large type, short lines, strong contrast, generous spacing, and minimal metadata.

Do not blindly apply mobile/web font sizes. Validate on the Vega Virtual Device at realistic TV viewing scale.

### Focus is physical

Amazon's Vega guidance requires clear focus feedback for TV navigation. Focus should use physical/shape changes such as scale, border, elevation, or position—not only a subtle color/opacity change.

Every interactable element must have an obvious focused state.

### Overlay restraint

Context cards should occupy only the space they need. Prefer a lower-third or side panel that leaves important video visible.

If an answer is long enough to dominate the screen, the answer is probably too long.

### Immediate acknowledgement

When a contextual action is selected, show a loading/working state immediately without freezing playback.

## Fire TV core components

### Context action tray

A small, fast menu available from playback with actions such as:

- What did I miss?
- Who's here?
- Explain that line
- Why does this matter?
- Spoiler Dial

The exact labels may be tuned for clarity and space.

### Recap card

Recommended information hierarchy:

- short label: `WHAT YOU MISSED`
- 1–3 concise sentences
- optional tiny time context such as `Last 45 sec`
- obvious dismiss/back behavior

Do not show model/system detail in customer UI.

### Character card

Recommended hierarchy:

- character name;
- already-known relationship/role;
- one sentence: why relevant now;
- optional last-seen reference.

Never show future relationship/reveal information.

### Dialogue explanation card

Recommended hierarchy:

- current dialogue line or very short excerpt;
- plain-language explanation;
- optional already-known subtext.

### Spoiler Dial

Make the three modes understandable at a glance:

- Strict — facts only
- Helpful — safe inference
- Catch Me Up — fuller recap

The UI should communicate that all three modes are bounded to the current point in the story.

### Loading state

Use a small branded motion/progress treatment. It should clearly communicate that the request is working.

### Error state

Plain language, one recovery action.

Example semantic structure:

- "Couldn't load context."
- `Try again`

Do not surface raw exception text.

## Fire TV interaction principles

- D-pad directional movement must be predictable.
- Back should dismiss overlays before exiting playback.
- The focused control must never be ambiguous.
- Rapid key presses should not leave focus lost.
- Avoid deep menus.
- Core actions should require very few remote presses.
- Preserve the user's place in the video.

## Alexa+-style simulation design

The simulation should follow the spirit of Amazon's current Alexa+ MCP design guidance while remaining clearly identified as a hackathon simulation.

### Conversational, not chat-app heavy

The surface can show transcript/history, but the main value is the current result/action, not an endless message log.

### Low information density

Amazon currently recommends larger typography and reduced metadata density for Alexa+ surfaces. Use substantially larger text than ordinary desktop web UI and prioritize glanceability.

### Inline cards by default

For this product, most responses should resemble concise inline summaries/cards rather than full-screen dashboards.

Good responses:

- one recap card;
- one character card;
- one preference confirmation;
- one explanation card.

### Voice-compatible content

Even if the hackathon simulation uses text input, returned data should make sense when spoken aloud. Avoid tables, pipes, dense formatting, and visual-only meaning.

### Multi-turn continuity

The UI should make follow-up interaction feel natural:

- "Who is he?"
- "Why does that matter?"
- "Make your answers shorter."

The user should not need to restate media title/timestamp in every message.

## Suggested visual direction

Use a dark cinematic base appropriate for television/video.

Recommended palette concept (implementation may tune exact values after device testing):

- near-black / charcoal background;
- slightly lighter translucent surfaces;
- off-white primary text;
- muted secondary text;
- one warm or cool accent used sparingly for focus/active state;
- error and success colors only where semantically necessary.

Do not use several competing accent colors.

Exact hex values are less important than contrast, focus clarity, and TV readability. The coding agent should choose and validate a small token set, then use it consistently.

## Typography

Prefer a system/supported sans-serif typeface with excellent screen readability rather than adding a risky custom font dependency.

Rules:

- large title sizes;
- comfortable line height;
- medium/semibold emphasis rather than all-caps everywhere;
- concise body copy;
- avoid ultra-light weights.

The Alexa-style simulation should use larger typography and lower density than typical web UI, consistent with Amazon's current design guidance.

## Motion

Use motion only to communicate state:

- card entrance/exit;
- focus transition;
- loading/progress;
- preference confirmation.

Avoid ornamental animations that compete with video.

## Accessibility and usability

- High contrast.
- Do not encode focus or status by color alone.
- Large touch targets in web simulation.
- TV controls must be fully operable by remote.
- Respect larger-text preference.
- Avoid rapid flashing.
- Keep spoken/visual answer content consistent.

## Screenshot and demo composition

The final screenshots/video should intentionally capture:

1. beautiful playback frame + recap overlay;
2. character card;
3. Spoiler Dial;
4. Alexa+-style contextual card;
5. cross-surface preference confirmation;
6. optional architecture/eval proof image.

Avoid screenshots dominated by terminal windows, setup screens, raw JSON, or empty app chrome.

## Design acceptance test

Before final capture, inspect every demo surface and answer:

- Can a viewer understand it from several feet away?
- Is the current focused element obvious?
- Is the answer shorter than it could be?
- Is video still visually dominant?
- Does this look intentionally designed for TV/Alexa rather than repurposed desktop UI?
- Are loading/error states polished?
- Are there any clipped elements, tiny labels, awkward wraps, or dead space?

Fix failures before final recording.
