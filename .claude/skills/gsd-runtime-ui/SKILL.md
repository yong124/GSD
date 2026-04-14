---
name: gsd-runtime-ui
description: Use when improving GSD runtime UI in the browser game, including HUD, dialogue box, choice hierarchy, memo panel, save/load panel, scene goal cards, responsiveness, and input flow.
---

# GSD Runtime UI

Use this skill when the task is primarily in the runtime presentation layer.

Do not use this as the primary skill when the job is mostly about authoring new investigation scene content. In that case, use `gsd-priority-investigation` first and this skill second only if runtime UI also changes.

## Main files

- `G:\GSD\game\index.html`
- `G:\GSD\game\css\main.css`
- `G:\GSD\game\css\dialogue.css`
- `G:\GSD\game\css\effects.css`
- `G:\GSD\game\js\engine\choice.js`
- `G:\GSD\game\js\engine\dialogue.js`
- `G:\GSD\game\js\engine\evidence.js`
- `G:\GSD\game\js\engine\save.js`
- `G:\GSD\game\js\engine\scene.js`
- `G:\GSD\game\js\main.js`

## Goals

- make the current player task readable
- make choice types visually distinct
- make state changes legible without exposing raw numbers
- prevent input conflicts between panels and dialogue
- keep desktop and narrow layouts usable

## Example prompts

- `HUD가 지금 무엇을 조사 중인지 더 분명하게 보여주게 다듬어줘`
- `메모 패널과 저장 패널이 겹칠 때 UX를 정리해줘`
- `좁은 해상도에서 배너와 선택지가 겹치지 않게 손봐줘`

## Workflow

1. Identify the user-facing loop being improved:
   - title/start
   - dialogue progression
   - choice selection
   - investigation loop
   - memo/evidence reading
   - save/load
2. Edit the smallest set of runtime files needed.
3. If any browser-loaded asset changes, bump `?v=` in `game/index.html`.
4. After input-flow changes, re-check:
   - `새 게임`
   - `이어하기`
   - `Esc`
   - `M / S / L`
   - dialogue advance while panels are open
5. Before browser automation:
   - confirm `http://127.0.0.1:4173` responds
   - if it does not, start a local server from `G:\GSD\game`
   - prefer `gsd-browser-qa` and the scene-local Playwright runners first
   - use legacy wrapper scripts only for broad regression sweeps after targeted QA passes

## Do not

- do not forget `?v=` bumps after browser-loaded JS or CSS changes
- do not let runtime globals reach IIFE-private state directly
- do not add raw numeric meters unless the task explicitly wants visible stats
- do not improve panel visuals without also checking input flow
- do not jump straight to heavy legacy full-run scripts when scene-local QA can answer the question faster

## Validate

```powershell
node --check G:\GSD\game\js\engine\choice.js
node --check G:\GSD\game\js\engine\scene.js
node --check G:\GSD\game\js\main.js
```

Add other `node --check` calls for touched files.

For targeted browser QA, prefer:

```powershell
node G:\GSD\.qa-node\scene_boot_check.js
node G:\GSD\.qa-node\scene_choice_runner.js
node G:\GSD\.qa-node\evidence_choice_runner.js
```

Use wrapper scripts as fallback broad checks:

```powershell
powershell -ExecutionPolicy Bypass -File G:\GSD\content\tools\run_browser_playtest_save_flow.ps1
powershell -ExecutionPolicy Bypass -File G:\GSD\content\tools\run_browser_playtest_full_run.ps1
```

## Watchouts

- Cache issues are common. If behavior seems unchanged, check `?v=` first.
- HUD helpers must not reach IIFE-private state directly from globals.
- Prefer subtle state feedback over raw meters.
- `ERR_CONNECTION_REFUSED` during Playwright boot usually means the local server is down, not that the runtime itself is broken.

## Done when

- touched runtime JS files pass `node --check`
- browser cache busting was handled where needed
- browser QA ran against a confirmed live local server
- title, panels, and hotkeys do not obviously fight each other
- the UI makes the current player task more legible than before

## Data-first reminder

If UI needs repeatable content like memo items, labels, questions, or goal text, prefer table-backed content over duplicated hardcoding.
