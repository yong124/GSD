# 경성뎐 데이터 시스템 기획서

## 1. 문서 목적

본 문서는 `경성뎐` 프로젝트의 내러티브 데이터 운영 구조를 정의하는 시스템 기획 문서다.

본 문서에서 다루는 범위는 다음과 같다.

- 데이터 원본 관리 단위
- 테이블 구조 정의
- 노드형 에디터 기준 편집 구조
- `xlsx <-> game_data` 양방향 변환 구조

본 문서는 JS 객체 설명보다, **기획 데이터 테이블과 편집 툴을 어떻게 운용할 것인지**를 설명하는 데 목적이 있다.

---

## 2. 데이터 운영 방향

### 2-1. 현재 운영 기준

현재 프로젝트의 메인 작업 툴은 `EditorNode` 노드형 에디터와 `game_data.js` 직접 편집 흐름이다.

운영 방향은 다음과 같다.

- 메인 편집: `EditorNode`, 필요 시 `game/data/game_data.js`
- 테이블 백업 / 정리 / 검수: `script.xlsx`, `content/generated/script.generated.xlsx`
- 게임 반영 데이터: `game_data.js`

즉, 과거에는 `xlsx -> game_data` 중심의 단방향 구조였다면, 현재는 **노드형 에디터 / game_data 중심으로 작업하고, 필요 시 xlsx를 보조 산출물로 왕복시키는 구조**를 운영 기준으로 삼는다.

### 2-2. 데이터 흐름

```text
Node Editor
↔ game_data
↔ xlsx
→ 게임 런타임
```

### 2-3. 운용 원칙

- 구조 편집과 일반 수정은 노드형 에디터를 우선한다.
- 서사 반복 보강과 빠른 톤 수정은 `game_data.js` 직접 수정도 허용한다.
- `script.xlsx`는 절대 단일 원본이라기보다 검수 / 공유 / 백업용 테이블 포맷으로 운용한다.
- 따라서 `xlsx -> game_data`뿐 아니라 `game_data -> generated xlsx`가 현재 실무상 더 중요하다.

---

## 3. 데이터 단위

현재 시스템에서 관리하는 데이터 단위는 다음과 같다.

| 단위 | 역할 |
| --- | --- |
| Scene | 씬 메타 정보 및 기본 흐름 정의 |
| Dialogue | 씬 내부 대사 라인 정의 |
| Choice | 플레이어 선택지 정의 |
| Branch | 상태값 기반 분기 정의 |
| Evidence | 단서 / 수집 정보 정의 |
| Character | 캐릭터 이름, 기본 감정, 수첩용 인물 메타 정의 |
| CharacterEmotion | 감정별 이미지 정의 |
| Question | 조사 수첩 질문 메타 정의 예정 |
| StateDescriptor | 상태값을 UI 문구로 해석하는 규칙 정의 예정 |

모든 구조는 결국 `Scene`을 중심으로 연결되며, 나머지 데이터는 씬에 종속된 하위 데이터다.

다만 최근 추가된 조사 수첩 계층은 일부가 씬 종속이 아니라 `조사 메타 데이터`로 움직이므로, 앞으로는 아래 두 축도 별도 관리 대상으로 본다.

- 인물 메타 데이터
- 질문 / 상태 해석 메타 데이터

---

## 4. 테이블 관계 구조

```text
SceneTable
 ├─ 1:N → DialogTable
 ├─ 1:N → ChoiceTable
 ├─ 1:N → BranchTable
 └─ 1:N → EvidenceTable

CharacterTable
 └─ 1:N → CharacterEmotionTable

QuestionTable
 └─ rule 참조 예정

FlagTable
 └─ StateDescriptorTable 참조 예정
```

### 4-1. 관계 설명

- 하나의 씬은 여러 대사를 가진다.
- 하나의 씬은 여러 선택지를 가질 수 있다.
- 하나의 씬은 여러 분기 조건을 가질 수 있다.
- 하나의 씬은 여러 단서를 가질 수 있다.

즉, `SceneTable`이 상위 구조를 정의하고, 나머지 테이블은 모두 `SceneID`를 기준으로 연결된다.

단, `CharacterTable`, `QuestionTable`, `FlagTable`, `StateDescriptorTable`은 씬 종속이라기보다 **게임 전역 메타 데이터**로 관리한다.

---

## 4-2. 하드코딩 마이그레이션 방향

