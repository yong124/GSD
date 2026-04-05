# 경성뎐 데이터 테이블 명세

> 현재 구조 전환 기준 문서.
> `Question / Rule / StateDescriptor`는 이번 전환 라운드에서 테이블 원본이 아니라 런타임 하드코딩 영역으로 유지한다.

---

## 1. ConditionTable

게임 내 표시/분기 조건을 공통으로 정의한다.

같은 `ConditionGroupID`를 가진 행은 모두 만족해야 한다.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `ConditionID` | 조건 고유 ID | - |
| `ConditionGroupID` | AND 조건 묶음 ID | - |
| `ConditionType` | 검사 타입 | `EConditionType` |
| `ConditionTargetID` | 검사 대상 ID | 타입별 참조 |
| `CompareType` | 비교 방식 | `ECompareType` |
| `ConditionValue` | 비교값 | - |

### ConditionType

- `Trust`
- `EvidenceOwned`
- `ChoiceSelected`
- `RevealedCharacter`
- `SceneProgressIndex`
- `InvestigationScore`
- `ResonanceLevel`
- `StateValue`

---

## 2. SceneTable

씬의 메타 정보만 정의한다.

| 컬럼 | 설명 |
| --- | --- |
| `SceneID` | 씬 고유 ID |
| `Chapter` | 챕터 번호 |
| `Title` | 씬 제목 |
| `Background` | 배경 경로 |
| `Music` | BGM 경로 |
| `Effect` | 씬 진입 효과 |
| `GoalKicker` | 목표 UI 머리말 |
| `GoalText` | 목표 문장 |
| `EvidencePromptTitle` | 증거 제시 UI 제목 |
| `EvidencePromptHint` | 증거 제시 UI 안내 문구 |

### 메모

- 기본 이동은 `SceneTable`이 아니라 `BranchTable`에서 처리한다.
- 조사 메타는 `InvestigationTable`로 분리한다.

---

## 3. DialogTable

씬 안의 순차 대사 노드.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `DialogID` | 대사 고유 ID | - |
| `SceneID` | 소속 씬 | `SceneTable.SceneID` |
| `Order` | 씬 내 기본 순서 | - |
| `CharacterID` | 화자 캐릭터 | `CharacterTable.CharacterID` |
| `EmotionType` | 감정 타입 | `CharacterEmotionTable` |
| `StandingSlot` | 스탠딩 위치 | `EStandingSlot` |
| `FocusType` | 포커스 타입 | `EFocusType` |
| `EnterMotion` | 등장 모션 | enum |
| `ExitMotion` | 퇴장 모션 | enum |
| `IdleMotion` | 유지 모션 | enum |
| `FxType` | 순간 FX | enum |
| `Text` | 대사 본문 | - |
| `Style` | 대사 스타일 | `EDialogStyle` |
| `ConditionGroupID` | 대사 표시 조건 | `ConditionTable.ConditionGroupID` |
| `ChoiceGroupID` | 이 시점에 호출할 선택지 그룹 | `ChoiceGroupTable.ChoiceGroupID` |
| `NextDialogID` | 강제 연결할 다음 대사 | `DialogTable.DialogID` |

### 메모

- 기존 `Label`, `ConditionKey`, `ConditionValue`, `Speaker`, `Portrait`는 레거시 대상이다.

---

## 4. ChoiceGroupTable

한 번에 표시되는 선택지 묶음.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `ChoiceGroupID` | 선택지 그룹 ID | - |
| `Type` | 그룹 종류 | `EChoiceGroupType` |
| `ConditionGroupID` | 그룹 표시 조건 | `ConditionTable.ConditionGroupID` |
| `MaxSelectable` | 선택 가능 개수 | - |

### EChoiceGroupType

- `Normal`
- `Investigation`
- `Evidence`

---

## 5. ChoiceTable

실제 플레이어가 고르는 개별 선택지.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `ChoiceID` | 선택지 고유 ID | - |
| `ChoiceGroupID` | 소속 그룹 ID | `ChoiceGroupTable.ChoiceGroupID` |
| `Order` | 그룹 내 순서 | - |
| `Text` | 선택지 문구 | - |
| `ConditionGroupID` | 선택지 노출 조건 | `ConditionTable.ConditionGroupID` |
| `NextType` | 이동 타입 | `ENextType` |
| `NextID` | 이동 대상 ID | Scene 또는 Dialog |
| `EvidenceID` | 획득 증거 ID | `EvidenceTable.EvidenceID` |
| `TrustCharacterID` | 신뢰도 대상 캐릭터 | `CharacterTable.CharacterID` |
| `TrustValue` | 신뢰도 변화값 | - |
| `ResonanceValue` | 공명도 변화값 | - |

