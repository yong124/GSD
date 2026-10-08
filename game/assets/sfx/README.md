# 장면 효과음

기존 MP3는 배경음악이다. WAV 19종은 이 프로젝트에서 직접 합성한 짧은 효과음이며, 외부 샘플이나 녹음 음성을 사용하지 않는다. `ritual_chant`와 `hum_dissonant`도 가사가 없는 합성 허밍이다.

효과음을 배치하는 기준 데이터는 `game/data/chapters/ch{N}.js`의 대사 `sfx` 필드다. 일반 대사, 조사 반응, 증거 제출 반응에 같은 필드를 쓴다. EditorNode의 대사 편집에서 파일 경로를 변경하면 된다.

```json
"sfx": "assets/sfx/paper_rustle.wav"
```

| 파일 | 용도 |
|---|---|
| gavel_strike | 법정 판결봉 |
| paper_rustle / pencil_write | 신문·쪽지·명부를 펼치거나 수첩에 기록 |
| footsteps_stone | 복도·돌계단 이동 |
| lock_turn / door_creak / door_slam | 자물쇠, 문 열기, 문 충돌 |
| metal_rattle | 접견실 철문 떨림 |
| glass_set | 술잔 내려놓기 |
| telephone_pickup | 전화 수화기 |
| gasp | 짧은 들숨 |
| wet_crack / bone_snap | 신체 변형 장면 |
| whisper_dissonant / hum_dissonant / ritual_chant | 감응과 의식의 불협화음 |
| heartbeat_low / sting_horror | 긴장과 공포 강조 |
| evidence_reveal | 조사에서 단서가 연결되는 순간 |

효과음은 BGM 위에 한 번 재생된다. 다음 효과음이 시작되면 이전 효과음은 멈추고, 씬을 떠나거나 스킵을 켜면 재생 중인 효과음도 멈춘다. 설정의 효과음 볼륨과 음소거는 재생 중인 소리에도 즉시 반영된다.

재생성: 저장소 루트에서 `py content/tools/generate_sfx.py`. 고정된 시드로 동일한 WAV를 만든다. 데이터 검수: `py content/tools/validate_game_data.py`.
