# STEP 06 — 레거시 필드 제거

## 목적

STEP 01~05 완료 후 더 이상 사용되지 않는 구 필드와 코드를 정리한다.
이 단계는 반드시 STEP 01~05가 모두 완료되고 브라우저 QA를 통과한 뒤에 진행한다.

---

## 제거 대상

### game_data.js 필드

| 위치 | 제거 필드 |
|---|---|
| `scenes[].choices[]` | `flag_key`, `flag_value`, `next_scene`, `next_dialogue`, `priority_cost`, `extra_flags` |
| `scenes[].choices[]` | `trust_character_id`, `trust_value`, `resonance_value`, `state_type`, `state_value` |
| `scenes[].dialogues[]` | `label`, `condition_key`, `condition_value`, `speaker`, `portrait` |
| `scenes[]` | `next_scene`, `priority_title`, `priority_hint`, `priority_budget`, `priority_after_dialogues` |
| `scenes[].branches[]` | `flag_key`, `flag_value` |

### 런타임 코드

| 파일 | 제거 대상 |
|---|---|
| `game/js/engine/choice.js` | `applyChoiceEffects` 내 구 컬럼 참조 |
| `game/js/engine/choice.js` | `describeChoiceImpact` 내 하드코딩 메시지 (state_type switch) |
| `game/js/engine/choice.js` | `getChoiceType` 내 state_type 분기 |
| `game/js/engine/evidence.js` | `getResonanceState`, `getTrustState`, `getInvestigationState` 하드코딩 fallback |
| `game/js/engine/scene.js` | `priority_budget`, `priority_title`, `priority_hint` 참조 |
| `game/js/engine/dialogue.js` | `label`, `condition_key` 참조 |

### EditorNode

| 파일 | 제거 대상 |
|---|---|
| `EditorNode/editor.js` | `field-priority-budget`, `field-priority-dialogues` DOM 요소 및 핸들러 |
| `EditorNode/index.html` | 위 DOM 요소 마크업 |

### 파이프라인

| 파일 | 제거 대상 |
|---|---|
| `content/tools/export_to_json.py` | 구 필드 매핑 코드 |
| `content/tools/validate_game_data.py` | 구 타입 허용 코드 (`SongsoonTrust`, `ResonanceLevel` 등) |

---

## 진행 순서

```
1. game_data.js에서 구 필드 제거 (python 스크립트로 일괄 처리 권장)
2. 런타임 코드에서 구 필드 참조 제거
3. EditorNode에서 구 필드 UI 제거
4. 파이프라인 코드 정리
5. validate_game_data.py 실행
6. 브라우저 QA
```

---

## 주의사항

- 제거 전 반드시 현재 `game_data.js`를 백업한다.
- `export_to_json.py` 실행 시 구 필드가 덮어써지지 않도록 파이프라인을 먼저 정리한다.
- 구 필드 제거 후 런타임에서 참조 에러가 없는지 콘솔을 확인한다.
- `node --check game/js/engine/*.js`로 문법 오류 여부를 확인한다.

---

## 검증 기준

- [ ] `game_data.js`에 제거 대상 필드가 존재하지 않는다.
- [ ] 브라우저 콘솔에 구 필드 관련 에러/경고가 없다.
- [ ] `validate_game_data.py` 통과.
- [ ] `node --check game/js/engine/*.js` 통과.
- [ ] ch1 전체 플레이가 정상 동작한다.
- [ ] 세이브/불러오기가 정상 동작한다.
- [ ] EditorNode에서 씬 편집이 정상 동작한다.
