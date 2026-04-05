# script.xlsx 시트 확장안

## 목적

이 문서는 `content/data/script.xlsx`를 실제로 손볼 때, 어떤 시트에 어떤 컬럼을 추가해야 하는지를 바로 따라갈 수 있게 정리한 작업 문서다.

기준은 다음과 같다.

- 가능한 것은 기존 테이블에 병합한다
- 독립 메타 데이터만 새 시트로 분리한다
- 1차 적용안과 2차 적용안을 분리한다

---

## 1차 적용 원칙

이번 라운드에서 먼저 손대기 좋은 것은 아래 4개다.

1. `SceneTable` 목표 컬럼 추가
2. `CharacterTable` 수첩 요약 컬럼 추가
3. `EvidenceTable` 카테고리 컬럼 추가
4. `QuestionTable` 신설

이 4개만으로도 현재 조사 수첩의 하드코딩 상당수를 데이터로 옮길 수 있다.

---

## 1. SceneTable

## 현재 컬럼

- `SceneID`
- `Chapter`
- `Title`
- `Background`
- `Music`
- `Effect`
- `NextScene`

## 1차 추가 컬럼

- `GoalKicker`
- `GoalText`

## 예시

| SceneID | Title | GoalKicker | GoalText |
| --- | --- | --- | --- |
| `ch2_cafe` | 찻잔 밑의 허밍 | `현재 목표` | `세 갈래 이야기 중 무엇을 먼저 파고들지 정한다.` |
| `ch5_ritual_room` | 의례의 방 | `문턱 조사` | `의식의 구조와 흔적을 확인하고 다음 결단으로 넘어간다.` |

## 메모

- 이 컬럼은 HUD와 조사 수첩이 같이 읽는다.
- 씬 단위 메타이므로 별도 시트로 빼지 않는다.

---

## 2. CharacterTable

## 현재 컬럼

- `CharacterID`
- `DisplayName`
- `DefaultEmotionType`
- `DefaultImagePath`

## 1차 추가 컬럼

- `RoleText`
- `NotebookSummary1`
- `NotebookSummary2`

## 예시

| CharacterID | DisplayName | RoleText | NotebookSummary1 | NotebookSummary2 |
| --- | --- | --- | --- | --- |
| `Songsoon` | 송순 | 증언자 | 낙원 안쪽 사정을 알고 있지만 쉽게 입을 열지 않는다. | 신뢰를 얻을수록 더 깊은 증언에 접근할 수 있다. |
| `Ipangyu` | 이판규 | 문턱의 죄수 | 광기와 교리 사이를 오가며 사건의 단어를 흘린다. | 헛소리처럼 들리지만 사건의 방향을 먼저 암시한다. |

## 메모

- 지금 `CHARACTER_NOTES`에 있는 하드코딩을 여기에 옮긴다.
- 1차는 요약 2줄까지만 두는 게 좋다.

---

## 3. EvidenceTable

## 현재 컬럼

- `EvidenceID`
- `SceneId`
- `Trigger`
- `Name`
- `Description`
- `Image`

## 1차 추가 컬럼

- `CategoryID`
- `CategoryTitle`
- `CategoryHint`

## 권장 CategoryID

- `ritual`
- `record`
- `trace`

## 예시

| EvidenceID | Name | CategoryID | CategoryTitle | CategoryHint |
| --- | --- | --- | --- | --- |
| `EvDiary` | 송금의 일기장 | `record` | 기록과 기사 | 지워졌거나 남겨진 문장들 |
| `EvBlueHanbok` | 푸른 천 조각 | `ritual` | 의례와 공명 | 문, 무녀, 감응과 연결된 흔적 |

## 메모

- 현재 정규식 기반 분류를 이 컬럼 기반으로 바꾸면 된다.
- 카테고리 개수가 적기 때문에 별도 `EvidenceCategoryTable`은 1차엔 불필요하다.

---

## 4. QuestionTable

## 1차 신설 시트

질문은 씬, 인물, 단서 어디에도 자연스럽게 속하지 않으므로 새 시트로 만든다.

## 1차 권장 컬럼

- `QuestionID`
- `Title`
- `Detail`
- `SortOrder`
- `Category`
- `VisibleRuleID`
- `StateRuleID`

