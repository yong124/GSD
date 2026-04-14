# 寃쎌꽦???곗씠???뚯씠釉?紐낆꽭

> 踰붿슜 HTML ADV ?붿쭊 湲곗? ?뚯씠釉?援ъ“.
> ?ㅺ퀎 諛곌꼍怨??먯튃? `?뚯씠釉??꾩쟾_?덇뎄議?md`瑜?李몄“?쒕떎.

---

## 1. GaugeTable

寃뚯엫 ???섏튂瑜??뺤쓽?쒕떎.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `GaugeID` | ?섏튂 怨좎쑀 ID |
| `Label` | ?쒖떆 ?대쫫 |
| `MinValue` | 理쒖넖媛?|
| `MaxValue` | 理쒕뙎媛?|
| `DefaultValue` | 珥덇린媛?|
| `HudVisible` | HUD ?곸떆 ?쒖떆 ?щ? |
| `HudOrder` | HUD ?쒖떆 ?쒖꽌 |

### 寃쎌꽦???곸슜 ?덉떆

| GaugeID | Label | Min | Max | Default | HudVisible |
|---|---|---|---|---|---|
| `Erosion` | 移⑥떇 | 0 | 10 | 0 | true |
| `Credibility` | ?좎슜 | 0 | 10 | 10 | true |

---

## 2. GaugeStateTable

?섏튂 ?④퀎瑜??뺤쓽?쒕떎. 媛숈? `GaugeID`???됰뱾???섏튂 踰붿쐞蹂??곹깭瑜?援ъ꽦?쒕떎.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `GaugeID` | ?뚯냽 ?섏튂 |
| `MinValue` | ???곹깭 理쒖넖媛?|
| `MaxValue` | ???곹깭 理쒕뙎媛?|
| `Label` | ?곹깭 ?대쫫 |
| `HudColor` | HUD ?쒖떆 ?됱긽 |
| `Detail` | ?곹깭 ?ㅻ챸 |
| `TriggerSceneID` | ???곹깭 吏꾩엯 ???대룞????(`None`?대㈃ ?꾪솚 ?놁쓬) |

---

## 3. EffectTable

?④낵 臾띠쓬???뺤쓽?쒕떎. 媛숈? `EffectGroupID`瑜?媛吏??됱? ?숈떆???ㅽ뻾?쒕떎.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `EffectGroupID` | 臾띠쓬 ID |
| `EffectType` | ?④낵 醫낅쪟 |
| `GaugeID` | `GaugeChange`????????섏튂 |
| `GaugeDelta` | `GaugeChange`????蹂?붽컪 |
| `EvidenceID` | `EvidenceGive`?????띾뱷 利앷굅 |
| `TrustCharacterID` | `TrustChange`???????罹먮┃??|
| `TrustDelta` | `TrustChange`????蹂?붽컪 |

### EffectType

- `GaugeChange` ???섏튂 蹂??
- `EvidenceGive` ??利앷굅 ?띾뱷
- `TrustChange` ??罹먮┃???좊ː??蹂??

---

## 4. ConditionTable

寃뚯엫 ???쒖떆/遺꾧린 議곌굔??怨듯넻?쇰줈 ?뺤쓽?쒕떎. 媛숈? `ConditionGroupID`瑜?媛吏??됱? 紐⑤몢 留뚯”?댁빞 ?쒕떎(AND).

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `ConditionID` | 議곌굔 怨좎쑀 ID |
| `ConditionGroupID` | AND 議곌굔 臾띠쓬 ID |
| `ConditionType` | 寃?????|
| `ConditionTargetID` | 寃?????ID |
| `CompareType` | 鍮꾧탳 諛⑹떇 |
| `ConditionValue` | 鍮꾧탳媛?|

### ConditionType

| ???| ConditionTargetID |
|---|---|
| `GaugeValue` | GaugeID |
| `Trust` | CharacterID |
| `EvidenceOwned` | EvidenceID |
| `ChoiceSelected` | ChoiceID |
| `RevealedCharacter` | CharacterID |
| `SceneProgressIndex` | ??|
| `SceneVisited` | SceneID |

### ECompareType

