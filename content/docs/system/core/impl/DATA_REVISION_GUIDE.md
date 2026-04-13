# 시나리오 데이터 수정 가이드

> game_data.js 수정 지시서.
> 게임성 강화 기획(GaugeTable / EffectTable / AnswerType: Evidence)을 실제 시나리오에 반영한다.
> 대사 초안은 이 문서에 포함되어 있으며, 톤 가이드를 참고해 자연스럽게 다듬어도 된다.
> 톤 참고: `content/docs/system/writing/DIALOGUE_PERIOD_TONE_GUIDE.md`

---

## 현재 증거 목록

| EvidenceID | 이름 | 획득 씬 |
|---|---|---|
| `EvNote` | 메모 | ch2_factory |
| `EvBlueCloth` | 청색 천 | ch2_factory |
| `EvRitualScore` | 의식 악보 | ch3_warehouse |
| `EvBlueHanbok` | 청색 한복 | ch3_room4 |
| `EvMask` | 네눈 가면 | ch3_room4 |
| `EvDiary` | 송금의 일기 | ch3_room4 |
| `EvOldArticles` | 1924년 기사 | ch4a_library |
| `EvRitualNote` | 의식 메모 | ch5 |

---

## PART 1 — 신규 씬 4개

---

### 1. ch2_ipangyu (이판규 접선)

**위치**: ch2_cafe → ch2_ipangyu → ch2_well 순서로 삽입

**역할**: 이판규와의 첫 직접 대면. 그의 헛소리처럼 들리는 말에 증거를 맞춰야 진실 조각이 나온다. 논리형 퍼즐 1번.

**침식 효과**: 이 씬의 특정 선택지 진행 시 `Erosion +1`

#### 씬 메타

```
scene_id: ch2_ipangyu
chapter: 2
title: 골목의 죄수
background: assets/bg/alley.jpeg  (기존 bg 중 적합한 것 사용)
music: assets/sfx/jazz_dark.mp3
goal_kicker: 조사 목표
goal_text: 이판규의 말 속에서 진짜 정보와 헛소리를 가려낸다.
```

#### 대사 흐름

```
[나레이션] 카페를 나서자 골목 어귀에 아까 법정에서 보았던 남자가 서 있다.
           판결 이후에도 저 눈빛은 달라지지 않았군.

[이판규] 기자 양반, 토요일 밤 그 집에 다녀왔소? 
         노래 소리가 아직 귀에 남습니까?

[유웅룡] (속마음) 노래? 카페에서 음악이 없었던 건 아닌데.
          이 남자, 아는 게 있다.

[이판규] 문이 열리면 먼저 들어간 자가 나오지 못하는 법이오.
         청색이 보이는 자는 이미 문 앞에 서 있는 거요.
         (유웅룡을 위아래로 훑으며) 당신한텐 냄새가 나는군. 조금.
```

#### 논리형 퍼즐 (AnswerType: Evidence)

**이판규 발언**: *"청색이 보이는 자는 이미 문 앞에 서 있는 거요"*

이 대사 이후 ChoiceGroup 트리거.

| 제시 증거 | 결과 | Credibility | Erosion | 이동 대사 |
|---|---|---|---|---|
| `EvBlueCloth` (청색 천) | **정답** | +1 | +1 | 이판규가 눈을 가늘게 뜨며 더 말한다 |
| `EvRitualScore` (악보) | **정답** | +1 | +1 | 이판규가 악보를 낚아채듯 보고는 고개를 끄덕인다 |
| 기타 증거 | **오답** | -1 | 0 | "아직 멀었소. 눈에 보이는 것만 보고 있구먼" |

**default_dialog**: *"기자 양반, 손에 든 게 없으면 내 말이 그냥 헛소리로 들리겠지요."*

#### 정답 시 이어지는 대사

