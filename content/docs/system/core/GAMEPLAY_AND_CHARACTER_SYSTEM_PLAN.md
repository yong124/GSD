# 경성뎐 게임성 및 캐릭터 시스템 확장 계획

## 1. 문서 목적

이 문서는 현재 `경성뎐` 프로젝트를

- 비주얼노벨형 텍스트 중심 구조에서
- 조사형 내러티브 게임 구조로 확장하고
- 캐릭터 표현 시스템을 데이터 기반으로 정리하기 위한

설계 및 실행 계획 문서다.

핵심 목표는 두 가지다.

1. 플레이어가 `읽는 사람`이 아니라 `판단하고 선택하는 사람`이 되도록 게임성을 보강한다.
2. 캐릭터를 단순 `Speaker 문자열`이 아니라 데이터 엔티티로 승격해 표정, 스탠딩, 포커스, 연출을 확장 가능한 구조로 바꾼다.

---

## 2. 현재 상태 진단

현재 `경성뎐`은 아래 강점이 있다.

- 세계관과 장면 분위기가 선명하다
- 선택, 플래그, 분기, 증거 구조가 이미 존재한다
- 관계값과 조사값이 일부 후속 장면과 엔딩에 반영된다
- 툴과 파이프라인이 이미 갖춰져 있다

반면 게임성 측면의 현재 한계는 아래와 같다.

- 플레이어의 주된 행동이 `대사 진행`과 `선택지 클릭`에 머물러 있다
- 정보 획득이 능동 조사보다 대사 전달에 가깝다
- 상태값이 존재하지만 플레이 감각으로 강하게 번역되진 않는다
- 장면 연출이 대부분 `배경 + 텍스트 + 초상화` 단위라 존재감이 약하다

즉 현재 위치는
`분위기 좋은 조사형 비주얼노벨 프로토타입`
에 가깝고,
다음 단계는
`판단, 우선순위, 위험, 증거 활용이 살아 있는 조사형 게임`
으로 가는 것이다.

---

## 3. 지금 구조에서 싸게 넣을 수 있는 5개 개선안

### 1. 질문 우선순위 선택

각 조사 장면마다 질문 3~4개를 제공하고,
그중 2개만 깊게 볼 수 있게 만든다.

### 2. 조사 대상 제한

장면마다 `인물`, `물건`, `장소` 중 일부만 먼저 확인 가능하게 만들고,
무엇을 먼저 보느냐에 따라 다음 대사가 달라지게 한다.

### 3. 위험 질문 도입

특정 질문이나 접근은 `관계 하락`, `공명 상승`, `정보 차단` 리스크를 갖게 한다.

### 4. 증거 제시 분기

단서를 얻는 것만으로 끝내지 않고,
어느 장면에서 어느 NPC에게 어떤 증거를 제시하느냐에 따라 반응이 달라지게 한다.

### 5. 즉시 피드백 강화

선택 결과를 엔딩까지 미루지 말고 바로 보여준다.

예:

- 송순이 한 발 물러남
- 기자가 태도를 바꿈
- 대사 라인이 닫힘
- 공명 연출이 강해짐

---

## 4. 포트폴리오에 가장 효과 좋은 핵심 시스템

가장 추천하는 핵심 시스템은 `조사 우선순위 시스템`이다.

정의:

`각 장면에서 질문, 조사, 증거 제시 기회가 제한되어 있고, 무엇을 먼저 파고들지에 따라 정보, 관계, 위험, 후속 반응이 달라지는 구조`

이 시스템이 좋은 이유는 아래와 같다.

- 현재 구조에 가장 적은 비용으로 붙일 수 있다
- 전투가 없어도 분명한 플레이 감각이 생긴다
- 시스템 기획 포트폴리오로 설명하기 좋다
- 기존 `InvestigationScore`, `SongsoonTrust`, `ResonanceLevel`과 자연스럽게 연결된다

---

## 5. 실제 씬 단위 적용 예시

### `Ch2_Cafe`

- 질문 선택 3개 제공
  - `그날 마지막으로 본 사람을 묻는다`
  - `병원 이야기를 꺼낸다`
  - `송순의 표정을 관찰한다`
- 이 중 2개만 깊게 진행 가능
- `병원 이야기`를 너무 빠르게 밀면 `SongsoonTrust` 하락
- `표정 관찰`로 가면 이후 감정 연출 힌트 해금

### `Ch3_Warehouse`

- 조사 포인트 3개 제공
  - `발자국`
  - `낡은 상자`
  - `벽면 흔적`