현재 런타임에는 조사 수첩 UI 구현을 위해 일부 데이터가 코드에 직접 선언돼 있다.

이 항목들은 다음 방향으로 정리한다.

| 현재 하드코딩 | 이동 방향 |
| --- | --- |
| 인물 역할/요약 | `CharacterTable` 확장으로 병합 |
| 단서 카테고리 | `EvidenceTable` 확장으로 병합 |
| 목표 문구 | `SceneTable` 확장으로 병합 |
| 질문 목록 | `QuestionTable` 신설 |
| 상태 단계 문구 | `StateDescriptorTable` 신설 |
| 등장 여부 계산 | 런타임 로직 유지 |

상세 기준은 다음 문서를 따른다.

- [TABLE_SPEC.md](/G:/GSD/content/docs/system/core/TABLE_SPEC.md)

---

## 5. SceneTable

### 5-1. 역할

씬의 기본 메타 정보와 기본 이동 흐름을 정의하는 기준 테이블이다.

### 5-2. 컬럼 정의

| 컬럼명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `SceneID` | string | O | 씬 고유 ID |
| `Chapter` | int |  | 챕터 번호 |
| `Title` | string |  | 씬 제목 |
| `Background` | string |  | 배경 경로 |
| `Music` | string |  | BGM 경로 |
| `NextScene` | string |  | 기본 다음 씬 |
| `Effect` | string / int |  | 씬 진입 효과 |

### 5-3. 작성 규칙

- `SceneID`는 중복 없이 관리한다.
- 가능하면 영문 소문자 + 언더스코어 기준으로 통일한다.
- `NextScene`은 기본 흐름용이며, 조건 분기가 존재하는 경우 BranchTable이 우선 적용될 수 있다.

---

## 6. DialogTable

### 6-1. 역할

씬 내부에서 출력되는 대사 라인을 관리한다.

### 6-2. 컬럼 정의

| 컬럼명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `SceneID` | string | O | 소속 씬 ID |
| `Order` | int | O | 씬 내 출력 순서 |
| `Label` | string |  | 특정 대사 지점 식별용 라벨 |
| `Speaker` | string |  | 화자명 |
| `Text` | string | O | 대사 본문 |
| `Style` | string |  | 대사 스타일 |
| `Portrait` | string |  | 초상화 경로 |
| `ConditionKey` | string |  | 조건부 출력용 플래그 키 |
| `ConditionValue` | string |  | 조건부 출력용 플래그 값 |

### 6-3. 작성 규칙

- `Order` 오름차순 기준으로 출력된다.
- `ConditionKey / ConditionValue`가 없으면 항상 출력된다.
- `Label`은 같은 씬 내 점프 또는 후속 제어용 라벨로 사용한다.

### 6-4. 스타일 값

| 값 | 의미 |
| --- | --- |
| `normal` | 기본 대사 |
| `narration` | 내레이션 / 지문 |
| `thought` | 내면 독백 |
| `crazy` | 광기 / 불안정 상태 |
| `scared` | 공포 / 위축 상태 |
| `magic` | 세뇌 / 감응 / 비현실 연출 |

---

## 7. ChoiceTable

### 7-1. 역할

플레이어 선택지를 정의하고, 상태값 기록과 후속 흐름 제어를 담당한다.

### 7-2. 컬럼 정의

| 컬럼명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `SceneID` | string | O | 소속 씬 ID |
| `Order` | int | O | 선택지 노출 순서 |
| `Text` | string | O | 선택지 문구 |
| `FlagKey` | string |  | 선택 시 기록할 플래그 키 |
| `FlagValue` | string |  | 선택 시 기록할 플래그 값 |
| `NextScene` | string |  | 선택 후 이동할 씬 |
| `NextDialogue` | string |  | 같은 씬 내 이동할 대사 라벨 |

### 7-3. 작성 규칙

- `Text`는 반드시 작성한다.
- `FlagKey`만 있고 `FlagValue`가 비어 있으면 기본값 처리 여부를 기획에서 명확히 한다.
- `NextScene`과 `NextDialogue`는 목적이 다르므로 동시에 사용할 때 우선순위를 명확히 검수한다.

---

## 8. BranchTable

### 8-1. 역할

누적된 상태값을 기준으로 대화 종료 후 후속 씬을 결정하는 분기 테이블이다.

### 8-2. 컬럼 정의

