# 경성뎐 프로젝트

브라우저 기반 ADV 프로젝트와 그 제작 환경을 함께 관리하는 저장소입니다.

이 저장소는 단순히 게임 런타임만 담고 있지 않고, 아래 작업을 한 번에 포함합니다.

- 실제 플레이 가능한 게임 런타임
- 콘텐츠 데이터를 편집하는 노드 에디터
- 데이터 변환 / 검증 파이프라인
- 시스템 구조 문서
- 포트폴리오 및 프로젝트 정리 문서

즉, `게임 결과물 + 제작 도구 + 데이터 구조 + 문서`를 함께 운영하는 프로젝트입니다.

---

## 핵심 폴더

```text
G:/GSD/
├─ game/                       # 실제 게임 런타임
│  ├─ data/                    # 최종 게임 데이터
│  ├─ js/                      # 런타임 로직
│  └─ assets/                  # 게임 에셋
├─ EditorNode/                 # 메인 노드 에디터
├─ content/
│  ├─ generated/               # 생성된 테이블 산출물
│  ├─ tools/                   # 변환 / 검증 도구
│  └─ docs/                    # 시스템 / 에디터 / 포트폴리오 문서
├─ .qa/                        # QA 및 플레이테스트 관련 로컬 폴더
└─ README.md
```

---

## 지금 프로젝트를 이해하는 가장 빠른 경로

처음 보는 사람이라면 아래 순서로 보면 됩니다.

1. 이 `README.md`
2. [content/docs/system/README.md](/G:/GSD/content/docs/system/README.md)
3. [content/docs/editor/DATA_EDIT_REVIEW_PROCESS.md](/G:/GSD/content/docs/editor/DATA_EDIT_REVIEW_PROCESS.md)
4. `EditorNode/`와 `game/` 구조 확인

포트폴리오 문서까지 보고 싶다면 아래도 이어서 보면 됩니다.

5. [content/docs/portfolio/PPT_PDF_포트폴리오_작성_가이드.md](/G:/GSD/content/docs/portfolio/PPT_PDF_포트폴리오_작성_가이드.md)
6. [content/docs/portfolio/제출용_포트폴리오_장표_초안.md](/G:/GSD/content/docs/portfolio/제출용_포트폴리오_장표_초안.md)
7. [content/docs/portfolio/제출용_포트폴리오_슬라이드별_문구_초안.md](/G:/GSD/content/docs/portfolio/제출용_포트폴리오_슬라이드별_문구_초안.md)
8. [content/docs/portfolio/클로드_PPT_제작_브리프.md](/G:/GSD/content/docs/portfolio/클로드_PPT_제작_브리프.md)

---

## 주요 구성 설명

### `game/`

실제 플레이어가 실행하는 게임 쪽입니다.

- `game/data/game_data.js`
  현재 런타임이 직접 읽는 핵심 데이터입니다.
- `game/js/`
  상태, 분기, UI, 조사, 증거 등 런타임 로직이 들어 있습니다.
- `game/assets/`
  배경, 인물, 아이템 등 게임 에셋이 들어 있습니다.

### `EditorNode/`

콘텐츠 편집을 위한 메인 노드 에디터입니다.

- 씬 연결 구조를 시각적으로 편집
- 선택지 / 분기 / 데이터 연결 수정
- 데이터 패널 기반 세부 편집
- 현재 프로젝트의 핵심 작업 도구

### `content/generated/`

테이블 기반 생성 산출물이 들어 있습니다.

- delimited CSV/TSV
- generated xlsx
- 데이터 구조 검토 및 산출물 확인용

### `content/tools/`

데이터 변환, 검증, 보조 스크립트가 들어 있습니다.

대표적으로 아래 스크립트를 많이 사용합니다.

- `export_to_json.py`
  테이블/중간 데이터에서 런타임 데이터로 변환
- `json_to_generated_xlsx.py`
  런타임 데이터에서 generated xlsx 생성
- `validate_game_data.py`
  FK, Enum, 연결 구조 등 데이터 검증
- `check_story_flow.py`
  스토리 흐름 점검용 보조 도구

### `content/docs/`

문서 저장 위치입니다.

- `system/`
  시스템 구조와 데이터 구조 문서
- `editor/`
  에디터 사용 및 리뷰 프로세스 문서
- `portfolio/`
  포트폴리오/PPT 제작용 문서와 관련 자료

---

## 현재 데이터 운영 기준

현재 프로젝트는 아래 흐름으로 이해하면 됩니다.

```text
EditorNode / content tools / generated tables / game_data.js / runtime
```

조금 더 실무적으로 보면 아래와 같습니다.

- 구조 검토와 콘텐츠 편집은 `EditorNode` 중심
- 런타임 기준 데이터는 `game/data/game_data.js`
- 변환 / 검증은 `content/tools/`
- 생성 산출물 확인은 `content/generated/`

즉, 지금은 `에디터 + 런타임 데이터 + 검증 도구`가 운영의 중심입니다.

---

## 현재 구조의 핵심 포인트

이 프로젝트는 최근 구조 정리를 거치면서 아래 방향으로 맞춰져 있습니다.

