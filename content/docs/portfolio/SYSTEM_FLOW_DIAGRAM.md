# 경성뎐 시스템 플로우 다이어그램

> 시스템 기획자 관점에서 본 선택 → 상태 변화 → 분기 → 엔딩 흐름

---

## 전체 흐름 개요

```
플레이어 입력
    │
    ├─ [일반 선택지] ──────────────────────────────┐
    │                                              │
    ├─ [조사 선택지 (Investigation)]               │
    │     └─ 조사 루프 (budget 소진까지 반복)       │
    │                                              │
    └─ [증거 제시 (Evidence)]                      │
          └─ 대사 반응 재생                         │
                                                  ▼
                                        Effect Group 적용
                                                  │
                                    ┌─────────────┴─────────────┐
                                    │                           │
                               GaugeChange                 EvidenceGive
                           (Credibility / Erosion 등)     (인벤토리 추가)
                                    │
                                    ▼
                              State 갱신
                                    │
                          씬 종료 → Branch 판정
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
               조건 분기         조건 분기       기본 분기
            (condition_group) (condition_group)  (null)
                     │              │              │
                  다음 씬        다른 씬        기본 씬
```

---

## 게이지 시스템

| 게이지 | 범위 | 의미 | 엔딩 영향 |
|--------|------|------|-----------|
| `Erosion` | 0~10 | 침식도 — 위험한 선택/공명 누적 | 10 도달 시 즉시 게임오버 |
| `Credibility` | 0~10 | 신뢰도 — 증거/기록 기반 조사 | 0 도달 시 게임오버 / 엔딩 분기 가중 |
| `ReadRitualScore` | 0~10 | 의례 독해 — 의례 관련 선택 누적 | ch6 엔딩 A/B 조건 |
| `SolvedQuestionCount` | 0~10 | 해결한 질문 수 | 조사 완성도 |

---

## 선택 → 게이지 흐름 (주요 예시)

```
ch3_room4 - 벽의 문양에 손을 댄다
    └─ effect_group: eff_ch3_room4_touch_wall
          └─ GaugeChange: Erosion +2   ← 위험한 선택

ch3_room4 - 일기장의 다음 장을 읽는다
    └─ effect_group: eff_ch3_room4_read_record
          └─ GaugeChange: Credibility +1   ← 기록 기반 조사

ch4a_library - 핵심 문장만 수첩에 적는다
    └─ effect_group: eff_ch4a_library_note_articles
          └─ GaugeChange: Credibility +3   ← 높은 조사 가중치
```

---

## 조사 씬 구조 (Investigation Loop)

ch2, ch3, ch4a, ch6 에 Investigation 씬 배치.

```
Investigation 씬 진입
    │
    ▼
investigation_id → investigations 테이블 조회
    │
    ├─ title / hint → HUD 표시
    ├─ budget = 2 (ch4a_library 기준)
    └─ choice_group_id → choice_groups 조회
                              │
                              ▼
               Investigation 선택지 목록 렌더
                    (budget 소진까지 반복)
                              │
                  플레이어 선택 1회
                              │
              ├─ effect_group 즉시 적용 (gauge 변화)
              ├─ priority_dialogues[next_id] 인라인 재생
              └─ 남은 budget 차감 → re-render
                              │
                    budget === 0
                              │
                              ▼
                     다음 씬으로 이동 (branch 판정)
```

**현재 Investigation 씬 배치:**

| 챕터 | 씬 | investigation_id | budget | 조사 축 |
|------|----|-----------------|--------|---------|
| ch2 | ch2_cafe | Investigation_CafeNakwon | 2 | 지배인 / 여급 / 관찰 |
| ch3 | ch3_room4 | Investigation_Room4 | 2 | 물리 접촉 / 기록 / 관계 |
| ch4 | ch4a_library | Investigation_Library | 2 | 증거 확보 / 패턴 분석 / 의도 추적 |
| ch6 | ch6_ritual_scene | Investigation_RitualFinal | 1 | 최후 선택 (단일) |

---

## 엔딩 분기 흐름

```
ch6_threshold (게임오버 관문)
    ├─ CG_Erosion_Max (Erosion >= 10) ──────────── scene_gameover_erosion
    ├─ CG_Credibility_Zero (Credibility <= 0) ──── scene_gameover_credibility
    └─ default ─────────────────────────────────── ch6_ritual_scene
                                                         │
                                                   ch6_outcome
                                                         │
                             ┌───────────────────────────┼───────────────────────┐
                             │                           │                       │
                   CG_Branch_FinalChoice_A    CG_Branch_FinalChoice_B    CG_Branch_FinalChoice_C
                             │                           │                       │
                         ch6_path_a               ch6_path_b               ch6_ending_c
                             │                           │
                         ch6_path_a2              ch6_path_b2
                             │                           │
                         ch6_ending_a             ch6_ending_b
                                                         │
                                                   ch6_epilogue
                                           (CG_Epilogue_EndingA / EndingB 조건 분기)
```

**엔딩 분류:**

| 엔딩 | 조건 | 의미 |
|------|------|------|
| Ending A | FinalChoice_A + 조사 완성도 | 진실 공개 루트 |
| Ending B | FinalChoice_B + 관계 기반 | 공존 루트 |
| Ending C | FinalChoice_C / 기본값 | 침묵 루트 |
| Gameover (침식) | Erosion >= 10 | 너무 깊이 들어간 결과 |
| Gameover (신뢰) | Credibility <= 0 | 근거 없이 밀어붙인 결과 |

---

## 시스템 설계 원칙

1. **테이블 중심 설계** — 선택 결과(effects), 조건 판정(conditions), 조사 흐름(investigations) 모두 데이터 테이블이 소유. 런타임은 테이블을 읽어 동작할 뿐 결과값을 직접 갖지 않음.

2. **게이지 이중 구조** — Erosion(위험 누적)과 Credibility(신뢰 누적)가 서로 반대 방향으로 작용. 한쪽만 치우치면 게임오버.

3. **조사 루프 템포** — budget 소진 전까지 선택 → 반응 → 재선택이 한 씬 안에서 반복됨. 각 선택지는 서로 다른 조사 축(물리/기록/관계/위험)을 대표.

4. **엔딩 수렴 설계** — 중반부 선택은 게이지를 누적하고, ch6에서 최종 선택(A/B/C) 하나로 수렴. 엔딩 분기는 FinalChoice 플래그 + 게임오버 조건 우선 체크 순서로 판정.
