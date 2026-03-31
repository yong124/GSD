window.GAME_DATA = {
  "first_scene": "ch1_court",
  "scenes": {
    "ch1_court": {
      "id": "ch1_court",
      "chapter": 1,
      "title": "묻힌 판결",
      "background": "assets/bg/court.jpeg",
      "music": "assets/sfx/ambient.mp3",
      "next_scene": "ch1_newsroom",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "1932년 12월. 조선인 아동 두 명이 사라진 사건. 범인은 잡혔지만… 진실은 끝내, 묻혔다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "재판관",
          "text": "경성지방법원 제5호 법정. 피고 이판규, 아동 실종 및 살해 혐의 심리를 개시한다.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "검사",
          "text": "피고 이판규는 한 달 간격으로 아홉 살, 열한 살 조선인 남자아이 두 명을 살해한 혐의입니다. 피해 아동의 입 안에서 파란 천 조각이 깊숙이 말려든 채 발견되었습니다.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "재판관",
          "text": "피해자 신원은 확인되었나?",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "검사",
          "text": "아니오. 빈민가 출신 조선인 유아로 추정됩니다.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 6,
          "speaker": "재판관",
          "text": "유아라… 어린아이는 완전한 인격체로 보기 어렵지.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 7,
          "speaker": "변호인",
          "text": "피고인은 오래전부터 정신 질환을 앓아왔으며, 사건 당시 피해망상 증상이 관찰됐습니다. 또한 사체가 발견되지 않았고, 사고 실종 가능성도 배제할 수 없습니다.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 8,
          "speaker": "재판관",
          "text": "증거 불충분 및 정신질환 의심을 이유로— 피고 이판규에게 무죄를 선고한다.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 9,
          "speaker": "유웅룡",
          "text": "역시. 증거 없으면 죄도 없지. 아이 둘 죽은 거치고도… 팔릴 기사는 되겠군.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch1_newsroom": {
      "id": "ch1_newsroom",
      "chapter": 1,
      "title": "난향일보 편집국",
      "background": "assets/bg/newsroom.jpeg",
      "music": "assets/sfx/newsroom.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "편집장",
          "text": "유 기자! 이판규, 알아? 그 미친놈 말야. 풀려났다고 신문사들 죄다 물었어.",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "실종된 애들 둘. 잊혀진 지 오래잖습니까.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "편집장",
          "text": "그냥 실종이 아니지. 입에 파란 천 쑤셔 넣고 바쳤다는 놈이야. 근데 무죄야, 정신병자란 이유로. 이런 게 기사야, 유 기자.",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "그래서 뭐 어쩌라고요. 조선인 두 명 사라진 미제 사건, 지금 와서 팔리겠습니까?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "편집장",
          "text": "조선인이 죽은 것만으론 팔리지 않아. 뭔가… 기묘한 걸 써와. 미스터리하게.",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "(건네받은 클리핑을 본다) \"그는 신에게 바쳤을 뿐\"… 기묘한 기사, 한 번 써보죠.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "알겠습니다. (순응)",
          "flag_key": "editor_rel",
          "flag_value": 1,
          "next_scene": "ch2_hospital"
        },
        {
          "order": 2,
          "text": "생각해 보겠습니다. (냉소)",
          "flag_key": "editor_rel",
          "flag_value": 0,
          "next_scene": "ch2_hospital"
        }
      ],
      "evidence": []
    },
    "ch2_hospital": {
      "id": "ch2_hospital",
      "chapter": 2,
      "title": "정신병원 접견실",
      "background": "assets/bg/hospital.jpeg",
      "music": "assets/sfx/tense.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "경성 정신병원, 접견실. 철제 창살, 낡은 접견 테이블. 교도관이 문 앞에 대기 중이다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "…이판규 씨죠? 기사로 쓰기 전에, 그냥… 이야기를 듣고 싶어요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "이판규",
          "text": "…왔어. 또, 기자. (천천히 고개를 든다) 내가 죽인 게 아니야. 그 애들은… 내가 바친 거야.",
          "style": "normal",
          "portrait": "assets/portraits/pan_crazy.png"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "'바쳤다'… 누구에게요?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "이판규",
          "text": "청의의 감응을 이은… (갑자기 주문처럼) 감응, 감응, 숭성하옵시며—",
          "style": "crazy",
          "portrait": "assets/portraits/pan_crazy.png"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "'청의의 감응'이 무엇인가?",
          "flag_key": "info_level",
          "flag_value": 1,
          "next_scene": "ch2_hospital_a"
        },
        {
          "order": 2,
          "text": "'문'이 무엇인가?",
          "flag_key": "info_level",
          "flag_value": 2,
          "next_scene": "ch2_hospital_b"
        }
      ],
      "evidence": []
    },
    "ch2_hospital_a": {
      "id": "ch2_hospital_a",
      "chapter": 2,
      "title": "정신병원 — 감응 질문",
      "background": "assets/bg/hospital.jpeg",
      "music": "assets/sfx/tense.mp3",
      "next_scene": "ch2_hospital_end",
      "effect": 1,
      "dialogues": [
        {
          "order": 1,
          "speaker": "이판규",
          "text": "감응? 하하… 인간과 청의동자 사이의 통로야. 노래가 열쇠고, 무녀가 매개야. 나는 그냥 준비하는 자였을 뿐이고.",
          "style": "crazy",
          "portrait": "assets/portraits/pan_crazy.png"
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "'청의동자'… 그게 뭡니까?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "이판규",
          "text": "눈이 네 개인 아이. 해와 달의 원천. 그분의 눈이 돌아오는 날, 동방은 불타고 서방은 얼어붙어. 우리만 남아.",
          "style": "crazy",
          "portrait": "assets/portraits/pan_crazy.png"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch2_hospital_b": {
      "id": "ch2_hospital_b",
      "chapter": 2,
      "title": "정신병원 — 문 질문",
      "background": "assets/bg/hospital.jpeg",
      "music": "assets/sfx/tense.mp3",
      "next_scene": "ch2_hospital_end",
      "effect": 1,
      "dialogues": [
        {
          "order": 1,
          "speaker": "이판규",
          "text": "문? 이승과 저승 사이의 경계야. 무녀가 노래하면 열려. 근데 나는 열쇠를 틀렸어. 애들이 틀린 열쇠였대. (몸을 떤다) 그분이 노하셨어…",
          "style": "crazy",
          "portrait": "assets/portraits/pan_crazy.png"
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "틀린 열쇠…? 그럼 맞는 열쇠는 뭡니까?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "이판규",
          "text": "무녀야. 청의의 무녀. 이해심이 찾아냈어. 낙원의 그 여자.",
          "style": "crazy",
          "portrait": "assets/portraits/pan_crazy.png"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch2_hospital_end": {
      "id": "ch2_hospital_end",
      "chapter": 2,
      "title": "정신병원 — 탈주",
      "background": "assets/bg/hospital.jpeg",
      "music": "assets/sfx/tense.mp3",
      "next_scene": "ch2_factory",
      "effect": 3,
      "dialogues": [
        {
          "order": 1,
          "speaker": "이판규",
          "text": "…기자 양반. 당신은 해인가요, 달인가요…?",
          "style": "crazy",
          "portrait": "assets/portraits/pan_crazy.png"
        },
        {
          "order": 2,
          "speaker": "이판규",
          "text": "잘못했어요… 다신 안 그럴게요…! 문은 아직 열리지 않았어요…!!",
          "style": "crazy",
          "portrait": "assets/portraits/pan_crazy.png"
        },
        {
          "order": 3,
          "speaker": "",
          "text": "이판규가 갑자기 벌떡 일어서며 교도관을 밀치고 달아난다. 그 눈에는 충혈된 채 웃음기가 남아 있다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "'낙원의 여자'… 청의의 무녀… 이게 단순한 망상일까.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch2_factory": {
      "id": "ch2_factory",
      "chapter": 2,
      "title": "경성 외곽 폐공장",
      "background": "assets/bg/factory.jpeg",
      "music": "assets/sfx/creepy.mp3",
      "next_scene": "ch2_cafe",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "경성 외곽 폐공장. 이른 새벽. 바람도 없고 벌레 소리조차 없다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "경찰",
          "text": "기자 양반, 이리 와보쇼. 여깁니다.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "이판규의 시신. 무릎을 꿇은 채 고개는 비정상적으로 위를 향해 꺾여 굳어 있다. 입가엔 푸르스름한 점액. 양쪽 눈구멍은 텅 비어 있다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "…손에 뭘 쥐고 있었지. (경직된 손가락을 펴 쪽지를 꺼낸다)",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "",
          "text": "쪽지에는 붉은 잉크로 삐뚤하게 적혀 있다 — '토요일, 낙원. 그녀가 노래하면, 문은 열린다.'",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "낙원… 카페 낙원. 토요일이 오늘이다.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_note",
          "trigger": 1,
          "name": "붉은 쪽지",
          "description": "이판규의 손에서 발견된 쪽지. '토요일, 낙원. 그녀가 노래하면 문은 열린다.'",
          "image": "assets/items/note.png"
        }
      ]
    },
    "ch2_cafe": {
      "id": "ch2_cafe",
      "chapter": 2,
      "title": "카페 낙원",
      "background": "assets/bg/cafe.jpeg",
      "music": "assets/sfx/jazz.mp3",
      "next_scene": "ch3_warehouse",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "1932년 토요일 밤. 경성 종로, 카페 '낙원'. 붉고 푸른 혼합 조도. 담배 연기. 재즈풍 반주.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "토요일, 낙원… 그녀가 노래하면, 문이 열린다… 일단 확인해보자.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "점장",
          "text": "어서 오십시오. 커피로 하시겠습니까?",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "커피로 할게요. (메뉴판을 덮으며) 여기 노래 잘하는 분이 계셨다고 들었는데요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "점장",
          "text": "아… 그런 분이 있었죠. 요즘은 공연 안 합니다. 분위기가 좀… 달라졌거든요.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 6,
          "speaker": "여급",
          "text": "그냥… 그런 거 요즘은 안 해요. 이야기 꺼내지 않는 게 나아요.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 7,
          "speaker": "송순",
          "text": "(커피를 리필하러 와 조용히 쪽지를 내려놓는다) 오늘 밤, 우물터 옆 담벼락에서 기다릴게요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 8,
          "speaker": "",
          "text": "그 순간, 무대 위 조명이 깜빡이며 흔들린다. 커피잔 위 연기 속으로 파란 빛이 잠시 스쳐간다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 9,
          "speaker": "유웅룡",
          "text": "…뭔가 있다.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch3_warehouse": {
      "id": "ch3_warehouse",
      "chapter": 3,
      "title": "낙원 무대 뒤 창고",
      "background": "assets/bg/warehouse.jpg",
      "music": "assets/sfx/tense.mp3",
      "next_scene": "ch3_room4",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "그날 밤. 우물터 접선 후. 두 사람은 낙원 무대 뒤 창고로 진입한다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "송순",
          "text": "언니가 자주 머물던 곳이에요. 여기서 뭔가 들었다고 했어요… 노래 소리, 의식 같은 소리라고.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 3,
          "speaker": "",
          "text": "흩어진 악보들 사이, 유독 한 장이 반짝이며 눈에 띈다. 푸른 잉크로 무언가가 덧칠되어 있다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "…이상하다… 왜 이러지… 머리가 깨질 것 같아…",
          "style": "crazy",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "기자님! (그의 손을 잡으며) 호흡을 고르세요. 천천히. 제가 있어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "송순",
          "text": "(악보를 살피며) 이 노래… 음표 사이에 아주 작은 글씨가 — '청의의 감응을 숭성하옵시며…'",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 7,
          "speaker": "송순",
          "text": "이건 노래가 아니에요. 의식을 부르는 주문이에요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 8,
          "speaker": "유웅룡",
          "text": "(벽에 손을 댄 송순의 얼굴을 본다) 저 눈빛… 두려워하고 있는 게 아니야. 버티고 있는 거다.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 9,
          "speaker": "송순",
          "text": "(벽 너머에서 희미한 허밍이 들린다) …언니. 내가 왔어.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_scores",
          "trigger": 2,
          "name": "감응 악보",
          "description": "주문이 음표 사이에 숨겨진 기묘한 악보. 유웅룡에게만 이명과 고통을 유발한다.",
          "image": "assets/items/scores.png"
        }
      ]
    },
    "ch3_room4": {
      "id": "ch3_room4",
      "chapter": 3,
      "title": "기숙사 4번 방",
      "background": null,
      "music": "assets/sfx/sad.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "딸칵 — 오래된 자물쇠가 풀린다. 차가운 공기가 스며나온다. 시간이 멈춘 공간.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "송순",
          "text": "…여기, 언니랑 같이 살던 곳이에요. 어느 날 아무 말도 없이 사라졌어요. 신발도 그대로였고, 거울 앞에 브러시도 그대로…",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 3,
          "speaker": "송순",
          "text": "이건… 이런 옷, 언니가 입은 걸 본 적 없어요. (청색 한복을 들어 보이며)",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "무대의상도, 평상복도 아니야. 의례용 복장이다.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "…이건 뭐예요? (가면을 보며) 눈이 네 개나 있어요. 무섭게 생겼어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "의식을 위한 도구야. (서랍 이중 바닥에서 일기장을 꺼내며) 이게 뭔지 봐요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 7,
          "speaker": "유웅룡",
          "text": "(낭독) '노래를 부르면 누군가 문 밖에서 듣고 있는 기분이에요. 그 사람들은 절 그분의 그릇이라 불러요…'",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 8,
          "speaker": "유웅룡",
          "text": "'그들은 제가 청의의 무녀가 될 운명이라 했어요. 노래가 곧 감응이라면서…'",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 9,
          "speaker": "송순",
          "text": "(멍하게) …예전에 언니가 그런 말을 했어요. '자긴 무대가 아니라 문 앞에서 노래를 부를 거래.'",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 10,
          "speaker": "유웅룡",
          "text": "청의의 무녀. 이판규가 중얼거렸던 그 이름. 이건 이젠 우연이 아냐.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 11,
          "speaker": "송순",
          "text": "…언니가 뭘 겪었든, 여기 증거가 있어요. 이제 더는 남한테 맡기고 싶지 않아요. 제가 직접 찾아야겠어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 12,
          "speaker": "유웅룡",
          "text": "…이건 기사거리가 아니다. 이건… 기록해야 할 진실이다.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "벽의 문양에 손을 댄다.",
          "flag_key": "ending_a_score",
          "flag_value": 1,
          "next_scene": "ch4a_library"
        },
        {
          "order": 2,
          "text": "그대로 둔다.",
          "flag_key": "ending_a_score",
          "flag_value": 0,
          "next_scene": "ch4a_library"
        }
      ],
      "evidence": [
        {
          "evidence_id": "ev_hanbok",
          "trigger": 1,
          "name": "청색 비단 한복",
          "description": "송금의 방에서 발견된 의례용 한복. 소매 안쪽에 바느질 자국과 작은 상처 자국들.",
          "image": "assets/items/hanbok.png"
        },
        {
          "evidence_id": "ev_mask",
          "trigger": 1,
          "name": "오징어 가면",
          "description": "눈 구멍이 네 개 달린 기괴한 가면. 청의동자의 눈 네 개를 상징한다.",
          "image": "assets/items/mask.png"
        },
        {
          "evidence_id": "ev_diary",
          "trigger": 2,
          "name": "숨겨진 일기장",
          "description": "송금의 일기장. '청의의 무녀', '노래가 곧 감응', '문 앞에서 노래를 부를 것'.",
          "image": "assets/items/diary.png"
        }
      ]
    },
    "ch4a_library": {
      "id": "ch4a_library",
      "chapter": 4,
      "title": "난향일보 자료실",
      "background": null,
      "music": "assets/sfx/mystery.mp3",
      "next_scene": "ch4a_slum",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "다음 날. 유웅룡 단독 루트. 난향일보 자료실.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "1924년 기사… 지금과 똑같은 패턴의 실종 사건이다. 파란 천, 눈 없는 시신, 여성 실종.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "게다가 이 기사의 필자가… 편집장이라니? 기사 말미에 지워진 문장 — '낙원이라 불리는 장소에서—' 이후 삭제.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "처음부터 알고 있었던 거야. 나한테 이 사건을 취재시킨 것도… 우연이 아니겠지.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_records",
          "trigger": 1,
          "name": "1924년 기사 뭉치",
          "description": "과거에 발생한 유사 사건의 기록. 편집장이 직접 작성했다. 일부 문장이 삭제되어 있다.",
          "image": "assets/items/records.png"
        }
      ]
    },
    "ch4a_slum": {
      "id": "ch4a_slum",
      "chapter": 4,
      "title": "경성 외곽 빈민가",
      "background": null,
      "music": "assets/sfx/gloomy.mp3",
      "next_scene": "ch4b_cafe",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "경성 외곽 빈민가. 좁고 습한 골목. 청의교 출신 하층민을 찾아간다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "노인",
          "text": "…청의교? 그거 함부로 입에 올리면 안 돼. (목소리를 낮추며) 수년 전에도 그랬어. 여자들이 하나둘 사라지고, 아무도 찾지 않았어.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "주도하는 사람이 있습니까? 누가 이걸 이끌고 있죠?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 4,
          "speaker": "노인",
          "text": "…이해심이라는 여자. 창백한 얼굴, 푸른 옷, 한쪽 눈에 안대. 한 번 본 사람은 잊을 수가 없어.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "유웅룡",
          "text": "'이해심'. 처음으로 이름이 생겼다.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch4b_cafe": {
      "id": "ch4b_cafe",
      "chapter": 4,
      "title": "여급의 루트",
      "background": "assets/bg/cafe.jpeg",
      "music": "assets/sfx/jazz_dark.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "같은 날. 송순 단독 루트. 카페 낙원 내부.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "송순",
          "text": "옥련 씨. 언니에 대해 알고 있는 게 있으면 말해줘요. 제발.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 3,
          "speaker": "옥련",
          "text": "…(목소리를 낮추며) 송금 언니는 이해심 님께 직접 선택받았어요. '그릇이 되어야 한다'고. 노래가 문을 여는 열쇠라고 했어요.",
          "style": "normal",
          "portrait": "assets/portraits/kum_fixed.png"
        },
        {
          "order": 4,
          "speaker": "송순",
          "text": "언니가… 지금 어디에 있어요?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 5,
          "speaker": "옥련",
          "text": "저는 겁이 나서 도망쳤어요. 언니는 남았고요. 더는 모르겠어요. 전 기억하고 싶지 않아요.",
          "style": "normal",
          "portrait": "assets/portraits/kum_fixed.png"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "알겠어요. 고마워요. (멈춘다)",
          "flag_key": "ending_a_score",
          "flag_value": 2,
          "next_scene": "ch5_ritual_path"
        },
        {
          "order": 2,
          "text": "제발, 조금만 더. (캐묻는다)",
          "flag_key": "okryun_pushed",
          "flag_value": true,
          "next_scene": "ch5_ritual_path"
        }
      ],
      "evidence": []
    },
    "ch5_ritual_path": {
      "id": "ch5_ritual_path",
      "chapter": 5,
      "title": "지하 진입로",
      "background": null,
      "music": "assets/sfx/creepy_2.mp3",
      "next_scene": "ch5_ritual_room",
      "effect": 1,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "밤. 두 사람이 재합류한다. 유웅룡이 얻은 정보와 송순이 얻은 정보가 하나로 맞춰진다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "편집장이 처음부터 알고 있었어요. 1924년에도 같은 사건이 있었습니다. 그리고 이해심이라는 여자가 이 모든 걸 주도하고 있어요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "송순",
          "text": "언니는 이해심이 직접 선택했어요. '청의의 무녀'로. 노래가 문을 연다고… 언니가 그 열쇠예요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "청의동자. 눈이 네 개인 아이. 해와 달의 원천. 그 눈이 돌아오는 날 심판. 그리고 그 문이… 여기 지하에 있다는 거잖아요.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "들어가야 해요. 언니가 아직 살아있다면.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "",
          "text": "어둠 속 창고 깊숙이, 선반 뒤편에 숨겨진 문. 자물쇠도 없다. 문 너머로 미세하게 흘러나오는 공기.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 7,
          "speaker": "유웅룡",
          "text": "먼저 들어갑니다. (그녀에게 손을 내민다)",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "편집장에게 연락한다.",
          "flag_key": "called_editor",
          "flag_value": true,
          "next_scene": "ch5_ritual_room"
        },
        {
          "order": 2,
          "text": "말하지 않는다. 둘만 간다.",
          "flag_key": "called_editor",
          "flag_value": false,
          "next_scene": "ch5_ritual_room"
        }
      ],
      "evidence": []
    },
    "ch5_ritual_room": {
      "id": "ch5_ritual_room",
      "chapter": 5,
      "title": "지하 의례실",
      "background": "assets/bg/ritual_room.jpg",
      "music": "assets/sfx/ritual.mp3",
      "next_scene": "ch6_ritual_scene",
      "effect": 2,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "계단을 내려가자 공간이 열린다. 돌벽, 흙바닥, 꺼지지 않은 촛불들. 누군가 최근까지 여기 있었다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "이곳이 지하 의례실인가. 저 기분 나쁜 파란 천들 좀 봐.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "송순",
          "text": "저기 제단에… '그릇은 셋. 둘은 쓰였고 하나가 남았다'라고 적혀 있어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "그릇 셋 중 둘은 이판규가 바쳤던 아이들. 그리고 세 번째가… 아직 남아 있다.",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "언니가 살아있어요. 아직 의식이 끝나지 않았어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "",
          "text": "그때, 더 깊은 곳에서 여성의 노랫소리가 흘러나온다. 표정 없는, 감정 없는 노래.",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_ritual_note",
          "trigger": 1,
          "name": "의례실 종이",
          "description": "'그릇은 셋. 둘은 쓰였고 하나가 남았다.' 마지막 무녀가 아직 남아 있다는 증거.",
          "image": null
        }
      ]
    },
    "ch6_ritual_scene": {
      "id": "ch6_ritual_scene",
      "chapter": 6,
      "title": "의식 현장",
      "background": null,
      "music": "assets/sfx/ritual_climax.mp3",
      "next_scene": null,
      "effect": 4,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "지하 의례실 깊숙이. 이해심이 의식을 집행하고 있다. 송금이 청색 한복을 입고 노래하고 있다. 표정이 없다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "이해심",
          "text": "어리석은 자들이여. 문이 열리는 날, 경성은 비로소 정화될 것이다. 동방은 불의 눈으로, 서방은 차가운 눈으로.",
          "style": "normal",
          "portrait": "assets/portraits/haesim.jpeg"
        },
        {
          "order": 3,
          "speaker": "송금",
          "text": "(표정 없이, 노래를 흥얼거린다) …푸른… 옷을… 입고… 문 앞에… 서서…",
          "style": "normal",
          "portrait": "assets/portraits/kum_fixed.png"
        },
        {
          "order": 4,
          "speaker": "송순",
          "text": "언니… 언니!",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 5,
          "speaker": "",
          "text": "이해심의 눈에서 피가 흐르기 시작한다. 하나는 불빛, 하나는 서릿발. 문이 열리고 있다.",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "송순이 언니의 노래에 응답한다.",
          "flag_key": "final_choice",
          "flag_value": "a",
          "next_scene": "ch6_ending_a"
        },
        {
          "order": 2,
          "text": "유웅룡이 이해심을 막으러 달려간다.",
          "flag_key": "final_choice",
          "flag_value": "b",
          "next_scene": "ch6_ending_b"
        },
        {
          "order": 3,
          "text": "아무것도 하지 않고 지켜본다.",
          "flag_key": "final_choice",
          "flag_value": "c",
          "next_scene": "ch6_ending_c"
        }
      ],
      "evidence": []
    },
    "ch6_ending_a": {
      "id": "ch6_ending_a",
      "chapter": 6,
      "title": "엔딩 A — 돌아오지 않은 언니",
      "background": null,
      "music": "assets/sfx/ending.mp3",
      "next_scene": "ch6_epilogue",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "송순",
          "text": "(창고 벽 앞에서 들었던 그 멜로디로 응답한다. 언니의 노래에 맞서는 허밍)",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 2,
          "speaker": "",
          "text": "감응이 흔들린다. 이해심이 비틀거리며 쓰러진다. 문이 반쯤 열린 채 닫힌다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "송금이 천천히 고개를 돌린다. 눈이 텅 비어 있다. 살아있지만, 돌아오지 않았다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "송순",
          "text": "(언니를 껴안는다. 언니는 반응이 없다)",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch6_ending_b": {
      "id": "ch6_ending_b",
      "chapter": 6,
      "title": "엔딩 B — 기록된 것들",
      "background": null,
      "music": "assets/sfx/ending.mp3",
      "next_scene": "ch6_epilogue",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "유웅룡이 이해심을 향해 달려든다. 충돌. 이해심이 쓰러지며 의식의 연결이 끊긴다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "",
          "text": "문이 닫힌다. 노래가 멎는다. 송금은 그 자리에 쓰러진다. 숨은 붙어 있다. 하지만 눈을 뜨지 않는다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "(수첩을 꺼낸다. 처음으로 모든 것을 적는다. 이판규, 폐공장, 낙원, 이해심, 청의동자, 그리고 두 사람의 이름)",
          "style": "thought",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch6_ending_c": {
      "id": "ch6_ending_c",
      "chapter": 6,
      "title": "엔딩 C — 문 너머",
      "background": null,
      "music": "assets/sfx/ending.mp3",
      "next_scene": "ch6_epilogue",
      "effect": 2,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "문이 완전히 열린다. 무엇이 나왔는지 보이지 않는다. 공간 전체가 잠시 — 정지한다. 소리가 없다. 빛이 없다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "",
          "text": "다시 현실로 돌아왔을 때 — 이해심도, 송금도, 천용해도 없다. 유웅룡과 송순만 남아 있다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "…뭐가 나왔을까요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 4,
          "speaker": "송순",
          "text": "(대답하지 않는다)",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch6_epilogue": {
      "id": "ch6_epilogue",
      "chapter": 6,
      "title": "에필로그",
      "background": null,
      "music": "assets/sfx/ending.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "며칠 뒤, 경성. 난향일보에 짧은 기사가 실렸다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "",
          "text": "\"낙원 화재로 인한 건물 일부 소실. 인명 피해 없음.\"",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "유웅룡의 이름은 없다. 편집장이 그 기사를 보며 담배를 피운다. 표정이 없다.",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "",
          "text": "문은 열렸다. 무엇이 나왔는지는 아무도 모른다. 그리고 아무도 묻지 않는다.",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [],
      "evidence": []
    }
  }
};
