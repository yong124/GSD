# 경성뎐 데이터 구조 운영 문서

## 목적

이 문서는 현재 경성뎐 프로젝트의 데이터 운영 기준을 정리한다.

이번 기준은 `테이블 완전 새구조.md`를 기반으로 하되, 아래 세 영역은 당분간 런타임 하드코딩으로 유지한다.

- `Question`
- `Rule`
- `StateDescriptor`

즉 이번 전환의 핵심은 **나머지 구조를 새 테이블 기준으로 정렬하는 것**이다.

---

## 운영 원칙

### 1. 데이터 우선

반복되거나 확장될 정보는 우선 테이블 구조로 뺀다.

우선순위는 아래와 같다.

1. 기존 테이블 확장
2. 새 테이블 추가
3. 정말 필요한 런타임 파생 로직

### 2. 이번 전환의 예외

아래 세 구조는 지금 기능 안정성이 낮고 UI/런타임 의존성이 커서 당분간 하드코딩 유지한다.

- `Question`
- `Rule`
- `StateDescriptor`

### 3. 진행 순서

1. 문서
2. 파이프라인
3. 에디터
4. 런타임
5. 데이터 마이그레이션
6. 검증

---

## 현재 운영 대상 테이블

| 테이블 | 역할 |
| --- | --- |
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
| `InvestigationTable` | 조사 메타 |

---

## 관계 구조

```text
SceneTable
 ├─ 1:N → DialogTable
 ├─ 1:N → BranchTable
 └─ 0..1 → InvestigationTable

DialogTable
 ├─ 0..1 → ConditionTable.ConditionGroupID
 ├─ 0..1 → ChoiceGroupTable
 └─ 0..1 → DialogTable.NextDialogID

ChoiceGroupTable
 ├─ 0..1 → ConditionTable.ConditionGroupID
 └─ 1:N → ChoiceTable

ChoiceTable
 ├─ 0..1 → ConditionTable.ConditionGroupID
 ├─ 0..1 → SceneTable / DialogTable (NextType, NextID)
 ├─ 0..1 → EvidenceTable
 └─ 0..1 → CharacterTable (TrustCharacterID)

BranchTable
 └─ 0..1 → ConditionTable.ConditionGroupID

EvidenceTable
 └─ 0..1 → EvidenceCategoryTable

CharacterTable
 └─ 1:N → CharacterEmotionTable

InvestigationTable
 └─ 1 → ChoiceGroupTable
```

---

## 런타임 상태와 테이블의 경계

### 테이블이 가지는 것

- 정적 정의
- 참조 관계
- 표시 조건
- 선택지 이동 구조
- 조사 메타

### 런타임이 가지는 것

- 현재 씬 / 현재 대사 위치
- 증거 보유 여부
- 신뢰도 / 공명도 / 조사 진행 상태
- 선택 이력
- 질문 해결 여부

즉 테이블은 **정의**, 런타임은 **현재 상태**를 담당한다.

---

## 레거시 구조 정리 방향

현재 코드에 남아 있는 아래 구조는 새 테이블 구조로 옮기는 대상이다.

| 레거시 구조 | 이동 대상 |
| --- | --- |
| `Scene.next_scene` | `BranchTable.NextSceneID` |
| `Scene.priority_*` | `InvestigationTable` |
| `Scene.priority_after_dialogues` | `DialogTable` 흐름 |
| `Dialog.label` | `DialogID` / `NextDialogID` |
| `Dialog.condition` | `ConditionTable` |
| `Choice.flag_*` | `ChoiceTable` 효과 필드 또는 런타임 보조 처리 |
| `Choice.next_scene / next_dialogue` | `ChoiceTable.NextType / NextID` |
| `Choice.condition` | `ConditionTable` |
| `Branch.flag_*` | `ConditionTable` |
| `Evidence.category_title / hint` | `EvidenceCategoryTable` |

---

## 현재 하드코딩 유지 대상

이번 라운드에서는 아래를 데이터 원본에서 분리하지 않는다.

### 1. Question

- 질문 목록
- 질문 해결 방식
- 질문 해결 보상

### 2. Rule

- 질문 노출 규칙
- 질문 상태 문구 규칙

### 3. StateDescriptor

- 공명 / 신뢰 / 조사 상태 문구 변환

이 세 구조는 런타임 리팩터링 범위가 커서, 새 테이블 구조 전환과 분리해서 다룬다.

---

## 다음 작업 기준

새 구조 전환 작업은 아래 순서로 진행한다.

1. `TABLE_SPEC.md` 기준 확정
2. `export_to_json.py`, `json_to_generated_xlsx.py`, `validate_game_data.py` 전환
3. `EditorNode` 전환
4. `scene.js`, `choice.js` 등 런타임 전환
5. `game_data.js` 마이그레이션
6. 브라우저 QA

상세 체크리스트는 아래 문서를 따른다.

- [새_테이블_구조_전환_계획.md](/G:/GSD/content/docs/system/core/새_테이블_구조_전환_계획.md)
