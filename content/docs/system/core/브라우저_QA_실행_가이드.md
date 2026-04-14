# 브라우저 QA 실행 가이드

## 목적

경성뎐 브라우저 QA는 "게임이 끝까지 돌아가는가"만 보는 단일 풀런보다, 아래 순서로 얇게 쪼개서 확인하는 방식이 더 안정적이다.

1. 씬 부팅 확인
2. 텍스트 선택지 클릭 확인
3. 증거 인벤토리 제출 확인
4. 실패 경로만 재현

이 방식은 다음 장점이 있다.

- 어디서 멈췄는지 바로 알 수 있다
- 씬 단위로 중간 저장이 가능하다
- 토큰과 실행 시간을 아낄 수 있다
- "선택지는 떴는데 눌러도 진행 안 됨" 같은 실제 진행 막힘을 잡기 쉽다

## 기준 프로세스

QA 시작 전 기준 상태는 아래처럼 맞춘다.

- 로컬 서버만 1개 유지
- QA용 `node` / `chrome-headless-shell` 프로세스는 실행할 때만 생성
- 이전에 실패한 Playwright 잔여 프로세스는 먼저 정리

서버 실행:

```powershell
cd G:\GSD\game
py -m http.server 4173
```

서버 확인:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:4173' -UseBasicParsing
```

## QA 환경

Playwright 전용 환경:

- `G:\GSD\.qa-node`
- `G:\GSD\.qa-artifacts`

핵심 스크립트:

- [scene_boot_check.js](/G:/GSD/.qa-node/scene_boot_check.js)
- [scene_choice_runner.js](/G:/GSD/.qa-node/scene_choice_runner.js)
- [evidence_choice_runner.js](/G:/GSD/.qa-node/evidence_choice_runner.js)
- [scene_choice_audit.js](/G:/GSD/.qa-node/scene_choice_audit.js)

기존 스크립트:

- [browser_playtest_full_run.js](/G:/GSD/content/tools/browser_playtest_full_run.js)
- [browser_playtest_save_flow.js](/G:/GSD/content/tools/browser_playtest_save_flow.js)
- [browser_playtest_scene_jump.js](/G:/GSD/content/tools/browser_playtest_scene_jump.js)

기존 풀런 스크립트는 여전히 유효하지만, 진행 막힘 탐지에는 씬 단위 러너가 우선이다.

## 권장 순서

### 1. 씬 부팅 확인

목적:

- 특정 씬이 `qa_scene`로 정상 진입하는지 확인
- 첫 `choice` 또는 `evidence` UI까지 도달하는지 확인

예시:

```powershell
$env:QA_SCENE='ch1_court'
node G:\GSD\.qa-node\scene_boot_check.js
Remove-Item Env:QA_SCENE
```

출력:

- `G:\GSD\.qa-artifacts\boot-<sceneId>.json`
- `G:\GSD\.qa-artifacts\boot-<sceneId>.png`

성공 기준:

- `ok: true`
- `kind: choice` 또는 `kind: evidence`

### 2. 텍스트 선택지 확인

목적:

- 선택지 클릭 후 다음 인터랙션으로 상태가 바뀌는지 확인

중요:

- PowerShell에서 한글 문자열 전달이 깨질 수 있으므로 선택지는 텍스트보다 인덱스로 넘기는 쪽이 안전하다

예시:

```powershell
$env:QA_SCENE='ch1_court'
$env:QA_ACTION_INDEX='0'
node G:\GSD\.qa-node\scene_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX
```

출력:

- `G:\GSD\.qa-artifacts\choice-<sceneId>.json`
- `G:\GSD\.qa-artifacts\choice-<sceneId>.png`

성공 기준:

- `ok: true`
- 클릭 전후 state signature가 달라짐

실패 기준:

- `action-not-found`
- `click-failed`
- `same-state-after-click`
- `interaction-timeout`

### 3. 증거 인벤토리 확인

목적:

- 증거 제출 화면에서 실제 제출 후 다음 인터랙션으로 바뀌는지 확인

예시:

```powershell
$env:QA_SCENE='ch2_well'
$env:QA_ACTION_INDEX='-1'
$env:QA_EVIDENCE_INDEX='0'
node G:\GSD\.qa-node\evidence_choice_runner.js
Remove-Item Env:QA_SCENE, Env:QA_ACTION_INDEX, Env:QA_EVIDENCE_INDEX
```

`QA_ACTION_INDEX=-1`은 씬이 바로 evidence 인벤토리로 시작하는 경우를 뜻한다.

출력:

- `G:\GSD\.qa-artifacts\evidence-<sceneId>-<actionIndex>-<evidenceIndex>.json`
- `G:\GSD\.qa-artifacts\evidence-<sceneId>-<actionIndex>-<evidenceIndex>.png`

성공 기준:

- `ok: true`
- 제출 전후 state signature가 달라짐

### 4. 씬 전체 순회

목적:

- 씬의 가능한 선택지 노드를 넓게 훑고, 실패가 있는지 저장

예시:

```powershell
node G:\GSD\.qa-node\scene_choice_audit.js
```

주의:

- 이 스크립트는 가장 무겁다
- 먼저 `scene_boot_check.js`와 `scene_choice_runner.js`로 기준을 잡은 뒤 사용한다

## 토큰 절약 원칙

브라우저 QA를 AI와 함께 돌릴 때는 아래 원칙을 따른다.

1. 먼저 서버/프로세스 상태를 확인하고, 이상이 없을 때만 브라우저 러너를 돌린다.
2. 전체 전수보다 `1씬 -> 3씬 -> 병렬 배치` 순서로 넓힌다.
3. 한글 선택지는 텍스트 대신 인덱스를 사용한다.
4. 실패 없는 정상 케이스는 한 줄 요약만 남긴다.
5. 실패 케이스만 JSON과 스크린샷을 읽어 자세히 본다.
6. 동일 증거 풀을 반복 제출하는 씬은 결과를 요약 집계로 압축한다.

## 권장 보고 형식

진행 중 보고:

- 몇 씬 완료했는지
- 실패가 있는지
- 지금 어떤 씬/배치를 돌리는지

최종 보고:

1. 막힌 선택지 여부
2. 재현 경로
3. 수정 여부
4. 남은 조건부 분기 또는 서사 QA 필요 사항

## 이번 기준에서 확인된 실제 버그

- `ch5_ipangyu_deal`
  - 증상: `문구를 따라 한다.`, `거절한다.` 클릭 후 같은 선택지 화면으로 복귀
  - 원인: 일반 choice의 `Dialog` 분기가 `scene.evidence_dialogues`를 보지 못함
  - 조치: [scene.js](/G:/GSD/game/js/engine/scene.js) 수정
  - 현재 상태: 재검증 통과
