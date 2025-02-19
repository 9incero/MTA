from enum import Enum


class ChatbotState(Enum):
    THERAPEUTIC_CONNECTION = "Therapeutic_Connection"
    MUSIC_CREATION = "Music_Creation"
    MUSIC_DISCUSSION = "Music_Discussion"
    WRAP_UP = "Wrap_Up"