---
name: gsd-browser-qa
description: Use when validating browser runtime progression in GSD with token-efficient Playwright QA. Focus on scene boot, choice progression, evidence submission, and only deep-read failures.
---

# GSD Browser QA

Use this skill when the user asks to QA the playable browser build, click through choices, verify progression, or find stuck branches.

## Goal

Find real progression blockers without wasting time or tokens on full noisy transcripts.

## Default approach

Always work in this order:

1. confirm process baseline
2. verify scene boot
3. verify text choices
4. verify evidence submission
5. only deep-dive failures

Do not start with a giant all-in-one full run unless the smaller checks are already known-good.

## Process baseline

Before browser QA:

- keep only the local game server alive
- kill leftover `node` / `chrome-headless-shell` QA processes
- confirm `http://127.0.0.1:4173` responds before blaming runtime code

Preferred server:

```powershell
cd G:\GSD\game
py -m http.server 4173
```

## Primary scripts

Use these first:

- `G:\GSD\.qa-node\scene_boot_check.js`
- `G:\GSD\.qa-node\scene_choice_runner.js`
- `G:\GSD\.qa-node\evidence_choice_runner.js`
- `G:\GSD\.qa-node\qa_fast_batch.js`

Use this last:

- `G:\GSD\.qa-node\scene_choice_audit.js`

Legacy wrappers still exist, but they are not the first choice for blocker hunting:

- `G:\GSD\content\tools\run_browser_playtest_full_run.ps1`
- `G:\GSD\content\tools\run_browser_playtest_save_flow.ps1`

## Token-saving rules

### 1. Prefer scene-local checks over global traversal

Bad:

- read giant output logs first
- run one huge flow and then inspect everything

Good:

- run one scene
- summarize pass/fail in one line
- inspect JSON only when something fails
- or run `qa_fast_batch.js` to parallelize the same lightweight checks across many scenes

### 2. Use indices instead of Korean choice text

PowerShell env passing can mangle Korean strings.

Prefer:

- `QA_ACTION_INDEX`
- `QA_EVIDENCE_INDEX`

Do not pass Korean choice text through env vars unless necessary.

### 3. Failures get detail, passes get compression

For passing scenes, summarize:

- scene id
- number of actions checked
- whether progression changed

For failing scenes, capture:

- scene id
- action path
- failure type
- screenshot path
- likely owner subsystem

### 4. Reuse artifact files

If `G:\GSD\.qa-artifacts` already contains the JSON you need, read that first instead of rerunning.

## Recommended workflow

### Scene boot

```powershell
$env:QA_SCENE='ch1_court'
node G:\GSD\.qa-node\scene_boot_check.js
Remove-Item Env:QA_SCENE
```

Pass when first interactive UI becomes `choice` or `evidence`.

### Text choice

```powershell
$env:QA_SCENE='ch1_court'
$env:QA_ACTION_INDEX='0'
node G:\GSD\.qa-node\scene_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX
```

Pass when the post-click state signature changes.

### Evidence submission

```powershell
$env:QA_SCENE='ch2_well'
$env:QA_ACTION_INDEX='-1'
$env:QA_EVIDENCE_INDEX='0'
node G:\GSD\.qa-node\evidence_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX, Env:QA_EVIDENCE_INDEX
```

Pass when the post-submit state signature changes.

### Fast batch

```powershell
$env:QA_SCENES='ch2_cafe,ch3_room4,ch5_ipangyu_deal'
$env:QA_CONCURRENCY='4'
node G:\GSD\.qa-node\qa_fast_batch.js
Remove-Item Env:QA_SCENES, Env:QA_CONCURRENCY
```

Use this for the default broad pass:

- scene boot
- root choice progression
- root evidence submission
- evidence checks reachable from one root choice click

Then use `scene_choice_audit.js` only on scenes that failed or still look suspicious.

### Deep audit

```powershell
$env:QA_SCENES='ch2_cafe'
$env:QA_OUT_PATH='G:\GSD\.qa-artifacts\audit-ch2_cafe.json'
$env:QA_INCLUDE_EVIDENCE='0'
node G:\GSD\.qa-node\scene_choice_audit.js
Remove-Item Env:QA_SCENES, Env:QA_OUT_PATH, Env:QA_INCLUDE_EVIDENCE
```

Use `QA_INCLUDE_EVIDENCE='0'` when you want a faster choice-only crawl before looking at evidence branches.

## Reporting format

While running:

- say which batch is in progress
- say how many scenes or interactions passed
- call out failures immediately

At the end:

1. confirmed blockers
2. fixed blockers
3. remaining conditional-risk items

## Known finding pattern

If a choice uses `next_type: "Dialog"` and the target lives only in `scene.evidence_dialogues`, check runtime branching in:

- `G:\GSD\game\js\engine\scene.js`

This exact pattern caused the `ch5_ipangyu_deal` progression blocker.
