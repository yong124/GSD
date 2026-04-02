# 경성뎐 양방향 데이터 파이프라인 설계

## 1. 목적

본 문서는 `xlsx -> game_data` 단방향 구조를 `xlsx <-> game_data` 양방향 구조로 확장하기 위한 설계 문서다.

현재 메인 작업 툴은 `EditorNode`이므로, 실질적인 목표는 다음과 같다.

```text
Node Editor
↔ game_data
↔ xlsx
```

---

## 2. 왜 필요한가

기존 구조에서는 엑셀이 원본이고, 게임 데이터는 엑셀에서만 생성되었다.

하지만 현재는 다음 이유로 역방향 변환이 필요하다.

- 메인 편집이 노드형 에디터에서 이루어짐
- 수정 결과를 테이블 문서로 다시 정리해야 함
- 검수 / 공유 / 백업은 여전히 xlsx가 유리함
- 특정 시점의 데이터를 표 형태로 비교해야 할 수 있음

즉, `json -> xlsx`는 단순 편의 기능이 아니라, 현재 작업 흐름을 유지하기 위한 필수 구조다.

---

## 3. 입출력 기준

### 3-1. 입력

- `game/data/game_data.js`
- 또는 `window.GAME_DATA = ...` 형태의 js 파일
- 또는 순수 json 파일

### 3-2. 출력

- `content/generated/script.generated.xlsx`

기존 `script.xlsx`를 바로 덮어쓰기보다는, 기본적으로는 별도 파일로 생성하는 방식을 권장한다.

---

## 4. 생성 대상 시트

역변환 시 생성하는 기본 시트는 다음과 같다.

| 시트명 | 역할 |
| --- | --- |
| `SceneTable` | 씬 메타 정보 |
| `DialogTable` | 대사 데이터 |
| `ChoiceTable` | 선택지 데이터 |
| `BranchTable` | 분기 데이터 |
| `EvidenceTable` | 단서 데이터 |

---

## 5. 변환 기준

### 5-1. Scene

`scenes[scene_id]`의 메타 정보를 `SceneTable` 한 행으로 변환한다.

### 5-2. Dialogue

각 씬의 `dialogues[]`를 펼쳐 `DialogTable` 여러 행으로 변환한다.

### 5-3. Choice

각 씬의 `choices[]`를 펼쳐 `ChoiceTable` 여러 행으로 변환한다.

### 5-4. Branch

각 씬의 `branches[]`를 펼쳐 `BranchTable` 여러 행으로 변환한다.

### 5-5. Evidence

각 씬의 `evidence[]`를 펼쳐 `EvidenceTable` 여러 행으로 변환한다.

---

## 6. 정렬 원칙

역변환 시 테이블 정렬 기준은 다음과 같다.

- SceneTable: 씬 ID 또는 chapter 기준 안정 정렬
- DialogTable: `SceneID`, `Order`
- ChoiceTable: `SceneID`, `Order`
- BranchTable: `SceneID`, `Order`
- EvidenceTable: `SceneId`, `EvidenceID`

정렬 기준이 고정되어 있어야 diff 비교와 검수가 쉬워진다.

---

## 7. 운용 방침

### 7-1. 기본 방침

- 메인 작업은 노드형 에디터
- 최종 반영은 `game_data.js`
- 테이블 산출물은 필요 시 역변환으로 생성

### 7-2. 추천 사용 방식

1. 노드형 에디터에서 데이터 수정
2. `game_data.js` 갱신
3. `json_to_generated_xlsx.py` 실행
4. 생성된 xlsx를 검수 / 공유 / 백업용으로 사용

---

## 8. 주의사항

- 역변환 시 주석, 수동 색상, 수동 메모 같은 엑셀 전용 부가 정보는 복원하지 않는다.
- 역변환은 구조 데이터 복원에 초점을 둔다.
- 따라서 `script.xlsx`를 완전한 수기 문서로 쓰기보다, 구조 검수 가능한 산출물로 보는 편이 적절하다.

---

## 9. 최종 정리

양방향 파이프라인의 핵심은 다음과 같다.

- 편집 중심은 노드형 에디터
- 실행 중심은 `game_data`
- 검수 / 공유 중심은 `xlsx`

즉, 세 포맷이 역할을 분담하되, 어느 한쪽에 갇히지 않도록 상호 변환 가능한 구조를 유지하는 것이 목표다.