- `Equal`
- `NotEqual`
- `Greater`
- `GreaterEqual`
- `Less`
- `LessEqual`

---

## 5. SceneTable

?ъ쓽 硫뷀? ?뺣낫瑜??뺤쓽?쒕떎.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `SceneID` | ??怨좎쑀 ID |
| `Chapter` | 梨뺥꽣 踰덊샇 |
| `Title` | ???쒕ぉ |
| `Background` | 諛곌꼍 寃쎈줈 |
| `Music` | BGM 寃쎈줈 |
| `Effect` | ??吏꾩엯 ?④낵 |
| `GoalKicker` | 紐⑺몴 UI 癒몃━留?|
| `GoalText` | 紐⑺몴 臾몄옣 |
| `EvidencePromptTitle` | 利앷굅 ?쒖떆 UI ?쒕ぉ |
| `EvidencePromptHint` | 利앷굅 ?쒖떆 UI ?덈궡 臾멸뎄 |
| `InvestigationTitle` | 議곗궗 ???쒕ぉ |
| `InvestigationHint` | 議곗궗 ???덈궡 臾멸뎄 |

### 硫붾え

- ???대룞? `BranchTable`?먯꽌 泥섎━?쒕떎.
- ??吏꾩엯 ???④낵媛 ?꾩슂?섎㈃ 泥?踰덉㎏ `DialogTable` ?됱뿉 `EffectGroupID`瑜?遺숈씤??

---

## 6. DialogTable

???덉쓽 ?쒖감 ????몃뱶.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `DialogID` | ???怨좎쑀 ID |
| `SceneID` | ?뚯냽 ??|
| `Order` | ????湲곕낯 ?쒖꽌 |
| `CharacterID` | ?붿옄 罹먮┃??|
| `EmotionType` | 媛먯젙 ???|
| `StandingSlot` | ?ㅽ깲???꾩튂 |
| `FocusType` | ?ъ빱?????|
| `EnterMotion` | ?깆옣 紐⑥뀡 |
| `ExitMotion` | ?댁옣 紐⑥뀡 |
| `IdleMotion` | ?좎? 紐⑥뀡 |
| `FxType` | ?쒓컙 FX |
| `Text` | ???蹂몃Ц |
| `Style` | ????ㅽ???|
| `ConditionGroupID` | ????쒖떆 議곌굔 |
| `ChoiceGroupID` | ???쒖젏???몄텧???좏깮吏 洹몃９ |
| `NextDialogID` | 媛뺤젣 ?곌껐???ㅼ쓬 ???|
| `EffectGroupID` | ?????吏꾪뻾 ??諛쒕룞???④낵 |

---

## 7. ChoiceGroupTable

??踰덉뿉 ?쒖떆?섎뒗 ?좏깮吏 臾띠쓬.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `ChoiceGroupID` | ?좏깮吏 洹몃９ ID |
| `Type` | 洹몃９ 醫낅쪟 |
| `AnswerType` | ?낅젰 諛⑹떇 |
| `ConditionGroupID` | 洹몃９ ?쒖떆 議곌굔 |
| `MaxSelectable` | ?좏깮 媛??媛쒖닔 |
| `DefaultDialogID` | `AnswerType: Evidence`?????뺤쓽?섏? ?딆? 利앷굅 ?쒖떆 ??諛섏쓳 ???|

### EChoiceGroupType

- `Normal`
- `Investigation`
- `Evidence`

### EAnswerType

- `Text` ???띿뒪???좏깮吏 踰꾪듉
- `Evidence` ???꾩옱 蹂댁쑀??利앷굅 ?몃깽?좊━ ?꾩껜 ?쒖떆

---

## 8. ChoiceTable

