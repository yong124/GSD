---
name: gsd-priority-investigation
description: Use when adding or expanding GSD investigation scenes built on investigation_id, investigations table flow, investigation choice groups, branch dialogue flow, and investigation-focused UI text.
---

# GSD Priority Investigation

Use this skill when working on investigation scenes driven by the current `investigation_id` and `investigations[]` structure.

Use this skill for the scene loop itself: budget, branch pacing, branch content shape, and investigation-specific HUD text. Use `gsd-runtime-ui` only when the shared runtime presentation layer also needs changes.

## Current pattern

The intended flow is:

1. show investigation header
2. show remaining investigation budget
3. choose one branch
4. play branch dialogue
5. re-render remaining options
6. after budget is spent, play the post-investigation follow-up
7. move to the next scene

## Example prompts

- `ch3_room4를 investigation 씬 구조에 맞게 정리해줘`
- `조사 선택지들이 서로 다른 조사 축으로 읽히게 정리해줘`
- `조사 루프 이후 후속 대사까지 자연스럽게 이어지게 다듬어줘`

## Current data shape

Investigation scenes are driven by `investigation_id` and linked tables.

```text
scene.investigation_id -> investigations[] lookup
investigations[].choice_group_id -> choice_groups[] lookup (type: "Investigation")
investigations[].priority_dialogues[next_id] -> branch dialogue after a pick
investigations[].budget -> number of selectable investigation actions
```

Key fields:

- `investigation_id: "Investigation_Xxx"`

`investigations` table:

- `investigation_id`, `title`, `hint`, `budget`
- `choice_group_id` -> links to `choice_groups`
- `priority_dialogues: { "label": [...dialogues] }`

`choice_groups` table:

- `type: "Investigation"`
- `max_selectable`

Investigation choices:

- `choice_group_id`
- `next_type: "Dialog"`
- `next_id: "label"` -> must match a `priority_dialogues` key
- `effect_group_id`

If an investigation choice uses `next_type: "Scene"`, the branch dialogue will not play. Default to `next_type: "Dialog"` unless the design explicitly needs an immediate scene jump.

## Recommended scene design

Each investigation option should represent a distinct axis:

- physical trace
- record/article/document evidence
- emotional or relationship reading
- risk/resonance contact

Avoid three options that all feel like "ask more questions."

## Workflow

1. Decide the investigation axes before writing lines.
2. Add or update:
   - `investigation_id`
   - `investigations[]`
   - investigation choice rows
   - branch dialogue labels
   - post-investigation follow-up
   - goal or HUD support text if needed
3. Make sure each option teaches the player something different.
4. Keep branch dialogue short enough to preserve loop tempo.
5. If runtime HUD or investigation display breaks, coordinate with `gsd-runtime-ui`.

## Do not

- do not make every option a paraphrase of the same question
- do not spend budget on branches that produce no meaningful shift
- do not forget to clear or update investigation HUD context after the loop
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
- HUD context for investigation scenes should clear when the scene changes.
- If a choice mutates facts or gauges, make sure HUD refresh still works.

## Done when

- each investigation option has a distinct gameplay meaning
- the budget loop still feels brisk
- post-investigation follow-up lands cleanly
- data validates and touched runtime files pass syntax checks
