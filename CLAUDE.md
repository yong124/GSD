# 경성뎐: 여급 실종사건 — 프로젝트 가이드

## 프로젝트 개요

- 1930년대 경성 배경의 미스터리 조사 ADV. 브라우저 정적 게임(`game/`)과 노드형 저작 도구(`EditorNode/`)를 함께 개발한다.
- 순수 정적 파일 구성이라 빌드 없이 로컬 HTTP 서버만 있으면 돌아간다.
- 게임 외에 포트폴리오 제출물 축(`content/docs/portfolio/`)이 병행된다.
- 작업 우선순위는 항상 이 순서다:
  1. 플레이가 실제로 진행되는가
  2. 선택과 상태 변화가 읽히는가
  3. UI와 연출이 그 변화를 전달하는가
  4. 그다음 문장 밀도와 감정 정리

## 프로젝트 구조

```text
G:/GSD/
├── game/                              # 실제 플레이어용 게임
│   ├── index.html                     # 모든 JS/CSS를 ?v= 쿼리로 로드
│   ├── css/                           # main.css / dialogue.css / effects.css
│   ├── js/
│   │   ├── config.js
│   │   ├── main.js
│   │   ├── core/                      # engine.js
│   │   ├── managers/                  # ui.js / audio.js / input.js / effects.js
│   │   └── engine/                    # scene / dialogue / choice / evidence / state / save
│   ├── data/
│   │   ├── game_data.js               # 런타임 데이터 번들 (게임이 로드하는 파일)
│   │   ├── tables/                    # 테이블별 분리 JSON (EditorNode가 로드하는 파일)
│   │   └── prompts.md                 # 에셋 생성 프롬프트
│   └── assets/                        # bg / portraits / items / ev / sfx
├── EditorNode/                        # 메인 노드형 에디터 (index.html / editor.js / editor.css)
├── content/
│   ├── data/script.xlsx               # 원본 테이블 (현재는 검수/공유용에 가까움)
│   ├── generated/                     # script.generated.xlsx 등 보조 산출물
│   ├── tools/                         # 파이프라인·검증·QA 스크립트 (아래 참조)
│   ├── docs/                          # editor / portfolio / system(core·scenario·writing·characters)
│   └── archive/
├── .claude/                           # rules / skills / commands
├── .qa-node/                          # Playwright QA 러너 (scene_boot_check.js 등)
├── .qa-artifacts/                     # QA 결과 JSON/스크린샷 (임시 산출물)
├── start_editor_server.bat            # 포트 8000으로 서버 띄우고 EditorNode 열기
└── 경성뎐_GDD_v1.docx
```

`content/docs/` 이하는 git 추적 대상이 아니다(로컬에만 존재). 문서를 지우거나 옮길 때 git이 지켜주지 않는다는 점을 의식한다.

---

## 소스 오브 트루스와 파이프라인

- 런타임 소스 오브 트루스: `game/data/game_data.js`. 게임(`game/index.html`)은 이 파일 하나만 로드한다.
- `game/data/tables/*.json`은 같은 데이터를 테이블 단위로 분리한 것이다. EditorNode는 이 tables를 로드해서 편집하고, 저장 시 **tables JSON과 game_data.js를 함께** 기록한다.
- 흐름 요약:

```text
EditorNode ↔ tables/*.json + game_data.js  →  게임 런타임
game_data.js → split_game_data.py → tables/*.json   (수동 분리 갱신)
game_data.js → json_to_generated_xlsx.py → generated xlsx   (검수/공유용)
script.xlsx → export_to_json.py → game_data.js   (구형 방향. 실행하면 game_data.js가 덮어써짐 — 주의)
```

- `content/tools/` 주요 스크립트:
  - `validate_game_data.py` — 구조 검수 (first_scene, 참조 씬, order/label 중복 등). 오류 시 exit 1.
  - `split_game_data.py` — game_data.js → tables JSON 분리.
  - `json_to_generated_xlsx.py` — 검수용 xlsx 생성.
  - `export_to_json.py` — xlsx → game_data.js. **game_data.js를 통째로 덮어쓴다.**
  - `check_story_flow.py`, `run_browser_playtest_*.ps1` — 보조/레거시 QA.