## 예시

| QuestionID | Title | Detail | SortOrder | Category | VisibleRuleID | StateRuleID |
| --- | --- | --- | --- | --- | --- | --- |
| `QIpangyuCall` | 이판규는 누구에게 불려갔는가 | 광기처럼 보이는 말들이 실제로는 사건의 중심을 향한 반응일 수 있다. | `10` | `Witness` | `QR_IpangyuSeen` | `QS_IpangyuCall` |
| `QSonggeumMissing` | 송금은 왜 사라졌는가 | 송금이 자발적으로 사라진 것인지, 의식의 일부로 지워진 것인지가 핵심이다. | `20` | `Missing` | `QR_SonggeumOpen` | `QS_SonggeumMissing` |

## 메모

- `VisibleRuleID`, `StateRuleID`는 처음엔 문자열 참조만 두고, 실제 규칙 테이블은 2차에서 붙여도 된다.
- 1차엔 코드에서 `RuleID -> 하드코딩 규칙` 매핑으로 버티는 것도 가능하다.

---

## 2차 적용 후보

## 5. StateDescriptorTable

공명/신뢰/조사 상태를 UI 문구로 치환하는 시트.

### 권장 컬럼

- `DescriptorID`
- `TargetFlagID`
- `MinValue`
- `MaxValue`
- `Label`
- `Detail`

### 예시

| DescriptorID | TargetFlagID | MinValue | MaxValue | Label | Detail |
| --- | --- | --- | --- | --- | --- |
| `SD_Resonance_0` | `ResonanceLevel` | `0` | `0` | 안정 | 아직은 현실 감각이 우세한 상태입니다. |
| `SD_Resonance_1` | `ResonanceLevel` | `1` | `1` | 전조 | 조사 과정 곳곳에서 공명의 낌새가 드러납니다. |
| `SD_Trust_2` | `SongsoonTrust` | `2` | `99` | 신뢰 | 송순이 등을 돌리지 않고 같은 방향을 보고 있습니다. |

## 메모

- 2차부터 넣는 게 좋다.
- 조사 수첩과 HUD가 같은 시트를 읽게 만들 수 있다.

---

## 3차 적용 후보

## 6. RuleTable

질문 노출, 질문 상태, 인물 노출 같은 조건식을 일반화하고 싶을 때 도입한다.

### 권장 컬럼 예시

- `RuleID`
- `GroupID`
- `FlagID`
- `Operator`
- `Value`
- `JoinType`

## 메모

- 처음부터 넣으면 과설계가 될 가능성이 높다.
- 1차는 `QuestionTable.VisibleRuleID`, `QuestionTable.StateRuleID`만 준비하고, 실제 규칙 테이블은 나중에 붙이는 편이 안전하다.

---

## 실제 작업 순서

### Step 1

`SceneTable`, `CharacterTable`, `EvidenceTable`에 컬럼 추가

### Step 2

`QuestionTable` 새 시트 추가

### Step 3

`export_to_json.py`, `json_to_generated_xlsx.py`, `validate_game_data.py` 확장

### Step 4

런타임에서 아래 하드코딩 제거

- `CHARACTER_NOTES`
- `getEvidenceCategory`
- `getCurrentSceneGoal`
- `getQuestionEntries`

### Step 5

이후 필요하면 `StateDescriptorTable` 추가

---

## 1차 시트 체크리스트

- `SceneTable`에 `GoalKicker`, `GoalText` 추가
- `CharacterTable`에 `RoleText`, `NotebookSummary1`, `NotebookSummary2` 추가
- `EvidenceTable`에 `CategoryID`, `CategoryTitle`, `CategoryHint` 추가
- `QuestionTable` 시트 생성

---

## 결론

지금 `script.xlsx`에서 바로 손대기 좋은 범위는 다음 네 가지다.

1. `SceneTable` 목표 컬럼 확장
2. `CharacterTable` 수첩 요약 컬럼 확장
3. `EvidenceTable` 카테고리 컬럼 확장
4. `QuestionTable` 신설

이 4개가 먼저 들어가면, 현재 조사 수첩 UI에서 가장 큰 하드코딩을 데이터 쪽으로 옮길 수 있다.
