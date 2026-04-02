# 경성뎐 변수 명세서

## 1. 문서 목적

이 문서는 `경성뎐`의 서사 시스템에서 실제로 사용할 전역 변수와 핵심 플래그를 확정하는 명세서다.

이 문서는 다음 작업의 기준이 된다.

1. `script.xlsx` 데이터 입력
2. `game_data.js` 분기 조건 설계
3. 엔딩 조건 점검
4. 에디터 검수 기준 정리

모든 키는 `PascalCase` 기준으로 작성한다.

## 2. 운영 원칙

- 반복 누적은 수치형 변수로 관리한다.
- 한 번 발생한 사건 여부는 플래그로 관리한다.
- 변수는 가능한 한 `장면 목적`과 바로 연결되게 둔다.
- 변수 하나가 너무 많은 의미를 동시에 가지지 않게 한다.

## 3. 전역 수치 변수

## 3-1. `InvestigationScore`

- 타입: `Int`
- 기본값: `0`
- 범위: `0 ~ 5`
- 용도:
  - 플레이어가 사건의 핵심을 얼마나 깊게 파고들었는지 기록
  - 추가 질문 해금
  - 챕터 4A 정보량 차이
  - 엔딩 B 보조 조건

### 증가 조건

- 이판규 접견에서 핵심 질문 두 갈래를 모두 확인
- 폐공장 조사에서 쪽지와 시신 상태를 모두 확인
- 자료실에서 과거 기사 뭉치를 확보
- 옥련 대화에서 사건 구조를 끝까지 추궁

### 참조 씬

- `ch2_hospital`
- `ch2_factory`
- `ch4a_library`
- `ch4b_cafe`
- `ch6_ending_b`

## 3-2. `SongsoonTrust`

- 타입: `Int`
- 기본값: `0`
- 범위: `0 ~ 3`
- 용도:
  - 송순과 유웅룡 사이의 신뢰 수준 기록
  - 챕터 3~6 대사 톤 변화
  - 후반부 공조 감정선 강화

### 증가 조건

- 송순의 실종 진술을 진지하게 받아들임
- 송금 관련 단서를 기사거리로 취급하지 않음
- 악보 장면에서 송순의 판단을 신뢰함
- 후반부 진입 전에 송순을 동등한 파트너로 대함

### 참조 씬

- `ch3_warehouse`
- `ch3_room4`
- `ch5_ritual_path`
- `ch6_ritual_scene`

## 3-3. `ResonanceLevel`

- 타입: `Int`
- 기본값: `0`
- 범위: `0 ~ 4`
- 용도:
  - 초자연 접촉 수준 기록
  - 환청/환시 연출 강도 조절
  - 엔딩 A 조건 보조
  - 일부 독백과 스타일 변화

### 증가 조건

- 위험한 오브젝트를 직접 확인
- 감응 악보를 끝까지 읽음
- 벽 너머 허밍이나 의례 문구에 적극적으로 반응
- 의례실 심층 조사

### 참조 씬

- `ch3_warehouse`
- `ch3_room4`
- `ch5_ritual_room`
- `ch6_ending_a`

## 4. 핵심 운영 플래그

## 4-1. `EditorRel`

- 타입: `Int`
- 기본값: `0`
- 값:
  - `0`: 냉소 / 거리 둠
  - `1`: 순응 / 협조
- 용도:
  - 초반 편집장과의 관계 방향 결정
  - 이후 편집장의 말투 및 협조 정도 차이

### 설정 씬

- `ch1_newsroom`

### 참조 씬

- `ch4a_library`
- `ch5_ritual_path`

## 4-2. `InfoLevel`

- 타입: `Int`
- 기본값: `0`
- 값:
  - `0`: 기본
  - `1`: 감응 관련 정보 확보
  - `2`: 감응 + 문 구조 정보 확보
- 용도:
  - 이판규 접견의 조사 깊이 반영
  - 중반부 독백과 정보 정리 대사 차이

### 설정 씬

- `ch2_hospital`

### 참조 씬

- `ch2_hospital_a`
- `ch2_hospital_b`
- `ch5_ritual_room`

## 4-3. `EndingAScore`

- 타입: `Int`
- 기본값: `0`
- 범위: `0 ~ 2`
- 용도:
  - 송순/송금/감응 축 관련 엔딩 A 누적 조건

### 증가 조건

- 언니의 방 관련 감응 선택 수행
- 옥련 대화에서 깊은 추궁 선택 수행

### 설정 씬

- `ch3_room4`
- `ch4b_cafe`

### 참조 씬

- `ch6_ending_a`

