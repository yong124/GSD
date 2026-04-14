---
name: gsd-editornode-pipeline
description: Use when updating EditorNode, the game_data pipeline, table schema, generated xlsx flow, or validation rules for GSD narrative data.
---

# GSD EditorNode Pipeline

Use this skill when the task spans authoring tools and data pipeline.

Do not use this as the primary skill for narrative-only polishing or runtime-only HUD tweaks.

## Main files

- `G:\GSD\EditorNode\index.html`
- `G:\GSD\EditorNode\editor.css`
- `G:\GSD\EditorNode\editor.js`
- `G:\GSD\content\tools\export_to_json.py`
- `G:\GSD\content\tools\json_to_generated_xlsx.py`
- `G:\GSD\content\tools\validate_game_data.py`
- `G:\GSD\content\docs\system\core\DATA_STRUCTURE.md`
- `G:\GSD\content\docs\system\core\TABLE_SPEC.md`

## Goals

- keep authoring structures aligned with runtime structures
- prevent silent data loss in export or import
- make enum-like fields safe to edit
- preserve schema naming conventions where applicable

## Example prompts

- `CharacterEmotion 구조를 export부터 generated까지 같이 맞춰줘`
- `EditorNode에서 enum 필드를 드롭다운으로 바꿔줘`
- `조사 관련 필드를 에디터와 validate까지 한 번에 정리해줘`

## Workflow

1. Decide whether the change is:
   - editor-only
   - pipeline-only
   - schema-wide
2. If schema-wide, update in this order:
   - runtime expectation
   - EditorNode serialization or normalization
   - export or import scripts
   - validation
   - docs
3. If user-facing editor interaction changed, guard against focus loss and rerender loops.

## Do not

- do not add a field to runtime only
- do not add a field to EditorNode only
- do not leave generated output stale after schema changes
- do not use free-text inputs for enum-like data if dropdowns are feasible

## Validate

```powershell
node --check G:\GSD\EditorNode\editor.js
py -m py_compile G:\GSD\content\tools\export_to_json.py G:\GSD\content\tools\json_to_generated_xlsx.py G:\GSD\content\tools\validate_game_data.py
py G:\GSD\content\tools\validate_game_data.py
```

## Watchouts

- Do not add a field in only one layer.
- Enum-like fields should prefer dropdown or select handling in EditorNode.
- If generated output changes, regenerate `script.generated.xlsx`.
- If schema terms changed, update docs and validation wording together.

## Done when

- schema changes are reflected in runtime, editor, tools, and docs
- touched Python files compile
- editor JS passes syntax check
- validation still passes

## Data-first reminder

반복 가능한 게임 메타데이터는 런타임 하드코딩보다 테이블화가 우선이다. 순서는 기존 테이블 확장, 필요 시 신규 테이블 추가, 마지막에 파생 로직만 런타임 처리다.