```
[이판규] (청색 천 / 악보를 보며) 이걸 어디서 났소.
         낙원 안쪽이구먼. 벌써 그 안까지 들어갔단 말이오?

[이판규] 좋소. 그렇다면 하나만 말하리다.
         토요일 밤, 노래하는 여자가 세 번째로 서는 날.
         그날 밤이 마지막이오. 문이 닫히기 전에 찾으시오.

[유웅룡] (속마음) 세 번째. 악보엔 세 개의 음표 위에 표시가 있었다.
          우연이 아니군.
```

#### 효과 정의

```
ChoiceGroup: ChoiceGroup_Ipangyu_Confront
answer_type: Evidence

Choice (정답1 - EvBlueCloth):
  effect_group_id: eff_ipangyu_correct
  next_dialog_id: dlg_ipangyu_reveal

Choice (정답2 - EvRitualScore):
  effect_group_id: eff_ipangyu_correct
  next_dialog_id: dlg_ipangyu_reveal

EffectGroup: eff_ipangyu_correct
  - GaugeChange: Credibility +1
  - GaugeChange: Erosion +1

EffectGroup: eff_ipangyu_wrong
  - GaugeChange: Credibility -1
```

---

### 2. ch6_article (기사 작성 클라이맥스)

**위치**: ch6_ritual_scene 종료 후 → ch6_article → ch6_epilogue

**역할**: 유웅룡이 수집한 증거로 기사를 완성한다. 수집한 증거 조합과 신용/침식 수치가 엔딩을 결정한다.

**형태**: AnswerType: Evidence ChoiceGroup 3개가 순서대로 진행

#### 씬 메타

```
scene_id: ch6_article
chapter: 6
title: 기사를 쓴다
background: assets/bg/desk.jpeg  (기존 bg 사용 또는 newsroom)
music: assets/sfx/silence.mp3  (또는 ambient)
goal_kicker: 기록
goal_text: 지금까지 붙든 것들로 이 사건을 기사에 담는다.
```

#### 도입 대사

```
[나레이션] 새벽 세시, 유웅룡은 수첩과 증거들을 책상 위에 늘어놓는다.
           이걸 기사로 쓸 수 있는가. 써야 하는가.
           손이 먼저 움직인다.

[유웅룡] (속마음) 이름부터 적는다. 사라진 사람들의 이름.
          그다음엔 무엇이 그들을 사라지게 했는지.
          마지막으로, 누가 알고 있었는지.
```

#### 기사 항목 3개 (AnswerType: Evidence ChoiceGroup)

**항목 1 — "송금은 왜 사라졌는가"**

| 제시 증거 | 결과 | 기사 문장 |
|---|---|---|
| `EvDiary` | **정답** | "의식의 제물로 지목된 여급 송금은 스스로의 의지로 그 자리를 택하지 않았다." |
| `EvBlueHanbok` + `EvMask` 둘 다 보유 | **정답** | 위와 동일 |
| 기타 | **오답** | "낙원의 여급 한 명이 실종됐다는 사실만을 확인했다." (구멍 난 기사) |

**항목 2 — "의식은 무엇을 목적으로 했는가"**

| 제시 증거 | 결과 | 기사 문장 |
|---|---|---|
| `EvRitualScore` | **정답** | "청의교의 의식은 특정 음률로 감응자를 특정하고, 그 감응자를 제물로 쓰는 구조였다." |
| `EvRitualNote` | **정답** | 위와 동일 |
| 기타 | **오답** | "의식의 존재는 확인했으나 목적을 특정하는 증거가 불충분하다." |

**항목 3 — "누가 알고 있었는가"**

| 제시 증거 | 결과 | 기사 문장 |
|---|---|---|
| `EvOldArticles` | **정답** | "1924년 유사 사건이 이미 편집국에 의해 한 번 묻혔다는 사실이 확인됐다." |
| 기타 | **오답** | "외부 개입 여부는 확인하지 못했다." |

#### 마무리 대사 (항목별 결과 조합 후)

```
[유웅룡] (속마음) 다 썼다. 
          이게 기사가 될 수 있는지는 편집장이 결정한다.
          하지만 적어도 한 번은 — 누군가의 수첩에 이름이 남았다.
```

