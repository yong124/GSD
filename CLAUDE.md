# 경성뎐: 여급 실종사건 — 프로젝트 가이드

## 프로젝트 구조

```text
G:/GSD/
├── game/                              # 실제 플레이어용 게임
│   ├── index.html
│   ├── css/
│   ├── js/
│   │   └── engine/
│   ├── data/
│   │   ├── game_data.js               # 런타임 데이터
│   │   └── prompts.md                 # 에셋 생성 프롬프트
│   └── assets/
│       ├── bg/
│       ├── portraits/
│       ├── items/
│       ├── ev/
│       └── sfx/
├── EditorNode/                        # 메인 노드형 에디터
│   ├── index.html
│   ├── editor.js
│   └── editor.css
├── content/
│   ├── data/
│   │   ├── script.xlsx
│   │   └── script 백업.xlsx
│   ├── generated/
│   │   ├── script.generated.xlsx
│   │   └── script.generated_delimited/
│   ├── tools/
│   │   ├── export_to_json.py
│   │   ├── json_to_generated_xlsx.py
│   │   └── run_export.bat
│   ├── docs/
│   │   ├── editor/
│   │   ├── portfolio/
│   │   └── system/
│   │       ├── core/
│   │       ├── scenario/
│   │       ├── writing/
│   │       └── characters/
│   └── archive/
└── 경성뎐_GDD_v1.docx
```

---

## 현재 운영 기준

- 메인 편집 도구: `EditorNode/`
- 원본 테이블: `content/data/script.xlsx`
- 런타임 데이터: `game/data/game_data.js`
- xlsx → game_data 변환: `content/tools/export_to_json.py`
- game_data → generated xlsx 변환: `content/tools/json_to_generated_xlsx.py`

현재 운영 방향은 다음과 같다.

```text
EditorNode ↔ game_data ↔ xlsx → 게임 런타임
```

즉, 실무상 메인 작업은 `EditorNode`와 `game_data` 중심으로 진행하고,
`script.xlsx`는 원본 테이블이자 대량 수정 / 검수 / 공유용 포맷으로 함께 운용한다.

---

## 데이터 수정 원칙

### 기본 원칙

- 구조 편집과 일반 데이터 수정은 `EditorNode`를 우선한다.
- 테이블 검수, 대량 편집, 복붙 작업은 `script.xlsx`와 generated xlsx를 사용한다.
- generated 파일은 원본이 아니라 보조 산출물이다.

### game_data.js 직접 수정 원칙

- 원칙적으로 `game_data.js`는 런타임 반영 파일이다.
- 다만 현재 프로젝트는 시나리오 밀도 조정, 캐릭터성 보강, 관계 아크 반영처럼 **빠른 서사 반복 작업**이 필요하므로, 이 경우 `game_data.js`를 직접 수정할 수 있다.
- 직접 수정 후에는 필요 시 generated xlsx를 다시 뽑아 `script.xlsx` 검수 흐름으로 되돌린다.
- `export_to_json.py`를 다시 실행하면 `game_data.js`가 덮어써질 수 있으므로, 어떤 파일을 기준으로 작업 중인지 항상 의식한다.

---

## 실행 기준

```bash
# 게임
python -m http.server 3900
# http://localhost:3900/game/index.html

# 노드형 에디터
python -m http.server 3901
# http://localhost:3901/EditorNode/index.html
```

---

## 문서 읽기 우선순위

### 시스템 기준 문서

- `content/docs/system/core/WORLDVIEW_BIBLE.md`
- `content/docs/system/core/DATA_STRUCTURE.md`
- `content/docs/system/core/TABLE_SPEC.md`
- `content/docs/system/core/NARRATIVE_SYSTEM_DESIGN.md`
- `content/docs/system/core/NARRATIVE_VARIABLE_SPEC.md`

### 시나리오 기준 문서

- `content/docs/system/scenario/SCENARIO_STORY_BIBLE.md`
- `content/docs/system/scenario/SCENARIO_DENSITY_PRINCIPLES.md`

### 문체 기준 문서

- `content/docs/system/writing/DIALOGUE_PERIOD_TONE_GUIDE.md`

### 캐릭터 기준 문서

- `content/docs/system/characters/CHARACTER_ARCS_INDEX.md`
- `content/docs/system/characters/REL_INDEX.md`

---

