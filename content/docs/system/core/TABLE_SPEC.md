# 경성뎐 데이터 테이블 명세

> 범용 HTML ADV 엔진 기준 테이블 구조.
> 설계 배경과 원칙은 `테이블_완전_새구조.md`를 참조한다.

---

## 1. GaugeTable

게임 내 수치를 정의한다.

| 컬럼 | 설명 |
|---|---|
| `GaugeID` | 수치 고유 ID |
| `Label` | 표시 이름 |
| `MinValue` | 최솟값 |
| `MaxValue` | 최댓값 |
| `DefaultValue` | 초기값 |
| `HudVisible` | HUD 상시 표시 여부 |
| `HudOrder` | HUD 표시 순서 |

### 경성뎐 적용 예시

| GaugeID | Label | Min | Max | Default | HudVisible |
|---|---|---|---|---|---|
| `Erosion` | 침식 | 0 | 10 | 0 | true |
| `Credibility` | 신용 | 0 | 10 | 10 | true |

---

## 2. GaugeStateTable

수치 단계를 정의한다. 같은 `GaugeID`의 행들이 수치 범위별 상태를 구성한다.

| 컬럼 | 설명 |
|---|---|
| `GaugeID` | 소속 수치 |
| `MinValue` | 이 상태 최솟값 |
| `MaxValue` | 이 상태 최댓값 |
| `Label` | 상태 이름 |
| `HudColor` | HUD 표시 색상 |
| `Detail` | 상태 설명 |
| `TriggerSceneID` | 이 상태 진입 시 이동할 씬 (`None`이면 전환 없음) |

---

## 3. EffectTable

효과 묶음을 정의한다. 같은 `EffectGroupID`를 가진 행은 동시에 실행된다.

| 컬럼 | 설명 |
|---|---|
| `EffectGroupID` | 묶음 ID |
| `EffectType` | 효과 종류 |
| `GaugeID` | `GaugeChange`일 때 대상 수치 |
| `GaugeDelta` | `GaugeChange`일 때 변화값 |
| `EvidenceID` | `EvidenceGive`일 때 획득 증거 |
| `TrustCharacterID` | `TrustChange`일 때 대상 캐릭터 |
| `TrustDelta` | `TrustChange`일 때 변화값 |

### EffectType

- `GaugeChange` — 수치 변화
- `EvidenceGive` — 증거 획득
- `TrustChange` — 캐릭터 신뢰도 변화

---

## 4. ConditionTable

게임 내 표시/분기 조건을 공통으로 정의한다. 같은 `ConditionGroupID`를 가진 행은 모두 만족해야 한다(AND).

| 컬럼 | 설명 |
|---|---|
| `ConditionID` | 조건 고유 ID |
| `ConditionGroupID` | AND 조건 묶음 ID |
| `ConditionType` | 검사 타입 |
| `ConditionTargetID` | 검사 대상 ID |
| `CompareType` | 비교 방식 |
| `ConditionValue` | 비교값 |

### ConditionType

| 타입 | ConditionTargetID |
|---|---|
| `GaugeValue` | GaugeID |
| `Trust` | CharacterID |
| `EvidenceOwned` | EvidenceID |
| `ChoiceSelected` | ChoiceID |
| `RevealedCharacter` | CharacterID |
| `SceneProgressIndex` | — |
| `SceneVisited` | SceneID |

### ECompareType

- `Equal`
- `NotEqual`
- `Greater`
- `GreaterEqual`
- `Less`
- `LessEqual`

---

## 5. SceneTable

씬의 메타 정보를 정의한다.

| 컬럼 | 설명 |
|---|---|
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
| `InvestigationTitle` | 조사 씬 제목 |
| `InvestigationHint` | 조사 씬 안내 문구 |

### 메모

- 씬 이동은 `BranchTable`에서 처리한다.
- 씬 진입 시 효과가 필요하면 첫 번째 `DialogTable` 행에 `EffectGroupID`를 붙인다.

---

## 6. DialogTable

씬 안의 순차 대사 노드.

| 컬럼 | 설명 |
|---|---|
| `DialogID` | 대사 고유 ID |
| `SceneID` | 소속 씬 |
| `Order` | 씬 내 기본 순서 |
| `CharacterID` | 화자 캐릭터 |
| `EmotionType` | 감정 타입 |
| `StandingSlot` | 스탠딩 위치 |
| `FocusType` | 포커스 타입 |
| `EnterMotion` | 등장 모션 |
| `ExitMotion` | 퇴장 모션 |
| `IdleMotion` | 유지 모션 |
| `FxType` | 순간 FX |
| `Text` | 대사 본문 |
| `Style` | 대사 스타일 |
| `ConditionGroupID` | 대사 표시 조건 |
| `ChoiceGroupID` | 이 시점에 호출할 선택지 그룹 |
| `NextDialogID` | 강제 연결할 다음 대사 |
| `EffectGroupID` | 이 대사 진행 시 발동할 효과 |