→ ch6_epilogue로 이동

#### 효과 및 엔딩 분기 조건

```
각 항목 정답 시:
  effect_group_id: eff_article_correct → Credibility +1

각 항목 오답 시:
  effect_group_id: eff_article_wrong → (변화 없음, 기사 완성도만 낮아짐)

최종 엔딩 분기는 ch6_epilogue의 BranchTable에서 판단:
  - 정답 3개 + Credibility 7 이상 → 엔딩 B (기록된 것들)
  - 정답 2개 이하 + Credibility 5 이상 → 엔딩 A (돌아오지 않은 언니)
  - Credibility 4 이하 → 엔딩 C (문 너머)
  - Erosion 9 이상 진입 시 → scene_ending_erosion으로 강제 분기 (ch6_article 진입 전에 처리)
```

---

### 3. scene_ending_erosion (신도 엔딩)

**위치**: Erosion이 9~10에 도달하는 시점에 GaugeStateTable의 TriggerSceneID로 자동 진입

**역할**: 유웅룡이 스스로 의식 안으로 걸어 들어가는 엔딩. 기자가 아니라 신자로서의 선택.

**톤**: 공포보다는 체념과 몰입. 그것이 틀렸다는 걸 알면서도 멈추지 않는 감각.

#### 씬 메타

```
scene_id: scene_ending_erosion
chapter: 6
title: 문 안으로
background: assets/bg/ritual_room.jpeg  (또는 threshold)
music: assets/sfx/ritual_hum.mp3
```

#### 대사

```
[나레이션] 어느 순간부터 노래 소리가 멈추지 않는다.
           밖에 있는 건지 안에 있는 건지 구분이 안 된다.
           구분하고 싶다는 생각도 사라진 지 오래다.

[유웅룡] (속마음) 이상하다는 생각은 이미 몇 번 전에 했다.
          그때 멈췄어야 했다는 것도.
          그런데 다리가 계속 움직인다.

[나레이션] 문이 열려 있다.
           누군가 먼저 들어간 것 같은 온기가 난다.
           유웅룡은 수첩을 주머니에 넣고 — 그 안으로 걸어 들어간다.

[나레이션] 수첩은 나오지 않았다.
           기사도 나오지 않았다.
           그가 적으려 했던 이름들도, 그와 함께 안에 남았다.
```

---

### 4. scene_gameover_credibility (기자 실격 게임오버)

**위치**: Credibility가 0에 도달하는 시점에 GaugeStateTable의 TriggerSceneID로 자동 진입

**역할**: 잘못된 증거 제시와 섣부른 판단이 누적되어 기자로서의 자격을 잃는 결말.

#### 씬 메타

```
scene_id: scene_gameover_credibility
chapter: 0
title: 기록되지 않는 것들
background: assets/bg/newsroom.jpeg
music: null
```

#### 대사

```
[나레이션] 어느 시점부터 유웅룡의 말을 받아주는 사람이 없어졌다.

[편집장] 증거도 없이, 증언도 없이, 대체 뭘 기사라고 가져온 거요.
         이름 하나 제대로 확인하지 못한 게 몇 번이오.

[유웅룡] (속마음) 틀렸다. 증거를 잘못 짚었다.
          몇 번, 몇 번이나.

[나레이션] 편집장은 원고를 돌려보내지도 않았다.
           그냥 서랍에 넣었다.
           잠그는 소리가 났다.

[나레이션] 유웅룡은 취재를 계속했다.
           하지만 아무도 그의 기사를 싣지 않았다.
           사건은 그렇게, 기자와 함께 묻혔다.

[선택지] 다시 시작한다  →  ch1_court로 이동
```

---

## PART 2 — 수정 씬 4개

---

### 5. ch4b_cafe 수정 (옥련 논리형 퍼즐 추가)

**현재**: 선택지 "억지로 묻기 vs 기다리기" 단순 분기
**변경**: 옥련이 발언을 회피하는 순간에 AnswerType: Evidence ChoiceGroup 추가

