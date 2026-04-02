# content 폴더 정리

## 구조

- `data/`
  - 실제 원본 데이터
  - `script.xlsx`
  - `script 백업.xlsx`
- `generated/`
  - 복붙용 생성 산출물
  - `script.generated.xlsx`
  - `script.dialog_only.xlsx`
  - `script.generated_delimited/`
- `tools/`
  - 현재 사용하는 변환 스크립트
  - `export_to_json.py`
  - `json_to_generated_xlsx.py`
  - `run_export.bat`
- `tools/legacy/`
  - 현재 메인 루틴에서 쓰지 않는 구버전/실험용 스크립트
  - `json_to_xlsx.py`
  - `fill_xlsx_tables.ps1`
- `docs/system/`
  - 데이터 구조 / 테이블 / 플래그 / 분기 문서
- `docs/editor/`
  - Node Editor / generated xlsx / 작업 프로세스 문서
- `docs/portfolio/`
  - 포트폴리오 설명 문서
- `archive/`
  - 보관용 텍스트 / 임시 추출 자료

## 현재 운영 기준

- 메인 편집: `EditorNode`
- 원본 테이블: `content/data/script.xlsx`
- 런타임 반영: `game/data/game_data.js`
- xlsx 생성 도구: `content/tools/json_to_generated_xlsx.py`
- xlsx → game_data 변환: `content/tools/export_to_json.py`

## 정리 기준

- 직접 쓰는 파일은 `data`, `generated`, `tools`, `docs`에 둔다.
- 지금 메인 흐름에 없는 실험용 파일은 `tools/legacy`로 뺀다.
- 참고만 남길 파일은 `archive`로 이동한다.