---

## 7. ChoiceGroupTable

한 번에 표시되는 선택지 묶음.

| 컬럼 | 설명 |
|---|---|
| `ChoiceGroupID` | 선택지 그룹 ID |
| `Type` | 그룹 종류 |
| `AnswerType` | 입력 방식 |
| `ConditionGroupID` | 그룹 표시 조건 |
| `MaxSelectable` | 선택 가능 개수 |
| `DefaultDialogID` | `AnswerType: Evidence`일 때 정의되지 않은 증거 제시 시 반응 대사 |

### EChoiceGroupType

- `Normal`
- `Investigation`
- `Evidence`

### EAnswerType

- `Text` — 텍스트 선택지 버튼
- `Evidence` — 현재 보유한 증거 인벤토리 전체 표시

---

## 8. ChoiceTable

플레이어가 고르는 개별 선택지.

| 컬럼 | 설명 |
|---|---|
| `ChoiceID` | 선택지 고유 ID |
| `ChoiceGroupID` | 소속 그룹 ID |
| `Order` | 그룹 내 순서 |
| `Text` | 선택지 문구 (`AnswerType: Text`일 때) |
| `EvidenceID` | 반응할 증거 ID (`AnswerType: Evidence`일 때) |
| `ConditionGroupID` | 선택지 노출 조건 |
| `NextType` | 이동 타입 |
| `NextID` | 이동 대상 ID |
| `EffectGroupID` | 선택 시 발동할 효과 |

### ENextType

- `Scene`
- `Dialog`
- `None`

### 메모

- `AnswerType: Evidence`일 때 `Text`는 비워도 된다.
- 효과는 `EffectTable`로 분리됐다. 기존 `TrustCharacterID`, `TrustValue`, `ResonanceValue`, `StateType`, `StateValue`는 제거됐다.

---

## 9. BranchTable

씬 종료 후 자동 분기.

| 컬럼 | 설명 |
|---|---|
| `BranchID` | 분기 고유 ID |
| `SceneID` | 소속 씬 ID |
| `Order` | 분기 평가 순서 |
| `ConditionGroupID` | 분기 조건 |
| `NextSceneID` | 이동할 다음 씬 |

---

## 10. EvidenceTable

정적 증거 정의.

| 컬럼 | 설명 |
|---|---|
| `EvidenceID` | 증거 고유 ID |
| `Name` | 증거 이름 |
| `Description` | 증거 설명 |
| `Image` | 증거 이미지 경로 |
| `CategoryID` | UI 카테고리 ID |

---

## 11. EvidenceCategoryTable

단서 UI 카테고리 정의.

| 컬럼 | 설명 |
|---|---|
| `CategoryID` | 카테고리 고유 ID |
| `CategoryTitle` | 카테고리 이름 |
| `CategoryHint` | 카테고리 설명 |

---

## 12. CharacterTable

캐릭터 기본 정보와 수첩 정보.

| 컬럼 | 설명 |
|---|---|
| `CharacterID` | 캐릭터 고유 ID |
| `DisplayName` | 표시 이름 |
| `DefaultTrust` | 게임 시작 시 기본 신뢰도 |
| `NotebookSummary1` | 수첩 요약 1 |
| `NotebookSummary2` | 수첩 요약 2 |

### 메모

- `RoleText`는 런타임 전환 완료 전까지 보조 컬럼으로 허용한다.

---

## 13. CharacterEmotionTable

감정별 이미지 매핑.

| 컬럼 | 설명 |
|---|---|
| `CharacterID` | 캐릭터 ID |
| `EmotionType` | 감정 타입 |
| `ImagePath` | 감정별 이미지 경로 |

---

## 제거된 테이블

| 테이블 | 제거 이유 |
|---|---|
| `InvestigationTable` | `SceneTable` + `ChoiceGroupTable`로 완전히 흡수 |

---

## 레거시 제거 대상

아래 필드는 새 구조 전환 후 제거 대상이다.

- `Choice.FlagKey` / `Choice.FlagValue`
- `Choice.NextScene` / `Choice.NextDialogue`
- `Choice.PriorityCost` / `Choice.ExtraFlags`
- `Choice.TrustCharacterID` / `Choice.TrustValue`
- `Choice.ResonanceValue`
- `Choice.StateType` / `Choice.StateValue`
- `Dialog.Label` / `Dialog.ConditionKey` / `Dialog.ConditionValue`
- `Scene.NextScene`
- `Scene.PriorityTitle` / `Scene.PriorityHint` / `Scene.PriorityBudget`
- `Scene.PriorityAfterDialogues`
- `Branch.FlagKey` / `Branch.FlagValue`
