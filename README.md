# 경성뎐

1930년대 경성을 배경으로 한 조사형 내러티브 게임 프로토타입입니다.  
전투보다 `조사`, `기록`, `관계`, `공명`의 축으로 플레이를 설계했고, 동시에 `시스템 기획 + AI 활용 + 제작 파이프라인 설계`를 보여주는 포트폴리오 프로젝트로 진행하고 있습니다.

## 프로젝트 목표

- 조사형 내러티브 게임의 데이터 구조 설계
- 선택과 상태값이 실제 장면 반응으로 이어지는 시스템 구현
- `game_data.js`, `EditorNode`, generated xlsx, validation 스크립트를 잇는 제작 파이프라인 구축
- AI를 텍스트 생성이 아니라 `문체 보강`, `정합성 검수`, `반복 작업 자동화`에 실무적으로 활용

## 현재 구현된 핵심 요소

- 씬/대사/선택지/분기 기반 내러티브 런타임
- `SpeakerID`, `EmotionType`, `StandingSlot`, `FocusType` 기반 스테이징
- 스탠딩 캐릭터, 화자 강조, 간단한 모션/FX
- `priority_budget` 기반 조사 우선순위 시스템
- 단서 수집과 메모장 UI
- 3슬롯 저장/불러오기
- 조사 HUD, 목표 카드, 시스템 토스트
- `EditorNode` 기반 데이터 편집
- 브라우저 자동 QA 래퍼

## 폴더 구조

```text
game/                 런타임 게임
EditorNode/           노드형 데이터 편집기
content/tools/        export / validate / QA 스크립트
content/docs/         시스템 문서 / 포트폴리오 문서
.claude/              프로젝트 전용 Claude rule / skill / command
```

## 실행 방법

정적 서버로 `game` 폴더를 띄우면 됩니다.

```powershell
cd G:\GSD\game
py -m http.server 4173
```

브라우저에서 아래 주소로 접속:

- `http://127.0.0.1:4173`

## 브라우저 QA

자동 QA는 아래 래퍼를 사용합니다.

```powershell
powershell -ExecutionPolicy Bypass -File G:\GSD\content\tools\run_browser_playtest_save_flow.ps1
powershell -ExecutionPolicy Bypass -File G:\GSD\content\tools\run_browser_playtest_full_run.ps1
```

관련 문서:

- `content/docs/system/core/브라우저_QA_실행_가이드.md`
- `content/docs/system/core/브라우저_QA_결과_요약.md`

## 주요 문서

포트폴리오 관점:

- `content/docs/portfolio/시스템_기획자_AI_포트폴리오_포지셔닝.md`
- `content/docs/portfolio/포트폴리오_프로젝트_스토리.md`
- `content/docs/portfolio/프로젝트_개발_과정.md`

시스템/구조 관점:

- `content/docs/system/core/DATA_STRUCTURE.md`
- `content/docs/system/core/TABLE_SPEC.md`
- `content/docs/system/core/DATA_STRUCTURE.md`
- `content/docs/system/core/TABLE_SPEC.md`
- `content/docs/system/core/브라우저_QA_실행_가이드.md`

## 작업 원칙

- 빠르게 움직이는 기준 데이터는 현재 `game/data/game_data.js`
- 브라우저 로드 자산을 바꾸면 `game/index.html`의 `?v=`도 같이 갱신
- 한국어 데이터 확인은 UTF-8 기준으로 검증
- QA 런타임 폴더(`.qa-*`)는 Git 추적 대상이 아니라 로컬 실행 환경

## 상태

현재 프로젝트는 `프로토타입 + 포트폴리오용 고도화` 단계입니다.  
기본 플레이 루프, 조사 시스템, 스테이징, 저장/불러오기, 자동 QA까지 연결된 상태이며, 이후 작업은 주로 체감 QA와 연출/콘텐츠 폴리시 중심으로 이어집니다.
