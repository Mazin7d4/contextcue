# Friction Log — Amazon Developer Tooling

## Purpose

Capture genuine friction while it happens. Current hackathon rules allow a judging bonus of up to 10% for strong friction-log entries.

Do not manufacture issues. Do not submit vague complaints. Prefer fewer high-quality reproducible entries.

## Entry template

### [Short descriptive title]

**Date:**

**Tool / API / SDK / documentation:**

**Environment:**

**Task attempted:**

**Steps taken:**

1.
2.
3.

**Expected result:**

**Actual result:**

**Error/log excerpt (only the minimal useful excerpt):**

**Severity:** Critical / High / Medium / Low

**Impact on development:**

**Workaround used:**

**Was the workaround successful?** Yes / Partially / No

**Actionable suggestion for Amazon:**

**Reference URL(s):**

---

### Vega SDK cannot be installed on Windows

**Date:** 2026-10-02

**Tool / API / SDK / documentation:** Vega Developer Tools / Vega SDK 0.24 install docs

**Environment:** Windows 11 (10.0.26200), Node.js 24.13.0, no WSL, no native Ubuntu or macOS

**Task attempted:** Install the Vega SDK and Vega Virtual Device so the Fire TV app can be built and run on the supported simulator.

**Steps taken:**

1. Read https://developer.amazon.com/docs/vega/0.24/install-vega-sdk.html
2. Checked the host for WSL (`wsl -l -v`) and for an existing Vega install.
3. Compared with the Amazon Devices Builder Tools prerequisite note that the Vega SDK is required only for Vega workflows.

**Expected result:** A documented way to install the Vega SDK and launch the Vega Virtual Device on the development machine.

**Actual result:** The install page states Windows is not supported, and Windows Subsystem for Linux is not tested. The SDK requires a native macOS or Ubuntu installation. WSL is not installed on this machine. Amazon community guidance also says the Virtual Device does not run under VirtualBox, Docker, or WSL because it needs direct KVM or Hypervisor.framework access.

**Error/log excerpt (only the minimal useful excerpt):** `wsl.exe` reported: "The Windows Subsystem for Linux is not installed."

**Severity:** High

**Impact on development:** The Vega app cannot be compiled or screen-recorded on this computer. Fire OS workflows in Amazon Devices Builder Tools do not require the Vega SDK.

**Workaround used:** Installed Amazon Devices Builder Tools MCP anyway. Deferred the TV app until the platform choice is explicit. Fire OS plus the Android TV emulator is the path this host can actually run; the FAQ lists that emulator as acceptable.

**Was the workaround successful?** Partially

**Actionable suggestion for Amazon:** Provide a supported Windows development path, or a cloud Vega Virtual Device, and say that clearly on the hackathon resources page. The current install page is accurate, but a Windows developer following the hackathon "use Vega" recommendation has no working local simulator.

**Reference URL(s):**

- https://developer.amazon.com/docs/vega/0.24/install-vega-sdk.html
- https://developer.amazon.com/apps-and-games/blogs/2026/07/guide-to-building-for-fire-tv-on-vega-os
- https://community.amazondeveloper.com/t/is-it-possible-to-test-a-vega-app-inside-a-virtualbox-machine-running-ubuntu-24/27880

---

### New-account verification blocks Bedrock Converse

**Date:** 2026-10-02

**Tool / API / SDK / documentation:** Amazon Bedrock Runtime `Converse`, model `amazon.nova-lite-v1:0`, region `us-west-2`

**Environment:** Windows 11, AWS CLI 2.37.8, account `293653898909`, signed in with `aws login`

**Task attempted:** Send one Converse request to confirm the on-demand model the app will use for grounded rewrites.

**Steps taken:**

1. `aws sts get-caller-identity` succeeded.
2. `aws bedrock list-foundation-models --region us-west-2` showed `amazon.nova-lite-v1:0` with `ON_DEMAND`.
3. `aws bedrock-runtime converse --region us-west-2 --model-id amazon.nova-lite-v1:0` with a one-line user message.

**Expected result:** A short model response.

**Actual result:** `AccessDeniedException`. The account can list models, S3, and DynamoDB. It cannot call Converse until verification finishes.

**Error/log excerpt (only the minimal useful excerpt):** `Your account is currently being verified. Verification normally takes less than 2 hours. Until your account is verified, you may not have access to this operation.`

**Severity:** High

**Impact on development:** Live grounded rewrites cannot be demonstrated yet. The app falls back to a deterministic answer built only from eligible facts and does not label that answer as Bedrock.

**Workaround used:** Keep the Bedrock client in the runtime, probe with `npm run bedrock:check`, and leave `BEDROCK_MODEL_ID` unset until the probe succeeds.

**Was the workaround successful?** Partially

**Actionable suggestion for Amazon:** Let hackathon accounts that already received promotional-credit instructions invoke a small on-demand model such as Nova Lite immediately, or return a console link and a remaining-time estimate instead of only an email address.

**Reference URL(s):**

- https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html

---

## Candidate areas to watch

Record only if real friction occurs:

- Vega SDK installation;
- Vega Virtual Device startup/behavior;
- React Native for Vega package compatibility;
- D-pad/focus documentation;
- media player APIs;
- Amazon Devices Builder Tools installation or tool behavior;
- ADBT documentation search quality;
- Fire TV debugging/logging;
- Bedrock model/region access;
- AWS SDK/IaC documentation gaps;
- Alexa+ hackathon guidance vs gated public docs;
- MCP protocol/transport requirements;
- simulator limitations;
- unclear submission/runtime-hook rules.

## Final selection guidance

Before submission, choose entries that have:

- a concrete task;
- reproducible steps;
- clear expected vs. actual behavior;
- developer impact;
- a real workaround if found;
- a specific improvement Amazon could implement.