| 컬럼명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `SceneID` | string | O | 소속 씬 ID |
| `Order` | int | O | 분기 평가 순서 |
| `FlagKey` | string | O | 검사할 플래그 키 |
| `FlagValue` | string | O | 비교할 값 |
| `NextScene` | string | O | 조건 일치 시 이동할 씬 |

### 8-3. 작성 규칙

- `Order`가 낮을수록 먼저 평가한다.
- 먼저 일치한 분기가 우선 적용된다.
- 조건 충돌이 있는지 반드시 검수한다.

---

## 9. EvidenceTable

### 9-1. 역할

씬에서 획득 가능한 단서 정보를 정의한다.

### 9-2. 컬럼 정의

| 컬럼명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `EvidenceID` | string | O | 단서 고유 ID |
| `SceneId` | string | O | 소속 씬 ID |
| `Trigger` | string / int | O | 획득 시점 |
| `Name` | string | O | 단서 이름 |
| `Description` | string |  | 단서 설명 |
| `Image` | string |  | 단서 이미지 경로 |

### 9-3. 트리거 값

| 값 | 의미 |
| --- | --- |
| `auto` 또는 `1` | 씬 진입 시 자동 획득 |
| `click` 또는 `2` | 대화 종료 시 획득 |

---

## 10. 공통 작성 규칙

### 10-1. 무시 규칙

- 시트명이 `$`로 시작하면 export 대상에서 제외한다.
- 컬럼명이 `$`로 시작하면 해당 컬럼은 무시한다.

### 10-2. ID 규칙

- `SceneID`, `EvidenceID`, `Label`, `FlagKey`는 가능한 한 중복 없이 관리한다.
- 기본 네이밍은 영문 소문자 + 언더스코어 기준으로 통일한다.

### 10-3. 경로 규칙

- 배경: `assets/bg/...`
- 초상화: `assets/portraits/...`
- 단서 이미지: `assets/items/...`
- BGM: `assets/sfx/...`

### 10-4. 검수 포인트

- 존재하지 않는 씬 ID를 참조하지 않는지 확인
- `Order` 값이 의도한 흐름 순서와 일치하는지 확인
- 분기 조건이 서로 충돌하지 않는지 확인
- 선택지 / 분기 / 대사 조건이 동일 플래그 체계를 기준으로 정리되어 있는지 확인

---

## 11. 노드형 에디터 구조

### 11-1. 운영 위치

- 메인 편집 도구: `EditorNode/`

### 11-2. 역할

노드형 에디터는 현재 프로젝트의 **주 작업 툴**이다.

역할은 다음과 같다.

- 씬 생성 / 삭제 / 이름 변경
- 씬 간 연결 구조 편집
- 선택지 연결 편집
- 분기 연결 편집
- 대사 / 선택지 / 분기 / 배경 정보 수정
- 전체 흐름 시각 검토

### 11-3. 기획상 의미

노드형 에디터는 단순 시각화 도구가 아니라, 현재 프로젝트에서 실제 기획 데이터를 다루는 중심 인터페이스다.

즉, 기획자는 노드형 에디터를 통해 다음 두 가지를 동시에 수행한다.

- 데이터 수정
- 구조 검토

### 11-4. 강점

| 항목 | 설명 |
| --- | --- |
| 흐름 파악 | 씬 간 연결 구조를 한눈에 볼 수 있음 |
| 분기 검토 | 선택지와 분기 연결을 시각적으로 추적 가능 |
| 수정 효율 | 연결 변경 시 표보다 빠르게 수정 가능 |
| 설계 검수 | 서사 구조의 비정상 흐름을 빠르게 발견 가능 |

---

## 12. 구형 카드형 에디터 정리

프로젝트 초기에 카드형 편집 UI를 실험했으나, 현재 작업 기준에서는 사용하지 않는다.

- 현재 기준 편집 도구는 `EditorNode/` 하나로 본다.
- 기존 카드형 에디터는 운영 대상에서 제외한다.
- 문서 / 구조 설계 기준도 노드형 에디터에 맞춘다.

---

## 13. xlsx의 현재 역할

`script.xlsx`는 이제 단순한 "절대 원본"이라기보다 다음 역할을 가진다.

| 역할 | 설명 |
| --- | --- |
| 백업 | 구조화된 테이블 백업본 |
| 검수 | generated xlsx와 비교하는 표 기반 검토 문서 |
| 공유 | 외부 공유 / 전달용 포맷 |
| 정리 | 대량 데이터 정리 및 비교 용도 |