- `game_data.js`를 직접 수정했으면, 다음 EditorNode 세션이 낡은 tables를 읽지 않도록 `split_game_data.py`로 tables도 갱신한다.

## 데이터 수정 원칙

- 구조 편집과 일반 데이터 수정은 `EditorNode`를 우선한다.
- 테이블 검수, 대량 편집, 복붙 작업은 `script.xlsx`와 generated xlsx를 사용한다. generated 파일은 원본이 아니라 보조 산출물이다.
- 시나리오 밀도 조정, 캐릭터성 보강, 관계 아크 반영 같은 **빠른 서사 반복 작업**은 `game_data.js` 직접 수정을 적극 허용한다.
- 직접 수정 후에는 필요 시 generated xlsx를 다시 뽑아 검수 흐름으로 되돌린다.
- 어떤 파일(`game_data.js` / tables / `script.xlsx`)을 기준으로 작업 중인지 항상 먼저 명확히 한다.
- 한국어 텍스트 수정은 Edit 도구(정확 문자열 패치)로 한다. PowerShell/shell 인라인 문자열로 한국어를 삽입하면 실제 `???` 손상을 만들 수 있으므로 금지.

---

## 실행 / QA 기준

```powershell
# 게임 + 브라우저 QA 기준 서버 (QA 스크립트들이 이 포트를 가정한다)
cd G:\GSD\game
py -m http.server 4173
# http://127.0.0.1:4173/index.html

# 에디터: 루트에서 start_editor_server.bat 실행 (포트 8000)
# http://localhost:8000/EditorNode/index.html
```

- 브라우저 QA는 `.qa-node/` 러너를 가벼운 것부터 쓴다: `scene_boot_check.js` → `scene_choice_runner.js` → `evidence_choice_runner.js` → `qa_fast_batch.js` → (실패 씬만) `scene_choice_audit.js`. 상세는 `gsd-browser-qa` 스킬.
- `ERR_CONNECTION_REFUSED`는 대부분 로컬 서버가 죽은 것이지 런타임 버그가 아니다.
- 브라우저 로드 JS/CSS를 수정했으면 `game/index.html`의 해당 `?v=` 버전을 반드시 올린다. "수정했는데 반영이 안 보임"의 첫 번째 용의자는 캐시다.

---

## 데이터 스키마 요약 (2026-07 기준 실측)

`window.GAME_DATA`의 top-level 키는 13개다:

```text
first_scene, characters, character_emotions,
choice_groups, conditions, evidence_categories,
investigations, questions, state_descriptors,
gauges, gauge_states, effects, scenes
```

씬 구조 (실제 사용 중인 키):

```js
scenes: {
  "scene_id": {
    id, chapter, title, background, music, effect,
    branches: [ { branch_id, order, condition_group_id, next_scene } ],
    dialogues: [
      // 필수: order, text, style
      // 선택: dialog_id(대사 점프 라벨), speaker_id, emotion_type, standing_slot,
      //        focus_type, enter_motion, exit_motion, idle_motion, fx_type,
      //        condition_group_id, effect_group_id
    ],
    choices: [
      // 필수: order, choice_id, text, next_type, next_id
      // 선택: type, kicker, impact_text, choice_group_id, condition_group_id,
      //        effect_group_id, evidence_id, reward_state_id, reward_value, reward_mode
    ],
    evidence: [ { evidence_id, trigger, name, description, image } ],
    // 증거 제출 확장
    evidence_choices, evidence_dialogues, evidence_prompt_title, evidence_prompt_hint,
    // 조사 루프 확장 (예산·분기 대사는 investigations 테이블이 가짐)
    investigation_id,
    // 씬 목표 HUD
    goal_kicker, goal_text
  }
}
```

조사 씬은 `scene.investigation_id → investigations[]` 참조로 돌아간다.
`investigations` 항목: `investigation_id, title, hint, budget, choice_group_id, priority_dialogues`.

### 새 모델이 자주 틀리는 지점 (하드 룰)

