---
name: gsd-data-polish
description: Use when editing GSD scenario data in game_data.js, tightening dialogue, differentiating branches, adding reaction lines, or improving evidence and ending payoff in Gyeongseong narrative content.
---

# GSD Data Polish

Use this skill when the task is primarily about `game/data/game_data.js`.

Do not use this as the primary skill for runtime-only HUD/CSS work. In that case, use `gsd-runtime-ui`.

Before choosing this skill over others, read:

- `G:\GSD\.claude\references\작업_축_선택_가이드.md`
- `G:\GSD\.claude\references\검증_체크리스트.md`

## Focus

- tighten Korean dialogue
- improve branch differentiation
- add reaction dialogue after choices
- strengthen variable payoff
- refine ending resonance

## Example prompts

- `ch5_ritual_room부터 ch6_ending_b까지 문장 밀도 좀 더 눌러줘`
- `선택 후 반응 대사가 약한 씬들만 골라서 보강해줘`
- `송순 신뢰/조사/공명 분기 차이가 대사에서 더 느껴지게 해줘`

## Workflow

1. Confirm current source of truth.

```powershell
git status --short
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Get-Content 'G:\GSD\game\data\game_data.js' -Encoding utf8
```

2. Edit Korean text with `apply_patch` when possible.
3. Preserve current structure fields such as:
   - `SpeakerID`
   - `EmotionType`
   - `StandingSlot`
   - `FocusType`
   - `next_dialogue`
   - `priority_budget`
   - `priority_dialogues`
4. Prefer `choice -> reaction dialogue -> next scene` over direct jumps.
5. Keep distinctions clear between:
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

- If the task introduces repeatable narrative metadata, move it into tables before defaulting to runtime hardcoding.
- Prefer extending existing tables first:
  - `CharacterTable`
  - `EvidenceTable`
  - `SceneTable`
- Use dedicated tables when the content is cross-cutting:
  - `QuestionTable`
  - `StateDescriptorTable`
  - `RuleTable`

## Watchouts

- Do not assume mojibake means file corruption; re-open in UTF-8 first.
- Avoid shell-driven bulk Korean text insertion.
- If you touch late-game scenes, keep `record / name / resonance / personhood` motifs consistent.

## Done when

- affected scenes still validate structurally
- branch tone differences are readable without reading variable names
- any new Korean text was checked in UTF-8
- if needed, generated xlsx was refreshed for review
