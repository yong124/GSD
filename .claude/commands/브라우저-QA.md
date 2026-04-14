# 브라우저 QA

이 명령은 실제 브라우저 빌드에서 씬 진입, 선택지 클릭, 증거 제출, 진행 막힘 여부를 Playwright 기준으로 확인할 때 쓴다.

## 기본 순서

1. 남아 있는 QA 프로세스를 정리하고 로컬 서버만 살린다.
2. `http://127.0.0.1:4173` 응답을 확인한다.
3. `scene_boot_check.js`로 씬 진입을 확인한다.
4. `scene_choice_runner.js`로 일반 선택지를 검사한다.
5. `evidence_choice_runner.js`로 증거 제출을 검사한다.
6. 막힘이 확인된 경우에만 깊게 로그와 아티팩트를 읽는다.

## 먼저 쓰는 스킬

- `gsd-browser-qa`

## 같이 붙기 쉬운 스킬

- `gsd-runtime-ui`
- `gsd-release-checks`
