---
name: gsd-scene-authoring
description: Use when adding a brand-new GSD scene or wiring new branches between scenes end-to-end - creating scene entries, choices, branches, evidence hooks, connecting them into the flow, and validating reachability. Trigger on 새 씬, 씬 추가, 분기 연결, 씬 연결, new scene. For polishing existing lines use gsd-data-polish; for investigation-loop scenes use gsd-priority-investigation.
---

# GSD Scene Authoring

Use this skill when the task creates new scene structure, not when it only rewrites existing text.

Hand off to:

- `gsd-data-polish` — tone/density of existing lines
- `gsd-priority-investigation` — scenes driven by `investigation_id`
- `gsd-browser-qa` — progression verification after wiring

## Schema hard rules (mistakes that kill progression)

- `next_type` is `"Scene"` or **`"Dialog"`** — never `"Dialogue"`.
- Dialogue jump labels live in `dialog_id` — there is no `label` field.
- A `"Dialog"` `next_id` must match an existing `dialog_id`, a `priority_dialogues` key, or an `evidence_dialogues` key in that scene's context.
- `SceneID` is lowercase + underscore (`ch4b_cafe_press`); flags/state keys are `PascalCase`.
- Every new scene must be reachable: some choice `next_id` (Scene type), branch `next_scene`, or `first_scene` must point at it, or it is an orphan.
- Scene required shape: `id, chapter, title, background, music, effect, branches, dialogues, choices, evidence` (see CLAUDE.md schema section for optional keys).

## Workflow

1. Read the neighboring scenes in `game/data/game_data.js` first; copy their field conventions, not an imagined schema.
2. Decide entry and exit wiring before writing lines:
   - what points INTO the new scene (choice / branch / first_scene)
   - what the new scene points OUT to (every choice and branch resolved)
3. Author dialogues with `order` gaps-free per scene; give `dialog_id` only to lines that are jump targets.
4. Choices: required `order, choice_id, text, next_type, next_id`; add `effect_group_id` / reward fields only when state should move.
5. Prefer `choice -> reaction dialogue -> next scene` over hard jumps when the moment carries emotion.
6. Reuse existing `condition_group_id` / `effect_group_id` entries before minting new ones; new ones go into their tables, not inline hacks.
7. Assets must exist: check `assets/bg`, `assets/portraits` paths before referencing.
8. If `game_data.js` was edited directly, refresh editor tables:

```powershell
py G:\GSD\content\tools\split_game_data.py
```

## Validate (all required)

```powershell
py G:\GSD\content\tools\validate_game_data.py
```

Then boot-check the new scene on a live server (port 4173):

```powershell
$env:QA_SCENE='<new_scene_id>'
node G:\GSD\.qa-node\scene_boot_check.js
Remove-Item Env:QA_SCENE
```

If the scene has choices, run `scene_choice_runner.js` on at least the root choice.

## Do not

- do not leave any `next_id` pointing at a scene or label that does not exist yet ("I'll add it later" is how blockers ship)
- do not invent new schema fields; extend via tables per the Data-First Rule
- do not copy an investigation scene's shape for a plain dialogue scene
- do not skip the boot check because validation passed — validation cannot see runtime branching

## Done when

- validate passes with the new scene included
- the new scene boots in the browser and its root choice progresses
- entry wiring exists (no orphan) and every exit resolves
- editor tables are in sync if the bundle was edited directly
