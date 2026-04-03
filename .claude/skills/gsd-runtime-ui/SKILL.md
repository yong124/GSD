---
name: gsd-runtime-ui
description: Use when improving GSD runtime UI in the browser game, including HUD, dialogue box, choice hierarchy, memo panel, save/load panel, scene goal cards, responsiveness, and input flow.
---

# GSD Runtime UI

Use this skill when the task is primarily in the runtime presentation layer.

Do not use this as the primary skill when the job is mostly about authoring new `priority_budget` scene content. In that case, use `gsd-priority-investigation` first and this skill second only if runtime UI also changes.

Before choosing this skill over others, read:

- `G:\GSD\.claude\references\작업_축_선택_가이드.md`
- `G:\GSD\.claude\references\검증_체크리스트.md`

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

- make current player task readable
- make choice types visually distinct
- make state changes legible without exposing raw numbers
- prevent input conflicts between panels and dialogue
- keep desktop and narrow layouts usable

## Example prompts

- `HUD가 지금 뭘 조사 중인지 더 분명하게 보여주게 해줘`
- `메모장과 저장 패널이 열렸을 때 UX를 정리해줘`
- `좁은 해상도에서 배너랑 선택지 겹치지 않게 다듬어줘`

## Workflow

1. Identify the user-facing loop being improved:
   - title/start
   - dialogue progression
   - choice selection
   - priority investigation
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

## Do not

- do not forget `?v=` bumps after browser-loaded JS/CSS changes
- do not let runtime globals reach IIFE-private state directly
- do not add raw numeric meters unless the task explicitly wants visible stats
- do not improve panel visuals without also checking input flow

## Validate

```powershell
node --check G:\GSD\game\js\engine\choice.js
node --check G:\GSD\game\js\engine\scene.js
node --check G:\GSD\game\js\main.js
```

Add other `node --check` calls for touched files.

## Watchouts

- Cache issues are common. If behavior seems unchanged, check `?v=` first.
- HUD helpers must not reach IIFE-private state directly from globals.
- Prefer subtle state feedback over raw meters.

## Done when

- touched runtime JS files pass `node --check`
- browser cache busting was handled where needed
- title, panels, and hotkeys do not obviously fight each other
- the UI makes the current player task more legible than before
