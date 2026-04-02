# 경성뎐: 여급 실종사건 — 프로젝트 가이드

## 구조

```
G:/GSD/
├── game/                    # 실제 플레이어용 게임 (port 3900)
│   ├── index.html
│   ├── js/
│   │   ├── main.js          # 진입점. GAME_DATA 로드 → 엔진 init
│   │   └── engine/
│   │       ├── scene.js     # Scene.load(), resolveNextScene()
│   │       ├── dialogue.js  # Dialogue.start(), condition 필터링
│   │       ├── choice.js    # Choice.show()
│   │       ├── evidence.js  # Evidence.index(), collectOnClick()
│   │       ├── state.js     # State.flags{}, serialize(), getFlag()
│   │       ├── save.js      # localStorage 자동저장
│   │       └── audio.js
│   ├── css/
│   │   ├── main.css         # @import 반드시 첫 줄
│   │   └── dialogue.css     # .thought .crazy .scared .magic 스타일
│   ├── data/
│   │   └── game_data.js     # window.GAME_DATA = {...} (자동 생성, 수동 편집 금지)
│   └── assets/
│       ├── portraits/       # *.jpeg (예외: kum_fixed.png, pan_crazy.png)
│       ├── backgrounds/     # *.jpg
│       └── items/           # *.png
├── editor/                  # ADV 에디터 (port 3901)
│   ├── index.html
│   ├── editor.js            # IIFE + state{} + render() 패턴
│   └── editor.css
└── content/
    ├── data/
    │   └── script.xlsx      # 원본 시나리오 데이터
    ├── tools/
    │   └── export_to_json.py # xlsx → game_data.js 변환
    └── docs/system/
        └── TABLE_SPEC.md    # 테이블 스키마 문서
```

## 데이터 흐름

```
content/data/script.xlsx → python content/tools/export_to_json.py → game/data/game_data.js
```

game_data.js 수정 필요 시 반드시 xlsx에서 수정 후 재export. 직접 편집은 덮어쓰임.

## 서버

```bash
# 게임 (game/ 폴더 기준)
python -m http.server 3900   # http://localhost:3900/index.html

# 에디터 (GSD/ 루트 기준)
python -m http.server 3901   # http://localhost:3901/editor/index.html
```

launch.json에 두 설정 모두 있음 (`경성뎐`, `adv-editor`).

## game_data.js 스키마 요약

```js
window.GAME_DATA = {
  first_scene: "scene_id",
  scenes: {
    "scene_id": {
      id, title, background,   // background: "assets/backgrounds/..."
      next_scene,              // 기본 다음 씬
      branches: [              // 플래그 분기 (우선순위 순서)
        { flag_key, flag_value, next_scene }
      ],
      dialogues: [
        { order, speaker, text, portrait, style, condition }
        // style: normal|narration|thought|crazy|scared|magic
        // condition: { flag_key, flag_value } | null
        // portrait: "assets/portraits/name.jpeg"
      ],
      choices: [
        { order, text, next_scene, flag_key, flag_value }
      ],
      evidence: [
        { id, name, description, image, trigger }
        // trigger: 1=always, 2=on dialogue end
      ]
    }
  }
}
```

## 엔진 핵심 패턴

**씬 진행 흐름:**
`Scene.load(id)` → `resolveNextScene()` 로 플래그 분기 확인 → `Dialogue.start(lines)` → 대화 끝나면 `Evidence.collectOnClick(scene)` → `Choice.show()` or `Scene.load(next)`

**플래그 시스템:**
- 세팅: Choice의 `flag_key` / `flag_value`
- 읽기: `dialogue.condition`, `branch.flag_key`
- 접근: `State.getFlag(key)`, `State.setFlag(key, value)`

**resolveNextScene(scene):** branches 순서대로 순회, 첫 매칭 next_scene 반환. 없으면 scene.next_scene 사용.

## 에디터 패턴

```js
// 카드 액션 바인딩 (Up/Down/Copy/Delete)
bindCardActions(card, action => { ... });

// 필드 변경 바인딩 (input, textarea, select 모두)
bindFieldUpdates(card, (field, value) => { ... });

// 렌더 사이클
markDirty() → render() → renderSceneList() + renderEditor() + renderPreview() + renderFlagPanel()
```

## 알려진 주의사항

- `main.css`: `@import` 반드시 첫 번째 줄 (CSS 규칙)
- Portrait 에셋: 실제 파일은 `.jpeg` (일부 `.png`). game_data.js 경로와 일치 확인
- `game_data.js` 직접 편집 시 `content/tools/export_to_json.py` 재실행하면 덮어써짐
- `State.serialize()`는 `dialogueIndex` 제외하고 저장 (재시작 시 씬 처음부터)
- branches `flag_value`: 엔진은 배열도 지원하나 에디터는 단일값만 입력
