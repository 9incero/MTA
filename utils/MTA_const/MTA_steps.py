from utils.MTA_const.MTA_enum import ChatbotState


# 스텝 순서: 각 State 내에서 어떤 순서로 스텝을 진행할지 결정
STATE_STEPS_ORDER = {
    ChatbotState.THERAPEUTIC_CONNECTION.value: [
        "rapport_building",
        "goal_and_motivation_building",
        "music_preference",
    ],
    ChatbotState.MUSIC_CREATION.value: [
        "making_concept",
        "making_lyrics",
        "lyrics_gen",
        "lyrics_discussion",
        "making_music",
        "style_gen",
    ],
    ChatbotState.MUSIC_DISCUSSION.value: [
        "music_opinion",
        "music_recreation",
    ],
    ChatbotState.WRAP_UP.value: [
        "reflection",
        "complete",
    ],
}