- 레거시 `Flag` / `Rule` 중심 구조 축소
- `Condition` 중심 분기 구조로 통합
- 상태, 게이지, 조사, 증거 관련 데이터 재정리
- 에디터와 런타임이 같은 구조를 바라보도록 정비
- 검증과 생성 파이프라인 강화

즉, 단순 기능 추가보다 `구조 일관성`과 `콘텐츠 생산성`을 더 중요하게 정리한 상태입니다.

---

## 포트폴리오 관련 문서

포트폴리오 작업은 `content/docs/portfolio/` 아래에 정리되어 있습니다.

중요 문서는 아래입니다.

- [PPT_PDF_포트폴리오_작성_가이드.md](/G:/GSD/content/docs/portfolio/PPT_PDF_포트폴리오_작성_가이드.md)
- [제출용_포트폴리오_장표_초안.md](/G:/GSD/content/docs/portfolio/제출용_포트폴리오_장표_초안.md)
- [제출용_포트폴리오_슬라이드별_문구_초안.md](/G:/GSD/content/docs/portfolio/제출용_포트폴리오_슬라이드별_문구_초안.md)
- [클로드_PPT_제작_브리프.md](/G:/GSD/content/docs/portfolio/클로드_PPT_제작_브리프.md)

이 문서들은 `발표용 슬라이드`보다 `문서형 PPT 포트폴리오`를 만드는 기준에 맞춰 정리되어 있습니다.

---

## QA 관련 폴더

QA/브라우저 플레이테스트 관련 로컬 폴더는 `.qa/` 아래에 모아뒀습니다.

예시:

- `.qa/browsers/`
- `.qa/node/`
- `.qa/artifacts/`
- `.qa/playtest/`

이 폴더는 작업 환경과 테스트 산출물 보관용입니다.

---

## 작업할 때 참고 사항

- 제품 코드와 포트폴리오 문서는 성격이 다르므로 분리해서 보는 것이 좋습니다.
- `game_data.js`는 현재 런타임 기준 데이터이므로 수정 시 영향 범위를 항상 같이 봐야 합니다.
- 에디터, 생성 산출물, 런타임 데이터는 서로 연결되어 있으므로 한쪽만 보고 판단하면 안 됩니다.
- 포트폴리오 자료는 `content/docs/portfolio/` 기준으로 따로 관리합니다.

---

## 한 줄 요약

`경성뎐 프로젝트는 브라우저 ADV 게임 자체뿐 아니라, 그 게임을 계속 만들 수 있는 데이터 구조, 에디터, 검증 파이프라인까지 함께 운영하는 저장소입니다.`
# GitHub Clone -> Browser QA Quick Start

이 섹션만 따라 하면 GitHub에서 저장소를 받은 뒤 현재 기준의 Playwright QA를 바로 다시 실행할 수 있습니다.

## 1. Clone

```powershell
git clone <REPO_URL> G:\GSD
cd G:\GSD
```

## 2. Install QA dependencies

```powershell
cd G:\GSD\.qa-node
npm install
npx playwright install chromium
```

설명:

- `.qa-node` 안에는 QA 러너와 `package.json`이 들어 있습니다.
- `node_modules`는 커밋하지 않으므로 clone 후 한 번 설치해야 합니다.

## 3. Start local game server

다른 터미널에서:

```powershell
cd G:\GSD\game
py -m http.server 4173
```

서버 확인:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:4173' -UseBasicParsing
```

## 4. Run the lightest QA first

씬 부팅 확인:

```powershell
$env:QA_SCENE='ch1_court'
node G:\GSD\.qa-node\scene_boot_check.js
Remove-Item Env:QA_SCENE
```

텍스트 선택지 확인:

```powershell
$env:QA_SCENE='ch1_court'
$env:QA_ACTION_INDEX='0'
node G:\GSD\.qa-node\scene_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX
```

증거 제출 확인:

```powershell
$env:QA_SCENE='ch2_well'
$env:QA_ACTION_INDEX='-1'
$env:QA_EVIDENCE_INDEX='0'
node G:\GSD\.qa-node\evidence_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX, Env:QA_EVIDENCE_INDEX
```

## 5. Where results go

- `G:\GSD\.qa-artifacts\boot-*.json`
- `G:\GSD\.qa-artifacts\choice-*.json`
- `G:\GSD\.qa-artifacts\evidence-*.json`
- `G:\GSD\.qa-artifacts\*.png`

## 6. Notes

- 한글 선택지 텍스트는 PowerShell env 전달 중 깨질 수 있으므로 `QA_ACTION_INDEX` / `QA_EVIDENCE_INDEX`를 권장합니다.
- 먼저 `scene_boot_check.js`로 씬 진입을 확인한 뒤 choice/evidence 러너로 넓히는 방식이 가장 안전합니다.
- `node`나 `chrome-headless-shell` 잔여 프로세스가 남아 있으면 먼저 정리하고 다시 시작하세요.
- 전체 가이드는 [브라우저_QA_실행_가이드.md](/G:/GSD/content/docs/system/core/브라우저_QA_실행_가이드.md)에 있습니다.