#### 추가할 ChoiceGroup

발동 조건: 옥련이 *"그릇이 되어야 한다는 건 저도 들었어요. 근데 그게 무슨 뜻인지는…"* 이후 말을 흐리는 대사 직후

```
ChoiceGroup: ChoiceGroup_Okryeon_Confront
answer_type: Evidence
default_dialog_id: dlg_okryeon_close
```

| 제시 증거 | 결과 | Credibility | Erosion | 이동 대사 |
|---|---|---|---|---|
| `EvDiary` (일기) | **정답** | +1 | 0 | 옥련이 굳는다. "...어떻게 가지고 계세요, 그걸." |
| `EvBlueHanbok` (한복) | **정답** | +1 | +1 | 옥련이 뒤로 물러선다. "그 옷을 보신 거예요?" |
| 기타 | **오답** | -1 | 0 | 옥련이 입을 닫는다 |

**정답 시 옥련이 말하는 것**:
```
[옥련] 송금 씨가 그 방에 들어간 건… 스스로 원해서가 아니에요.
       이해심 선생이 지목을 했어요. "저 사람이 그릇이다"라고.
       송금 씨는 그날 밤 울지도 않았어요. 이미 알고 있었던 것처럼.
```

**오답/default 대사**:
```
[옥련] 죄송해요. 제가 더 드릴 말씀이 없어요.
       여기서 오래 일한 사람들은 다 그래요. 모르는 게 낫다고 배웠거든요.
```

---

### 6. ch2_well 수정 (송순 신뢰 개방 구조 추가)

**현재**: 대화 흐름만 있음. 송순이 조건 없이 협력 제안
**변경**: 송순이 처음에 의심하는 순간, 증거를 보여줘야 신뢰가 열리는 구조 추가

**발동 시점**: 송순이 *"기자들은 적어도 들은 걸 바로 잊진 않으니까"* 이후, *"근데 왜 이 사건에 관심을 갖는 거예요?"* 라고 묻는 대사 직후

```
ChoiceGroup: ChoiceGroup_Songsoon_Trust
answer_type: Evidence
default_dialog_id: dlg_songsoon_skeptical
```

| 제시 증거 | 결과 | Trust (Songsoon) | 이동 대사 |
|---|---|---|---|
| `EvNote` (메모) | **정답** | +1 | "…이걸 어디서 구하셨어요. 낙원 안에서 나온 거잖아요." |
| `EvBlueCloth` (청색 천) | **정답** | +1 | "청색. 맞아요. 언니가 마지막에 그걸 입고 있었어요." |
| 기타 | **오답** | 0 | 송순이 한 발 물러선다 |

**정답 시 이어지는 대사**:
```
[송순] 기자님이 진짜로 안쪽까지 들어가 보셨군요.
       그럼 같이 움직여도 될 것 같아요.
       저도 혼자서는 한계가 있었거든요.
```

**오답/default 대사**:
```
[송순] 그냥 궁금해서요? 신문 한 줄 쓰려고요?
       그런 분들은 많이 봤어요. 다음 날 되면 다른 기사 쓰더라고요.
       (잠시 뜸을 들이다가) …그래도 여기까지 왔으니까.
       일단 들어나 보세요.
```

---

### 7. ch4a_editor_room 수정 (편집장 논리형 퍼즐 추가)

**현재**: 편집장이 과거 은폐를 인정하는 대화
**변경**: 편집장이 부인하는 순간에 증거 제시 구조 추가. 정답이면 은폐 구조가 드러남

**발동 시점**: 편집장이 *"그건 내가 묻은 게 아니라, 묻힐 수밖에 없었던 거요"* 이후

```
ChoiceGroup: ChoiceGroup_Editor_Confront
answer_type: Evidence
default_dialog_id: dlg_editor_deflect
```

