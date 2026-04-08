# STEP 05 — ConditionTable 재정의

## 목적

기존 ConditionType에서 경성뎐 특화 타입(`SongsoonTrust`, `ReadRitualScore`, `ResonanceLevel` 등)과 Flag 계열을 모두 제거한다.
범용 타입으로 재정의해 어떤 타이틀에서도 사용 가능한 조건 판정 구조를 만든다.

---

## 구현 범위

| 파일 | 작업 |
|---|---|
| `game/js/engine/scene.js` | `passesConditionGroup` 함수 재작성 |
| `game/data/game_data.js` | conditions 배열 마이그레이션 |
| `content/tools/export_to_json.py` | ConditionType 변환 처리 수정 |
| `content/tools/validate_game_data.py` | ConditionType 유효성 검증 수정 |
| `EditorNode/editor.js` | ConditionType 드롭다운 옵션 수정 |

---

## ConditionType 변경 명세

### 제거되는 타입

| 기존 타입 | 제거 이유 |
|---|---|
| `SongsoonTrust` | `Trust + ConditionTargetID: Songsoon`으로 대체 |
| `ReadRitualScore` | `GaugeValue + ConditionTargetID: ReadRitualScore`로 대체 (또는 Gauge 통합) |
| `ResonanceLevel` | `GaugeValue + ConditionTargetID: Erosion`으로 대체 |
| `InvestigationScore` | `GaugeValue + ConditionTargetID: InvestigationScore`로 대체 |
| `StateValue` | `Flag` 계열 → 제거. 행동 여부는 `ChoiceSelected`로 대체 |

### 확정 ConditionType

| ConditionType | ConditionTargetID | 설명 |
|---|---|---|
| `GaugeValue` | GaugeID | 게이지 수치 비교 |
| `Trust` | CharacterID | 캐릭터 신뢰도 비교 |
| `EvidenceOwned` | EvidenceID | 증거 보유 여부 |
| `ChoiceSelected` | ChoiceID | 선택지 선택 여부 |
| `RevealedCharacter` | CharacterID | 캐릭터 공개 여부 |
| `SceneProgressIndex` | — | 현재 씬 대사 진행 인덱스 |
| `SceneVisited` | SceneID | 특정 씬 방문 여부 |

### ECompareType

| 값 | 설명 |
|---|---|
| `Equal` | 같음 |
| `NotEqual` | 다름 |
| `Greater` | 초과 |
| `GreaterEqual` | 이상 |
| `Less` | 미만 |
| `LessEqual` | 이하 |

---

## 런타임 판정 로직

### passesConditionGroup(conditionGroupId, context)

```
1. game_data.conditions에서 condition_group_id 일치하는 행 전체 수집
2. 행이 없으면 true 반환 (조건 없음)
3. 모든 행이 통과해야 true (AND 조건)
4. 각 행의 condition_type에 따라 판정:
```

| ConditionType | 판정 방식 |
|---|---|
| `GaugeValue` | `State.getGauge(target_id)` vs `condition_value` |
| `Trust` | `State.getTrust(target_id)` vs `condition_value` |
| `EvidenceOwned` | `State.getEvidence().includes(target_id)` |
| `ChoiceSelected` | `State.hasChoice(target_id)` |
| `RevealedCharacter` | `Scene.getRevealedCharacterIds().includes(target_id)` |
| `SceneProgressIndex` | `context.sceneProgressIndex` vs `condition_value` |
| `SceneVisited` | `State.hasVisitedScene(target_id)` |

### State.hasVisitedScene(sceneId) — 신규

- `State`에 `visited_scenes: Set<string>` 추가
- `Scene.load(id)` 호출 시 `visited_scenes`에 sceneId를 기록한다
- `serialize()`에 `visited_scenes` 배열로 포함
- `deserialize()`에서 복원

---

## 데이터 마이그레이션

기존 `game_data.js`의 `conditions` 배열에서 구 타입을 신 타입으로 변환한다.

| 기존 | 신규 condition_type | 신규 condition_target_id |
|---|---|---|
| `SongsoonTrust` | `Trust` | `Songsoon` |
| `ResonanceLevel` | `GaugeValue` | `Erosion` |
| `InvestigationScore` | `GaugeValue` | `Credibility` |
| `ReadRitualScore` | `GaugeValue` | `ReadRitualScore` (Gauge로 정의) |
| `StateValue` (CalledEditor) | `ChoiceSelected` | 해당 선택지 ChoiceID |

마이그레이션 후 `validate_game_data.py`를 실행해 구 타입이 남아있지 않은지 확인한다.

---

## EditorNode 변경

ConditionType 드롭다운 옵션을 신규 타입 목록으로 교체한다.

```js
// 변경 전
const CONDITION_TYPE_OPTIONS = [
  'Trust', 'EvidenceOwned', 'ChoiceSelected', 'RevealedCharacter',
  'SceneProgressIndex', 'ReadRitualScore', 'ResonanceLevel',
  'InvestigationScore', 'SongsoonTrust', 'StateValue'
];

// 변경 후
const CONDITION_TYPE_OPTIONS = [
  'GaugeValue', 'Trust', 'EvidenceOwned', 'ChoiceSelected',
  'RevealedCharacter', 'SceneProgressIndex', 'SceneVisited'
];
```

ConditionTargetID 입력 필드는 ConditionType에 따라 적절한 드롭다운으로 변환한다.

| ConditionType | TargetID 입력 방식 |
|---|---|
| `GaugeValue` | GaugeID 드롭다운 |
| `Trust` | CharacterID 드롭다운 |
| `EvidenceOwned` | EvidenceID 드롭다운 |
| `ChoiceSelected` | ChoiceID 드롭다운 |
| `RevealedCharacter` | CharacterID 드롭다운 |
| `SceneProgressIndex` | 비활성화 (없음) |
| `SceneVisited` | SceneID 드롭다운 |

---

## 검증 기준

- [ ] `GaugeValue` 조건이 게이지 수치에 따라 올바르게 판정된다.
- [ ] `Trust` 조건이 캐릭터 신뢰도에 따라 올바르게 판정된다.
- [ ] `SceneVisited` 조건이 방문 여부에 따라 올바르게 판정된다.
- [ ] 구 타입(`SongsoonTrust`, `ResonanceLevel` 등)이 코드에 남아있지 않다.
- [ ] 마이그레이션 후 기존 씬 분기가 동일하게 동작한다.
- [ ] 세이브/불러오기 후 `visited_scenes`가 올바르게 복원된다.
- [ ] `validate_game_data.py` 통과.
- [ ] EditorNode ConditionType 드롭다운이 신규 목록을 표시한다.
