# 브라우저 QA 결과 요약

## 범위

이번 자동 브라우저 QA는 두 축으로 검증했습니다.

- 저장 / 이어하기 플로우
- 첫 장면부터 엔딩 복귀까지의 전체 진행

## 결과

### 1. 저장 / 이어하기 QA

검증 스크립트:

- [run_browser_playtest_save_flow.ps1](/G:/GSD/content/tools/run_browser_playtest_save_flow.ps1)

통과 기준과 결과:

- 장면 시작 전 저장 차단: 통과
- 정상 저장 시 `currentSceneId` 포함 저장: 통과
- `이어하기 -> 슬롯 선택 -> 복구`: 통과
- 로드 후 타이틀 하강 및 대화 재개: 통과

확인된 상태:

- early save 토스트: `장면이 시작된 뒤에 저장할 수 있습니다.`
- load 토스트: `슬롯 1번 기록을 불러왔습니다.`

### 2. 전체 진행 QA

검증 스크립트:

- [run_browser_playtest_full_run.ps1](/G:/GSD/content/tools/run_browser_playtest_full_run.ps1)

검증 방식:

- 새 게임 시작
- 대사는 자동 진행
- 선택지와 priority 조사 선택지는 첫 번째 선택부터 처리
- 엔딩 후 타이틀 복귀까지 확인

최종 결과:

- `endedBackOnTitle: true`
- `elapsedMs: 6185`
- `traceCount: 349`
- 브라우저 콘솔 `pageerror` 없음

## 정리

현재 자동 브라우저 QA 기준으로는

- 저장 / 이어하기
- 일반 선택지 진행
- priority 조사 진행
- 엔딩 복귀

까지 모두 통과한 상태입니다.

남는 QA는 자동화가 아니라 체감 영역입니다.

- 연출 강약
- 실제 플레이 리듬
- 좁은 해상도 시인성
- 메모장 / 패널 가독성 마감

## QA 런타임 폴더 메모

자동 QA를 다시 돌리려면 아래 폴더를 유지합니다.

- `G:\GSD\.qa-browsers`
- `G:\GSD\.qa-node`
- `G:\GSD\.qa-artifacts`

파일 수가 많은 이유는 다음과 같습니다.

- `.qa-browsers`: Chromium / headless shell / ffmpeg 같은 Playwright 런타임 파일
- `.qa-node`: `playwright` 패키지와 그 의존 파일

즉, “로그 임시파일 수천 개”가 아니라 브라우저 자동화 런타임 자체라고 보면 됩니다.

아티팩트 출력은 최소로 유지합니다.

- `qa-save-flow.json`
- `qa-full-run.json`
- `qa-final.png`
