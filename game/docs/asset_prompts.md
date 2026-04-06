# 🎨 경성뎐(Gyeongseong Engine) 필요 에셋 및 기획 문서 기반 생성 프롬프트

해당 문서는 `game_data.js` 및 **게임 코어 기획 문서(`docs/system/characters`)의 캐릭터 아크(ARC)**를 철저히 반영하여 작성된 에셋 생성 가이드입니다. 1930년대 일제강점기 경성의 디스토피아 느와르와 크툴루풍 오컬트를 결합한 비주얼 로어(Lore)를 담았습니다.

---

## 1. 🌆 배경 (Backgrounds) `assets/bg/`
대부분 어둡고, 채도가 낮으며 기괴한 그림자가 깔린 1930년대 일제강점기 경성의 분위기입니다.

| 파일명 | 에셋 내용 | 추천 생성 프롬프트 |
| --- | --- | --- |
| `court.jpeg` | 냉정한 법정 | `Dark 1930s colonial era courtroom, wood panels, eerie and cold atmosphere, long distorted shadows, hardboiled noir, cinematic lighting, conceptual art --ar 16:9` |
| `newsroom.jpeg` | 난향일보 편집국 | `1930s newspaper editorial office, messy desks covered in papers and typewriters, dim cigarette smoke, dark noir aesthetic, sepia and cold blue tones --ar 16:9` |
| `hospital.jpeg` | 정신병원 입원실/접견실 | `Creepy 1930s asylum interview room, barren concrete walls, single flickering light bulb overhead, heavy iron door, claustrophobic and terrifying vibe --ar 16:9` |
| `factory.jpeg` | 외곽 폐공장 | `Abandoned 1930s industrial factory interior at dawn, rusted machinery, creepy occult horror atmosphere, faint unnatural blue mist on the floor --ar 16:9` |
| `cafe.jpeg` | 카페 '낙원' | `1930s high-end colonial cafe interior, jazz age, antique phonograph, red velvet curtains, subtle eerie vibe despite the luxury, noir lighting --ar 16:9` |
| `storage.jpeg` / `warehouse.jpg` | 빈민가 창고 | `Dark grim wooden warehouse in 1930s slum, dusty, cobwebs, mysterious crates, horror visual novel background --ar 16:9` |
| `ritual_room.jpg` | 숨겨진 의례실 | `Underground secret occult ritual room 1930s, bloody symbols on the stone floor, dark and disturbing atmosphere, faint candlelight, horror dark fantasy --ar 16:9` |

---

## 2. 🕴️ 메인 캐릭터 스탠딩 (Standing Sprites & Emotions) `assets/portraits/`, `assets/standing/`
비주얼 노벨 리소스를 위해 **투명 배경(PNG)의 반응형 스탠딩 에셋** 기준으로 작성되었습니다. 각 캐릭터의 **설정 기획안(ARC)**에 부여된 세부 외형과 성격적 텐션을 반영했습니다.

### 2-1. 유웅룡 (기자 / 기록의 책임자)
* **캐릭터 핵심:** 세상을 정의롭게 구하려 하기보단 세상이 사람을 지우는 방식을 너무 잘 아는 냉소적 생존자이나, 끝내 '누가 지워졌는지는 적어두려는' 인물.
* **기본 외형 프롬프트:** `1930s hardboiled Korean male journalist, wearing a worn-out trench coat and fedora, cynical and tired expression, holding a small notepad, dark Noir art style, half-body standing sprite, plain white background`
* **요구되는 표정 바리에이션:**
  * `Neutral`: `smoking a cigarette, calm, cynical and distant look`
  * `Tense`: `slightly frowning, sharp observing eyes, analyzing a crime scene`
  * `Shaken`: `sweating, subtle fear creeping in, realizing the horrific structure`

### 2-2. 이해심 (의식의 중심 / 무녀 / 의친왕의 숨겨진 딸)
* **캐릭터 핵심:** 흉측한 악인이 아니며, 단아하고 고귀해 보이지만 조선을 구하겠다는 확신 끝에 타락하여 '멸망을 통한 정화'를 믿는 비극적 교주. 스스로 두 눈을 내놓았다.
* **기본 외형 프롬프트:** `Very pale and fragile 1930s Korean princess, wearing an elegant but eerie blue modern hanbok, an elegant blue silk eyepatch covering her missing eyes, silver hairpin, calm and highly noble aesthetic but unsettlingly terrifying, dark fantasy occult mood, half-body standing sprite, plain white background`
* **요구되는 표정 바리에이션:**
  * `Neutral`: `gentle but extremely cold smile, confident and quiet`
  * `Trance`: `floating slightly, the blue eyepatch seems to seethe with dark energy, chillingly euphoric smile`

