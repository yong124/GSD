# 브라우저 QA 실행 가이드

## 목적

경성뎐 런타임을 브라우저에서 실제 플레이 기준으로 검증할 때 쓰는 기본 가이드입니다.

지금은 두 가지 자동 검증 스크립트를 둡니다.

- 저장/이어하기 검증
- 첫 장면부터 엔딩까지 진행하는 전체 플레이 검증

## 사전 조건

다음 폴더를 QA 전용 런타임 폴더로 사용합니다.

- `G:\GSD\.qa-browsers`
- `G:\GSD\.qa-node`
- `G:\GSD\.qa-artifacts`

의미는 이렇게 나뉩니다.

- `.qa-browsers`: Playwright 브라우저 바이너리
- `.qa-node`: Playwright 패키지 런타임
- `.qa-artifacts`: 스크린샷, 진행 로그 같은 산출물

로컬 서버는 `game` 폴더 기준으로 켜져 있어야 합니다.

```powershell
cd G:\GSD\game
py -m http.server 4173
```

브라우저 검증 스크립트는 기본적으로 아래 주소를 사용합니다.

- `http://127.0.0.1:4173`

가능하면 raw `node` 호출보다 `.ps1` 래퍼를 먼저 씁니다.
현재 래퍼는 서버를 먼저 확인하고, 꺼져 있으면 자동으로 기동합니다.

## 1. 저장 / 이어하기 검증

이 스크립트는 아래 흐름을 자동으로 확인합니다.

1. 너무 이른 저장이 차단되는지
2. 장면 시작 후 저장이 정상 저장되는지
3. 새로고침 후 `이어하기 -> 슬롯 선택`이 정상 복구되는지

실행:

```powershell
powershell -ExecutionPolicy Bypass -File G:\GSD\content\tools\run_browser_playtest_save_flow.ps1
```

직접 실행 파일:

- [browser_playtest_save_flow.js](/G:/GSD/content/tools/browser_playtest_save_flow.js)
- [run_browser_playtest_save_flow.ps1](/G:/GSD/content/tools/run_browser_playtest_save_flow.ps1)

정상 기준:

- early save는 패널이 뜨지 않아야 함
- `"장면이 시작된 뒤에 저장할 수 있습니다."` 토스트가 보여야 함
- 정상 저장 후 슬롯 JSON에 `currentSceneId`가 들어가야 함
- 로드 후 타이틀이 내려가고 대화창이 보여야 함

## 2. 전체 플레이 검증

이 스크립트는 아래 흐름을 자동으로 확인합니다.

1. 새 게임 시작
2. 대사는 자동으로 넘김
3. 선택지가 뜨면 첫 번째 선택지를 고름
4. priority 조사 씬에서도 남은 선택지를 첫 번째부터 처리
5. 엔딩 후 타이틀 복귀까지 확인

실행:

```powershell
powershell -ExecutionPolicy Bypass -File G:\GSD\content\tools\run_browser_playtest_full_run.ps1
```

직접 실행 파일:

- [browser_playtest_full_run.js](/G:/GSD/content/tools/browser_playtest_full_run.js)
- [run_browser_playtest_full_run.ps1](/G:/GSD/content/tools/run_browser_playtest_full_run.ps1)

정상 기준:

- 중간에 `pageerror`가 없어야 함
- 선택지/대화가 멈추지 않고 끝까지 진행돼야 함
- 엔딩 후 타이틀로 되돌아와야 함

## 로그와 산출물

자동 QA 스크립트는 콘솔에 JSON 요약을 남깁니다.

스크린샷 산출 위치:

- `G:\GSD\.qa-artifacts\qa-final.png`

JSON 산출 위치:

- `G:\GSD\.qa-artifacts\qa-save-flow.json`
- `G:\GSD\.qa-artifacts\qa-full-run.json`

현재 기본 운영은 아티팩트를 최소로 유지하는 방식입니다.

- 저장 / 이어하기 QA: JSON만 남김
- 전체 진행 QA: JSON 1개 + 최종 스크린샷 1장만 남김

## 작업 원칙

- 런타임 JS/CSS 수정 후에는 `game/index.html`의 `?v=`를 같이 올립니다.
- 브라우저에서 안 바뀌면 코드보다 먼저 캐시를 의심합니다.
- 한글 파일 확인은 UTF-8 기준으로 봅니다.

```powershell
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Get-Content '경로' -Encoding utf8
```

## 추천 순서

브라우저 관련 수정 후에는 아래 순서로 확인합니다.

1. `run_browser_playtest_save_flow.ps1`
2. `run_browser_playtest_full_run.ps1`
3. 필요하면 수동 브라우저 플레이로 HUD / 패널 / 반응형 마감 QA
