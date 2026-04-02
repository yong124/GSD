# generated xlsx 작업 방식

## 목적

기존 `content/data/script.xlsx`의 표/양식을 직접 건드리지 않고,
헤더 순서가 맞는 복붙용 xlsx를 별도로 생성하기 위한 작업 방식이다.

## 생성 파일

- 입력: `game/data/game_data.js`
- 출력: `content/generated/script.generated.xlsx`

## 사용 방식

1. `content/generated/script.generated.xlsx`를 연다.
2. 필요한 시트(`SceneTable`, `DialogTable`, `ChoiceTable`, `BranchTable`, `EvidenceTable`)를 확인한다.
3. 기존 `content/data/script.xlsx`의 동일 시트 표에 값만 복사/붙여넣기 한다.
4. 표 양식, 필터, 노션/검수용 서식은 `content/data/script.xlsx`에서 유지한다.

## 장점

- 기존 원본 xlsx 양식이 깨지지 않음
- 표(Table) 메타 손상 위험이 없음
- 최신 헤더 순서 기준으로 데이터만 빠르게 복붙 가능

## 생성 명령

```powershell
py G:\GSD\content\tools\json_to_generated_xlsx.py
```
