---
name: gsd-data-polish
description: Use when editing GSD scenario data in game_data.js, tightening dialogue, differentiating branches, adding reaction lines, or improving evidence and ending payoff in Gyeongseong narrative content.
---

# GSD Data Polish

Use this skill when the task is primarily about `game/data/game_data.js`.

Do not use this as the primary skill for runtime-only HUD or CSS work. In that case, use `gsd-runtime-ui`.

## Focus

- tighten Korean dialogue
- improve branch differentiation
- add reaction dialogue after choices
- strengthen variable payoff
- refine ending resonance

## Example prompts

- `ch5_ritual_room부터 ch6 엔딩 전까지 문장 톤을 다듬어줘`
- `선택 후 반응 대사가 약한 장면들만 골라서 보강해줘`
- `송순 신뢰 / 조사 / 공명 분기 차이가 대사에서 드러나게 정리해줘`

## Workflow

1. Check `git status --short` first to understand the existing worktree.
2. If Korean text looks broken, verify UTF-8 before assuming file corruption.
3. Edit Korean text with `apply_patch` when possible.
4. Preserve current structural fields such as:
   - `speaker_id`
   - `emotion_type`
   - `standing_slot`
   - `focus_type`
   - `next_id`
   - `choice_group_id`
   - `effect_group_id`
5. Prefer `choice -> reaction dialogue -> next scene` over direct jumps when the scene wants emotional payoff.
6. Keep distinctions clear between:
   - investigation-first
   - relationship-first
   - risk/resonance-first
   - record/evidence-first

## Do not

- do not bulk-insert Korean strings through shell when a normal patch will do
- do not rewrite scene structure unless the task really requires structural change
- do not make different choices sound emotionally identical
- do not overexplain endings when a shorter line carries more weight

## Validate

```powershell
py G:\GSD\content\tools\validate_game_data.py
```

If tabular review is needed:

```powershell
py G:\GSD\content\tools\json_to_generated_xlsx.py
```

## Data-first reminder

If repeatable narrative metadata can live in tables, prefer that over hardcoding the same pattern in many scenes.

## Watchouts

- Do not assume mojibake means file corruption; re-open in UTF-8 first.
- Avoid shell-driven bulk Korean text insertion.
- If you touch late-game scenes, keep `record / name / resonance / personhood` motifs consistent.

## Done when

- affected scenes still validate structurally
- branch tone differences are readable without reading variable names
- any new Korean text was checked in UTF-8
- if needed, generated xlsx was refreshed for review
