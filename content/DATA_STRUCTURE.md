# 경성뎐 데이터 구조

현재 프로젝트의 데이터 구조를 실제 코드 기준으로 정리한 문서다.

- 원본 입력: `content/script.xlsx`
- 변환 스크립트: `content/export_to_json.py`
- 결과물: `game/data/game_data.js`

`game_data.js`는 직접 수정하지 않고, `script.xlsx`를 수정한 뒤 `export_to_json.py`로 다시 생성하는 것을 기준으로 한다.

## 전체 구조

```js
window.GAME_DATA = {
  first_scene: "scene_id",
  scenes: {
    "scene_id": {
      id: "scene_id",
      chapter: 1,
      title: "씬 제목",
      background: "assets/bg/...",
      music: "assets/sfx/...",
      next_scene: "next_scene_id",
      effect: "flicker",
      branches: [],
      dialogues: [],
      choices: [],
      evidence: []
    }
  }
};
```

## 최상위 필드

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `first_scene` | `string \| null` | 게임 시작 시 첫 진입 씬 ID |
| `scenes` | `Record<string, Scene>` | 씬 ID를 키로 가지는 씬 맵 |

## Scene

각 씬은 하나의 장면 단위이며, 대사/선택지/분기/단서를 모두 포함한다.

```js
{
  id: "ch1_court",
  chapter: 1,
  title: "법정",
  background: "assets/bg/court.jpeg",
  music: "assets/sfx/tense.mp3",
  next_scene: "ch1_editor",
  effect: null,
  branches: [Branch],
  dialogues: [Dialogue],
  choices: [Choice],
  evidence: [Evidence]
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `string` | 씬 고유 ID |
| `chapter` | `number \| null` | 챕터 번호 |
| `title` | `string \| null` | 씬 제목 |
| `background` | `string \| null` | 배경 이미지 경로 |
| `music` | `string \| null` | BGM 경로 |
| `next_scene` | `string \| null` | 기본 다음 씬 |
| `effect` | `string \| number \| null` | 씬 진입 시 효과 |
| `branches` | `Branch[]` | 플래그 기반 분기 목록 |
| `dialogues` | `Dialogue[]` | 대사 목록 |
| `choices` | `Choice[]` | 선택지 목록 |
| `evidence` | `Evidence[]` | 단서 목록 |

## Dialogue

대사 라인은 `order` 순으로 정렬된다. 조건부 대사는 `condition`이 있을 때만 노출된다.

```js
{
  order: 1,
  label: "intro_a",
  speaker: "유우",
  text: "대사 내용",
  style: "normal",
  portrait: "assets/portraits/yuu.jpeg",
  condition: {
    flag_key: "editor_rel",
    flag_value: 1
  }
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `order` | `number` | 씬 내 대사 순서 |
| `label` | `string` | 특정 대사 지점 점프용 라벨. 없으면 생략 |
| `speaker` | `string` | 화자 이름. 비어 있으면 내레이션처럼 처리됨 |
| `text` | `string` | 대사 본문 |
| `style` | `string` | `normal`, `narration`, `thought`, `crazy`, `scared`, `magic` |
| `portrait` | `string \| null` | 초상화 경로 |
| `condition` | `Condition \| null` | 조건부 표시용 플래그 조건 |

### Condition

```js
{
  flag_key: "editor_rel",
  flag_value: 1
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `flag_key` | `string` | 읽을 플래그 키 |
| `flag_value` | `string \| number \| boolean \| Array` | 일치 조건 값 |

런타임에서는 `State.getFlag(flag_key)` 값이 `flag_value`와 일치할 때만 해당 대사가 표시된다.

## Choice

선택지는 플레이어가 누르는 버튼이며, 플래그를 기록하고 씬 이동 또는 같은 씬 내 대사 점프를 유도한다.

```js
{
  order: 1,
  text: "편집장의 말을 따른다",
  flag_key: "flag_editor_response",
  flag_value: "A",
  next_scene: "ch2_hospital",
  next_dialogue: "editor_followup"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `order` | `number` | 선택지 순서 |
| `text` | `string` | 버튼 텍스트 |
| `flag_key` | `string \| null` | 선택 시 기록할 플래그 키 |
| `flag_value` | `string \| number \| boolean \| null` | 기록할 값. 없으면 런타임에서 `true` 사용 |
| `next_scene` | `string \| null` | 선택 후 이동할 다음 씬 |
| `next_dialogue` | `string` | 같은 씬 안에서 점프할 대사 라벨. 없으면 생략 |

런타임 동작 우선순위는 다음과 같다.

1. `flag_key`가 있으면 `State.setFlag(flag_key, flag_value ?? true)` 실행
2. `next_scene`가 있으면 해당 씬으로 이동
3. `next_dialogue`가 있으면 같은 씬의 해당 라벨 대사부터 재시작
4. 둘 다 없으면 씬의 `resolveNextScene(scene)` 결과 사용

## Branch

브랜치는 대화 종료 후 다음 씬을 정할 때 사용되는 조건 목록이다.

```js
{
  order: 1,
  flag_key: "ending_a_score",
  flag_value: 2,
  next_scene: "ch6_epilogue_truth"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `order` | `number` | 평가 순서 |
| `flag_key` | `string` | 검사할 플래그 키 |
| `flag_value` | `string \| number \| boolean \| Array \| null` | 비교 값 |
| `next_scene` | `string` | 조건 일치 시 이동할 씬 |

런타임에서는 `branches`를 순서대로 검사하고, 첫 번째로 일치한 `next_scene`을 반환한다. 일치하는 항목이 없으면 씬의 `next_scene`을 사용한다.

## Evidence

단서는 씬 단위로 연결되며, 자동 수집 또는 대화 종료 시 수집된다.

```js
{
  evidence_id: "ev_note",
  trigger: "auto",
  name: "붉은 쪽지",
  description: "토요일, 낙원. 그녀가 노래하면, 문은 열린다.",
  image: "assets/items/note.png"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `evidence_id` | `string` | 단서 고유 ID |
| `trigger` | `string \| number` | `auto` 또는 `1`, `click` 또는 `2` |
| `name` | `string` | 단서 이름 |
| `description` | `string` | 단서 설명 |
| `image` | `string \| null` | 단서 이미지 경로 |

런타임 규칙:

- `auto` 또는 `1`: 씬 진입 시 자동 획득
- `click` 또는 `2`: 대화 종료 후 획득

## Excel 입력 시트 기준

`export_to_json.py`는 아래 시트 구조를 읽어 현재 JSON 구조로 변환한다.

### SceneTable / Scenes

| 컬럼 | 설명 |
| --- | --- |
| `SceneID` | 씬 ID |
| `Chapter` | 챕터 번호 |
| `Title` | 씬 제목 |
| `Background` | 배경 경로 |
| `Music` | BGM 경로 |
| `NextScene` | 기본 다음 씬 |
| `Effect` | 진입 효과 |

### DialogTable / Dialogues

| 컬럼 | 설명 |
| --- | --- |
| `SceneID` | 소속 씬 |
| `Order` | 순서 |
| `Label` | 대사 라벨 |
| `Speaker` | 화자 |
| `Text` | 대사 |
| `Style` | 스타일 |
| `Portrait` | 초상화 경로 |
| `ConditionKey` | 조건 플래그 키 |
| `ConditionValue` | 조건 플래그 값 |

### ChoiceTable / Choices

| 컬럼 | 설명 |
| --- | --- |
| `SceneID` | 소속 씬 |
| `Order` | 순서 |
| `Text` | 선택지 문구 |
| `FlagKey` | 선택 시 기록할 플래그 키 |
| `FlagValue` | 선택 시 기록할 플래그 값 |
| `NextScene` | 다음 씬 |
| `NextDialogue` | 같은 씬 내 점프할 대사 라벨 |

### BranchTable / Branches

| 컬럼 | 설명 |
| --- | --- |
| `SceneID` | 소속 씬 |
| `Order` | 분기 평가 순서 |
| `FlagKey` | 검사할 플래그 키 |
| `FlagValue` | 검사할 값 |
| `NextScene` | 조건 일치 시 이동할 씬 |

### EvidenceTable / Evidence

| 컬럼 | 설명 |
| --- | --- |
| `EvidenceID` | 단서 ID |
| `SceneId` | 소속 씬 |
| `Trigger` | 수집 시점 |
| `Name` | 단서 이름 |
| `Description` | 단서 설명 |
| `Image` | 이미지 경로 |

## 주의사항

- 시트명이 `$`로 시작하면 export 대상에서 제외된다.
- 컬럼명이 `$`로 시작하면 해당 컬럼은 무시된다.
- `game_data.js`는 생성 결과물이므로 직접 수정하지 않는다.
- `Dialogue.condition.flag_value`와 `Branch.flag_value`는 런타임에서 배열도 비교 가능하도록 작성되어 있다.
