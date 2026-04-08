# STEP 02 — 이펙트 시스템 구축

## 목적

선택지와 대사에 붙는 효과를 독립 테이블(`EffectTable`)로 분리한다.
기존에 `ChoiceTable` 컬럼에 직접 박혀있던 `trust_value`, `resonance_value`, `state_type` 등을 제거하고
`EffectGroupID` 하나로 참조하는 구조로 전환한다.

이 단계 완료 후 Choice와 Dialog 모두 동일한 방식으로 효과를 발동할 수 있다.

---

## 구현 범위

| 파일 | 작업 |
|---|---|
| `game/data/game_data.js` | `effects` 배열 추가 |
| `game/js/engine/choice.js` | `applyChoiceEffects` → `applyEffectGroup`으로 교체 |
| `game/js/engine/dialogue.js` | 대사 진행 시 `effect_group_id` 발동 처리 추가 |
| `content/tools/export_to_json.py` | EffectTable 시트 → game_data 변환 추가 |
| `content/tools/validate_game_data.py` | effects 구조 검증 추가 |
| `EditorNode/editor.js` | 데이터 탭에 Effect 편집 UI 추가, Choice/Dialog 행에 EffectGroupID 필드 추가 |

---

## 데이터 명세

### game_data.js 구조

```js
window.GAME_DATA = {
  // 기존 필드들...

  "effects": [
    {
      "effect_group_id": "eff_songsoon_trust_up",
      "effect_type": "TrustChange",
      "trust_character_id": "Songsoon",
      "trust_delta": 1
    },
    {
      "effect_group_id": "eff_ritual_erosion",
      "effect_type": "GaugeChange",
      "gauge_id": "Erosion",
      "gauge_delta": 2
    },
    {
      "effect_group_id": "eff_get_diary",
      "effect_type": "EvidenceGive",
      "evidence_id": "ev_diary"
    }
  ]
}
```

같은 `effect_group_id`를 가진 행은 동시에 실행된다.

### EffectTable 컬럼

| 컬럼 | 타입 | 필수 |
|---|---|---|
| `effect_group_id` | string | ✓ |
| `effect_type` | string | ✓ |
| `gauge_id` | string | GaugeChange일 때 |
| `gauge_delta` | number | GaugeChange일 때 |
| `evidence_id` | string | EvidenceGive일 때 |
| `trust_character_id` | string | TrustChange일 때 |
| `trust_delta` | number | TrustChange일 때 |

### EffectType

| 타입 | 설명 | 필요 컬럼 |
|---|---|---|
| `GaugeChange` | 게이지 수치 변화 | `gauge_id`, `gauge_delta` |
| `EvidenceGive` | 증거 획득 | `evidence_id` |
| `TrustChange` | 캐릭터 신뢰도 변화 | `trust_character_id`, `trust_delta` |

---

## ChoiceTable / DialogTable 변경

### ChoiceTable

기존 효과 컬럼 제거, `effect_group_id` 추가.

| 제거 컬럼 | 대체 |
|---|---|
| `trust_character_id` | `EffectTable.TrustChange` |
| `trust_value` | `EffectTable.TrustChange` |
| `resonance_value` | `EffectTable.GaugeChange (Erosion)` |
| `state_type` | `EffectTable.GaugeChange` |
| `state_value` | `EffectTable.GaugeChange` |

추가 컬럼: `effect_group_id` (nullable)

### DialogTable

추가 컬럼: `effect_group_id` (nullable)

대사가 표시되는 시점에 `effect_group_id`가 있으면 효과를 발동한다.

---

## 동작 정의

### applyEffectGroup(effectGroupId)

```
1. game_data.effects 에서 effect_group_id 일치하는 행 전체 수집
2. 각 행의 effect_type에 따라 처리:
   - GaugeChange  → State.addGauge(gauge_id, gauge_delta)
   - EvidenceGive → Evidence.collect(evidence_id)
   - TrustChange  → State.addTrust(trust_character_id, trust_delta)
3. 효과 발동 후 토스트 없음 (UI 피드백은 각 핸들러가 담당)
```

### Trust 런타임

- `State.getTrust(characterId)` → number
- `State.addTrust(characterId, delta)` → clamp(0, max) 처리
- Trust max값은 `CharacterTable.default_trust` 기준으로 게임 시작 시 초기화
- 직렬화: `trusts: { [characterId]: number }` 맵으로 저장

### choice.js 변경

기존 `applyChoiceEffects` 내부의 개별 처리 로직을 `applyEffectGroup` 호출로 교체한다.

```js
// 변경 전
function applyChoiceEffects(choice) {
  if (choice.trust_character_id) { ... }
  if (choice.resonance_value) { ... }
  if (choice.state_type) { ... }
}

// 변경 후
function applyChoiceEffects(choice) {
  State.recordChoice(choice.choice_id);
  if (choice.effect_group_id) applyEffectGroup(choice.effect_group_id);
}
```

### dialogue.js 변경

대사 렌더 시 `effect_group_id`가 있으면 `applyEffectGroup` 호출.
타이핑 시작 전에 발동한다.

---

## 검증 기준

- [ ] `game_data.js`에 `effects` 배열이 존재한다.
- [ ] `EffectType: GaugeChange` 실행 시 해당 게이지 값이 변한다.
- [ ] `EffectType: EvidenceGive` 실행 시 증거가 수첩에 추가된다.
- [ ] `EffectType: TrustChange` 실행 시 해당 캐릭터 신뢰도가 변한다.
- [ ] 같은 `effect_group_id` 행이 여러 개일 때 모두 동시에 실행된다.
- [ ] Dialog에 `effect_group_id`가 있으면 해당 대사 진행 시 효과가 발동된다.
- [ ] Choice에서 기존 `trust_value`, `resonance_value` 컬럼이 더 이상 참조되지 않는다.
- [ ] `validate_game_data.py` 통과.
- [ ] EditorNode에서 Effect 항목을 추가/수정/삭제할 수 있다.