?뚮젅?댁뼱媛 怨좊Ⅴ??媛쒕퀎 ?좏깮吏.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `ChoiceID` | ?좏깮吏 怨좎쑀 ID |
| `ChoiceGroupID` | ?뚯냽 洹몃９ ID |
| `Order` | 洹몃９ ???쒖꽌 |
| `Text` | ?좏깮吏 臾멸뎄 (`AnswerType: Text`???? |
| `EvidenceID` | 諛섏쓳??利앷굅 ID (`AnswerType: Evidence`???? |
| `ConditionGroupID` | ?좏깮吏 ?몄텧 議곌굔 |
| `NextType` | ?대룞 ???|
| `NextID` | ?대룞 ???ID |
| `EffectGroupID` | ?좏깮 ??諛쒕룞???④낵 |

### ENextType

- `Scene`
- `Dialog`
- `None`

### 硫붾え

- `AnswerType: Evidence`????`Text`??鍮꾩썙???쒕떎.
- ?④낵??`EffectTable`濡?遺꾨━?먮떎. 湲곗〈 `TrustCharacterID`, `TrustValue`, `ResonanceValue`, `StateType`, `StateValue`???쒓굅?먮떎.

---

## 9. BranchTable

??醫낅즺 ???먮룞 遺꾧린.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `BranchID` | 遺꾧린 怨좎쑀 ID |
| `SceneID` | ?뚯냽 ??ID |
| `Order` | 遺꾧린 ?됯? ?쒖꽌 |
| `ConditionGroupID` | 遺꾧린 議곌굔 |
| `NextSceneID` | ?대룞???ㅼ쓬 ??|

---

## 10. EvidenceTable

?뺤쟻 利앷굅 ?뺤쓽.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `EvidenceID` | 利앷굅 怨좎쑀 ID |
| `Name` | 利앷굅 ?대쫫 |
| `Description` | 利앷굅 ?ㅻ챸 |
| `Image` | 利앷굅 ?대?吏 寃쎈줈 |
| `CategoryID` | UI 移댄뀒怨좊━ ID |

---

## 11. EvidenceCategoryTable

?⑥꽌 UI 移댄뀒怨좊━ ?뺤쓽.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `CategoryID` | 移댄뀒怨좊━ 怨좎쑀 ID |
| `CategoryTitle` | 移댄뀒怨좊━ ?대쫫 |
| `CategoryHint` | 移댄뀒怨좊━ ?ㅻ챸 |

---

## 12. CharacterTable

罹먮┃??湲곕낯 ?뺣낫? ?섏꺽 ?뺣낫.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `CharacterID` | 罹먮┃??怨좎쑀 ID |
| `DisplayName` | ?쒖떆 ?대쫫 |
| `DefaultTrust` | 寃뚯엫 ?쒖옉 ??湲곕낯 ?좊ː??|
| `NotebookSummary1` | ?섏꺽 ?붿빟 1 |
| `NotebookSummary2` | ?섏꺽 ?붿빟 2 |

### 硫붾え

- `RoleText`???고????꾪솚 ?꾨즺 ?꾧퉴吏 蹂댁“ 而щ읆?쇰줈 ?덉슜?쒕떎.

---

## 13. CharacterEmotionTable

媛먯젙蹂??대?吏 留ㅽ븨.

| 而щ읆 | ?ㅻ챸 |
|---|---|
| `CharacterID` | 罹먮┃??ID |
| `EmotionType` | 媛먯젙 ???|
| `ImagePath` | 媛먯젙蹂??대?吏 寃쎈줈 |

---

## ?쒓굅???뚯씠釉?

| ?뚯씠釉?| ?쒓굅 ?댁쑀 |
|---|---|
| `InvestigationTable` | `SceneTable` + `ChoiceGroupTable`로 완전 흡수 |

---

## 제거된 레거시 필드

아래 필드는 현재 구조에서 이미 쓰지 않는 레거시 필드다.

- `Choice.StateKey` / `Choice.StateValue`
- `Choice.NextScene` / `Choice.NextDialogue`
- `Choice.PriorityCost` / `Choice.ExtraFlags`
- `Choice.TrustCharacterID` / `Choice.TrustValue`
- `Choice.ResonanceValue`
- `Choice.StateType` / `Choice.StateValue`
- `Dialog.Label` / `Dialog.ConditionKey` / `Dialog.ConditionValue`
- `Scene.NextScene`
- `Scene.PriorityTitle` / `Scene.PriorityHint` / `Scene.PriorityBudget`
- `Scene.PriorityAfterDialogues`
