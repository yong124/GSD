# STEP 03 — Choice 확장 (AnswerType: Evidence)

## 목적

증거 제시, 논리형 퍼즐, 클라이맥스 조합 등 특수 인터랙션을 별도 테이블 없이 Choice 구조 안에서 처리한다.
`ChoiceGroup.AnswerType`을 추가해 UI 방식을 결정하고,
`AnswerType: Evidence`일 때 플레이어가 현재 보유한 증거 전체를 인벤토리 UI에서 선택하게 한다.

---

## 구현 범위

| 파일 | 작업 |
|---|---|
| `game/data/game_data.js` | `choice_groups.answer_type`, `choice_groups.default_dialog_id` 필드 추가 |
| `game/js/engine/choice.js` | `AnswerType: Evidence` 분기 처리 추가 |
| `game/js/managers/ui.js` | 증거 인벤토리 선택 UI 구현 |
| `content/tools/export_to_json.py` | AnswerType, DefaultDialogId 변환 추가 |
| `content/tools/validate_game_data.py` | AnswerType 유효성 검증 추가 |
| `EditorNode/editor.js` | ChoiceGroup에 AnswerType, DefaultDialogID 필드 추가 |

---

## 데이터 명세

### ChoiceGroupTable 추가 컬럼

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `answer_type` | string | `Text` | `Text` 또는 `Evidence` |
| `default_dialog_id` | string \| null | null | 정의되지 않은 증거 제시 시 반응 대사 |

### ChoiceTable 추가 컬럼

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `evidence_id` | string \| null | `AnswerType: Evidence`일 때 반응할 증거 ID |

### game_data.js 구조 예시

```js
"choice_groups": [
  {
    "choice_group_id": "ChoiceGroup_OkryeonConfront",
    "type": "Evidence",
    "answer_type": "Evidence",
    "condition_group_id": null,
    "max_selectable": 1,
    "default_dialog_id": "dlg_okryeon_deny_default"
  }
]
```

```js
// choices (scene 안에 포함)
"choices": [
  {
    "choice_id": "choice_okryeon_ev_bloodstain",
    "choice_group_id": "ChoiceGroup_OkryeonConfront",
    "order": 1,
    "text": null,
    "evidence_id": "ev_bloodstain",
    "condition_group_id": null,
    "next_type": "Dialog",
    "next_id": "dlg_okryeon_confess",
    "effect_group_id": "eff_credibility_up"
  },
  {
    "choice_id": "choice_okryeon_ev_ledger",
    "choice_group_id": "ChoiceGroup_OkryeonConfront",
    "order": 2,
    "text": null,
    "evidence_id": "ev_ledger",
    "condition_group_id": null,
    "next_type": "Dialog",
    "next_id": "dlg_okryeon_confused",
    "effect_group_id": "eff_credibility_down"
  }
]
```

---

## 동작 정의

### AnswerType: Text (기존)

변경 없음. 텍스트 선택지 버튼을 표시한다.

### AnswerType: Evidence (신규)

```
1. 현재 State.getEvidence() 전체 목록을 가져온다.
2. 각 evidence_id → game_data.evidence에서 name, image를 조회한다.
3. 증거 인벤토리 UI를 표시한다 (카드 또는 목록 형태).
4. 플레이어가 증거 하나를 선택한다.
5. 선택된 evidence_id와 일치하는 Choice 행을 찾는다.
   - 일치하는 Choice 있음 → 해당 Choice의 effect_group_id 발동, next_type/next_id로 이동
   - 일치하는 Choice 없음 → choice_group.default_dialog_id 로 이동
6. 인벤토리 UI를 닫는다.
```

### 증거 인벤토리 UI 스펙

- 현재 보유한 증거 전체를 표시한다.
- 증거가 0개면 "제시할 단서가 없습니다." 메시지를 표시하고 닫기 버튼만 노출한다.
- 각 증거 카드에는 `name`과 `image`(있을 경우)를 표시한다.
- 선택 시 확인 단계 없이 바로 처리한다.
- ESC 또는 닫기 버튼으로 취소 가능하다. 취소 시 Choice 창은 그대로 유지된다.
- 기존 메모 패널(수첩)과 별개의 UI다. 수첩을 여는 게 아니다.

### 선택 영향 토스트

- `AnswerType: Evidence`일 때 선택 후 토스트를 표시한다.
- 일치하는 Choice가 있을 때: `"단서를 내밀었다"` + effect 내용에 따라 추가 문구
- 일치하는 Choice가 없을 때: `"이 단서는 지금 이 장면을 바꾸지 못했다"`

---

## 씬 설계 가이드 (작가/기획용)

`AnswerType: Evidence` ChoiceGroup을 씬에 배치할 때 아래를 준수한다.

1. 반드시 `default_dialog_id`를 설정한다. 오답 반응 대사 없이 배치하지 않는다.
2. 정답 증거는 해당 씬에서 이미 획득 가능하거나 이전 씬에서 얻을 수 있어야 한다.
3. 정답 증거가 하나인 경우 나머지 오답은 `default_dialog_id`로 처리한다.
4. 정답 증거가 여러 개인 경우 각각 별도 Choice 행으로 정의한다.

---

## 검증 기준

- [ ] `ChoiceGroup.answer_type`이 `Evidence`인 그룹에서 증거 인벤토리 UI가 열린다.
- [ ] 보유 증거가 0개일 때 "제시할 단서가 없습니다." 메시지가 표시된다.
- [ ] 정답 증거 선택 시 지정된 `next_id` 대사로 이동한다.
- [ ] 오답 증거 선택 시 `default_dialog_id` 대사로 이동한다.
- [ ] ESC로 인벤토리 UI를 닫을 수 있다.
- [ ] `AnswerType: Text`인 기존 ChoiceGroup은 동작이 변하지 않는다.
- [ ] `validate_game_data.py` 통과.
- [ ] EditorNode에서 ChoiceGroup의 AnswerType을 설정할 수 있다.
