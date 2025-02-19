from utils.MTA_const.MTA_enum import ChatbotState


# [예시] 각 스텝에서 필요한 변수를 "설명"과 함께 정의
# 실제로는 한국어 설명을 붙이거나, 변수명을 더 다양하게 구성하시면 됩니다.
STEP_VAR_DESCRIPTIONS = {
    # 1) Therapeutic_Connection
    ChatbotState.THERAPEUTIC_CONNECTION.value: {
        "rapport_building": {
            "user_ready": "사용자의 음악만들기에 대한 관심 여부"
        },
        "goal_and_motivation_building": {
            "motivation": "사용자가 음악만들기 활동을 통해 달성하고 싶은 목표",
            "difficulty": "사용자가 현재 겪고 있는 어려움, 어려움으로 야기되는 문제점",
            "emotion": "사용자가 최근 들어 많이 느끼는 감정"
        },
        "music_preference": {
            "music_info": "사용자가 좋아하거나 관심있거나 싫어하는 음악 정보 (장르, 스타일 등)"
        },
    },

    # 2) Music_Creation
    ChatbotState.MUSIC_CREATION.value: {
        "making_concept": {
            "concept": "음악의 전반적인 컨셉 (분위기, 테마, 메시지 등)"
        },
        "making_lyrics": {
            "lyrics_keyword": "가사에 들어갈 핵심 키워드 또는 아이디어",
            "lyrics_sentence":"가사의 핵심 문장",
            "lyrics_flow": "가사의 흐름",
        },
        "lyrics_gen":{
            "lyrics": "생성된 최종 가사"
        },
        "lyrics_discussion": {
            "discussion_feedback": "가사에 대한 사용자 의견"
        },
        "making_music": {
            "title": "사용자가 만들 노래 제목",
            "music_component": "멜로디, 코드 진행, 리듬 등 구체적인 음악 아이디어"
        },
        "style_gen":{
            "style_prompt":"챗봇이 만들어준 노래 구성요소 프롬프트"
        }
    },

    # 3) Music_Discussion
    ChatbotState.MUSIC_DISCUSSION.value: {
        "music_opinion": {
            "individual_emotion": "사용자가 음악을 듣고 느낀 개인적 감정",
            "strength": "음악만들기 활동을 통해 느낀 사용자의 장점"
        },
        "music_recreation": {
            "change_music": "사용자가 바꾸고 싶거나 개선하고 싶은 음악 요소"
        },
    },

    # 4) Wrap_Up
    ChatbotState.WRAP_UP.value: {
        "reflection": {
            "change_mind": "전체 과정을 통해 사용자에게 생긴 심경 변화나 인사이트"
        },
        "complete": {
            "feeling": "음악 만들기 활동을 통해서 사용자가 느낀 부분"
        },
    },
}