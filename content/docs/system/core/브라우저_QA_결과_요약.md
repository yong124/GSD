# 브라우저 QA 결과 요약

## 이번 라운드 범위

이번 QA는 아래 범위를 Playwright 기반으로 확인했다.

- 씬 부팅
- 텍스트 선택지 클릭
- 조사형 choice 소진
- evidence 인벤토리 제출
- 진행 막힘 재현과 수정 후 재검증

## 최종 결론

- 실제 진행 막힘은 `ch5_ipangyu_deal` 1건 확인
- 해당 이슈는 수정 후 재검증 통과
- 현재 기준으로는 진행 불가 선택지가 추가로 보이지 않음

## 확인 방식

### 1. 씬 부팅

사용 스크립트:

- [scene_boot_check.js](/G:/GSD/.qa-node/scene_boot_check.js)

확인 내용:

- `qa_scene` 진입 가능 여부
- 첫 `choice` 또는 `evidence` UI 도달 여부

### 2. 텍스트 선택지

사용 스크립트:

- [scene_choice_runner.js](/G:/GSD/.qa-node/scene_choice_runner.js)

확인 내용:

- 선택지 클릭 후 다음 인터랙션으로 전이되는지
- 같은 선택지 화면에 그대로 남지 않는지

### 3. evidence 제출

사용 스크립트:

- [evidence_choice_runner.js](/G:/GSD/.qa-node/evidence_choice_runner.js)

확인 내용:

- 인벤토리 항목 제출 후 다음 인터랙션 변화 여부

## 통과한 범주

### 일반 선택지

아래 씬들은 클릭 후 다음 인터랙션으로 정상 전이했다.

- `ch1_court`
- `ch1_newsroom`
- `ch2_hospital`
- `ch2_factory`
- `ch2_cafe`
- `ch3_warehouse`
- `ch3_room4`
- `ch5_ritual_path`
- `ch5_contact_editor`

### 조사형 / 반복 선택형

- `ch2_cafe`
- `ch3_room4`

확인 결과:

- 누른 항목이 빠지고 남은 선택지가 다시 표시됨
- 진행이 멈추는 현상 없음

### evidence 인벤토리형

아래 씬들은 evidence 제출 후 다음 인터랙션 변화가 확인됐다.

- `ch2_well`
- `ch2_ipangyu`
- `ch4a_library`
- `ch4b_cafe`
- `ch4a_editor_room`
- `ch5_guarded_door`
- `ch5_ritual_room`
- `ch6_ritual_scene`
- `ch6_article`

## 발견된 진행 막힘

### `ch5_ipangyu_deal`

증상:

- `문구를 따라 한다.`
- `거절한다.`

두 선택지 모두 클릭 후 같은 choice 화면으로 되돌아감

원인:

- 일반 choice의 `next_type: "Dialog"` 분기 처리 로직이 `scene.dialogues`만 조회
- 실제 분기 대상 `dlg_ipangyu_deal_accept`, `dlg_ipangyu_deal_refuse`는 `scene.evidence_dialogues`에만 존재
- 분기 대사 후 다음 씬으로 넘어가는 연결도 빠져 있었음

수정:

- [scene.js](/G:/GSD/game/js/engine/scene.js)

현재 상태:

- 수정 후 두 선택지 모두 정상 전이 확인

## 조건부 주의 사항

- `ch6_ritual_scene`의 4번째 선택지는 현재 QA 상태에선 비노출이었다
- 이 항목은 이번 라운드에서 "진행 막힘"으로 판정하지 않았고, 조건부 노출 여부를 따로 보면 된다

## 산출물 위치

실행 결과는 아래 위치에 남긴다.

- `G:\GSD\.qa-artifacts\boot-*.json`
- `G:\GSD\.qa-artifacts\choice-*.json`
- `G:\GSD\.qa-artifacts\evidence-*.json`
- `G:\GSD\.qa-artifacts\*.png`

## 운영 메모

- 전체 풀런 1회보다 씬 단위 러너가 막힘 탐지에 더 유리하다
- 실패 없는 정상 케이스는 요약만 보고, 상세 JSON은 실패 케이스 위주로 본다
- 한글 선택지 전달은 문자열보다 인덱스가 안전하다
