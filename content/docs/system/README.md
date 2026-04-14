# 시스템 문서 안내

이 폴더는 현재 `GSD` 프로젝트 운영 기준만 남기는 문서 묶음이다.

과거 설계안, 전환 계획, 중간 실험 메모보다 아래 세 가지를 먼저 본다.

1. 현재 데이터와 런타임 구조
2. 현재 QA 실행 방법
3. 현재 작업 파이프라인

## 가장 먼저 볼 문서

- [현재 운영 워크플로](/G:/GSD/content/docs/system/core/현재_운영_워크플로.md)
- [브라우저 QA 실행 가이드](/G:/GSD/content/docs/system/core/브라우저_QA_실행_가이드.md)
- [DATA_STRUCTURE.md](/G:/GSD/content/docs/system/core/DATA_STRUCTURE.md)
- [TABLE_SPEC.md](/G:/GSD/content/docs/system/core/TABLE_SPEC.md)

## 현재 기준 요약

- 실무 수정 기준 파일은 `game/data/game_data.js`
- `content/generated/script.generated.xlsx`는 `game_data.js`에서 다시 생성하는 검수 산출물
- `content/data/script.xlsx`를 다시 `game_data.js`로 밀어 넣고 싶을 때만 `run_export.bat` 사용
- `game_data.js`에서 `script.generated.xlsx`만 다시 만들고 싶을 때는 `run_data_to_generated_xlsx.bat` 사용
- 브라우저 진행 QA는 `.qa-node`의 scene-local Playwright 러너를 우선 사용

## 자주 쓰는 실행 경로

### 1. game_data 검증만 할 때

```powershell
py G:\GSD\content\tools\validate_game_data.py
```

### 2. game_data -> generated xlsx

```powershell
cmd /c G:\GSD\content\tools\run_data_to_generated_xlsx.bat
```

### 3. xlsx -> game_data -> generated xlsx 전체 파이프라인

```powershell
cmd /c G:\GSD\content\tools\run_export.bat
```

### 4. 브라우저 QA

```powershell
cd G:\GSD\game
py -m http.server 4173
```

그 다음 아래 러너를 사용한다.

- `G:\GSD\.qa-node\scene_boot_check.js`
- `G:\GSD\.qa-node\scene_choice_runner.js`
- `G:\GSD\.qa-node\evidence_choice_runner.js`

## 문서 읽는 순서

### 시스템 구조를 이해할 때

1. [현재 운영 워크플로](/G:/GSD/content/docs/system/core/현재_운영_워크플로.md)
2. [DATA_STRUCTURE.md](/G:/GSD/content/docs/system/core/DATA_STRUCTURE.md)
3. [TABLE_SPEC.md](/G:/GSD/content/docs/system/core/TABLE_SPEC.md)

### 브라우저 QA를 돌릴 때

1. [브라우저 QA 실행 가이드](/G:/GSD/content/docs/system/core/브라우저_QA_실행_가이드.md)
2. [브라우저 QA 결과 요약](/G:/GSD/content/docs/system/core/브라우저_QA_결과_요약.md)

### 서사와 분기 기준을 볼 때

- [NARRATIVE_SYSTEM_DESIGN.md](/G:/GSD/content/docs/system/core/NARRATIVE_SYSTEM_DESIGN.md)
- [BRANCH_DESIGN.md](/G:/GSD/content/docs/system/core/BRANCH_DESIGN.md)
- [SCENARIO_STORY_BIBLE.md](/G:/GSD/content/docs/system/scenario/SCENARIO_STORY_BIBLE.md)

## 유지 원칙

- 현재 코드와 어긋난 문서는 남겨 두지 않는다.
- 과거 전환 계획 문서는 참고 링크로 되살리지 않는다.
- 실행 방법은 실제로 지금 되는 경로만 적는다.