### 2-3. 송순 (조력자 / 지워진 사람 곁에 남은 자)
* **캐릭터 핵심:** 여급으로서 식민지의 밑바닥에 위치하며 두려움이 많으나, 공포를 안고서라도 끝내 실종된 언니(송금)의 이름을 붙드는 굳건함을 지닌다. 울부짖기보다 '눌린 결심'을 보여준다.
* **기본 외형 프롬프트:** `Young 1930s Korean woman, modest colonial modern dress (western waitress style mix), restrained desperation, holding a small diary tightly to her chest, dark cinematic lighting, half-body standing sprite, plain white background`
* **요구되는 표정 바리에이션:**
  * `Neutral`: `cautious and grieving look, tight lips, quiet resilience`
  * `Afraid`: `looking around nervously, trembling but not backing down`

### 2-4. 이판규 (광인 / 문턱의 죄수)
* **캐릭터 핵심:** 거대한 악이 아니라 기괴한 상부 구조에 '먼저 잠식되고 붕괴된' 피지배자이자 증거물.
* **기본 외형 프롬프트:** `Grotesque adult male prisoner in 1930s torn asylum clothes, severely emaciated, unnaturally twisted body posture, completely broken mind, horror visual novel standing sprite, plain white background`
* **요구되는 표정 바리에이션:**
  * `Neutral`: `looking down, rambling to himself, gloomy and chaotic`
  * `Crazy`: `empty wide eyes looking at an invisible door, bizarre unsettling smile, flesh tearing`

### 2-5. 송금 (실종자 / 의식을 위한 그릇)
* **캐릭터 핵심:** 낙원의 여급이자 수동적 희생자에 머물지 않고, 마지막까지 목소리를 빼앗기지 않으려 예감하고 저항했던 흔적을 가진 부재증명.
* **기본 외형 프롬프트:** `1930s Korean female cafe waitress in a cheap modern uniform, extremely pale skin, exhausted but refusing to fade away completely, haunting presence, horror visual novel sprite, plain white background`
* **요구되는 표정 바리에이션:**
  * `Neutral`: `nervous, frightened but hiding a secret`
  * `Trance`: `singing a bizarre humming melody with completely empty hollow eyes`

### 2-6. 엑스트라 및 특수 인물 (Extras)
* **천용해 (문턱의 인도자):** `Shadowy silhouette of a 1930s man wearing a tailored suit, unnatural bodily proportions, non-human eerie occult presence, standing sprite`
* **편집장 (Editor - 기록의 문지기):** `Cynical and pragmatic middle-aged male newspaper editor 1930s, suspenders, holding a censored newspaper, angry and tired expression`
* **경찰 / 재판관 / 점장 / 검사 등:** 각자의 직업에 맞는 1930년대 복식 바탕의 엑스트라 스탠딩.

---

## 3. 🧩 단서 및 소품 (Items/Evidence) `assets/items/` & `assets/ev/`
| 파일명 | 에셋 내용 | 추천 생성 프롬프트 |
| --- | --- | --- |
| `bluecloth.jpeg` | 푸른 천 조각 | `A ragged piece of blue silk cloth stained with dark dried blood, placed on a dark wooden table, macro photography, terrifying occult item` |
| `diary.png` | 숨겨진 일기장 | `An old worn-out leather notebook from 1930s, torn pages, blood splatters on the cover, dark isolated background, game UI icon` |
| `hanbok.png` | 푸른 한복 | `A torn and dirty traditional Korean blue hanbok for a child, draped over a dark background, eerie vibes` |
| `mask.png` | 기괴한 탈 | `A traditional Korean mask but distorted and terrifying, four eye holes, dark wooden texture, occult artifact` |
| `note.png` | 붉은 쪽지 | `A crumpled piece of paper with chaotic red ink handwriting, dark isolated background` |
| `scores.png` | 기괴한 악보 | `Old sheet music with chaotic, impossible musical notes that look like writhing insects, horror artifact vibes` |

---

## 4. 🎵 오디오 트랙 (SFX/Music) `assets/sfx/`
*   **Jazz / Cafe:** `jazz.mp3`, `jazz_dark.mp3` (1930년대 다크 재즈)
*   **Ambient / Gloomy:** `ambient.mp3`, `hospital.mp3`
*   **Horror / Tense:** `newsroom.mp3`, `creepy.mp3`, `tense.mp3`
*   **Ritual (Climax):** `ritual.mp3`, `ritual_climax.mp3` (무속 기반의 여음, 타악기)