- `next_type` 값은 `"Scene"` 또는 **`"Dialog"`** 다. `"Dialogue"`가 아니다. 오타 하나로 분기 점프가 통째로 죽는다.
- 대사 점프 라벨 필드는 `dialog_id`다. `label`이라는 필드는 없다.
- `next_type: "Dialog"`의 `next_id`는 문맥에 따라 `dialogues[].dialog_id`, `investigations[].priority_dialogues`의 키, `scene.evidence_dialogues`의 키 중 하나와 매칭되어야 한다.
- 조사 선택지는 기본 `next_type: "Dialog"`. `"Scene"`으로 두면 분기 대사가 재생되지 않는다.
- 고아 씬 탐지 시 choices의 `next_id`(Scene 타입), branches의 `next_scene`을 모두 참조로 간주한다.
- EditorNode 저장은 tables와 game_data.js **동시 기록**이다. 한쪽만 고치고 끝내지 않는다.

엔진 진행 흐름:

- `Scene.load(id)` → branch 확인 → `Dialogue.start(lines)` → 대사 종료 후 evidence / choice 처리
- 런타임 축: Character/CharacterEmotion 화자·이미지 참조, StandingSlot/FocusType/Motion/Fx 스테이징, investigation budget 조사 루프, 3슬롯 저장/불러오기, HUD/장면 목표/메모 배지/선택 결과 토스트

---

## 서사 작성 기준

- 배경은 `1930년대 경성`, `식민지 현실`, `기록과 삭제`, `사이비 종교`, `초자연 감응`이 겹친 구조다.
- 유웅룡은 처음부터 따뜻한 기자가 아니라 `냉소적이고 비판적인 관찰자`에 가깝다.
- 캐릭터 변화는 갑작스러운 개심보다 `균열`, `버팀`, `책임의 선택`으로 느껴져야 한다.
- 선택지는 정보 버튼보다 `태도`, `관계`, `기록할 것과 덮을 것의 선택`처럼 읽혀야 한다.
- 선택 후 바로 씬이 바뀌기보다, 가능하면 `반응 대화 -> 다음 전개` 구조를 우선 검토한다.
- 분량을 늘리는 것보다 장면 밀도, 감정 회수, 반복 모티프의 누적을 우선한다.
- 후반부 씬을 건드리면 `기록 / 이름 / 감응 / 사람다움` 모티프의 일관성을 유지한다.

## 데이터 키 / 표기 기준

- 시스템 변수와 플래그 키는 `PascalCase`: `InvestigationScore`, `SongsoonTrust`, `ResonanceLevel`, `CalledEditor`
- `SceneID`는 영문 소문자 + 언더스코어: `ch4b_cafe_press`
- 에셋 경로: 배경 `assets/bg/`, 초상화 `assets/portraits/`, 단서 `assets/items/` 또는 `assets/ev/`, 음악 `assets/sfx/`

---

## 에디터 기준

- 메인 편집 UI는 `EditorNode/` 하나로 본다. 예전 카드형 `editor/`는 폐기됐다.
- EditorNode는 씬 구조 편집, 대사/선택지/분기/단서 수정, 캐릭터/감정 편집, 조사 대사 편집, 검색/필터, 구조 검수, 프리뷰, generated 연동 검토까지 담당한다.
- 데이터 로드는 `game/data/tables/*.json`, 저장은 워크스페이스 선택 후 tables + game_data.js 동시 기록(File System Access API).
- 스키마를 바꾸면 `runtime → EditorNode → pipeline(export/split/generated) → validate → docs`를 같은 라운드에 맞춘다. 한 층에만 필드를 추가하지 않는다.

## 스킬 라우팅

작업 축을 먼저 정하고 스킬은 보통 1개, 많아야 2개만 부른다. 한국어 별칭은 `.claude/rules/경성뎐_운영_규칙.md` 참조.

