window.GAME_DATA = {
  "first_scene": "ch1_court",
  "scenes": {
    "ch1_court": {
      "id": "ch1_court",
      "chapter": 1,
      "title": "묻힌 판결",
      "background": "assets/bg/court.jpeg",
      "music": "assets/sfx/tense.mp3",
      "next_scene": "ch1_editor",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[1932년 경성지방법원. 방청석은 텅 비어 있다. 아무도 이 판결을 보러 오지 않았다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "판사",
          "text": "이판규. 무죄.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[망치가 내려친다. 법정은 조용하다. 마치 처음부터 아무 일도 없었다는 듯.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "[수첩에 받아 적는다] 조선인 유아는 인격체가 아니다. 법이 그렇게 말한다.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "",
          "text": "[무죄. 그 두 글자가 법정 천장에 걸린다.]",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch1_editor": {
      "id": "ch1_editor",
      "chapter": 1,
      "title": "편집부",
      "background": "assets/bg/newsroom.jpeg",
      "music": "assets/sfx/newsroom.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "편집장",
          "text": "유웅룡. 방금 법정에서 나왔지?",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "[수첩을 책상에 던진다]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "편집장",
          "text": "이판규 사건. 무죄 판결. 어떻게 된 일이야?",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "법대로 됐겠지요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "편집장",
          "text": "기묘하게 써와. 팔릴 기사로.",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "판결문을 상세히 메모한다",
          "flag_key": "flag_editor_response",
          "flag_value": "A",
          "next_scene": "ch2_hospital"
        },
        {
          "order": 2,
          "text": "그냥 넘긴다",
          "flag_key": "flag_editor_response",
          "flag_value": "B",
          "next_scene": "ch2_hospital"
        }
      ],
      "evidence": []
    },
    "ch2_hospital": {
      "id": "ch2_hospital",
      "chapter": 2,
      "title": "낙원의 문",
      "background": "assets/bg/hospital.jpeg",
      "music": "assets/sfx/gloomy.mp3",
      "next_scene": "ch2_factory",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[경성 외곽 정신병원 접견실. 철창. 낡은 테이블. 빛이 탁하다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "이판규",
          "text": "[초점 없는 눈으로 허공을 본다. 입술이 달싹인다.]",
          "style": "normal",
          "portrait": "assets/portraits/ipangyu.jpeg"
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "이판규. 나야. 기자. 기억해?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 4,
          "speaker": "이판규",
          "text": "…기자.",
          "style": "normal",
          "portrait": "assets/portraits/ipangyu.jpeg"
        },
        {
          "order": 5,
          "speaker": "유웅룡",
          "text": "무죄 판결이 났어. 이제 나와도 됐는데.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 6,
          "speaker": "이판규",
          "text": "판결이 뭐하나. 청의의 감응이 오지 않았다. 문이… 열리지 않았다.",
          "style": "normal",
          "portrait": "assets/portraits/ipangyu.jpeg"
        },
        {
          "order": 7,
          "speaker": "유웅룡",
          "text": "청의? 그게 뭔데?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 8,
          "speaker": "이판규",
          "text": "[철창을 붙잡으며] 제발… 나를 꺼내줘… 아직 늦지 않았어…",
          "style": "normal",
          "portrait": "assets/portraits/ipangyu.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "청의교에 대해 더 묻는다",
          "flag_key": "flag_iupangyu_questions",
          "flag_value": "A",
          "next_scene": "ch2_factory"
        },
        {
          "order": 2,
          "text": "접견을 끝낸다",
          "flag_key": "flag_iupangyu_questions",
          "flag_value": "B",
          "next_scene": "ch2_factory"
        }
      ],
      "evidence": []
    },
    "ch2_factory": {
      "id": "ch2_factory",
      "chapter": 2,
      "title": "폐공장",
      "background": "assets/bg/factory.jpeg",
      "music": "assets/sfx/creepy.mp3",
      "next_scene": "ch2_cafe",
      "effect": "flicker",
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[경성 외곽 폐공장. 아무 소리도 없다. 바람조차 없다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "",
          "text": "[손전등을 켠다. 먼지, 녹슨 기계. 발 아래가 축축하다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[청색 점액. 발가락 없는 발자국들이 흙 위에 찍혀 있다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "[발자국을 따라 천천히 걷는다]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "",
          "text": "[구석에 사람이 쓰러져 있다. 눈구멍이 텅 비어 있다. 이판규다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[한 걸음 물러선다. 손이 떨린다.]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 7,
          "speaker": "",
          "text": "[주머니를 뒤진다. 붉은 잉크로 쓴 쪽지. 거칠게 찢긴 종이.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 8,
          "speaker": "",
          "text": "[\"토요일, 낙원. 그녀가 노래하면, 문은 열린다.\"]",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_corpse",
          "trigger": "auto",
          "name": "시신",
          "description": "발가락 없는 발자국, 청색 점액, 텅 빈 눈구멍. 이판규로 확인됨.",
          "image": null
        },
        {
          "evidence_id": "ev_note",
          "trigger": "auto",
          "name": "붉은 쪽지",
          "description": "토요일, 낙원. 그녀가 노래하면, 문은 열린다.",
          "image": null
        }
      ]
    },
    "ch2_cafe": {
      "id": "ch2_cafe",
      "chapter": 2,
      "title": "카페 낙원",
      "background": "assets/bg/cafe.jpeg",
      "music": "assets/sfx/jazz.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[경성 도심 카페 낙원. 따뜻한 조명. 재즈가 흐른다. 평범한 저녁이다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "송순",
          "text": "어서오세요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "커피 한 잔.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 4,
          "speaker": "",
          "text": "[이름표: 김송순. 나이 22세. 단단한 눈빛.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "혹시… 신문사 분이세요?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[놀라며] 왜요?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 7,
          "speaker": "송순",
          "text": "[목소리를 낮춘다] 이판규 기사 쓰신 분이시죠.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 8,
          "speaker": "유웅룡",
          "text": "그렇게 보여요?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 9,
          "speaker": "송순",
          "text": "[주변을 살피며] 제 언니가… 김송금이에요. 요즘 안 나왔어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 10,
          "speaker": "송순",
          "text": "혹시 아세요? 어디 있는지…",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "송금의 행방을 솔직히 말한다",
          "flag_key": "flag_cafe_depth",
          "flag_value": "A",
          "next_scene": "ch3_cafe"
        },
        {
          "order": 2,
          "text": "모른다고 말한다",
          "flag_key": "flag_cafe_depth",
          "flag_value": "B",
          "next_scene": "ch3_cafe"
        }
      ],
      "evidence": [
        {
          "evidence_id": "ev_sungsun",
          "trigger": "click",
          "name": "김송순의 증언",
          "description": "송순: 언니 김송금이 요즘 안 나왔다.",
          "image": null
        }
      ]
    },
    "ch3_cafe": {
      "id": "ch3_cafe",
      "chapter": 3,
      "title": "언니의 방",
      "background": "assets/bg/cafe.jpeg",
      "music": "assets/sfx/jazz_dark.mp3",
      "next_scene": "ch3_storage",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[카페 낙원. 한 주일 뒤. 유웅룡이 문을 나서려 한다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "송순",
          "text": "유웅룡 씨.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "[멈춘다. 돌아보지 않는다.]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 4,
          "speaker": "송순",
          "text": "언니 어디 있어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 5,
          "speaker": "유웅룡",
          "text": "[침묵. 거짓말을 할 수 없다.]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 6,
          "speaker": "송순",
          "text": "[표정이 굳는다] 살아 있어요?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 7,
          "speaker": "유웅룡",
          "text": "모르겠어요. 그래서 찾아야 해요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 8,
          "speaker": "송순",
          "text": "[눈빛이 변한다] 같이 가요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "같이 가자",
          "flag_key": "flag_with_sungsun",
          "flag_value": "yes",
          "next_scene": "ch3_storage"
        },
        {
          "order": 2,
          "text": "혼자 하겠어",
          "flag_key": "flag_with_sungsun",
          "flag_value": "no",
          "next_scene": "ch4a_library"
        }
      ],
      "evidence": []
    },
    "ch3_storage": {
      "id": "ch3_storage",
      "chapter": 3,
      "title": "창고",
      "background": "assets/bg/storage.jpeg",
      "music": "assets/sfx/mystery.mp3",
      "next_scene": "ch3_room4",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[낙원 무대 뒤 창고. 먼지. 방치된 악기들. 오래된 냄새.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "언니가 여기 자주 왔어요?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "송순",
          "text": "[고개를 젓는다] 무대 뒤는 아무나 못 들어와요. 그런데 언니는…",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 4,
          "speaker": "",
          "text": "[책장 뒤에 상자 하나. 먼지가 두텁다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "유웅룡",
          "text": "[상자를 꺼낸다]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 6,
          "speaker": "",
          "text": "[청색 비단 한복. 오징어 형태 가면. 눈 구멍이 넷. 그 아래 일기장.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 7,
          "speaker": "송순",
          "text": "[목이 메인다] 언니 옷이야…",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 8,
          "speaker": "유웅룡",
          "text": "일기장이 있어요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 9,
          "speaker": "",
          "text": "[첫 줄: \"청의의 무녀. 노래가 곧 감응. 나는 준비됐다.\"]",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_diary",
          "trigger": "auto",
          "name": "송금의 일기장",
          "description": "청의의 무녀. 노래가 곧 감응. 준비되었다.",
          "image": null
        },
        {
          "evidence_id": "ev_mask",
          "trigger": "auto",
          "name": "오징어 가면",
          "description": "눈 구멍 4개. 청의동자의 눈. 의식 도구.",
          "image": null
        },
        {
          "evidence_id": "ev_hanbok",
          "trigger": "auto",
          "name": "청색 비단 한복",
          "description": "무녀의 복장. 송금이 입었을 것.",
          "image": null
        }
      ]
    },
    "ch3_room4": {
      "id": "ch3_room4",
      "chapter": 3,
      "title": "기숙사 4번방",
      "background": "assets/bg/storage.jpeg",
      "music": "assets/sfx/creepy_2.mp3",
      "next_scene": null,
      "effect": "resonance",
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[밤. 낙원 기숙사 4번방. 송금의 방. 시간이 멈춘 것 같다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "송순",
          "text": "[벽에 손을 얹는다. 차갑다.]",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[조명이 깜빡인다. 한 번. 두 번. 세 번.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "???",
          "text": "[여린 목소리] 돌아와… 돌아와…",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "[공포에 떨며] 언니…?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[송순의 팔을 잡는다] 나가자. 지금 당장.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 7,
          "speaker": "",
          "text": "[방의 벽에서 파란 안개가 피어난다. 목소리는 계속 들린다.]",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "벽에 손을 댄다",
          "flag_key": "flag_wall_touch",
          "flag_value": "yes",
          "next_scene": "ch4b_cafe"
        },
        {
          "order": 2,
          "text": "손을 뗀다",
          "flag_key": "flag_wall_touch",
          "flag_value": "no",
          "next_scene": "ch4b_cafe"
        }
      ],
      "evidence": []
    },
    "ch4a_library": {
      "id": "ch4a_library",
      "chapter": 4,
      "title": "자료실",
      "background": "assets/bg/newsroom.jpeg",
      "music": "assets/sfx/mystery.mp3",
      "next_scene": "ch4a_slum",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[난향일보 자료실. 오래된 신문들. 사람 하나 없다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "[1924년 신문을 넘긴다]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[헤드라인: \"여급 연쇄 실종. 경찰, 자살 추정으로 결론.\"]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "[기자명을 찾는다] …편집장.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "",
          "text": "[1923년. 1925년. 1928년. 같은 패턴. 모두 편집장이 썼다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[담배를 꺼낸다. 불을 붙이지 않는다] 그 남자가 알고 있었어.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_oldarticles",
          "trigger": "auto",
          "name": "1920년대 신문 뭉치",
          "description": "연쇄 실종 사건들. 모두 편집장이 작성. 1923, 1925, 1928년.",
          "image": null
        }
      ]
    },
    "ch4a_slum": {
      "id": "ch4a_slum",
      "chapter": 4,
      "title": "빈민가",
      "background": "assets/bg/warehouse.jpg",
      "music": "assets/sfx/ambient.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[경성 외곽 빈민가. 좁고 습한 골목. 오후가 저물고 있다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "여인 A",
          "text": "청의교? [목소리가 떨린다] 그걸 묻지 마세요.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "유웅룡",
          "text": "누가 이끄는 거예요?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 4,
          "speaker": "여인 A",
          "text": "우리 같은 것들을 구원해 준다고 했어요. 근데…",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "여인 A",
          "text": "[두려워한다] 거기 들어간 사람 중에 나온 사람을 본 적이 없어요.",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 6,
          "speaker": "",
          "text": "[유웅룡은 여인의 눈빛을 본다. 두려움과 체념이 뒤섞인 눈빛.]",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "[공감하며 들어준다]",
          "flag_key": "flag_slum_approach",
          "flag_value": "empathy",
          "next_scene": "ch5_ritual_path"
        },
        {
          "order": 2,
          "text": "[냉정하게 질문만 한다]",
          "flag_key": "flag_slum_approach",
          "flag_value": "cynical",
          "next_scene": "ch5_ritual_path"
        }
      ],
      "evidence": []
    },
    "ch4b_cafe": {
      "id": "ch4b_cafe",
      "chapter": 4,
      "title": "낙원 재방문",
      "background": "assets/bg/cafe.jpeg",
      "music": "assets/sfx/jazz_dark.mp3",
      "next_scene": "ch4b_okryeon",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[카페 낙원. 문을 닫은 시간. 송순이 혼자 안에 있다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "",
          "text": "[옥련이 구석에 앉아 있다. 몸을 사리고 있다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "송순",
          "text": "옥련 씨. 언니가 어디 있어?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 4,
          "speaker": "옥련",
          "text": "[한참 침묵하다가] 음악실. 지하 음악실.",
          "style": "normal",
          "portrait": "assets/portraits/okryeon.jpeg"
        },
        {
          "order": 5,
          "speaker": "옥련",
          "text": "언니가… 선택받았대요. 이해심이 직접.",
          "style": "normal",
          "portrait": "assets/portraits/okryeon.jpeg"
        },
        {
          "order": 6,
          "speaker": "송순",
          "text": "선택받다니. 뭘 위해서?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 7,
          "speaker": "옥련",
          "text": "[눈물이 흐른다] 청의의 무녀. 노래하는 그릇.",
          "style": "normal",
          "portrait": "assets/portraits/okryeon.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch4b_okryeon": {
      "id": "ch4b_okryeon",
      "chapter": 4,
      "title": "옥련과의 대화",
      "background": "assets/bg/cafe.jpeg",
      "music": "assets/sfx/sad.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "옥련",
          "text": "나도 거기 들었었어요. 의식에. 하지만…",
          "style": "normal",
          "portrait": "assets/portraits/okryeon.jpeg"
        },
        {
          "order": 2,
          "speaker": "옥련",
          "text": "[손이 떨린다] 도망쳤어요. 죽을 것 같았어요.",
          "style": "normal",
          "portrait": "assets/portraits/okryeon.jpeg"
        },
        {
          "order": 3,
          "speaker": "옥련",
          "text": "그곳은 사람의 장소가 아니에요. 문이 있어요. 뭔가 들어오려 해요.",
          "style": "normal",
          "portrait": "assets/portraits/okryeon.jpeg"
        },
        {
          "order": 4,
          "speaker": "송순",
          "text": "[눈이 흔들린다] 지금도 거기 있어?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 5,
          "speaker": "옥련",
          "text": "[깊게 숨을 들이쉰다] 지하야. 카페 밑 지하. 거기 있어.",
          "style": "normal",
          "portrait": "assets/portraits/okryeon.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "[더 캐묻는다]",
          "flag_key": "flag_okryeon_press",
          "flag_value": "A",
          "next_scene": "ch5_ritual_path"
        },
        {
          "order": 2,
          "text": "[멈춘다]",
          "flag_key": "flag_okryeon_press",
          "flag_value": "B",
          "next_scene": "ch5_ritual_path"
        }
      ],
      "evidence": [
        {
          "evidence_id": "ev_okryeon_statement",
          "trigger": "click",
          "name": "옥련의 증언",
          "description": "청의 의식에 참여했다가 도망쳤다. 지하에 있다고 말함.",
          "image": null
        }
      ]
    },
    "ch5_ritual_path": {
      "id": "ch5_ritual_path",
      "chapter": 5,
      "title": "지하의 문",
      "background": "assets/bg/ritual_room.jpg",
      "music": "assets/sfx/ritual.mp3",
      "next_scene": "ch5_ritual_room",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[유웅룡과 송순. 카페 낙원 뒤쪽. 지하로 향하는 문.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "유웅룡",
          "text": "뭘 알아냈어요?",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 3,
          "speaker": "송순",
          "text": "언니가 선택받았어요. 청의의 무녀로. 지하에 있어요.",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 4,
          "speaker": "유웅룡",
          "text": "[오래된 신문 뭉치를 꺼낸다] 이게 처음이 아니에요. 1923년부터야.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "[눈빛이 변한다] 그 전에도…?",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[문을 연다] 내려가요.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 7,
          "speaker": "",
          "text": "[계단을 내려간다. 공기가 점점 차가워진다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 8,
          "speaker": "",
          "text": "[발가락 없는 발자국이 땅에 찍혀 있다. 청색 점액.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 9,
          "speaker": "송순",
          "text": "[공포에 떨며] 저건…",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 10,
          "speaker": "???",
          "text": "[울부짖는 소리. 비명인지 신음인지 모를 소리.]",
          "style": "normal",
          "portrait": null
        },
        {
          "order": 11,
          "speaker": "유웅룡",
          "text": "묵표자야. 뛰어.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch5_ritual_room": {
      "id": "ch5_ritual_room",
      "chapter": 5,
      "title": "의례실",
      "background": "assets/bg/ritual_room.jpg",
      "music": "assets/sfx/ritual_climax.mp3",
      "next_scene": "ch6_ending",
      "effect": "blood",
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[지하 의례실. 제단. 파란 천. 양초가 줄지어 타고 있다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "천용해",
          "text": "[목소리가 울려 퍼진다] 오셨군요. 늦었지만. 보셔도 됩니다.",
          "style": "normal",
          "portrait": "assets/portraits/cheon.jpeg"
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[무릎을 꿇은 신도들. 가운데 청색 한복을 입은 여인. 노래하고 있다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "송순",
          "text": "[숨이 멎는다] 언니…",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 5,
          "speaker": "천용해",
          "text": "그릇은 셋이었소. 둘은 쓰였고. 셋째가 마지막이오.",
          "style": "normal",
          "portrait": "assets/portraits/cheon.jpeg"
        },
        {
          "order": 6,
          "speaker": "천용해",
          "text": "동방은 불로, 서방은 얼음으로. 그리고 우리만 남는다.",
          "style": "normal",
          "portrait": "assets/portraits/cheon.jpeg"
        },
        {
          "order": 7,
          "speaker": "이해심",
          "text": "[그림자에서 나타난다]",
          "style": "normal",
          "portrait": "assets/portraits/haesim.jpeg"
        },
        {
          "order": 8,
          "speaker": "이해심",
          "text": "막아도 소용없어. 문은 이미 열리고 있어.",
          "style": "normal",
          "portrait": "assets/portraits/haesim.jpeg"
        },
        {
          "order": 9,
          "speaker": "유웅룡",
          "text": "[앞으로 나간다] 그 여자를 돌려줘.",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 10,
          "speaker": "이해심",
          "text": "[눈에서 피가 흐른다] 늦었다.",
          "style": "normal",
          "portrait": "assets/portraits/haesim.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "편집장에게 연락한다",
          "flag_key": "flag_editor_contact",
          "flag_value": "yes",
          "next_scene": "ch6_ending"
        },
        {
          "order": 2,
          "text": "연락하지 않는다",
          "flag_key": "flag_editor_contact",
          "flag_value": "no",
          "next_scene": "ch6_ending"
        }
      ],
      "evidence": [
        {
          "evidence_id": "ev_ritualroom",
          "trigger": "auto",
          "name": "의례실",
          "description": "제단, 파란 천, 양초, 신도들, 청의동자의 흔적",
          "image": null
        },
        {
          "evidence_id": "ev_haesim",
          "trigger": "auto",
          "name": "이해심 첫 대면",
          "description": "안대, 푸른 한복, 피를 흘리는 눈, 냉정한 광기",
          "image": null
        },
        {
          "evidence_id": "ev_ritual_paper",
          "trigger": "auto",
          "name": "의례실 종이",
          "description": "그릇은 셋. 둘은 쓰였고 하나가 남았다.",
          "image": null
        }
      ]
    },
    "ch6_ending": {
      "id": "ch6_ending",
      "chapter": 6,
      "title": "결말",
      "background": "assets/bg/ritual_room.jpg",
      "music": "assets/sfx/ritual_climax.mp3",
      "next_scene": null,
      "effect": "blood",
      "dialogues": [
        {
          "order": 1,
          "speaker": "송순",
          "text": "[노래를 부른다. 언니의 목소리가 뒤섞인다.]",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 2,
          "speaker": "",
          "text": "[무언가가 울린다. 벽이 떨린다. 제단이 흔들린다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[제단 뒤의 벽이 갈라진다. 틈에서 빛도 어둠도 아닌 것이 스며든다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "이해심",
          "text": "[비명처럼 외친다] 아니다! 아직 아니야—",
          "style": "normal",
          "portrait": "assets/portraits/haesim.jpeg"
        },
        {
          "order": 5,
          "speaker": "유웅룡",
          "text": "[선택을 해야 한다.]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [
        {
          "order": 1,
          "text": "[송순을 도와 문을 닫는다]",
          "flag_key": "flag_ending_choice",
          "flag_value": "A",
          "next_scene": "ch6_ending_a"
        },
        {
          "order": 2,
          "text": "[이해심을 막고 문을 닫는다]",
          "flag_key": "flag_ending_choice",
          "flag_value": "B",
          "next_scene": "ch6_ending_b"
        },
        {
          "order": 3,
          "text": "[아무것도 하지 않는다]",
          "flag_key": "flag_ending_choice",
          "flag_value": "C",
          "next_scene": "ch6_ending_c"
        }
      ],
      "evidence": []
    },
    "ch6_ending_a": {
      "id": "ch6_ending_a",
      "chapter": 6,
      "title": "돌아오지 않은 언니",
      "background": "assets/bg/cafe.jpeg",
      "music": "assets/sfx/ending.mp3",
      "next_scene": "ch6_epilogue",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[송순의 노래가 이해심의 감응을 흔든다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "이해심",
          "text": "[무릎을 꿇는다. 쓰러진다.]",
          "style": "normal",
          "portrait": "assets/portraits/haesim.jpeg"
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[문이 반쯤 열린 채 닫힌다. 문 너머에서 손이 나온다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "송금",
          "text": "[낮고 공허한 목소리] 송순…?",
          "style": "normal",
          "portrait": "assets/portraits/songeum.jpeg"
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "[달려가 손을 잡는다]",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "",
          "text": "[송금이 나온다. 살아있다. 그러나 눈이 텅 비어 있다. 돌아오지 않았다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 7,
          "speaker": "유웅룡",
          "text": "[수첩을 꺼낸다. 쓴다. 손이 떨린다.]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": [
        {
          "evidence_id": "ev_songeum_state",
          "trigger": "auto",
          "name": "송금의 돌아옴",
          "description": "텅 빈 눈구멍. 살아있지만 돌아오지 않았다.",
          "image": null
        }
      ]
    },
    "ch6_ending_b": {
      "id": "ch6_ending_b",
      "chapter": 6,
      "title": "기록된 것들",
      "background": "assets/bg/newsroom.jpeg",
      "music": "assets/sfx/ending.mp3",
      "next_scene": "ch6_epilogue",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "유웅룡",
          "text": "[이해심 앞을 막아선다]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 2,
          "speaker": "이해심",
          "text": "[비틀린다. 피가 더 흐른다.]",
          "style": "normal",
          "portrait": "assets/portraits/haesim.jpeg"
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[문이 닫힌다. 떨리는 소리와 함께.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "",
          "text": "[신도들이 흩어진다. 어둠과 혼란만 남는다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "송순",
          "text": "[송금의 이름을 부르며 운다. 대답이 없다.]",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[수첩에 모든 것을 기록한다. 알고 있는 모든 것을.]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch6_ending_c": {
      "id": "ch6_ending_c",
      "chapter": 6,
      "title": "문 너머",
      "background": "assets/bg/ritual_room.jpg",
      "music": "assets/sfx/sad.mp3",
      "next_scene": "ch6_epilogue",
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[아무도 막지 않는다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "",
          "text": "[문이 완전히 열린다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[무엇이 나왔는지 보이지 않는다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "",
          "text": "[공간이 정지한다. 시간이 끊긴다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 5,
          "speaker": "",
          "text": "[다시 현실로 돌아왔을 때 — 이해심도, 송금도, 천용해도 없다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[송순을 바라본다]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 7,
          "speaker": "송순",
          "text": "[침묵. 눈빛만이 말한다.]",
          "style": "normal",
          "portrait": "assets/portraits/songsoon.jpeg"
        },
        {
          "order": 8,
          "speaker": "",
          "text": "[문은 열렸다. 무엇이 나왔는지는 아무도 모른다. 그리고 아무도 묻지 않는다.]",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [],
      "evidence": []
    },
    "ch6_epilogue": {
      "id": "ch6_epilogue",
      "chapter": 6,
      "title": "에필로그",
      "background": "assets/bg/newsroom.jpeg",
      "music": "assets/sfx/newsroom.mp3",
      "next_scene": null,
      "effect": null,
      "dialogues": [
        {
          "order": 1,
          "speaker": "",
          "text": "[며칠 뒤. 경성. 난향일보.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 2,
          "speaker": "",
          "text": "[짧은 기사 하나: \"낙원 화재로 인한 건물 일부 소실. 인명 피해 없음.\"]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 3,
          "speaker": "",
          "text": "[기사에 유웅룡의 이름은 없다.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 4,
          "speaker": "편집장",
          "text": "[유웅룡의 수첩을 한참 들여다본다.]",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        },
        {
          "order": 5,
          "speaker": "편집장",
          "text": "[서랍에 넣는다.]",
          "style": "normal",
          "portrait": "assets/portraits/editor.jpeg"
        },
        {
          "order": 6,
          "speaker": "유웅룡",
          "text": "[담배를 피운다. 창밖을 본다.]",
          "style": "normal",
          "portrait": "assets/portraits/yuu.jpeg"
        },
        {
          "order": 7,
          "speaker": "",
          "text": "[진실은 묻혔다. 어떤 형태로든.]",
          "style": "narration",
          "portrait": null
        },
        {
          "order": 8,
          "speaker": "",
          "text": "[문은 어디론가 열려 있다. 아무도 묻지 않는다.]",
          "style": "narration",
          "portrait": null
        }
      ],
      "choices": [],
      "evidence": []
    }
  }
};
