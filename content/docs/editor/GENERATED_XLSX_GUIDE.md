# generated xlsx 사용 가이드

## 1. 문서 목적

본 문서는 `content/generated/script.generated.xlsx`와 보조 `csv / tsv` 산출물을 어떤 상황에서 어떻게 사용할지 정리한 가이드다.

---

## 2. 생성 목적

generated xlsx는 다음 목적을 가진다.

- `script.xlsx` 표 양식을 건드리지 않고 데이터만 전달
- 대량 수정 전 검토용 산출물 제공
- 시트 단위 복붙 작업 보조
- 외부 공유용 표 데이터 생성

---

## 3. 기본 생성 명령

```powershell
py G:\GSD\content\tools\json_to_generated_xlsx.py
```

보조 `csv / tsv`까지 같이 만들 때:

```powershell
py G:\GSD\content\tools\json_to_generated_xlsx.py --with-delimited
```

특정 시트만 생성할 때:

```powershell
py G:\GSD\content\tools\json_to_generated_xlsx.py --sheets DialogTable,ChoiceTable
```

---

## 4. 생성 산출물

### 4-1. xlsx

- `content/generated/script.generated.xlsx`
- 필요 시 별도 출력 파일명을 지정해 생성할 수 있다

### 4-2. 보조 파일

`--with-delimited` 옵션 사용 시:

- `SceneTable.csv / tsv`
- `DialogTable.csv / tsv`
- `ChoiceTable.csv / tsv`
- `BranchTable.csv / tsv`
- `EvidenceTable.csv / tsv`

### 4-3. 내부 메타 시트

- `Meta`: 생성 시각, 소스 경로, 첫 씬, 포함 시트
- `Summary`: 시트별 행 수 요약

---

## 5. 사용 시점

- 대사 대량 수정 전 검토
- 특정 시트만 따로 정리해서 전달
- `script.xlsx`에 복붙 반영
- 외부 검수용 데이터 공유

---

## 6. 원칙

- generated 파일은 복붙용 산출물이다.
- `script.xlsx`의 표 양식과 메타는 직접 보존한다.
- generated 파일을 원본처럼 장기 운영하지 않는다.
- 구조 수정은 Node Editor 우선, generated xlsx는 보조 포맷으로 본다.

---

## 7. 한 줄 정리

generated xlsx는 `Node Editor에서 정리한 최신 데이터를 표 형태로 꺼내는 보조 산출물`이다.
