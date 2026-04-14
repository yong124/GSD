# 브라우저 QA 실행 가이드

## 목적

현재 브라우저 QA 기준은 `scene-local Playwright`다.

전체 풀런을 먼저 돌리는 방식이 아니라, 아래 순서로 잘게 확인한다.

1. 서버 확인
2. 씬 진입 확인
3. 일반 선택지 진행 확인
4. 증거 제출 확인
5. 조건부 분기 확인

## 서버와 프로세스

먼저 로컬 서버가 살아 있어야 한다.

```powershell
cd G:\GSD\game
py -m http.server 4173
```

확인:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4173
```

QA가 꼬였으면 남아 있는 `node` 프로세스를 정리하고 다시 시작한다.

## 우선 사용하는 러너

- [scene_boot_check.js](/G:/GSD/.qa-node/scene_boot_check.js)
- [scene_choice_runner.js](/G:/GSD/.qa-node/scene_choice_runner.js)
- [evidence_choice_runner.js](/G:/GSD/.qa-node/evidence_choice_runner.js)
- [scene_choice_audit.js](/G:/GSD/.qa-node/scene_choice_audit.js)

`scene_choice_audit.js`는 가장 마지막에 쓴다. 먼저 개별 씬 확인으로 막힘을 줄인다.

## 기본 실행 예시

### 1. 씬 진입 확인

```powershell
$env:QA_SCENE='ch2_cafe'
node G:\GSD\.qa-node\scene_boot_check.js
Remove-Item Env:QA_SCENE
```

성공 기준:

- `ok: true`
- 첫 인터랙션이 `choice` 또는 `evidence`

### 2. 일반 선택지 확인

```powershell
$env:QA_SCENE='ch3_room4'
$env:QA_ACTION_INDEX='1'
node G:\GSD\.qa-node\scene_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX
```

성공 기준:

- `ok: true`
- 클릭 후 다음 인터랙션으로 상태가 바뀜

### 3. 증거 제출 확인

```powershell
$env:QA_SCENE='ch2_ipangyu'
$env:QA_ACTION_INDEX='-1'
$env:QA_EVIDENCE_INDEX='2'
node G:\GSD\.qa-node\evidence_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX, Env:QA_EVIDENCE_INDEX
```

## 상태 주입 QA

현재 러너는 아래 상태 주입을 지원한다.

- `QA_FACTS`
- `QA_GAUGES`
- `QA_TRUSTS`
- `QA_CHOICES`

형식은 쉼표로 이어 붙인 `key:value` 목록이다.

예시:

```powershell
$env:QA_SCENE='ch6_ritual_scene'
$env:QA_GAUGES='SolvedQuestionCount:4'
node G:\GSD\.qa-node\scene_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_GAUGES
```

이 방식으로 조건부 선택지나 후반 분기를 바로 띄워 확인할 수 있다.

### 자주 쓰는 상태 주입 예시

- `QA_GAUGES='SolvedQuestionCount:4'`
  - 후반 조건부 폭로 선택 확인
- `QA_GAUGES='Erosion:2'`
  - 공명 침식 관련 조건 확인
- `QA_CHOICES='QuestionSolved_QMadness,QuestionSolved_QRunaway'`
  - 특정 질문 해결 상태 기반 분기 확인

## 결과물 위치

러너 실행 결과는 아래에 남는다.

- `G:\GSD\.qa-artifacts\boot-*.json`
- `G:\GSD\.qa-artifacts\choice-*.json`
- `G:\GSD\.qa-artifacts\evidence-*.json`
- 대응하는 `png` 스크린샷

## 현재 성공 기준

- 대상 씬에 직접 진입 가능
- 모든 선택지가 클릭 후 다음 인터랙션으로 진행됨
- 증거 제출 씬에서 정답/기본 반응 모두 정상
- 조건부 분기는 상태 주입으로 노출과 진행을 확인 가능

## 보고 원칙

진행 중 보고:

- 어떤 배치를 돌리는지
- 몇 개가 통과했는지
- 실패가 있으면 즉시 어떤 씬인지

최종 보고:

1. 확인된 진행 막힘
2. 수정된 막힘
3. 조건부 분기나 추가 확인 필요 항목