- `벽면 흔적`을 먼저 보면 `ResonanceLevel` 상승
- `발자국`을 먼저 보면 `InvestigationScore` 상승

### `Ch5_Ritual_Room`

- 단서 제시 선택 도입
  - `기록을 먼저 본다`
  - `가면을 먼저 확인한다`
  - `송순을 먼저 본다`
- 무엇을 먼저 택했는지에 따라 공포 연출과 대사 순서가 달라짐

---

## 6. 캐릭터 시스템 확장 방향

## 6-1. 현재 구조의 한계

현재 `DialogTable`의 `Speaker`는 문자열이다.

이 구조는 아래 한계가 있다.

- 이름 표시 외 다른 데이터와 연결되기 어렵다
- 표정, 스탠딩, 포커스, 연출을 붙이기 어렵다
- 캐릭터별 기본값을 관리하기 어렵다

따라서 캐릭터를 데이터 엔티티로 승격해야 한다.

## 6-2. 신규 테이블 제안

### `CharacterTable`

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `CharacterID` | string | O | 캐릭터 고유 ID |
| `DisplayName` | string | O | 출력 이름 |
| `DefaultEmotionType` | enum | O | 기본 감정 |
| `DefaultImagePath` | string |  | 기본 이미지 경로 |

### `CharacterEmotionTable`

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `CharacterID` | string | O | CharacterTable 참조 |
| `EmotionType` | enum | O | 감정 타입 |
| `ImagePath` | string | O | 감정 대응 이미지 경로 |

이 테이블은 최소 구조로 시작한다.

즉 현재 단계에선
`CharacterID`, `EmotionType`, `ImagePath`
세 컬럼만 있으면 충분하다.

## 6-3. `EmotionType` Enum 제안

- `Neutral`
- `Tense`
- `Uneasy`
- `Afraid`
- `Sad`
- `Angry`
- `Shaken`
- `Trance`
- `Crazy`

운영 규칙:

- 모든 캐릭터는 최소 `Neutral` 1개 필수
- 같은 `CharacterID + EmotionType` 조합은 중복 금지

## 6-4. `DialogTable` 확장 컬럼 제안

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `SpeakerID` | string |  | CharacterTable 참조 |
| `EmotionType` | enum |  | 현재 감정 상태 |
| `StandingSlot` | enum |  | `Left`, `Center`, `Right` |
| `FocusType` | enum |  | `Speaker`, `None`, `Dual` |
| `EnterMotion` | enum |  | 등장 모션 |
| `ExitMotion` | enum |  | 퇴장 모션 |
| `IdleMotion` | enum |  | 유지 모션 |
| `FxType` | enum |  | 대사 순간 FX |

최소 구현 우선순위는 아래가 맞다.

1. `SpeakerID`
2. `EmotionType`
3. `StandingSlot`
4. `FocusType`
5. 이후 `Motion`, `Fx`

---

## 7. 구현 우선순위 계획

### 1단계

- `CharacterTable` 설계
- `CharacterEmotionTable` 설계
- `DialogTable`에 `SpeakerID`, `EmotionType` 추가 설계

### 2단계

- `Ch2_Cafe`
- `Ch3_Warehouse`
- `Ch5_Ritual_Room`

세 씬에 `조사 우선순위 시스템` 우선 적용

### 3단계

- `StandingSlot`
- `FocusType`
- `EmotionType`

기반 UI 최소 구현

### 4단계

- `EnterMotion`
- `ExitMotion`
- `IdleMotion`
- `FxType`

제한된 Enum 기반 확장

---

## 8. 최종 정리

현재 `경성뎐`에 필요한 것은 텍스트 추가보다
아래 두 축이다.

### 게임성 축

`조사 우선순위`, `위험 감수`, `단서 활용`, `즉시 피드백`

### 캐릭터 시스템 축

`CharacterTable`, `CharacterEmotionTable`, `DialogTable 확장`, `스탠딩/포커스/감정 연출`

우선순위는 아래가 맞다.

1. `Character`, `CharacterEmotion`, `Dialogue` 확장 설계
2. 핵심 씬에 `조사 우선순위 시스템` 적용
3. 스탠딩/포커스 최소 구현
4. 모션과 FX 확장

실제 시트 컬럼, `game_data.js` 구조, `EditorNode` 편집 계획은
[CHARACTER_SCHEMA_AND_EDITING_PLAN.md](/G:/GSD/content/docs/system/core/CHARACTER_SCHEMA_AND_EDITING_PLAN.md)를 기준으로 삼는다.