즉, 메인 작업이 노드형 에디터나 `game_data.js`에서 진행되더라도, `xlsx`는 여전히 프로젝트 운영상 필요한 산출물이다.

---

## 14. 양방향 변환 구조

### 14-1. 필요성

기존 구조는 `xlsx -> game_data` 중심이었다.

하지만 현재는 노드형 에디터와 `game_data.js` 직접 수정이 메인 흐름이므로, 수정된 데이터를 다시 테이블 형태로 내보내는 기능이 필요하다.

즉, 앞으로의 기준은 다음과 같다.

```text
xlsx -> game_data
game_data -> generated xlsx
```

또는 실질적으로는 아래와 같이 이해할 수 있다.

```text
Node Editor / direct edit -> game_data -> generated xlsx
```

### 14-2. 목적

- 노드형 에디터 또는 `game_data.js`에서 편집한 결과를 테이블 문서로 복원
- 검수 / 공유 / 백업이 가능한 문서 형태 유지
- 메인 편집 툴과 문서 포맷 사이의 단절 해소

### 14-3. 운영 원칙

- 편집의 중심은 노드형 에디터와 `game_data.js`
- 결과 정리와 검수는 generated xlsx 및 필요 시 `script.xlsx`
- 양쪽 포맷은 상호 변환 가능해야 함

---

## 15. 최종 정리

현재 `경성뎐`의 데이터 시스템은 다음 방향으로 이해하면 된다.

- 데이터 단위는 Scene / Dialogue / Choice / Branch / Evidence 테이블로 분리한다.
- 실제 메인 편집은 `EditorNode`와 `game_data.js` 중심으로 진행한다.
- `xlsx`는 백업 / 검수 / 공유용 테이블 산출물로 유지한다.
- `game_data.js`는 현재 실질적인 메인 반영 원본이다.
- 따라서 시스템은 `노드형 에디터 + game_data 중심 + generated xlsx 검수` 구조를 기준으로 발전한다.
---

## 확장 현황

### 완료된 확장

`export_to_json.py`에서 이미 처리 중인 항목:

- `CharacterTable` → `game_data.characters`
- `CharacterEmotionTable` → `game_data.character_emotions`
- `DialogTable.Label` → 대사 라벨, 같은 씬 내 점프 기준
- `DialogTable.SpeakerID`, `EmotionType`, `StandingSlot`, `FocusType`, `EnterMotion`, `ExitMotion`, `IdleMotion`, `FxType` → 선택 컬럼, 있을 때만 포함
- `ChoiceTable.NextDialogue` → 같은 씬 내 대사 라벨 점프

xlsx에 해당 시트/컬럼이 없으면 export 시 생략되므로, 순차적으로 추가 가능.

### 다음 단계

- `조사 우선순위 시스템` (PriorityGroup/Budget/Cost 계열 컬럼) → 현재 [TABLE_SPEC.md](/G:/GSD/content/docs/system/core/TABLE_SPEC.md)와 runtime 구현 기준
- 스탠딩/포커스 UI 렌더러 구현
- CharacterTable / CharacterEmotionTable xlsx 시트 실제 작성

상세 스키마와 확장 구조는 현재 [TABLE_SPEC.md](/G:/GSD/content/docs/system/core/TABLE_SPEC.md) 기준

---

## 구조 정리 예정 메모

현재 구조는 `CharacterTable`, `CharacterEmotionTable`이 이미 들어온 상태지만, `Dialogue`가 여전히 일부 캐릭터 정보를 중복 보관한다.

대표 중복:

- `Speaker` + `SpeakerID`
- `Portrait` + `SpeakerID/EmotionType`
- `ConditionKey` + 향후 `ConditionFlagID`

또한 `Flag`는 별도 정의 테이블 없이 사용처에만 흩어져 있다.

다음 구조 정리의 기준은 이렇다.

- `FlagTable`을 추가해 상태 변수를 정의형 데이터로 관리
- `Dialogue`는 캐릭터 정체성을 다시 저장하지 않고 `SpeakerID` 중심으로 참조
- 이미지 결정은 `CharacterEmotionTable` 기준으로 수렴
- 선택지/분기/조건은 `FlagID` 기준으로 통일

상세 계획:

- [TABLE_SPEC.md](/G:/GSD/content/docs/system/core/TABLE_SPEC.md)