| 축 | 스킬 |
|---|---|
| 서사 데이터 다듬기 (`데이터 폴리시`) | `gsd-data-polish` |
| 런타임 화면/입력 (`런타임 UI`) | `gsd-runtime-ui` |
| 조사 씬 설계 (`조사 설계`) | `gsd-priority-investigation` |
| 에디터·파이프라인 (`에디터노드 파이프라인`) | `gsd-editornode-pipeline` |
| 진행 막힘 QA (`브라우저 QA`) | `gsd-browser-qa` |
| 마감·커밋 준비 (`릴리즈 체크`) | `gsd-release-checks` |
| 포트폴리오 내용 검증 (`내용검증`) | `gsd-content-review` |
| 포트폴리오 디자인 검증 (`디자인검증`) | `gsd-design-review` |
| 포트폴리오 개선 적용 (`개선`) | `gsd-improve` |
| 신규 씬/분기 저작 (`씬 추가`) | `gsd-scene-authoring` |
| 한글 깨짐 진단·복구 (`인코딩 복구`) | `gsd-encoding-recovery` |

---

## 한글 인코딩 규칙

터미널에서 한글이 깨져 보이면 **파일 손상으로 바로 판단하지 말고 먼저 환경 문제를 의심한다.**

```powershell
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Get-Content '경로' -Encoding utf8
```

UTF-8로 다시 읽어도 깨져 있으면 그때는 실제 손상이다. 그 경우:

1. `git log --oneline -- <파일>`로 마지막 정상 커밋을 찾는다 (`git show <해시>:<파일> | head`로 확인).
2. 정상 커밋이 있으면 그 버전을 기준으로 복구하고, 손상 이후의 변경분은 diff로 골라 다시 반영한다.
3. git에 없는 파일이면 CP949 왕복 복구(`line.encode('cp949').decode('utf-8')`)를 시도하되, `?`로 치환된 글자는 이미 소실된 것이므로 복구 불가로 보고한다.
4. 복구본 저장은 반드시 UTF-8로 한다.

예방: 한국어 대량 삽입은 Edit 도구로만. PowerShell 5.1의 기본 출력 인코딩(UTF-16)과 인라인 문자열 경유를 피한다.

## Data-First Rule

반복 가능한 게임플레이 메타데이터는 런타임 상수보다 테이블 이관을 먼저 검토한다.

1. 기존 테이블 확장 → 2. 신규 테이블 추가 → 3. 파생 로직만 런타임 처리

씬 목표 → SceneTable, 메모 요약/역할 → CharacterTable, 증거 분류/힌트 → EvidenceTable, 질문 → QuestionTable, 상태 라벨 → StateDescriptorTable 식으로 흡수하고, `evidence.js / scene.js / ui.js / editor.js` 상수에만 저작 가능한 콘텐츠를 넣지 않는다.

---

## 완료의 정의 (마치기 전 체크)

1. 데이터를 고쳤으면: `py G:\GSD\content\tools\validate_game_data.py` 통과.
2. 런타임 JS를 고쳤으면: 건드린 파일마다 `node --check`, `game/index.html`의 `?v=` 범프 확인.
3. EditorNode JS를 고쳤으면: `node --check G:\GSD\EditorNode\editor.js`.
4. game_data.js를 직접 고쳤으면: tables 분리 갱신(`split_game_data.py`) 필요 여부 판단. 검수 공유가 필요하면 `json_to_generated_xlsx.py`.
5. 입력 흐름 UI를 건드렸으면: `새 게임 / 이어하기 / Esc / M·S·L / 패널 열린 상태 대사 진행`을 같이 본다.
6. 진행 로직을 건드렸으면: 최소 `scene_boot_check.js` 수준의 브라우저 QA를 실제 서버에서 돌린다.
7. QA/도구가 만든 임시 폴더·캐시를 정리한다.
8. 보고는 `변경한 것 → 검증한 것 → 남은 리스크` 순서로 한다.

## 주의사항

- `main.css`의 `@import`는 첫 줄에 와야 한다.
- generated xlsx는 복붙/검수용이지 장기 원본이 아니다.
- 새 문서를 만들 때는 `core / scenario / writing / characters / editor / portfolio` 중 어디에 속하는지 먼저 결정한다.
- 커밋은 작업 슬라이스가 한 줄로 설명되게 나눈다. 관련 없는 변경을 섞지 않는다.
- 탐색은 CLAUDE.md와 Grep을 먼저 쓰고, 대형 파일 전체 Read를 반복하지 않는다. 응답(설명)을 먼저 말하고 코딩한다.