### ENextType

- `Scene`
- `Dialog`
- `None`

### 메모

- 기존 `FlagKey`, `FlagValue`, `NextScene`, `NextDialogue`, `PriorityCost`, `ExtraFlags`는 레거시 대상이다.
- 이번 구조에서는 선택 결과를 `EvidenceID / TrustValue / ResonanceValue / NextType / NextID`로 우선 표현한다.

---

## 6. BranchTable

씬 종료 후 자동 분기.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `BranchID` | 분기 고유 ID | - |
| `SceneID` | 소속 씬 ID | `SceneTable.SceneID` |
| `Order` | 분기 평가 순서 | - |
| `ConditionGroupID` | 분기 조건 | `ConditionTable.ConditionGroupID` |
| `NextSceneID` | 이동할 다음 씬 | `SceneTable.SceneID` |

---

## 7. EvidenceTable

정적 증거 정의.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `EvidenceID` | 증거 고유 ID | - |
| `Name` | 증거 이름 | - |
| `Description` | 증거 설명 | - |
| `Image` | 증거 이미지 경로 | 리소스 경로 |
| `CategoryID` | UI 카테고리 ID | `EvidenceCategoryTable.CategoryID` |

### 메모

- 증거 보유 여부는 런타임 상태가 관리한다.
- 기존 `SceneId`, `Trigger`, `CategoryTitle`, `CategoryHint`는 레거시 대상이다.

---

## 8. EvidenceCategoryTable

단서 UI 카테고리 정의.

| 컬럼 | 설명 |
| --- | --- |
| `CategoryID` | 카테고리 고유 ID |
| `CategoryTitle` | 카테고리 이름 |
| `CategoryHint` | 카테고리 설명 |

---

## 9. CharacterTable

캐릭터 기본 정보와 수첩 정보.

| 컬럼 | 설명 |
| --- | --- |
| `CharacterID` | 캐릭터 고유 ID |
| `DisplayName` | 표시 이름 |
| `NotebookSummary1` | 수첩 요약 1 |
| `NotebookSummary2` | 수첩 요약 2 |

### 메모

- 현재 운영상 `RoleText`는 유지 중이므로, 런타임 전환 완료 전까지는 보조 컬럼으로 허용한다.

---

## 10. CharacterEmotionTable

감정별 이미지 매핑.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `CharacterID` | 캐릭터 ID | `CharacterTable.CharacterID` |
| `EmotionType` | 감정 타입 | `EEmotionType` |
| `ImagePath` | 감정별 이미지 경로 | 리소스 경로 |

---

## 11. InvestigationTable

조사 메타 정보.

| 컬럼 | 설명 | 참조 |
| --- | --- | --- |
| `InvestigationID` | 조사 고유 ID | - |
| `Title` | 조사 제목 | - |
| `Hint` | 조사 안내 문구 | - |
| `Budget` | 조사 가능 횟수 | - |
| `ChoiceGroupID` | 조사에서 사용할 선택지 그룹 | `ChoiceGroupTable.ChoiceGroupID` |

### 메모

- 기존 `PriorityTitle`, `PriorityHint`, `PriorityBudget`은 이 테이블로 이동한다.

---

## 하드코딩 유지 대상

이번 전환 라운드에서는 아래 세 구조를 테이블 원본으로 다루지 않는다.

- `Question`
- `Rule`
- `StateDescriptor`

이 세 구조는 현재 런타임 로직과 UI 의존성이 크므로, 코드/JSON 하드코딩 영역으로 남긴다.

---

## 레거시 제거 대상

아래 필드는 새 구조 전환 후 제거 대상이다.

- `Scene.NextScene`
- `Scene.PriorityTitle`
- `Scene.PriorityHint`
- `Scene.PriorityBudget`
- `Scene.PriorityAfterDialogues`
- `Dialog.Label`
- `Dialog.ConditionKey`
- `Dialog.ConditionValue`
- `Choice.FlagKey`
- `Choice.FlagValue`
- `Choice.NextScene`
- `Choice.NextDialogue`
- `Choice.PriorityCost`
- `Choice.ExtraFlags`
- `Branch.FlagKey`
- `Branch.FlagValue`