## 서사 작성 기준

- 배경은 `1930년대 경성`, `식민지 현실`, `기록과 삭제`, `사이비 종교`, `초자연 감응`이 겹친 구조다.
- 유웅룡은 처음부터 따뜻한 기자가 아니라 `냉소적이고 비판적인 관찰자`에 가깝다.
- 캐릭터 변화는 갑작스러운 개심보다 `균열`, `버팀`, `책임의 선택`으로 느껴져야 한다.
- 선택지는 정보 버튼보다 `태도`, `관계`, `기록할 것과 덮을 것의 선택`처럼 읽혀야 한다.
- 선택 후 바로 씬이 바뀌기보다, 가능하면 `반응 대화 -> 다음 전개` 구조를 우선 검토한다.
- 분량을 늘리는 것보다 장면 밀도, 감정 회수, 반복 모티프의 누적을 우선한다.

---

## 데이터 키 / 표기 기준

- 시스템 변수와 플래그 키는 `PascalCase`를 사용한다.
  - 예: `InvestigationScore`, `SongsoonTrust`, `ResonanceLevel`, `CalledEditor`
- `SceneID`는 기존처럼 영문 소문자 + 언더스코어를 유지한다.
  - 예: `ch4b_cafe_press`
- 에셋 경로는 현재 실제 폴더 구조를 따른다.
  - 배경: `assets/bg/...`
  - 초상화: `assets/portraits/...`
  - 단서 이미지: `assets/items/...` 또는 `assets/ev/...`
  - 음악: `assets/sfx/...`

---

## 엔진 / 데이터 구조 요약

`window.GAME_DATA`의 핵심 구조는 다음과 같다.

```js
window.GAME_DATA = {
  first_scene: "scene_id",
  characters: {
    "CharacterID": {
      id, display_name, default_emotion_type, default_image_path
    }
  },
  character_emotions: {
    "CharacterID": {
      "EmotionType": "assets/portraits/..."
    }
  },
  scenes: {
    "scene_id": {
      id,
      chapter,
      title,
      background,
      music,
      next_scene,
      effect,
      branches: [
        { order, flag_key, flag_value, next_scene }
      ],
      dialogues: [
        // 필수: order, speaker, text, style, portrait, condition
        // 선택: label, speaker_id, emotion_type, standing_slot, focus_type,
        //        enter_motion, exit_motion, idle_motion, fx_type
        { order, label, speaker, text, style, portrait, condition }
      ],
      choices: [
        { order, text, flag_key, flag_value, next_scene, next_dialogue }
      ],
      evidence: [
        { evidence_id, trigger, name, description, image }
      ]
    }
  }
}
```

엔진 진행 흐름의 핵심은 아래다.

- `Scene.load(id)`
- branch 확인
- `Dialogue.start(lines)`
- 대화 종료 후 evidence / choice 처리
- 후속 `next_scene` 또는 branch 이동

---

## 에디터 기준

- 메인 편집 UI는 `EditorNode/` 하나로 본다.
- 예전 카드형 `editor/`는 더 이상 운영 대상이 아니다.
- `EditorNode`는 단순 뷰어가 아니라 아래를 함께 담당한다.
  - 씬 구조 편집
  - 대사 / 선택지 / 분기 / 단서 수정
  - 검색 / 필터
  - 구조 검수
  - 프리뷰
  - generated xlsx 연동용 데이터 검토

---

## 한글 파일 확인 규칙

터미널에서 한글이 깨져 보이면 **파일 손상으로 바로 판단하지 말고 먼저 환경 문제를 의심한다.**

PowerShell에서 한글 파일을 확인할 때는 아래 조합을 사용한다.

```powershell
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Get-Content '경로' -Encoding utf8
```

한글이 깨져 보이는 경우에도, 실제 파일은 정상 UTF-8일 수 있다.

---

## 주의사항

- `main.css`의 `@import`는 첫 줄에 와야 한다.
- `game_data.js`와 `script.xlsx` 중 어느 쪽을 기준으로 작업 중인지 항상 명확히 한다.
- generated xlsx는 복붙 / 검수용이지 장기 원본이 아니다.
- 문서 구조가 이미 커졌기 때문에, 새 문서를 만들 때는 `core / scenario / writing / characters / editor / portfolio` 중 어디에 속하는지 먼저 결정한다.