| 제시 증거 | 결과 | Credibility | 이동 대사 |
|---|---|---|---|
| `EvOldArticles` (1924년 기사) | **정답** | +2 | 편집장이 입을 다문다. 긴 침묵. |
| 기타 | **오답** | -1 | "그게 지금 이 사건과 무슨 관계요." |

**정답 시 이어지는 대사**:
```
[편집장] (긴 침묵 후)
         ...그 기사, 어디서 났소.

[유웅룡] 도서관에 남아 있었습니다. 선생님이 지우지 못한 것들이.

[편집장] 나도 처음엔 쓰려 했소. 근데 위에서—
         (말을 자른다) ...알겠소. 이번엔 내가 막지 않겠소.
         대신 증거가 완벽해야 해. 구멍이 하나라도 있으면 난 모른다.
```

**오답/default 대사**:
```
[편집장] 증거도 없이 사람 잡으러 왔소?
         기사는 사실로 쓰는 거요. 추측으로 쓰는 게 아니라.
```

---

### 8. 엔딩 조건 재연결

현재 `EndingAScore`, `OkryunPushed` 플래그를 신규 Gauge/Trust 기반으로 교체한다.

#### ch6_epilogue BranchTable

```
Branch 1 (최우선)
  조건: Erosion GaugeState = 붕괴 (10)
  → 이미 scene_ending_erosion으로 강제 이동됨. 여기까지 오지 않음.

Branch 2
  조건: Credibility GaugeValue >= 7 AND ChoiceSelected: article_q3_correct
  → ch6_ending_b (기록된 것들)

Branch 3
  조건: Trust(Songsoon) >= 1 AND ChoiceSelected: article_q1_correct
  → ch6_ending_a (돌아오지 않은 언니)

Branch 4 (기본)
  조건: null
  → ch6_ending_c (문 너머)
```

#### 침식 높음 + 기사 작성 완료 시 (엔딩 B 변형)

```
ch6_ending_b 내부에 Branch 추가:
  조건: Erosion GaugeValue >= 6 AND Credibility >= 7
  → 엔딩 B 내에서 "오염된 기록자" 변형 대사 분기
  (기사를 썼지만 유웅룡의 문장 곳곳에 의식의 언어가 스며든 상태)
```

---

## PART 3 — 게임오버 씬 GaugeStateTable 연결

STEP 01에서 만든 GaugeStateTable에 아래와 같이 TriggerSceneID를 설정한다.

| GaugeID | 단계 | min | max | TriggerSceneID |
|---|---|---|---|---|
| `Erosion` | 붕괴 | 10 | 10 | `scene_ending_erosion` |
| `Credibility` | 실각 | 0 | 0 | `scene_gameover_credibility` |

---

## PART 4 — 신규 증거 추가

이판규 씬과 클라이맥스를 위해 기존 증거 외 추가는 불필요.
단, `EvBlueCloth`와 `EvNote`의 description을 아래와 같이 보완한다.

| EvidenceID | 현재 description | 보완 방향 |
|---|---|---|
| `EvBlueCloth` | 청색 천 조각 | "낙원 공장 구석에서 발견된 청색 직물. 낙원의 무녀들이 입는 한복과 같은 색이다." |
| `EvNote` | 메모 | "공장 벽에 붙어있던 메모. 날짜와 이름이 적혀있으나 일부가 지워져 있다." |

---

## 수정 작업 순서

```
1. 신규 씬 4개 추가 (ch2_ipangyu, ch6_article, scene_ending_erosion, scene_gameover_credibility)
2. ch2_cafe의 branches에서 ch2_well 대신 ch2_ipangyu → ch2_well 순서로 변경
3. ch4b_cafe에 ChoiceGroup_Okryeon_Confront 추가
4. ch2_well에 ChoiceGroup_Songsoon_Trust 추가
5. ch4a_editor_room에 ChoiceGroup_Editor_Confront 추가
6. ch6_ritual_scene의 next_scene을 ch6_article로 변경
7. ch6_epilogue BranchTable 재작성
8. EvBlueCloth, EvNote description 보완
9. validate_game_data.py 실행 확인
```
