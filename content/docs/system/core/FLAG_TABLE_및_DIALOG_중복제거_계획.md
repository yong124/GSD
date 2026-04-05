# FlagTable 및 Dialog 중복 제거 계획

## 목적

현재 경성뎐 데이터 구조에는 두 가지 핵심 중복이 있다.

1. `Flag`가 별도 정의 테이블 없이 사용처 문자열로만 흩어져 있다.
2. `Dialogue`가 `Character`와 `CharacterEmotion`이 이미 책임지는 정보를 다시 들고 있다.

이번 계획의 목표는 다음과 같다.

- `FlagTable`을 도입해 상태 변수를 정의형 데이터로 올린다.
- `Dialogue`에서 `Speaker`, `Portrait` 같은 중복 필드를 축소한다.
- 파이프라인, 런타임, 에디터가 같은 기준을 보도록 맞춘다.

## 문제 요약

### Flag 정의 부재

현재 `ChoiceTable`, `BranchTable`, `Dialog condition`은 모두 문자열 기반으로 플래그를 직접 참조한다.

- `FlagKey`
- `ConditionKey`
- 런타임의 `HasEvidence_*`

즉, `Flag`는 “정의”가 아니라 “사용”만 존재하는 상태다.

### Dialogue의 캐릭터 정보 중복

현재 `Dialogue`는 아래 필드를 함께 들고 있다.

- `Speaker`
- `SpeakerID`
- `Portrait`
- `EmotionType`

하지만 구조적으로는:

- 이름은 `CharacterTable.DisplayName`
- 기본 이미지는 `CharacterTable.DefaultImagePath`
- 감정별 이미지는 `CharacterEmotionTable.ImagePath`

에서 가져와야 한다.

## 목표 구조

### FlagTable

`FlagTable`

- `FlagID`
- `DisplayName`
- `Description`
- `ValueType`
- `DefaultValue`
- `Category`

### DialogTable 최소 책임

`DialogTable`은 아래만 직접 책임진다.

- 누가 말하는가: `SpeakerID`
- 어떤 감정 상태인가: `EmotionType`
- 이 줄에서 어떤 연출을 하는가
- 실제 대사 텍스트
- 어떤 조건에서 출력되는가

즉, 캐릭터 정체성은 캐릭터 테이블로, 줄 단위 연출은 Dialogue로 책임을 나눈다.

## 권장 컬럼 구조

### DialogTable 유지

- `SceneID`
- `Order`
- `Label`
- `SpeakerID`
- `EmotionType`
- `StandingSlot`
- `FocusType`
- `EnterMotion`
- `ExitMotion`
- `IdleMotion`
- `FxType`
- `Text`
- `Style`
- `ConditionFlagID`
- `ConditionValue`

### DialogTable 축소 또는 deprecated 후보

- `Speaker`
- `Portrait`
- `ConditionKey`

### ChoiceTable 전환

- `FlagKey` → `FlagID`
- `FlagValue` 유지

### BranchTable 전환

- `FlagKey` → `FlagID`
- `FlagValue` 유지

## 마이그레이션 단계

### 1단계. 문서와 명세 고정

- `FlagTable` 추가
- `DialogTable` 중복 제거 정책 명시
- deprecated 필드 목록 명시

### 2단계. 파이프라인 호환 확장

- `export_to_json.py`
- `json_to_generated_xlsx.py`
- `validate_game_data.py`

이 도구들이 `FlagTable`, `FlagID`, `ConditionFlagID`를 읽고 검수하게 만든다.

### 3단계. 런타임 우선순위 전환

- 이름: `SpeakerID -> Character.DisplayName`
- 이미지: `SpeakerID + EmotionType -> CharacterEmotion.ImagePath`
- `Speaker`, `Portrait`는 fallback만 남긴다.

### 4단계. EditorNode 정리

- `Speaker` 입력 제거 또는 숨김
- `Portrait` 입력 제거 또는 override 전용으로 격리
- `FlagID` 드롭다운 도입
- 필요하면 `Flags` 탭 추가

### 5단계. 데이터 마이그레이션

- 기존 `game_data.js`와 xlsx에서 `Speaker`, `Portrait`, `FlagKey` 사용처를 줄인다.
- 최종적으로는 fallback이 없어도 되는 상태까지 가는 것을 목표로 한다.

## deprecated 예정 필드

### 1차 deprecated

- `DialogTable.Speaker`
- `DialogTable.Portrait`
- `DialogTable.ConditionKey`
- `ChoiceTable.FlagKey`
- `BranchTable.FlagKey`

### 대체 필드

- `SpeakerID`
- `ConditionFlagID`
- `FlagID`

## 검수 포인트

- 정의되지 않은 `FlagID`를 사용하는 Choice/Branch/Dialog condition이 없는가
- `SpeakerID`가 있는데 `Speaker`를 따로 유지할 이유가 실제로 있는가
- `EmotionType`이 있는데 `Portrait`가 중복으로 박혀 있지 않은가
- Character/Emotion 수정이 Dialogue까지 이중 수정되도록 강제하고 있지 않은가

## 결론

다음 구조 정리의 핵심은 이 두 줄이다.

- `Flag는 FlagTable로 정의한다.`
- `Dialogue는 캐릭터 정체성을 다시 저장하지 않는다.`

이 기준으로 파이프라인, 런타임, 에디터를 순차적으로 정리한다.
