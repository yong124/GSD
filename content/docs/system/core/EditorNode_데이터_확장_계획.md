# EditorNode 데이터 확장 계획

## 목적

`script.xlsx` 시트 확장만 진행하면 실제 실무 편집 흐름은 다시 `game_data.js` 직접 수정으로 되돌아가기 쉽다.

따라서 아래 확장은 `시트`, `파이프라인`, `런타임`과 함께 `EditorNode`에도 동시에 반영되어야 한다.

이번 문서는 다음 4개를 기준으로 한다.

1. `SceneTable` 확장
2. `CharacterTable` 확장
3. `EvidenceTable` 확장
4. `QuestionTable` 신설

---

## 현재 EditorNode 상태

현재 에디터는 이미 아래를 다룬다.

- 씬 메타
- 대사
- 선택지
- 분기
- 단서
- 캐릭터
- 감정 이미지
- priority 조사 대사

즉, 데이터 확장 대상 중 `Scene`, `Character`, `Evidence`는 이미 편집 UI가 있다.

따라서 1차 작업은 **기존 패널 확장** 위주가 맞다.

---

## 1. Scene 패널 확장

## 현재 필드

- `SceneID`
- `Title`
- `Background`
- `Chapter`
- `Music`
- `Effect`
- `priority_budget`

## 추가할 필드

- `GoalKicker`
- `GoalText`

## UI 위치 권장

`이펙트` 아래, `조사 예산` 위 또는 아래에 `씬 목표` 섹션 추가

### 예시 구성

- `목표 머리말`
- `목표 문장`

## 적용 포인트

- `bindElements`
- `renderPanel`
- scene input change binding
- normalize/export 시 `goal_kicker`, `goal_text` 보존

---

## 2. Character 패널 확장

## 현재 필드

- `CharacterID`
- `DisplayName`
- `DefaultEmotionType`
- `DefaultImagePath`

## 추가할 필드

- `RoleText`
- `NotebookSummary1`
- `NotebookSummary2`

## UI 위치 권장

기존 `Characters` 카드 내부에 바로 추가

### 예시 구성

- `역할`
- `수첩 요약 1`
- `수첩 요약 2`

## 적용 포인트

- 캐릭터 카드 렌더 함수
- 캐릭터 row 정규화 함수
- export 시 characters 블록에 새 필드 보존

---

## 3. Evidence 패널 확장

## 현재 필드

- `EvidenceID`
- `Trigger`
- `Name`
- `Description`
- `Image`

## 추가할 필드

- `CategoryID`
- `CategoryTitle`
- `CategoryHint`

## UI 위치 권장

기존 단서 카드의 `Description` 아래에 카테고리 섹션 추가

### 예시 구성

- `카테고리 ID`
- `카테고리명`
- `카테고리 설명`

## 적용 포인트

- `newEvidence()`
- evidence 카드 렌더 함수
- evidence 변경 핸들러
- normalize/export 시 카테고리 필드 보존

---

## 4. QuestionTable 대응 UI

질문은 기존 씬 하위 데이터가 아니라 전역 메타 데이터다.

따라서 기존 `노드 편집` 탭 안에 억지로 넣기보다, 1차는 `캐릭터 편집` 탭 옆에 별도 패널 섹션을 두는 것이 좋다.

## 권장 구조

### 옵션 A

`캐릭터 편집` 탭 내부 하단에 `Questions` 섹션 추가

장점:

- 구현이 가장 빠름
- 현재 탭 구조를 적게 건드림

단점:

- 캐릭터와 질문이 섞여 보여 의미 분리가 약함

### 옵션 B

탭을 3개로 확장

- `노드 편집`
- `캐릭터 편집`
- `조사 메타`

장점:

- 질문, 상태 해석, 규칙 테이블까지 자연스럽게 확장 가능

단점:

- 이번 라운드에 손댈 UI 범위가 조금 커짐

## 추천

1차는 `옵션 A`

질문 데이터가 실제로 붙고 나면, 2차에 `조사 메타` 탭으로 독립시키는 쪽이 안전하다.

## Question UI 필드

- `QuestionID`
- `Title`
- `Detail`
- `SortOrder`
- `Category`
- `VisibleRuleID`
- `StateRuleID`

---

## 5. normalize / export / import 수정 포인트

EditorNode는 입력 UI만 늘리면 끝나지 않는다.

아래 지점까지 같이 수정되어야 한다.

### state.data 기본 구조

현재:

- `first_scene`
- `characters`
- `character_emotions`
- `scenes`

추가 예정:

- `questions`

### normalize 대상

- scene normalize
- character normalize
- evidence normalize
- question normalize

### export 대상

- `game_data.questions`
- scene의 `goal_kicker`, `goal_text`
- character의 `role_text`, `notebook_summary1`, `notebook_summary2`
- evidence의 `category_id`, `category_title`, `category_hint`

---

## 6. 우선순위

### 1차

- Scene 목표 필드
- Character 수첩 요약 필드
- Evidence 카테고리 필드

이 3개는 기존 패널 확장만으로 바로 가능하다.

### 2차

- Questions 섹션 추가
- `state.data.questions` 지원

### 3차

- `StateDescriptorTable` 대응 UI
- 필요 시 `조사 메타` 탭 분리

---

## 7. 실제 작업 순서

1. `state.data`에 `questions` 기본 구조 추가
2. Scene 패널에 `GoalKicker`, `GoalText` 추가
3. Character 패널에 `RoleText`, `NotebookSummary1`, `NotebookSummary2` 추가
4. Evidence 패널에 `CategoryID`, `CategoryTitle`, `CategoryHint` 추가
5. normalize/export 보존 확인
6. Questions 섹션 추가
7. 이후 pipeline/export 스크립트와 완전 동기화

---

## 결론

이번 데이터 확장은 에디터도 반드시 같이 수정되어야 한다.

특히 1차 핵심은 아래 세 줄이다.

- Scene 패널에 목표 필드 추가
- Character 패널에 수첩 요약 필드 추가
- Evidence 패널에 카테고리 필드 추가

질문은 그다음 `questions` 전역 메타 구조를 추가하면서 UI를 붙이면 된다.
