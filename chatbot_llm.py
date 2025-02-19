import os
import requests
import time
import json
from typing import Dict, Any, List
import re
import datetime

# langchain
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

from dotenv import load_dotenv

from utils.MTA_const.MTA_enum import ChatbotState
from utils.MTA_const.MTA_steps import STATE_STEPS_ORDER
from utils.MTA_const.MTA_prompts import STEP_MAIN_PROMPTS
from utils.MTA_const.MTA_descriptions import STEP_VAR_DESCRIPTIONS

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

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
    다음에 주어지는 [대화 내역], [주요 프롬프트]를 바탕으로 [추출해야 할 변수와 설명]을 잘 채워넣을 수 있는 질문을 생성하세요.
    [추출해야할 변수와 설명]은 본 대화를 통해 사용자로부터 추출하고자 하는 변수와 그 변수가 무엇인지에 대한 설명을 '변수: 설명'의 형태로 제공합니다.
    당신은 [대화 규칙]을 철저하게 지켜야 합니다.
    사용자의 이름은 **{user_name}** 입니다.

    다음은 현재까지의 대화 내역입니다:

    [대화 내역]
    {chat_history}

    [주요 프롬프트] 
    {main_prompt}

    [추출해야 할 변수와 설명]
    {variable_explanations}

    [대화 규칙]
    - {user_name}님이 편안하게 대화할 수 있도록 배려하세요.
    - {user_name}님의 관심과 감정을 존중하며 질문하세요.
    - 추출해야 할 변수를 채우는 것을 최우선으로 하되 자연스럽게 대화를 이어가세요.
    - [대화 내역]에 있는 질문과 비슷하거나 똑같은 질문은 삼가하세요. 
    - 사용자는 문해력이 떨어지는 청각장애인이므로 되도록 간결하고 짧은 질문을 진행하세요. 
    - 예시는 사용자가 모르겠다고 할 때 제시하세요.

    """

    wait_text = """
    잠깐, 당신이 생성한 [질문]은 [기존 프롬프트]의 [대화 규칙]을 엄격히 지키며 사용자로부터 [추출해야 할 변수와 설명]의 변수를 적절히 추출하도록 구성되었나요?
    혹시 사용자가 이미 적절한 답변을 하였음에도 기존에 했던 질문을 반복하고 있지는 않나요?
    창의력을 발휘하여 사용자와 친밀한 대화를 나누는 방향으로 질문을 하고 있는 지 다시 생각해보세요.
    
    [질문]
    {question}
    
    [기존 프롬프트]
    {prior_prompt}
    """

    # (3) LangChain LLMChain 실행
    prompt = PromptTemplate(
        input_variables=["user_name","chat_history","main_prompt","variable_explanations","user_ready", "motivation", "difficulty", "emotion", "music_info", "concept", "lyrics_keyword", "lyrics_sentence","lyrics_flow","lyrics", "discussion_feedback", "music_component","title","style_prompt", "individual_emotion", "strength", "change_music", "change_mind", "feeling"],
        template=prompt_text
    )
    wait_prompt = PromptTemplate(
        input_variables=["question", "prior_prompt"],
        template=wait_text
    )
    chain = prompt | llm
    wait_chain = {"question": chain, "prior_prompt": prompt} | wait_prompt

    output = wait_chain.invoke({
        "user_ready": context.get("user_ready", ""),
        "motivation": context.get("motivation", ""),
        "difficulty": context.get("difficulty", ""),
        "emotion": context.get("emotion", ""),
        "music_info": context.get("music_info", ""),
        "concept": context.get("concept", ""),
        "lyrics_keyword": context.get("lyrics_keyword", ""),
        "lyrics_sentence": context.get("lyrics_sentence", ""),
        "lyrics_flow": context.get("lyrics_flow", ""),
        "lyrics": context.get("lyrics", ""),
        "discussion_feedback": context.get("discussion_feedback", ""),
        "music_component": context.get("music_component", ""),
        "title": context.get("title", ""),
        "style_prompt": context.get("style_prompt", ""),
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

    # new_chat_history = context.get("chat_history", "") + f"\n[System Output - Step: {step_name}]\n{output}"
    # context["chat_history"] = new_chat_history
    return output

def extract_reply_for_step(llm, state_name: str, step_name: str, context: Dict[str, Any]) -> str:
    chat_history = context['step_chat_history'][step_name]

    # (1) 해당 스텝에서 필요한 변수와 그 설명 가져오기
    var_desc_dict = STEP_VAR_DESCRIPTIONS[state_name][step_name]
    required_var_dict = {}
    for var, desc in var_desc_dict.items():
        if not context.get(var) or context[var] == "Unknown":
            required_var_dict[var] = desc
    required_vars = list(required_var_dict.keys())

    # (2) 프롬프트 생성
    #     - 현재 대화 내용
    #     - 해당 스텝의 안내 (STEP_MAIN_PROMPTS)
    #     - 추출해야 할 변수 목록 & 설명
    #     - "JSON으로만 응답" 요청
    prompt_text = """
    당신은 대화기록을 보고 특정 변수에 대답을 가공해서 넣는 전문가입니다.
    입력된 대화기록들을 보고 현재 단계에서 채워야하는 변수에 답변을 채우세요.
    최근 대화(1~3턴)을 보고 판단하여 변수를 채웁니다. 

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
        "chat_history": chat_history,
        "variable_explanations": "\n".join([f"- {var}: {desc}" for var, desc in required_var_dict.items()])

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
    # new_chat_history = context.get("chat_history", "") + f"\n[System Output - Step: {step_name}]\n{output}"
    # context["chat_history"] = new_chat_history
    return output.content

