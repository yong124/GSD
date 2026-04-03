# 경성뎐 캐릭터 스키마 및 편집 계획

## 1. 문서 목적

이 문서는 `CharacterTable`, `CharacterEmotionTable`, `DialogTable` 확장을

- `script.xlsx`
- `export_to_json.py`
- `game_data.js`
- `EditorNode`

기준으로 실제 적용 가능한 수준까지 구체화한 문서다.

즉 방향 설명이 아니라
`바로 구현할 때 어떤 필드를 어떻게 넣을지`
를 정리하는 문서다.

---

## 2. 적용 원칙

### 2-1. 네이밍 규칙

모든 시트 컬럼명은 기존 규칙에 맞춰 `PascalCase`를 사용한다.

예:

- `CharacterID`
- `EmotionType`
- `ImagePath`
- `SpeakerID`
- `StandingSlot`

### 2-2. 도입 원칙

처음부터 모든 연출 필드를 한 번에 넣지 않는다.

도입 순서는 아래가 맞다.

1. `CharacterTable`
2. `CharacterEmotionTable`
3. `DialogTable`에 `SpeakerID`, `EmotionType`
4. `StandingSlot`, `FocusType`
5. 이후 `Motion`, `Fx`

### 2-3. 호환 원칙

기존 `Speaker`, `Portrait` 기반 데이터와 한동안 공존 가능해야 한다.

즉 초기 단계에서는

- 신규 데이터가 있으면 신규 구조 우선
- 없으면 기존 `Speaker`, `Portrait` fallback

구조로 가는 것이 안전하다.

---

## 3. 신규 xlsx 시트 설계

## 3-1. CharacterTable

캐릭터 기본 정보 시트.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `CharacterID` | string | O | 캐릭터 고유 ID |
| `DisplayName` | string | O | 화면 출력 이름 |
| `DefaultEmotionType` | enum | O | 기본 감정 타입 |
| `DefaultImagePath` | string |  | 기본 이미지 경로 |

### 예시

| CharacterID | DisplayName | DefaultEmotionType | DefaultImagePath |
| --- | --- | --- | --- |
| `Yuu` | `유웅룡` | `Neutral` | `assets/standing/yuu_neutral.png` |
| `Songsoon` | `송순` | `Uneasy` | `assets/standing/songsoon_uneasy.png` |
| `Ipangyu` | `이판규` | `Neutral` | `assets/standing/ipangyu_neutral.png` |

---

## 3-2. CharacterEmotionTable

캐릭터 감정별 이미지 시트.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `CharacterID` | string | O | CharacterTable 참조 |
| `EmotionType` | enum | O | 감정 타입 |
| `ImagePath` | string | O | 감정 대응 이미지 경로 |

### 예시

| CharacterID | EmotionType | ImagePath |
| --- | --- | --- |
| `Yuu` | `Neutral` | `assets/standing/yuu_neutral.png` |
| `Yuu` | `Tense` | `assets/standing/yuu_tense.png` |
| `Songsoon` | `Uneasy` | `assets/standing/songsoon_uneasy.png` |
| `Songsoon` | `Afraid` | `assets/standing/songsoon_afraid.png` |
| `Ipangyu` | `Crazy` | `assets/standing/ipangyu_crazy.png` |

### 규칙

- `CharacterID + EmotionType` 조합은 유일
- 모든 캐릭터는 최소 `Neutral` 또는 지정된 기본 감정 하나 필수
- `ImagePath`는 현재 단일 이미지 기준

---

## 4. DialogTable 확장안

## 4-1. 최소 확장 컬럼

가장 먼저 추가할 컬럼은 아래 두 개다.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `SpeakerID` | string |  | CharacterTable 참조 |
| `EmotionType` | enum |  | 현재 감정 타입 |

이 두 컬럼만 있어도

- 문자열 Speaker 의존도 감소
- 감정별 이미지 전환 가능
- 이후 스탠딩 확장 기반 확보

가 가능하다.

## 4-2. 2차 확장 컬럼

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `StandingSlot` | enum |  | `Left`, `Center`, `Right` |
| `FocusType` | enum |  | `Speaker`, `None`, `Dual` |

