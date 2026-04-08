# 경성뎐 데이터 구조 운영 문서

## 목적

이 문서는 현재 경성뎐 프로젝트의 데이터 운영 기준을 정리한다.

이번 기준은 `테이블_완전_새구조.md`를 기반으로 한다.

---

## 운영 원칙

### 1. 데이터 우선

반복되거나 확장될 정보는 우선 테이블 구조로 뺀다.

우선순위는 아래와 같다.

1. 기존 테이블 확장
2. 새 테이블 추가
3. 정말 필요한 런타임 파생 로직

### 2. Flag 없음

임의 키-값 플래그를 사용하지 않는다.
모든 상태는 `ConditionType`으로 명시적으로 표현한다.

| 기존 Flag 용도 | 대체 |
|---|---|
| 행동 여부 | `ChoiceSelected` |
| 증거 보유 | `EvidenceOwned` |
| 누적 수치 | `GaugeValue` |
| 씬 방문 여부 | `SceneVisited` |

### 3. Effect 분리

선택지나 대사에 붙는 효과는 직접 컬럼으로 갖지 않는다.
`EffectTable`에 정의하고 `EffectGroupID`로 참조한다.

### 4. Choice 확장

퍼즐, 증거 제시, 클라이맥스 조합 등 특수 인터랙션은 별도 테이블 없이 Choice 구조를 확장해서 처리한다.
`ChoiceGroup.AnswerType`으로 UI 방식을 결정한다.

### 5. 진행 순서

1. 문서
2. 파이프라인
3. 에디터
4. 런타임
5. 데이터 마이그레이션
6. 검증

---

## 현재 운영 대상 테이블

| 테이블 | 역할 |
|---|---|
| `GaugeTable` | 수치 정의 |
| `GaugeStateTable` | 수치 단계 및 진입 효과 |
| `EffectTable` | 효과 묶음 |
| `ConditionTable` | 공통 조건 판정 |
| `SceneTable` | 씬 메타 |
| `DialogTable` | 씬 내부 대사 노드 |
| `ChoiceGroupTable` | 선택지 묶음 |
| `ChoiceTable` | 개별 선택지 |
| `BranchTable` | 씬 종료 후 자동 분기 |
| `EvidenceTable` | 정적 증거 정의 |
| `EvidenceCategoryTable` | 단서 UI 카테고리 |
| `CharacterTable` | 캐릭터 기본/수첩 정보 |
| `CharacterEmotionTable` | 감정별 이미지 |

---

## 관계 구조

```text
GaugeTable
 └─ 1:N → GaugeStateTable

EffectTable
 └─ N:1 (EffectGroupID로 묶임)

SceneTable
 ├─ 1:N → DialogTable
 └─ 1:N → BranchTable

DialogTable
 ├─ 0..1 → ConditionTable.ConditionGroupID
 ├─ 0..1 → ChoiceGroupTable
 ├─ 0..1 → DialogTable.NextDialogID
 └─ 0..1 → EffectTable.EffectGroupID

ChoiceGroupTable
 ├─ 0..1 → ConditionTable.ConditionGroupID
 └─ 1:N  → ChoiceTable

ChoiceTable
 ├─ 0..1 → ConditionTable.ConditionGroupID
 ├─ 0..1 → SceneTable / DialogTable (NextType, NextID)
 ├─ 0..1 → EvidenceTable (EvidenceID, AnswerType: Evidence일 때)
 └─ 0..1 → EffectTable.EffectGroupID

BranchTable
 └─ 0..1 → ConditionTable.ConditionGroupID

EvidenceTable
 └─ 0..1 → EvidenceCategoryTable

CharacterTable
 └─ 1:N → CharacterEmotionTable
```

---

## 런타임 상태와 테이블의 경계

### 테이블이 가지는 것

- 정적 정의
- 참조 관계
- 표시 조건
- 선택지 이동 구조
- 수치/단계 정의
- 효과 정의

### 런타임이 가지는 것

- 현재 씬 / 현재 대사 위치
- 증거 보유 목록
- 수치 현재값 (Gauge)
- 캐릭터별 신뢰도 현재값 (Trust)
- 선택 이력
- 씬 방문 이력

즉 테이블은 **정의**, 런타임은 **현재 상태**를 담당한다.

---

## 레거시 구조 정리 방향

현재 코드에 남아 있는 아래 구조는 새 테이블 구조로 옮기는 대상이다.

| 레거시 구조 | 이동 대상 |
|---|---|
| `Scene.next_scene` | `BranchTable.NextSceneID` |
| `Scene.priority_*` | `SceneTable.InvestigationTitle/Hint` + `ChoiceGroupTable.MaxSelectable` |
| `Scene.priority_after_dialogues` | `DialogTable` 흐름 |
| `Dialog.label` | `DialogID` / `NextDialogID` |
| `Dialog.condition` | `ConditionTable` |
| `Choice.flag_*` | 제거 — `EffectTable` 또는 `ConditionTable`로 대체 |
| `Choice.next_scene / next_dialogue` | `ChoiceTable.NextType / NextID` |
| `Choice.trust_*` / `resonance_value` | `EffectTable.TrustChange` / `GaugeChange` |
| `Choice.state_type / state_value` | `EffectTable.GaugeChange` |
| `Branch.flag_*` | `ConditionTable` |
| `Evidence.category_title / hint` | `EvidenceCategoryTable` |

---

## 다음 작업 기준

새 구조 전환 작업은 아래 순서로 진행한다.

1. `TABLE_SPEC.md` 기준 확정 ✓
2. `테이블_완전_새구조.md` 설계 확정 ✓
3. `export_to_json.py`, `json_to_generated_xlsx.py`, `validate_game_data.py` 전환
4. `EditorNode` 전환
5. `scene.js`, `choice.js` 등 런타임 전환
6. `game_data.js` 마이그레이션
7. 브라우저 QA