## 4-4. `OkryunPushed`

- 타입: `Bool`
- 기본값: `False`
- 용도:
  - 옥련을 끝까지 밀어붙였는지 기록
  - 엔딩 A와 챕터 5 송순 대사 밀도에 사용

### 설정 씬

- `ch4b_cafe`

### 참조 씬

- `ch5_ritual_path`
- `ch6_ending_a`

## 4-5. `CalledEditor`

- 타입: `Bool`
- 기본값: `False`
- 용도:
  - 최종 진입 전 편집장에게 연락했는지 기록
  - 챕터 6 외부 개입 가능성 및 엔딩 B 조건에 사용

### 설정 씬

- `ch5_ritual_path`

### 참조 씬

- `ch6_ritual_scene`
- `ch6_ending_b`

## 4-6. `FinalChoice`

- 타입: `String`
- 기본값: `""`
- 값:
  - `"A"`
  - `"B"`
  - `"C"`
- 용도:
  - 최종 선택 그 자체 기록
  - 엔딩 후 로그 / 검수용

### 설정 씬

- `ch6_ritual_scene`

### 참조 씬

- `ch6_ending_a`
- `ch6_ending_b`
- `ch6_ending_c`

## 5. 추가 이벤트 플래그

아래 값은 지금 바로 다 쓰지 않아도 되지만, 시나리오 작성 중 필요하면 바로 붙일 수 있는 예비 플래그다.

## 5-1. `TouchedRoomWall`

- 타입: `Bool`
- 기본값: `False`
- 설정 씬: `ch3_room4`
- 용도:
  - 감응 접촉 이벤트 기록
  - `ResonanceLevel` 상승 근거

## 5-2. `ShowedMaskToOkryun`

- 타입: `Bool`
- 기본값: `False`
- 설정 씬: `ch4b_cafe`
- 용도:
  - 단서 제시형 분기 확장용

## 5-3. `FoundOldArticles`

- 타입: `Bool`
- 기본값: `False`
- 설정 씬: `ch4a_library`
- 용도:
  - 편집장 과거 사건 인지 여부 회수

## 5-4. `ReadRitualScore`

- 타입: `Bool`
- 기본값: `False`
- 설정 씬: `ch3_warehouse`
- 용도:
  - 감응 악보를 끝까지 읽었는지 기록

## 5-5. `TrustedSongsoon`

- 타입: `Bool`
- 기본값: `False`
- 설정 씬: `ch3_warehouse`
- 용도:
  - `SongsoonTrust`의 서사적 사건 기록 버전
  - 후반부 특정 대사 조건에 보조적으로 사용 가능

## 6. Evidence 운영 기준

Evidence는 별도 수치가 아니라 `획득 여부` 자체가 상태다.

현재 우선 관리 대상은 아래와 같다.

- `EvNote`
- `EvRitualScore`
- `EvBlueHanbok`
- `EvMask`
- `EvDiary`
- `EvOldArticles`
- `EvBlueCloth`

각 Evidence는 다음 중 최소 하나에 연결되어야 한다.

- 대사 해금
- NPC 반응 변화
- 엔딩 조건 보조
- 세계관 이해도 강화

## 7. 최소 구현 세트

초반 제작에 바로 필요한 최소 세트는 아래다.

### 즉시 구현

- `EditorRel`
- `InfoLevel`
- `InvestigationScore`
- `SongsoonTrust`
- `ResonanceLevel`
- `EndingAScore`
- `OkryunPushed`
- `CalledEditor`
- `FinalChoice`

### 필요 시 추가

- `TouchedRoomWall`
- `ShowedMaskToOkryun`
- `FoundOldArticles`
- `ReadRitualScore`
- `TrustedSongsoon`

## 8. 작성 규칙

실제 데이터 작성 시 규칙은 아래와 같다.

- 수치 증감은 선택지 직후 바로 반영한다.
- 플래그는 사건이 발생한 씬에서 바로 기록한다.
- 엔딩 조건은 한 장면의 선택보다 중반까지의 누적값 조합으로 설계한다.
- 변수 이름은 약어 없이 `PascalCase`로 유지한다.

## 9. 다음 단계

이 명세서를 기준으로 다음 작업은 `챕터 1~3 데이터 설계`다.

그 문서에서는 씬마다 다음을 같이 적는다.

- 어떤 변수/플래그가 움직이는가
- 어떤 Evidence가 지급되는가
- 어떤 Choice가 분기를 만든다
- 어떤 Dialogue 조건이 붙는가

이 문서는 그 작업의 기준 명세로 사용한다.
