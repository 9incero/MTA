import os
import json
from typing import Dict, Any, List
from enum import Enum
import re

# langchain
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI



from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

################################################
# (A) State/Step 구조 & 변수 설명
################################################

class ChatbotState(Enum):
    THERAPEUTIC_CONNECTION = "Therapeutic_Connection"
    MUSIC_CREATION = "Music_Creation"
    MUSIC_DISCUSSION = "Music_Discussion"
    WRAP_UP = "Wrap_Up"

# [예시] 각 스텝에서 필요한 변수를 "설명"과 함께 정의
# 실제로는 한국어 설명을 붙이거나, 변수명을 더 다양하게 구성하시면 됩니다.
STEP_VAR_DESCRIPTIONS = {
    # 1) Therapeutic_Connection
    ChatbotState.THERAPEUTIC_CONNECTION.value: {
        "rapport_building": {
            "concern": "사용자가 음악 만들기 활동에 대해서 가지는 걱정"
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
            "concept": "음악/곡의 전반적인 컨셉 (분위기, 테마, 메시지 등)"
        },
        "making_lyrics": {
            "lyrics_keyword": "가사에 들어갈 핵심 키워드 또는 아이디어",
            "lyrics": "생성된 가사"
        },
        "lyrics_discussion": {
            "discussion_feedback": "가사에 대한 사용자 의견"
        },
        "making_music": {
            "music_component": "멜로디, 코드 진행, 리듬 등 구체적인 음악 아이디어"
        },
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

# (스텝별 메인 대화 프롬프트: 실제로는 더 풍부하게 작성 가능)
STEP_MAIN_PROMPTS = {
    ChatbotState.THERAPEUTIC_CONNECTION.value: {
        "rapport_building": """
            [라포 형성] 
            1. 사용자가 편안함을 느끼도록 대화를 이끌고,
            2. 음악만들기 활동에 대한 고민(concern)을 파악하세요. 고민에 대해 자세하게 물어보세요. 
            
            예시)
            1번의 경우
            - 반갑습니다, Name님. 오늘 저와 함께 이야기를 나누고, 그 이야기를 음악으로 표현해보면 어떨까요? Name님의 생각과 마음을 담아보는 데 제가 조금이나마 도움을 드릴 수 있으면 좋겠어요.
            - 음악을 만든다는 게 어려워보일 수 있지만, Name님이 도와준다면 같이 멋진 음악을 만들 수 있을 것 같아요. 저와 함께 오늘의 음악을 만들어 볼 준비가 되셨나요?
            - Name님, 오늘은 저와 함께 직접 가사와 음악을 만들어 볼거예요. 지금 느끼는 감정이나 어려운 점을 음악으로 표현하면서 마음을 조금 더 가볍게 만들어보는 게 어떨까요?
            2번의 경우
            - 음악 만들기 활동에 대해서 걱정이 있으신가요?
            """,
        "goal_and_motivation_building": """
            [목표/동기 파악] 
            사용자의 동기(motivation), 어려움(difficulty), 감정(emotion)을 파악하세요.
            현재 단계(Goal and Motivation-building)에서는 다음 정보가 필요합니다:

            1) difficulty (어려움)
            - 사용자가 생활 속에서 느끼는 가장 큰 어려움, 구체적인 상황(주제) + 그로 인한 문제점
                예: "직장 내 갈등으로 스트레스를 많이 받음" + "잠을 잘 못 자고 의욕이 떨어짐"
            - 만약 사용자가 '말하기 어렵다'거나 '잘 모르겠다'라고 하면, 
                대신 어떤 감정을 요즘 주로 느끼는지(emotion)를 파악하세요.

            2) emotion (감정) -> difficulty를 구체적으로 채웠을 경우 생략가능.
            - difficulty를 상세히 말하기 어려워하는 경우, 
                "최근 들어 주로 느끼는 감정이 있다면 어떤 것인가요?" 라고 추가 질문하세요.
            - 둘 다 말할 수 있으면 둘 다 수집해도 좋습니다.

            3) motivation (음악치료를 통해 얻고 싶은 것)
            - "기존에 듣던 음악에서 위로받은 경험이 있나요?" 라고 물어보고,
                - 만약 그렇다면 "어떤 경험이었는지" 묻고, 그 내용을 motivation에 반영하세요.
                - 만약 없다면 "음악치료로 무엇을 기대하는지", "어떤 목표가 있는지" 묻고 그 내용을 motivation에 담으세요.
            - 예: "음악을 통해 감정을 표현하고 싶다", "내면에 직면하고 싶다", "고립감을 해소하고 싶다" 등등

            [중요] 
            - 사용자가 답을 잘 못하면, 예시나 선택지를 제시할 수도 있습니다. 
            (예: “외부 문제(직장/인간관계), 내부 문제(성격/외모) 등이 있을까요?”)
            - 모든 질문을 한 번에 다 하지 말고, 사용자의 응답을 들은 뒤 추가 질문을 자연스럽게 이어가세요.
            - 사용자의 대답을 들으면 무조건 공감을 하고 대답을 해주세요.
            - 변수를 다 채운 뒤 잘 진행해보자는 말로 격려를 해주세요. 
            """,
        "music_preference": """
            [음악 선호] 
            사용자의 음악 선호(music_info)를 파악하세요.

            아래 조건을 지키며 사용자에게 질문하고, 대화를 진행해주세요:
            1. 먼저, 사용자가 평소에 음악을 좋아하는 편인지 물어보세요.
            2-1. 만약 '그렇다'고 응답하면 아래의 예시와 같은 질문을 진행하세요.
            - 최근 어떤 음악 활동(음악감상, 악기연주, 노래부르기 등)을 했나요?
            - 최근 주로 감상하는 음악은 무엇인가요?
            - 평소 좋아하는 음악은 무엇인가요?
            등을 물어보세요.
            2-2. 만약 '좋아하지 않는다'고 응답한다면, 아래의 예시와 같은 질문을 진행하세요. 
            - 사용자가 특별히 원하는 음악이 있나요?
            - 제외하고 싶은 음악이 있나요?

            [중요] 
            - 너무 깊게 들어가지 않아도 됩니다. 사용자의 말에 공감이 가장 중요하다는 것 잊지마세요. 
            - 모든 질문을 한 번에 다 하지 말고, 사용자의 응답을 들은 뒤 추가 질문을 자연스럽게 이어가세요.
            - 질문을 3턴이상 하지마세요. 마무리는 공감으로 진행하세요.
            - 변수를 다 채우고 이러한 음악을 좋아하시는 군요~ 같이 잘 만들어봐요. 하고 격려를 진행하세요. 
        """,
    },
    ChatbotState.MUSIC_CREATION.value: {
        "making_concept": """
            [컨셉 설정] 
            곡(음악)의 전반적인 컨셉(concept)을 구체화하세요.
            아래와 같은 대화 흐름을 따르세요.
            사용자가 어려워하면 이전의 대화 기록을 통해 추천해주세요.
            "없어요", "모르겠어요"와 같은 반응이 나오면 이전의 대화에서 추천해준 후 이 단계를 끝내세요. 
            똑같은 질문을 계속 하지마세요.
            
            (1) 주제 설정하기
            "Difficulty에서 이야기한 주제를 바탕으로 음악을 만들어볼까요?"
            (difficulty 변수가 있을 경우): "예를 들어, '{difficulty}'을(를) 음악으로 표현해볼 수도 있어요."
            "아니면 다른 주제를 선택하고 싶나요? 어떤 감정이나 상황을 음악으로 담고 싶나요?"

            (2) 이야기 구체화하기
            "이 노래 안에 어떤 이야기를 담고 싶나요?"
            "그 이야기를 담고 싶은 이유가 있나요?"
            "이 음악이 어떤 감정을 전달했으면 좋겠나요?"
            
            사용자가 답변을 망설이면
            예시를 제시하세요:
            "예를 들면, 극복하고 싶은 어려움, 행복했던 순간, 위로받고 싶은 감정 등이 있을까요?"
            선택지를 제안할 수도 있어요:
            "예를 들어, ‘외로움’, ‘성장’, ‘추억’, ‘희망’ 같은 주제도 가능해요."
            """,
        "making_lyrics": """
            [가사 작성] lyrics_keyword, lyrics(간단 가사)를 만들어보세요.
            사용자가 가사의 방향을 설정하고, GPT가 이를 바탕으로 가사를 생성합니다.
            무조건 "(3) 최종가사 생성" 단계를 거쳐야합니다. 

            (1) 가사 키워드 도출하기
            "이전 단계에서 정한 '{concept}' 를 음악으로 표현하려면, 어떤 단어나 느낌이 떠오르시나요?"
            "이 주제를 떠올릴 때 가장 먼저 생각나는 단어가 있나요?"
            "감정을 더 구체적으로 표현해볼까요? 예를 들면, ‘외로운 밤’, ‘빛을 향해 가는 길’, ‘차가운 바람’ 같은 이미지도 떠올려볼 수 있어요."

            사용자가 어려워하면
            예시 단어를 제시하세요:
            "예를 들어, ‘희망’, ‘눈물’, ‘바람’, ‘기다림’, ‘돌아봄’ 같은 단어도 좋아요."
            감정과 분위기 선택지를 제안할 수도 있어요:
            "이 노래는 밝은 느낌일까요? 아니면 차분한 분위기일까요?"
            
            (2) 가사 초안 작성하기
            "가사를 편하게 작성해보시겠어요?"
            "짧은 문장이나 단어라도 괜찮아요. 떠오르는 문구가 있다면 자유롭게 적어보세요."
            "단어 또는 짧은 문장으로 먼저 제시해주시면, 제가 같이 작업해볼게요!"
            사용자가 어려워하면

            "첫 줄을 제가 시작해볼까요?"
            예: "차가운 바람이 불어와도 / 난 다시 걸어가네"
            "이런 느낌은 어떠세요?" 하고 가이드 문장을 제공
            
            (3) 최종 가사 생성
            당신은 가사를 잘 만드는 작사가입니다.
            주어진 주제와 감정을 바탕으로 짧은 노래 가사를 작성해주세요.

            - 주제: {concept}
            - 음악스타일: {music_info}
            - 포함해야 할 단어: {lyrics_keyword}

            중요:
            - 감정을 효과적으로 전달하는 가사를 [Verse], [Chorus], [Bridge] 형식을 지켜서 생성합니다.
            - 감정을 잘 전달할 수 있도록 감각적인 표현을 포함하세요.
            - 아래와 같은 형식을 꼭 따르세요. 
            Verse(절)에는 곡의 상황이나 감정을 자세히 표현해주세요.
            Chorus(후렴)에는 곡의 핵심 메시지나 후크를 강조해주세요.
            Bridge(브리지)에서는 감정의 변화를 주거나 새로운 시각을 보여주세요.

            형식)
            [Verse]
            ...
            [Verse 2]
            ...
            [Chorus]
            ...
            [Bridge]
            ...
            [Verse 3]
            ...
            [Chorus]
            ...

            """,
        "lyrics_discussion": """
            [가사 피드백] 
            현재까지의 가사를 바탕으로 discussion_feedback(피드백)을 이끌어내세요.
            사용자가 생성된 가사에 대한 피드백을 주고, 필요하면 수정합니다.

            (1) 가사 피드백 요청하기
            "어떤가요? 이 가사가 마음에 드시나요?"
            "이 느낌이 {concept}을(를) 잘 표현한 것 같나요?"
            "더 드러났으면 하는 단어나 문장이 있을까요?"
            "혹시 추가하고 싶은 내용이나 바꾸고 싶은 부분이 있으면 말씀해주세요!"
            
            사용자가 고민하면
            "예를 들어, 좀 더 감정을 강조하고 싶으신가요?"
            "이 부분을 조금 더 시적으로 바꿔볼 수도 있어요. 예를 들면…" 하고 예시 제공
            
            (2) 가사 수정
            사용자의 피드백을 반영하여 가사 수정 -> 원하지 않으면 진행하지 않아도 됨

            2-1) 피드백이 부정적이거나 수정 요청이 있을 경우
                당신은 가사를 잘 만드는 작사가입니다.
                당신이 만든 가사에 대한 피드백이 들어왔습니다.
                피드백을 무조건적으로 수용해서 가사를 수정하세요. 
                하지만 원래의 가사와 너무 달라지면 안됩니다. 


                - 가사: {lyrics}
                - 피드백: {lyrics_feedback}

                가사 형식:
                - 아래의 예시와 같은 형식을 꼭 따르세요.
                예시)
                [Verse]
                [Verse 2]
                [Chorus]
                [Bridge]
                [Verse 3]
                [Chorus]
                
            2-2) 피드백이 긍정적이라면 (예시: "바꾸고 싶지 않아", "안 바꾸고 싶어", "응 좋아", "아니 없어", "~~한 감정이 느껴져", "내 마음을 잘 나타내는 것 같아")
                가사를 확정하고 다음 단계로 진행
            """,

        "making_music": """
            [작곡 아이디어] 
            음악 아이디어(music_component)를 구체적으로 제안하세요.
            단계별 질문을 통해 음악 구성 요소(장르, 템포, 악기, 분위기, 음색)를 정하고, 최종적으로 그것을 바탕으로 최종 프롬프트를 생성하는 단계입니다.
            사용자가 노래를 만들 수 있도록 질문을 순차적으로 진행하며 답을 이끌어주세요.
            아래의 대화의 흐름을 따라서 진행하세요. 

            1) 장르 (genre) 정하기 
            - "이 노래를 어떤 **장르/스타일**로 만들면 좋을까요? 예: 발라드, R&B, 재즈, 클래식, 힙합, 락, 포크, EDM 등"  
            - "국내 스타일(K-pop 발라드)과 해외 스타일(팝송) 중 선호하는 방향이 있나요?"
            만약 사용자가 “잘 모르겠어요”라고 한다면,
            “그렇다면 이 곡의 주제가 어떤 느낌인지 조금만 알려주실 수 있을까요? 밝은 느낌인가요, 아니면 감성적인 느낌인가요?”
            -> 사용자가 계속 어려워하면 이전의 대화({concept})를 참고해 자동으로 선정

            2) 노래의 빠르기 (tempo) 정하기 
            - "노래의 빠르기는 어떻게 하면 좋을까요? 느린 템포(감성적, 차분한 느낌) / 중간 템포(편안하고 감정 전달이 쉬운 느낌) / 빠른 템포(활기차고 강렬한 느낌)"  
            사용자가 어려워할 경우
            “가사에서 전달하고 싶은 감정이 깊은 편이면 느린 템포를, 좀 더 경쾌한 느낌이면 중간 이상 템포를 추천드려요.”
            -> 사용자가 계속 어려워하면 이전의 대화({concept})를 참고해 자동으로 선정

            3) 반주 악기 (instruments) 정하기
            - "어떤 **반주 악기**를 선호하시나요? 예: "피아노, 기타, 드럼, 바이올린, 신디사이저 등이 있습니다. 가사가 잘 들리는 음악을 원하신다면 **악기 1~2개**, 깊고 풍성한 느낌을 원하신다면 **여러 개의 악기**를 추천드립니다."  
            사용자가 어려워할 경우
            -> 모르면, “피아노와 기타를 메인으로 잡고, 필요하면 현악기를 조금 더 추가해 볼까요?” 등 자동 추천.
            -> 사용자가 계속 어려워하면 이전의 대화({concept})를 참고해 자동으로 선정

            4) 음악의 전반적인 분위기 (mood) 정하기
            - "이 곡이 전달하는 **전반적인 분위기**는 어떤 느낌이면 좋을까요? 예: "잔잔한, 감성적인, 서정적인, 희망적인, 강렬한, 기승전결이 확실한, 몽환적인, 복잡한 음악 등"  
            사용자가 어려워할 경우
            “가사나 주제와 어울릴 만한 분위기"으로 자동 결정.
            -> 사용자가 계속 어려워하면 이전의 대화({concept})를 참고해 자동으로 선정


            5) 가수의 음색 (vocal_tone)  
            - "가수의 음색은 어떤 느낌이면 좋을까요? 예시: "허스키한, 맑은, 밝은, 깨끗한, 중후한, 묵직한, 따뜻한 등"  
            - "성별(남성/여성/중성)에 대한 선호가 있나요?"
            사용자가 어려워할 경우
            -> 이전의 대화({concept})를 참고해 자동으로 선정


            [사용자가 어려워하는 경우] 추천 요청  
            - "이 주제({concept})에 맞는 **템포, 멜로디 스타일** 등을 추천받고 싶나요?"  
            -> 사용자가 요청하면 추천해주기

            [장르, 빠르기, 악기, 분위기, 음색이 정해지면 대화를 바탕으로] 프롬프트 생성
            모든 요소가 결정(혹은 자동으로 선정)되면, 최종적으로 노래 구성요소를 만들어주세요:

            당신은 작곡 전문가입니다.
            노래주제: {concept},
            가사: {lyrics},
            요구조건: {user_music_component}
            을 가지고 노래 구성요소(장르, 스타일, 빠르기, 악기, 분위기등등)을 만들어주세요.  
            """,
    },
    ChatbotState.MUSIC_DISCUSSION.value: {
        "music_opinion": """
            [음악 의견] 
            이 단계는 작곡 아이디어나 노래 제작 과정을 마친 후, 최종적으로 노래에 대한 감정과 느낌을 정리하는 목적입니다.             
            질문은 1~2개 정도(후속질문 제외)로 충분합니다.
            각 질문 후, 후속 질문을 1~2번 정도만 하고, 그 뒤 정리를 진행합니다.
            마지막에 “더 궁금한 점이 없으시면 대화를 마무리하겠습니다.” 같은 문구로 자연스럽게 단계를 종료합니다.
            
            질문(개인 감정 & 장점) 예시
            아래와 같은 질문을 진행하고 사용자의 답변이 나오면 거기에 대해 자연스럽게 후속 질문을 해주시면 됩니다.
            반복되는 질문은 하지마세요. 
            - “특별히 어떤 가사(단어, 구절)가 와닿으세요? 그 이유는 무엇인가요?”
                후속질문 예: “그 구절에서 어떤 기억이나 감정이 떠오르셨나요?”
            - “어떤 부분에서 위로가 되었나요? (가사 or 멜로디 or 분위기)”
                후속질문 예: “그 위로가 어떤 식으로 마음을 달래줬나요?”
            - “이 곡을 다른 사람에게 들려주고 싶다면 그 이유는 무엇인가요?”
                후속질문 예: “혹시 특정 대상(친구, 가족, 연인 등)이 있나요? 그 사람과 이 곡을 어떻게 나누고 싶으신가요?”
            - “만들어진 곡을 경험하니 어떤 감정이 드나요? 떠오르는 단어나 느낌, 이미지가 있으신가요?”
                후속질문 예: “그 느낌이나 이미지를 더 확장해서 표현해 본다면 어떤 색깔, 장면, 온도가 떠오르나요?”
            - “이 작업을 통해 자신의 강점을 발견하셨다면 어떤 것이 있을까요?”
                후속질문 예: “그 강점을 실생활에서 어떻게 발휘하거나 더 발전시킬 수 있을까요?”

            """,
        "music_recreation": """
            [음악 수정] 
            사용자에게 수정하고 싶은 부분(change_music)이 있는지 물어보세요.
            """,
    },
    ChatbotState.WRAP_UP.value: {
        "reflection": """
            [마무리 성찰] 
            작업을 통해 생긴 변화(change_mind)를 스스로 생각해보도록 돕습니다.
            사용자를 격려하고 변화에 대해 자세한 질문을 진행하세요. 
            아래의 예시와 같은 질문을 진행하세요. 
            - 음악만들기 과정을 통해 갖고 있던 생각이나 감정을 다루는 데 어떤 도움을 받으셨나요?
            - 음악만들기 과정을 통해 생각이나 느낌이 달라진 부분이 있다면 어떤 것일까요?
            - {difficulty}에 대하여 생각이나 자세가 바뀌었다고 생각하나요? 
            - 이 활동이 어떤 변화를 이끌어 낼 수 있다고 생각하나요?
            """,
        "complete": """
        [최종 마무리] 
        사용자의 현재 기분(feeling)을 확인하고 상담을 종료하세요.
        
        아래와 같은 대화 흐름을 통해 진행하세요. 아래의 번호중 하나를 골라 질문을 진행하세요. 
        
        오늘 음악 만들기 과정이 마무리되었어요.  
        이 활동이 어떤 의미가 있었는지 돌아보며, 마무리 소감을 나눠볼까요?  

        1) **자신감 향상** 
        - {user_name}님, 의미 있는 시간 되셨나요? 저는 오늘 {user_name}님의 작업을 통해 멋진 음악을 감상할 수 있는 뜻깊은 시간이었어요.  
        - {user_name}님은 오늘 활동이 어떠셨나요?  
    
        2) **강점 인식**  
        - {user_name}님의 {strength}을(를) 알게 되어서 기뻤습니다. 저도 {user_name}님처럼 저만의 강점을 찾아보려고 노력해보려고 합니다. 오늘 활동을 통해 얻은 가장 큰 배움은 무엇인가요?   

        3) **활동 회고**
        - 활동 중에서 좋았던 부분은 무엇인가요?  
        - 활동 중에서 어려웠던 부분은 무엇인가요?  
        - 제가 어떤 것을 더 도와드리면 좋을까요?  

        """,
    }
}

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
        "lyrics_discussion",
        "making_music",
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


################################################
# (B) Step 실행: LLM이 JSON으로 변수 추출
################################################

def generate_question_for_step(llm, state_name: str, step_name: str, context: Dict[str, Any]) -> str:
    """
    1) 해당 Step에 필요한 변수를 LLM에 안내 (각 변수별 설명 포함).
    2) 대화 내용(chat_history)을 바탕으로 LLM이 JSON 형태로 결과를 반환.
    """
    # (1) 해당 스텝에서 필요한 변수와 그 설명 가져오기
    var_desc_dict = STEP_VAR_DESCRIPTIONS[state_name][step_name]
    required_vars = list(var_desc_dict.keys())

    # (2) 프롬프트 생성
    #     - 현재 대화 내용
    #     - 해당 스텝의 안내 (STEP_MAIN_PROMPTS)
    #     - 추출해야 할 변수 목록 & 설명
    #     - "JSON으로만 응답" 요청
    prompt_text = """
    당신은 청각장애인을 위한 상담 및 음악치료 보조 챗봇입니다.
    사용자의 이름은 **{user_name}** 입니다.

    다음은 현재까지의 대화 내역입니다:

    --- 대화 내역 ---
    {chat_history}
    ----------------

    [주요 프롬프트] 
    {main_prompt}

    [추출해야 할 변수와 설명]
    {variable_explanations}

    [대화 규칙]
    - {user_name}님이 편안하게 대화할 수 있도록 배려하세요.
    - {user_name}님의 관심과 감정을 존중하며 질문하세요.
    - 추출해야 할 변수를 채우는 것을 최우선으로 하되 자연스럽게 대화를 이어가세요.
    - 질문을 한 번에 하나씩만 진행하세요.
    - 사용자의 응답에 공감을 무조건적으로 진행하세요. 
    - 비슷하거나 똑같은 질문은 삼가하세요. 

    """

    # (3) LangChain LLMChain 실행
    prompt = PromptTemplate(
        input_variables=["user_name","chat_history","main_prompt","variable_explanations","concern", "motivation", "difficulty", "emotion", "music_info", "concept", "lyrics_keyword", "lyrics", "discussion_feedback", "music_component", "individual_emotion", "strength", "change_music", "change_mind", "feeling"],
        template=prompt_text
    )
    chain = prompt | llm
    output = chain.invoke({
        "concern": context.get("concern", ""),
        "motivation": context.get("motivation", ""),
        "difficulty": context.get("difficulty", ""),
        "emotion": context.get("emotion", ""),
        "music_info": context.get("music_info", ""),
        "concept": context.get("concept", ""),
        "lyrics_keyword": context.get("lyrics_keyword", ""),
        "lyrics": context.get("lyrics", ""),
        "discussion_feedback": context.get("discussion_feedback", ""),
        "music_component": context.get("music_component", ""),
        "individual_emotion": context.get("individual_emotion", ""),
        "strength": context.get("strength", ""),
        "change_music": context.get("change_music", ""),
        "change_mind": context.get("change_mind", ""),
        "feeling": context.get("feeling", ""),
        "user_name": context.get("user_name", "Unknown"),
        "chat_history": context.get("chat_history", ""),
        "main_prompt": STEP_MAIN_PROMPTS[state_name][step_name],
        "variable_explanations": "\n".join([f"- {var}: {desc}" for var, desc in var_desc_dict.items()])

    })  # 프롬프트에 넣을 input_variables가 없으므로 {}만 전달


    # # 최종 프롬프트 미리보기
    # rendered_prompt = prompt.format(
    #     concern= context.get("concern", ""),
    #     motivation= context.get("motivation", ""),
    #     difficulty= context.get("difficulty", ""),
    #     emotion=context.get("emotion", ""),
    #     music_info=context.get("music_info", ""),
    #     concept= context.get("concept", ""),
    #     lyrics_keyword= context.get("lyrics_keyword", ""),
    #     lyrics=context.get("lyrics", ""),
    #     discussion_feedback=context.get("discussion_feedback", ""),
    #     music_component= context.get("music_component", ""),
    #     individual_emotion=context.get("individual_emotion", ""),
    #     strength= context.get("strength", ""),
    #     change_music= context.get("change_music", ""),
    #     change_mind= context.get("change_mind", ""),
    #     feeling= context.get("feeling", ""),
    #     user_name= context.get("user_name", "Unknown"),
    #     chat_history= context.get("chat_history", ""),
    #     main_prompt= STEP_MAIN_PROMPTS[state_name][step_name],
    #     variable_explanations= "\n".join([f"- {var}: {desc}" for var, desc in var_desc_dict.items()])
    # )

    # print("=== 최종 프롬프트 미리보기 ===")
    # print(rendered_prompt)
    # print("================================")
    # (5) 대화 히스토리 업데이트
    #     - 실제로는 사용자 입력도 추가해야 하지만, 여기서는 간단화
    new_chat_history = context.get("chat_history", "") + f"\n[System Output - Step: {step_name}]\n{output}"
    context["chat_history"] = new_chat_history
    return output

def extract_reply_for_step(llm, state_name: str, step_name: str, context: Dict[str, Any]) -> str:

    # (1) 해당 스텝에서 필요한 변수와 그 설명 가져오기
    var_desc_dict = STEP_VAR_DESCRIPTIONS[state_name][step_name]
    required_vars = list(var_desc_dict.keys())

    # (2) 프롬프트 생성
    #     - 현재 대화 내용
    #     - 해당 스텝의 안내 (STEP_MAIN_PROMPTS)
    #     - 추출해야 할 변수 목록 & 설명
    #     - "JSON으로만 응답" 요청
    prompt_text = """
    당신은 대화기록을 보고 특정 변수에 대답을 가공해서 넣는 전문가입니다.
    입력된 대화기록들을 보고 현재 단계에서 채워야하는 변수에 답변을 채우세요.

    다음은 현재까지의 대화 내역입니다:

    --- 대화 내역 ---
    {chat_history}
    ----------------

    [추출해야 할 변수와 설명]
    {variable_explanations}

    [출력 형식 안내]
    위 대화를 바탕으로, 아래의 변수를 JSON 형식으로만 반환하세요. 
    가능한 정보를 최대한 채워주세요. 
    만약 특정 변수를 알 수 없다면 "Unknown" 이라고 적어주세요.
    절대 JSON 이외의 불필요한 문장은 쓰지 마세요.

    출력 예시:
    {{
    "변수1": "...",
    "변수2": "...",
    ...
    }}
    """

    # (3) LangChain LLMChain 실행
    prompt = PromptTemplate(
        input_variables=["chat_history","variable_explanations"],
        template=prompt_text
    )
    chain = prompt | llm
    output = chain.invoke({       
        "chat_history": context.get("chat_history", ""),
        "variable_explanations": "\n".join([f"- {var}: {desc}" for var, desc in var_desc_dict.items()])

    })  # 프롬프트에 넣을 input_variables가 없으므로 {}만 전달

    # (4) JSON 파싱 시도
    #     - 제대로 JSON이 아닐 수 있으므로 예외처리 필수
    #     - 일단은 간단하게 try-except로
    try:
        parsed_data = json.loads(output.content)
        # 필요한 변수 context에 저장
        for var in required_vars:
            if var in parsed_data:
                context[var] = parsed_data[var]
            else:
                # JSON에서 해당 key가 없으면 Unknown 처리
                context[var] = "Unknown"
    except json.JSONDecodeError:
        # LLM이 JSON 형식을 제대로 못 맞췄다면 fallback
        for var in required_vars:
            context[var] = "Unknown"

    # (5) 대화 히스토리 업데이트
    #     - 실제로는 사용자 입력도 추가해야 하지만, 여기서는 간단화
    new_chat_history = context.get("chat_history", "") + f"\n[System Output - Step: {step_name}]\n{output}"
    context["chat_history"] = new_chat_history
    return output.content

def extract_name_with_llm(llm, user_input: str) -> str:
    """
    LLM이 사용자 입력에서 이름을 추출하여 반환하는 함수.
    """
    prompt_text = """
        사용자가 다양한 방식으로 자신의 이름을 말할 수 있습니다. 
        예를 들어:
        - 나는 지훈이요.
        - 나를 지훈이라고 불러줘.
        - 제 이름은 지훈입니다.
        - 지훈이요
        - 지훈
        - 김지훈

        당신의 역할은 **사용자의 입력에서 이름만 정확히 추출**하는 것입니다.
        위의 응답처럼 들어오면 아래와 같이 출력하세요.

        - 지훈
        
        절대로 다른 문장이나 설명을 추가하지 마세요.
        한글이 깨지지 않도록 그대로 출력해주세요. 
        반드시 이름만 그대로 출력하세요.


        사용자 입력: "{user_input}"
        사용자가 닉네임이나 초성만 입력했다면 그것을 그대로 출력해도 됩니다. 

        """.strip()

    # LangChain LLM 실행
    prompt = PromptTemplate(input_variables=["user_input"], template=prompt_text)
    chain = prompt | llm
    output = chain.invoke({"user_input": user_input})  # 실행

    
    name = output.content

    return name if name else "Unknown"
    



################################################
# (C) 전체 파이프라인(메인 함수)
################################################

def main():
    # 1) LLM 준비
    #    (OpenAI API 키 설정 필요: os.environ["OPENAI_API_KEY"] = "xxx")
    llm = ChatOpenAI(
    model_name="gpt-4-turbo",  # 최신 모델 사용
    temperature=0.7,
    openai_api_key=api_key  # 환경변수 설정 가능
    )
  # 2) 사용자 이름 입력 및 LLM을 이용한 이름 추출
    user_name = None
    while not user_name or user_name == "Unknown":
        user_input = input("안녕하세요. 저는 음악치료사입니다. 제가 당신을 어떻게 부르면 될까요?: ").strip()
        user_name = extract_name_with_llm(llm, user_input)

        if user_name == "Unknown":
            print("이름을 인식하지 못했습니다. 다시 입력해주세요.")

    # 3) Context 딕셔너리 (대화 기록, 사용자 이름 저장)
    context: Dict[str, Any] = {
        "chat_history": "",
        "user_name": user_name  # 사용자 이름 저장
    }

    print(f"좋아요! 앞으로 {user_name}님이라고 부를게요.")
    
    # 4) State 순서 (선형 진행)
    states = [
        ChatbotState.THERAPEUTIC_CONNECTION,
        ChatbotState.MUSIC_CREATION,
        ChatbotState.MUSIC_DISCUSSION,
        ChatbotState.WRAP_UP
    ]

    # # 4) 메인 루프: State → Step 순서대로 진행
    # for state in states:
    #     state_name = state.value
    #     steps = STATE_STEPS_ORDER[state_name]

    #     print(f"===== [{state_name}] 단계를 시작합니다. =====")

    #     for step_name in steps:
    #         print(f"{step_name} start")
    #         var_desc_dict = STEP_VAR_DESCRIPTIONS[state_name][step_name]
    #         required_vars = list(var_desc_dict.keys())

    #         # 필요한 변수들이 Unknown이면 계속 Q&A 반복
    #         while any(
    #             not context.get(var) or context[var] == "Unknown"
    #             for var in required_vars
    #         ):
    #             # (A) 질문 생성
    #             question_text = generate_question_for_step(llm, state_name, step_name, context)
    #             print("\n[Assistant Question]")
    #             print(question_text.content)

    #             # (B) 사용자 답변
    #             user_input = input(f"[{user_name}]: ")
    #             # 대화이력에 누적
    #             context["chat_history"] += f"\n{user_name}: {user_input}"

    #             # (C) 사용자 답변을 바탕으로 변수를 추출
    #             extract_reply_for_step(llm, state_name, step_name, context)

    #         # 각 스텝 완료 후 어떤 값들이 채워졌는지 출력
    #         print(f"\n--- 스텝 '{step_name}' 완료. 추출된 변수 ---")
    #         for var in required_vars:
    #             print(f"{var}: {context[var]}")
    #         print("---------------------------------------")

    # print("\n모든 스텝이 종료되었습니다! 수집된 변수 요약:")
    # for k, v in context.items():
    #     if k == "chat_history":
    #         continue
    #     print(f"- {k}: {v}")

    # print("\n상담 및 음악치료 세션이 모두 마무리되었습니다. 수고하셨습니다!")


    ##여기서부터
    # 분기 제어용 변수
    skip_to_state = None
    skip_to_step = None
    done = False  # 모든 진행이 끝나면 True

    state_index = 0
    while state_index < len(states) and not done:
        state = states[state_index]
        state_name = state.value

        print(f"\n===== [{state_name}] 단계를 시작합니다. =====")
        steps = STATE_STEPS_ORDER[state_name]

        step_index = 0
        while step_index < len(steps) and not done:
            step_name = steps[step_index]
            print(f"{step_name} start")

            var_desc_dict = STEP_VAR_DESCRIPTIONS[state_name][step_name]
            required_vars = list(var_desc_dict.keys())

            # 필요한 변수들이 Unknown이면 계속 Q&A 반복
            while any(
                not context.get(var) or context[var] == "Unknown"
                for var in required_vars
            ):
                # (A) 질문 생성
                question_text = generate_question_for_step(llm, state_name, step_name, context)
                print("\n[Assistant Question]")
                print(question_text.content)

                # (B) 사용자 답변
                user_input = input(f"[{user_name}]: ")
                # 대화이력에 누적
                context["chat_history"] += f"\n{user_name}: {user_input}"


                # (C) 사용자 답변을 바탕으로 변수 추출 (예: extract_reply_for_step)
                extract_reply_for_step(llm, state_name, step_name, context)

                # (예시 분기) goal_and_motivation_building에서 "go back" 이라는 키워드가 있으면
                # rapport_building으로 돌아가고 이후 단계는 순서대로 다시 진행
                if (
                    state == ChatbotState.MUSIC_DISCUSSION
                    and step_name == "music_recreation"
                ):
                    prompt = PromptTemplate(input_variables=["user_input"], template="""
                    사용자의 답변 "{user_input}"을 분석하세요.

                    - 만약 사용자가 **생성된 음악에 대해 바꾸고 싶어하는 경우 경우**, "1"을 단독 출력하세요.
                    - 예시: "바꾸고 싶어", "마음에 안들어", "이 부분은 바꾸고 싶어"

                    - 만약 사용자가 **생성된 음악에 대해 만족하는 경우**, "0"을 단독 출력하세요.
                    - 예시: "너무 좋아", "좋다", "마음에 들어", "안 바뀌어도 될 것 같아", "없다", "없어"

                    - 출력은 반드시 **"0" 또는 "1"만 단독으로 출력**해야 합니다. **다른 단어나 문장은 출력하지 마세요.**
                    """)
                    chain = prompt | llm
                    output = chain.invoke({"user_input": user_input})  # 실행
                    match = re.search(r'\b[01]\b', output.content) 
                    recreation_flag=int(match.group())
                    if (recreation_flag):
                        print("⇒ 사용자가 '이전 라포 스텝으로 돌아가길 원함' → Music_Creation.making_concept 분기합니다.")
                        skip_to_state = ChatbotState.MUSIC_CREATION
                        skip_to_step = "making_concept"  # 돌아가고 싶은 스텝
                        break  # while 루프 탈출

            # 만약 skip_to_state가 설정됐다면 현재 스텝 루프 정지
            if skip_to_state is not None:
                break

            # 스텝 완료
            print(f"\n--- 스텝 '{step_name}' 완료. 추출된 변수 ---")
            for var in required_vars:
                print(f"{var}: {context.get(var, 'Unknown')}")
            print("---------------------------------------")

            step_index += 1

        # 만약 skip_to_state가 설정됐다면, 그쪽으로 점프
        if skip_to_state:
            # 다음에 진행할 state 인덱스
            state_index = states.index(skip_to_state)
            # 그 안에서 원하는 step 인덱스
            if skip_to_step:
                all_steps = STATE_STEPS_ORDER[skip_to_state.value]
                if skip_to_step in all_steps:
                    step_index = all_steps.index(skip_to_step)
                else:
                    step_index = 0

            # 사용 후 초기화
            skip_to_state = None
            skip_to_step = None

        else:
            # 다음 State로 넘어감
            state_index += 1

    print("\n모든 진행이 끝났습니다. 수고하셨습니다.")
    print("수집된 변수:", context)

if __name__ == "__main__":
    main()
