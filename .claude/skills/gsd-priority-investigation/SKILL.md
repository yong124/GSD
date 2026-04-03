---
name: gsd-priority-investigation
description: Use when adding or expanding the GSD priority investigation system, including priority_budget scenes, priority_dialogues, post-investigation dialogue flow, and investigation-focused UI text.
---

# GSD Priority Investigation

Use this skill when working on investigation scenes driven by `priority_budget`.

Use this skill for the scene loop itself: budget, branch pacing, branch content shape, and priority-specific HUD text. Use `gsd-runtime-ui` only when the shared runtime presentation layer also needs changes.

Before choosing this skill over others, read:

- `G:\GSD\.claude\references\작업_축_선택_가이드.md`
- `G:\GSD\.claude\references\검증_체크리스트.md`

## Current pattern

The intended flow is:

1. show priority header
2. show remaining investigation budget
3. choose one branch
4. play branch dialogue
5. re-render remaining options
6. after budget is spent, play `priority_after_dialogues`
7. move to next scene

## Example prompts

- `ch3_room4를 priority 씬으로 바꿔줘`
- `priority 선택지가 서로 다른 조사 축으로 느껴지게 정리해줘`
- `priority_after_dialogues까지 포함해서 조사 루프를 자연스럽게 이어줘`

## Required data fields

- `priority_budget`
- `priority_dialogues`
- `priority_after_dialogues`
- `goal_kicker`
- `goal_text`
- `priority_title`
- `priority_hint`

## Recommended scene design

Each investigation option should represent a distinct axis:

- physical trace
- record/article/doc evidence
- emotional/relationship reading
- risk/resonance contact

Avoid three options that all feel like “ask more questions.”

## Workflow

1. Decide the investigation axes before writing lines.
2. Add or update:
   - `priority_budget`
   - `priority_dialogues`
   - `priority_after_dialogues`
   - `goal_*`
   - `priority_*`
3. Make sure each option teaches the player something different.
4. Keep branch dialogue short enough to preserve loop tempo.
5. If runtime HUD or priority display breaks, coordinate with `gsd-runtime-ui`.

## Do not

- do not make every option a paraphrase of the same question
- do not spend budget on branches that produce no meaningful shift
- do not forget to clear or update priority HUD context after the loop
- do not overlengthen branch dialogue until the loop stops feeling investigative

## Runtime files

- `G:\GSD\game\js\engine\choice.js`
- `G:\GSD\game\js\engine\scene.js`
- `G:\GSD\game\css\dialogue.css`
- `G:\GSD\game\css\main.css`

## Validate

```powershell
py G:\GSD\content\tools\validate_game_data.py
node --check G:\GSD\game\js\engine\choice.js
node --check G:\GSD\game\js\engine\scene.js
```

## Watchouts

- Keep reaction dialogue short enough that the loop still feels investigative.
- HUD context for priority scenes should clear when the scene changes.
- If a choice mutates flags, make sure HUD refresh still works.

## Done when

- each priority option has a distinct gameplay meaning
- the budget loop still feels brisk
- `priority_after_dialogues` lands cleanly
- data validates and touched runtime files pass syntax checks