## 4-3. 3차 확장 컬럼

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| `EnterMotion` | enum |  | 등장 모션 |
| `ExitMotion` | enum |  | 퇴장 모션 |
| `IdleMotion` | enum |  | 유지 모션 |
| `FxType` | enum |  | 대사 순간 FX |

---

## 4-4. DialogTable 예시

| SceneID | Order | SpeakerID | EmotionType | StandingSlot | FocusType | Text |
| --- | --- | --- | --- | --- | --- | --- |
| `Ch2_Cafe` | `1` | `Songsoon` | `Uneasy` | `Left` | `Speaker` | `그런 눈으로 보지 마셔요.` |
| `Ch2_Cafe` | `2` | `Yuu` | `Tense` | `Right` | `Speaker` | `그럼 무엇을 본 겁니까.` |
| `Ch2_Cafe` | `3` | `Songsoon` | `Afraid` | `Left` | `Speaker` | `본 게 아니라, 들렸어요.` |

---

## 5. Enum 제안

## 5-1. EmotionType

- `Neutral`
- `Tense`
- `Uneasy`
- `Afraid`
- `Sad`
- `Angry`
- `Shaken`
- `Trance`
- `Crazy`

## 5-2. StandingSlot

- `Left`
- `Center`
- `Right`

## 5-3. FocusType

- `Speaker`
- `None`
- `Dual`

## 5-4. Motion 계열

### EnterMotion

- `None`
- `FadeIn`
- `SlideLeft`
- `SlideRight`

### ExitMotion

- `None`
- `FadeOut`
- `SlideOutLeft`
- `SlideOutRight`

### IdleMotion

- `None`
- `Tremble`
- `ShakeLight`
- `ShakeHard`

## 5-5. FxType

- `None`
- `Fog`
- `BlueTrace`
- `BloodSmear`
- `Flicker`
- `RitualGlow`

---

## 6. game_data.js 확장안

## 6-1. 상위 구조

현재 `window.GAME_DATA`에 아래 두 블록을 추가한다.

```js
window.GAME_DATA = {
  first_scene: "Ch1_Court",
  characters: {
    Yuu: {
      id: "Yuu",
      display_name: "유웅룡",
      default_emotion_type: "Neutral",
      default_image_path: "assets/standing/yuu_neutral.png"
    }
  },
  character_emotions: {
    Yuu: {
      Neutral: "assets/standing/yuu_neutral.png",
      Tense: "assets/standing/yuu_tense.png"
    }
  },
  scenes: { ... }
};
```

## 6-2. Dialogue entry 확장 예시

```js
{
  order: 3,
  speaker: "송순",
  speaker_id: "Songsoon",
  emotion_type: "Afraid",
  standing_slot: "Left",
  focus_type: "Speaker",
  text: "본 게 아니라, 들렸어요.",
  style: "normal",
  portrait: "assets/portraits/songsoon.jpeg"
}
```

### 적용 원칙

- 초기에는 `speaker`, `portrait` 유지
- 신규 필드가 있으면 렌더러가 신규 구조 우선 사용
- 없으면 기존 구조 fallback

이렇게 가야 기존 데이터와 충돌이 적다.

---

## 7. export_to_json.py 변경 계획

## 7-1. 신규 읽기 대상 시트

추가 시트:

- `CharacterTable`
- `CharacterEmotionTable`

## 7-2. 신규 빌드 대상

현재 `build_game_data()`는

- `SceneTable`
- `DialogTable`
- `ChoiceTable`
- `BranchTable`
- `EvidenceTable`

만 읽고 있다.

확장 후에는 아래를 추가한다.

- `CharacterTable` -> `characters`
- `CharacterEmotionTable` -> `character_emotions`

## 7-3. 변환 규칙

### CharacterTable -> characters

```python
characters[CharacterID] = {
  "id": CharacterID,
  "display_name": DisplayName,
  "default_emotion_type": DefaultEmotionType,
  "default_image_path": DefaultImagePath,
}
```

