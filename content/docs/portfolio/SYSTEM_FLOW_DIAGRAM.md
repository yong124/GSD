# 시스템 플로우 다이어그램

> 현재 구현 기준의 선택, 상태 변화, 조사, 질문, 분기 흐름 요약.

---

## 전체 흐름

```text
플레이어 입력
  ├─ 일반 선택지
  │    ├─ EffectGroup 적용
  │    ├─ NextType = Scene / Dialog / None
  │    └─ 필요 시 다음 씬 또는 같은 씬 내부 Dialog 점프
  │
  ├─ 증거 제시
  │    ├─ 보유 증거 인벤토리 열기
  │    ├─ 매칭된 Choice 반응 실행
  │    └─ evidence_dialogues 또는 DialogID 분기
  │
  └─ 조사 선택지 (Investigation)
       ├─ investigation_id로 조사 메타 조회
       ├─ budget만큼 반복 선택
       ├─ EffectGroup 적용
       └─ priority_dialogues 반응 후 씬 종료

씬 종료
  ├─ 조건 분기 Branch 판정
  └─ 기본 Branch 또는 엔딩 이동
```

---

## 현재 사용 중인 게이지

| 게이지 | 역할 | HUD 카드 노출 |
|---|---|---|
| `Erosion` | 침식도 | 예 |
| `Credibility` | 평판 / 조사 신뢰도 | 예 |
| `ReadRitualScore` | 의식 독해 진척 | 아니오 |
| `SolvedQuestionCount` | 해결한 질문 수 | 아니오 |

참고:

- `SongsoonTrust`는 별도 게이지 카드가 아니라 신뢰 상태값으로 관리된다.
- `InvestigationProgress`는 파생 상태로 계산되며 수첩 상태 문구에서 읽힌다.

---

## Effect 배선 방식

현재 선택 결과 배선은 `effect_id` 단일 참조가 아니라 `EffectGroupID` 묶음 적용 구조다.

```text
Choice / Dialog
  └─ effect_group_id
       └─ EffectTable rows
            ├─ GaugeChange
            ├─ EvidenceGive
            └─ TrustChange
```

이 구조 덕분에 하나의 선택이 평판, 침식, 증거, 신뢰를 동시에 바꿀 수 있다.

---

## 질문 시스템

질문은 수첩의 `질문` 탭에서 노출되고, 관련 증거를 제출해 해결할 수 있다.

```text
관련 조건 충족
  └─ Question 노출
       ├─ related_evidence_ids 표시
       ├─ 단일 증거 제출 또는 복수 증거 연결
       ├─ 정답이면 solved_state 갱신
       └─ reward_state / solved count 반영
```

현재 구조상 질문은 단순 메모가 아니라 실제 판정 루프를 가진다.

---

## 현재 Investigation 배치

| 챕터 | 씬 | investigation_id | budget |
|---|---|---|---:|
| ch2 | `ch2_cafe` | `Investigation_CafeNakwon` | 2 |
| ch3 | `ch3_room4` | `Investigation_Room4` | 2 |
| ch6 | `ch6_ritual_scene` | `Investigation_RitualFinal` | 1 |

주의:

- 현재 `ch1`, `ch4`, `ch5`에는 Investigation 씬이 없다.
- 과거 문서에 있던 `ch4a_library / Investigation_Library` 배치는 현재 구현에 존재하지 않는다.

---

## 브랜치 구조

씬 종료 후 분기는 `scene.branches[]`에서 평가된다.

```text
Scene end
  ├─ condition_group_id가 있는 Branch를 순서대로 검사
  ├─ 처음 만족하는 next_scene로 이동
  └─ 없으면 조건 없는 기본 Branch 사용
```

현재 데이터에서는 기본 Branch 비중이 높아서, 많은 씬이 사실상 `다음 씬` 래퍼처럼 동작한다.

---

## 정리

현재 플로우의 핵심은 다음 네 가지다.

1. 선택 결과는 `EffectGroupID`로 상태에 반영된다.
2. 질문은 수첩 안에서 실제로 해결 가능한 시스템이다.
3. Investigation은 ch2, ch3, ch6 세 구간에서만 등장한다.
4. 엔딩과 씬 이동은 Branch 판정으로 결정된다.
