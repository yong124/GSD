# 장면 효과음

기존 MP3는 배경음악이다. WAV 22종은 이 프로젝트에서 직접 합성한 짧은 효과음이며, 외부 샘플이나 녹음 음성을 사용하지 않는다. `ritual_chant`와 `hum_dissonant`도 가사가 없는 합성 허밍이다.

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
| ui_hover / ui_click | 버튼 호버·클릭 |
| text_tick | 대사가 한 글자씩 나타나는 타자음 |

공통 UI 소리는 `game/data/ui_audio.js`의 `Hover`, `Click`, `Typing` 데이터에서 음원(`src`), 상대 볼륨(`volume`), 최소 재생 간격(`min_interval_ms`)을 조절한다. 이 파일은 씬 테이블과 별도로 로드하는 UI 설정이며 EditorNode의 씬 저장 대상이 아니다. UI 소리는 장면 효과음을 끊지 않는다. 비활성 버튼, 공백·문장부호, 스킵·대사 즉시 완성에는 타자음이 추가로 재생되지 않는다. 브라우저 오디오 정책에 따라 첫 클릭이나 키 입력 후 소리가 활성화된다.

효과음은 BGM 위에 한 번 재생된다. 대사 글자 표시가 끝나거나 클릭으로 대사를 완성·진행하면 해당 줄의 효과음과 타자음은 멈춘다. 다음 줄에 효과음이 없어도 이전 소리가 남지 않으며, 대사 묶음 교체·종료, 씬 전환, 스킵에서도 중단한다. BGM과 버튼 호버·클릭 소리는 이 중단 대상에 포함되지 않는다. 설정의 효과음 볼륨과 음소거는 재생 중인 소리에도 즉시 반영된다.

재생성: 저장소 루트에서 `py content/tools/generate_sfx.py`. 고정된 시드로 동일한 WAV를 만든다. 데이터 검수: `py content/tools/validate_game_data.py`.