def extract_name_with_llm(llm, user_input: str) -> str:
    """
    LLM이 사용자 입력에서 이름을 추출하여 반환하는 함수.
    """
    prompt_text = """
        사용자가 다양한 방식으로 자신의 이름을 말할 수 있습니다. 
        예를 들어:
        - 나는 00이요.
        - 나를 00이라고 불러줘.
        - 제 이름은 00입니다.
        - 00이요
        - 00
        - 김00

        당신의 역할은 **사용자의 입력에서 이름만 정확히 추출**하는 것입니다.
        위의 응답처럼 들어오면 아래와 같이 출력하세요.

        - 00
        
        절대로 다른 문장이나 설명을 추가하지 마세요.
        한글이 깨지지 않도록 그대로 출력해주세요. 
        반드시 이름만 그대로 출력하세요.


        사용자 입력: "{user_input}"
        사용자가 닉네임이나 초성만 입력했다면 그것을 그대로 출력해도 됩니다. 
        사용자의 이름을 이해 못했다면 사용자라고 지칭합니다. 

        """

    # LangChain LLM 실행
    prompt = PromptTemplate(input_variables=["user_input"], template=prompt_text)
    chain = prompt | llm
    output = chain.invoke({"user_input": user_input})  # 실행

    
    name = output.content

    return name if name else "Unknown"
    
def call_suno(title: str, lyrics: str, music_component: str) -> str:
    print(f'lyrics: {lyrics}')
    print(f'meta codes: {music_component}')
    print(f'title: {title}')

    if not os.path.exists('music'):
        os.makedirs('music')
    music_filename = os.path.join("music", f"{title}.wav")

    post = {
        'prompt': lyrics,
        'tags': music_component,
        'title': title,
        'make_instrumental': False,
        'wait_audio': True,
    }
    print(f'post message: {post}')

    response = requests.post('http://localhost:3000/api/custom_generate', json=post)

    if response.status_code == 200:
        res_data = response.json()
        print(res_data)
        audio_url = res_data[0]['audio_url']

        print(f'Downlaod music from {audio_url}')
        start_time = time.time()
        audio_res = requests.get(audio_url, stream=True, timeout=(5, 300))
        audio_res.raise_for_status()
        with open(music_filename, 'wb') as file:
            for chunk in audio_res.iter_content(chunk_size=8192):
                if chunk:
                    file.write(chunk)
            print(
                f'\nProcessed Suno, Input Text: {lyrics}, Meta_codes: {music_component}, Title: {title}, Output Music: {music_filename}.')
        print(f'Download done! Elapsed Time: {time.time() - start_time}')
    else:
        print(f'error code: {response.status_code}, message: {response.content}')

    return music_filename

def save_chat_history(context, user_name):
    """대화 기록을 'chat_history_YYYY-MM-DD_HH-MM-SS.txt' 형식으로 저장"""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"chat_history_{timestamp}_{user_name}.txt"
    
    # 폴더 존재 여부 확인 후 생성
    if not os.path.exists("chat_logs"):
        os.makedirs("chat_logs")

    file_path = os.path.join("chat_logs", filename)
    
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(context["chat_history"])
    
    print(f"대화 기록이 '{file_path}' 파일로 저장되었습니다.")

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
        "chat_history":"",
        "step_chat_history": {},
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
                if step_name not in context["step_chat_history"]:
                    context["step_chat_history"][step_name] = ""

                # (A) 질문 생성
                question_text = generate_question_for_step(llm, state_name, step_name, context)
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print("\n[Assistant Question]",question_text.content)
                context["step_chat_history"][step_name] += f"\n[{timestamp}] Assistant: {question_text.content}"
                context["chat_history"] += f"\n[{timestamp}] Assistant: {question_text.content}"

                if (step_name == "style_gen" or step_name=="lyrics_gen"):
                    pass
                else:
                    # (B) 사용자 답변
                    user_input = input(f"[{user_name}]: ")

                    # 대화이력에 누적
                    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    context["step_chat_history"][step_name] += f"\n[{timestamp}] {user_name}: {user_input}"
                    context["chat_history"] += f"\n[{timestamp}] {user_name}: {user_input}"


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

                print("==========step_chat_history========")
                print(context["step_chat_history"][step_name])
                print("===================")

                # (C) 사용자 답변을 바탕으로 변수 추출 (예: extract_reply_for_step)
                extract_reply_for_step(llm, state_name, step_name, context)


                #음악 생성
                if (
                    state == ChatbotState.MUSIC_CREATION
                    and step_name == "style_gen"
                    and context.get("style_prompt", "")
                ):
                    music_title=context.get("title", "")
                    music_lyrics=context.get("lyrics", "")
                    music_prompt=context.get("style_prompt", "")

                    # 모든 필수 값이 존재할 때만 실행
                    if all([music_title, music_lyrics, music_prompt]):
                        call_suno(music_title, music_lyrics, music_prompt)
                    else:
                        print("음악을 생성하기 위해 필요한 정보가 부족합니다.")                    

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

    save_chat_history(context,user_name)



if __name__ == "__main__":
    main()