### CharacterEmotionTable -> character_emotions

```python
character_emotions[CharacterID][EmotionType] = ImagePath
```

### DialogTable 확장 필드

아래 컬럼이 있으면 대사 엔트리에 같이 넣는다.

- `SpeakerID`
- `EmotionType`
- `StandingSlot`
- `FocusType`
- `EnterMotion`
- `ExitMotion`
- `IdleMotion`
- `FxType`

없으면 생략한다.

---

## 8. EditorNode 편집 계획

## 8-1. 현재 구조

현재 `EditorNode`는 대사 카드에서 아래 필드를 직접 편집한다.

- `speaker`
- `text`
- `style`
- `portrait`
- `condition`

즉 캐릭터를 문자열과 이미지 경로 단위로 다루고 있다.

## 8-2. 1차 개선

대사 카드에 아래 필드를 추가한다.

- `SpeakerID` 드롭다운
- `EmotionType` 드롭다운

운영 방식:

- `SpeakerID`를 고르면 `CharacterTable` 목록에서 선택
- `EmotionType`을 고르면 해당 캐릭터의 감정 목록만 노출
- 미리보기 이미지는 `CharacterEmotionTable` 기준으로 자동 표시

## 8-3. 2차 개선

대사 카드에 아래 필드를 추가한다.

- `StandingSlot`
- `FocusType`

이 단계부터는 대사 프리뷰가 단순 텍스트가 아니라
좌/중/우 배치 박스를 가진 미니 스테이징 프리뷰로 바뀌는 것이 좋다.

## 8-4. 3차 개선

대사 카드에 아래 필드를 추가한다.

- `EnterMotion`
- `ExitMotion`
- `IdleMotion`
- `FxType`

다만 이 단계는 최소 구현 이후에 들어가는 것이 맞다.

## 8-5. 별도 탭 제안

`EditorNode`에 아래 관리 탭 추가를 권장한다.

### Characters 탭

- `CharacterTable` 목록 편집
- 캐릭터 추가/삭제
- 기본 감정 설정

### Emotions 탭

- 선택한 캐릭터의 `CharacterEmotionTable` 편집
- 감정 타입별 이미지 경로 입력
- 썸네일 미리보기

이렇게 분리해야 `DialogTable` 편집이 과도하게 무거워지지 않는다.

---

## 9. 구현 우선순위

### 완료

- ✅ `export_to_json.py` - `CharacterTable`, `CharacterEmotionTable` 읽기 지원
- ✅ `export_to_json.py` - `DialogTable`의 `Label`, `SpeakerID`, `EmotionType`, `StandingSlot`, `FocusType`, `EnterMotion`, `ExitMotion`, `IdleMotion`, `FxType` 선택 컬럼 지원
- ✅ `game_data.js` 상위 `characters`, `character_emotions` 구조 반영
- ✅ `ChoiceTable.NextDialogue` 지원

### 다음 단계

- `script.xlsx`에 `CharacterTable`, `CharacterEmotionTable` 시트 실제 작성
- `DialogTable`에 `SpeakerID`, `EmotionType` 컬럼 실제 추가

### 이후 단계

- `EditorNode`에 `SpeakerID`, `EmotionType` 드롭다운 편집 추가
- 캐릭터 감정 썸네일 미리보기 추가
- `StandingSlot`, `FocusType` 스테이징 프리뷰 추가
- `Motion`, `Fx` 전체 장면 연출 확장

---

## 10. 최종 정리

실제 적용 기준으로 보면 가장 먼저 해야 할 일은 아래 세 가지다.

1. `script.xlsx`에 `CharacterTable`, `CharacterEmotionTable` 시트 추가
2. `DialogTable`에 `SpeakerID`, `EmotionType` 컬럼 추가
3. `export_to_json.py`와 `EditorNode`가 그 구조를 읽도록 확장

이 세 가지가 끝나면

- 캐릭터는 더 이상 문자열이 아니게 되고
- 감정별 이미지 전환이 가능해지며
- 이후 스탠딩, 포커스, 모션 시스템으로 자연스럽게 확장할 수 있다.
