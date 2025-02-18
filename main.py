import dotenv
from flask import Flask, request, jsonify, send_file, session
from flask_cors import CORS
import json
import traceback
from analyzer.music import MusicAnalyzer
import os
from chatbot.state_step_chat import ChatbotState, STATE_STEPS_ORDER,STEP_VAR_DESCRIPTIONS, generate_question_for_step, extract_reply_for_step, extract_name_with_llm, call_suno, save_chat_history
import requests
from io import BytesIO
import re
import datetime
from typing import Dict, Any
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI



load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
# CORS(app, origins=["https://mta-static.onrender.com"])
CORS(app)
app.secret_key = "scilab"  # 세션 사용을 위해 필요


llm = ChatOpenAI(
model_name="gpt-4-turbo",  # 최신 모델 사용
temperature=0.7,
openai_api_key=api_key  # 환경변수 설정 가능
)

chatbot_states = {}


@app.route('/analysis', methods=['POST'])
def analyze_music():
    try:
        post_data = request.get_json()
        if post_data is None:
            raise ValueError("No JSON data provided")
        
        print("Received data:", post_data)  # 요청 데이터 출력

        music_path = post_data.get('url')
        if not music_path:
            raise ValueError("Missing 'url' field")
        
        lyrics = post_data.get('lyrics', '""')

        print(f"Music path: {music_path}, Lyrics: {lyrics}")
        
         # Google Drive 링크 처리
        if "drive.google.com" in music_path:
            if "/file/d/" in music_path:
                file_id = music_path.split('/d/')[1].split('/')[0]
            elif "id=" in music_path:
                file_id = music_path.split("id=")[1].split("&")[0]
            else:
                raise ValueError("Invalid Google Drive URL")
            music_path = f"https://drive.google.com/uc?id={file_id}&export=download"
            print(f"Converted Google Drive link to direct download URL: {music_path}")


        # 파일 다운로드
        response = requests.get(music_path, stream=True)
        if response.status_code != 200:
            raise ValueError("Failed to download the music file")

        # 파일을 로컬에 임시 저장
        with open("temp_music_file.wav", "wb") as f:
            for chunk in response.iter_content(chunk_size=1024):
                f.write(chunk)

        la = MusicAnalyzer("temp_music_file.wav", lyrics)
        la.analyze()
        result = la.get_final_format()
        
        # 임시 파일 삭제
        os.remove("temp_music_file.wav")

        return jsonify(result), 200
    except ValueError as ve:
        error_message = {
            'error': str(ve),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_message, indent=4))  # 로그에 상세 오류 정보 출력
        return jsonify(error_message), 400
    except Exception as e:
        error_message = {
            'error': str(e),
            'traceback': traceback.format_exc()
        }
        print(json.dumps(error_message, indent=4))  # 로그에 상세 오류 정보 출력
        return jsonify(error_message), 400

@app.route('/set_user_name', methods=['POST'])
def set_user_name():
    """
    사용자가 처음 접근하면 챗봇이 "당신을 어떻게 부르면 될까요?"라고 질문함.
    이후 유저 입력을 받아 이름을 추출하여 반환.
    """
    data = request.get_json()
    print(data)
    user_input=data["userName"]
    user_id=data["currentUser"]
    # ✅ (1) 유저 입력이 없으면 챗봇이 먼저 질문
    if not user_input:
        return jsonify([{"role": "bot", "content": "제가 당신을 어떻게 부르면 될까요?"}])

    # ✅ (2) 유저가 입력하면 LLM으로 이름 추출
    user_name = extract_name_with_llm(llm, user_input)

    # 이름이 인식되지 않으면 다시 요청
    if user_name == "Unknown":
        return jsonify({"error": "이름을 인식하지 못했습니다. 다시 입력해주세요."}), 400
    
    chatbot_states[user_id] = {
    "user_name": user_name,
    "current_state": ChatbotState.THERAPEUTIC_CONNECTION.value,
    "current_step": 0,
    "context": {}
    }
    print(f"저장된 유저 이름: {chatbot_states[user_id]['user_name']}")

    return jsonify({"userName": f"좋아요, 앞으로 {user_name}님이라고 부를게요."})


# ✅ (1) 질문 생성 (POST /chat/question)
@app.route('/chat/question', methods=['POST'])
def generate_question():
    """현재 단계의 질문을 생성하고 프론트로 보냄."""
    data = request.get_json()
    print(data) 
    user_id=data["currentUser"]

    print(user_id)
    chat_state = chatbot_states[user_id]
    current_state = chat_state["current_state"]
    current_step_index = chat_state["current_step"]
    context = chat_state["context"]
    
    # 🔹 현재 진행 중인 단계 가져오기
    steps = STATE_STEPS_ORDER[current_state]
    step_name = steps[current_step_index]
    print(current_state, step_name)
    # 🔹 질문 생성
    question_text = generate_question_for_step(llm, current_state, step_name, context)
    
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    context.setdefault("step_chat_history", {}).setdefault(step_name, "")
    context["step_chat_history"][step_name] += f"\n[{timestamp}] boy: {question_text.content}"
    context["chat_history"] = context.get("chat_history", "") + f"\n[{timestamp}] bot: {question_text.content}"

    print(context)
    return jsonify([{"role": "bot", "content": question_text.content}])

# ✅ (2) 사용자 응답 처리 (POST /chat/response)
@app.route('/chat/response', methods=['POST'])
def process_response():
    """사용자 응답을 받아 변수 추출 & 다음 단계 진행"""
    data = request.get_json()
    print(data)
    user_id=data["currentUser"]

    user_input = data.get("message", "").strip()

    chat_state = chatbot_states[user_id]
    
    user_name = chat_state["user_name"]
    current_state = chat_state["current_state"]
    current_step_index = chat_state["current_step"]
    context = chat_state["context"]
    
    # 🔹 현재 진행 중인 단계 가져오기
    steps = STATE_STEPS_ORDER[current_state]
    step_name = steps[current_step_index]
    required_vars = list(STEP_VAR_DESCRIPTIONS[current_state][step_name].keys())
    print(steps, step_name)


    # 🔹 사용자 입력 저장
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    context.setdefault("step_chat_history", {}).setdefault(step_name, "")
    context["step_chat_history"][step_name] += f"\n[{timestamp}] {user_name}: {user_input}"
    context["chat_history"] = context.get("chat_history", "") + f"\n[{timestamp}] {user_name}: {user_input}"

    if current_state == ChatbotState.MUSIC_DISCUSSION.value and step_name == "music_recreation":
        print("🎯 Checking if the user wants to modify the music...")
        prompt = PromptTemplate(
            input_variables=["user_input"],
            template="""
            사용자의 답변 "{user_input}"을 분석하세요.

            - 만약 사용자가 **생성된 음악에 대해 바꾸고 싶다면**, "1"을 단독 출력하세요.
            - 예시: "바꾸고 싶어", "마음에 안들어", "이 부분은 수정하고 싶어"

            - 만약 사용자가 **음악 수정이 필요 없다고 판단하면**, "0"을 단독 출력하세요.
            - 예시: "좋아요", "수정 안 해도 될 것 같아"

            - 출력은 반드시 **"0" 또는 "1"만 단독으로 출력**해야 합니다.
            """
        )

        chain = prompt | llm
        output = chain.invoke({"user_input": user_input})
        match = re.search(r'\b[01]\b', output.content)

        if match:
            recreation_flag = int(match.group())
            if recreation_flag == 1:
                # 🔹 사용자가 "음악 수정 원함" → Music_Creation.making_concept 단계로 이동
                chat_state["current_state"] = ChatbotState.MUSIC_CREATION.value
                chat_state["current_step"] = STATE_STEPS_ORDER[ChatbotState.MUSIC_CREATION.value].index("making_concept")
                print("🔄 사용자 요청: 이전 단계로 돌아감 → Music_Creation.making_concept")
                ##근데 이렇게하면 변수를 다 초기화해야하나?
                return jsonify([{"role": "bot", "content": "음악을 다시 조정해볼게요. 어떤 방향으로 수정할까요?"}])
            
    # 🔹 사용자 입력을 바탕으로 변수 추출
    extract_reply_for_step(llm, current_state, step_name, context, context["step_chat_history"][step_name])

    if current_state == ChatbotState.MUSIC_CREATION.value and step_name == "style_gen":
            music_title = context.get("title", "")
            music_lyrics = context.get("lyrics", "")
            music_prompt = context.get("style_prompt", "")

            if all([music_title, music_lyrics, music_prompt]):
                print("음악 생성 시작")
                call_suno(music_title, music_lyrics, music_prompt)
                return jsonify([{"role": "bot", "content": "음악을 생성 중입니다. 잠시만 기다려주세요!"}])
            else:
                print("음악을 생성하기 위해 필요한 정보가 부족합니다.")
    # 🔹 필요한 변수가 모두 채워졌는지 확인
    all_vars_filled = all(var in context and context[var] != "Unknown" for var in required_vars)

    if all_vars_filled:
        if current_step_index + 1 < len(steps):
            chat_state["current_step"] += 1  # 같은 상태에서 다음 단계로 이동
        else:
            # 🔹 다음 상태로 이동
            state_keys = list(STATE_STEPS_ORDER.keys())
            current_state_index = state_keys.index(current_state)
            if current_state_index + 1 < len(state_keys):
                chat_state["current_state"] = state_keys[current_state_index + 1]
                chat_state["current_step"] = 0  # 새로운 상태의 첫 스텝
            else:
                return jsonify([{"role": "bot", "content": "모든 진행이 끝났습니다. 수고하셨습니다!"}])


    return jsonify([{"role": "bot", "content": "응답을 처리했습니다. 다음 질문을 요청해주세요."}])


# def music_chat():
 
#     user_name = session.get('user_name', 'Unknown')

#     # 3) Context 딕셔너리 (대화 기록, 사용자 이름 저장)
#     context: Dict[str, Any] = {
#         "chat_history":"",
#         "step_chat_history": {},
#         "user_name": user_name  # 사용자 이름 저장
#     }

#     # 4) State 순서 (선형 진행)
#     states = [
#         ChatbotState.THERAPEUTIC_CONNECTION,
#         ChatbotState.MUSIC_CREATION,
#         ChatbotState.MUSIC_DISCUSSION,
#         ChatbotState.WRAP_UP
#     ]

#     # 분기 제어용 변수
#     skip_to_state = None
#     skip_to_step = None
#     done = False  # 모든 진행이 끝나면 True

#     state_index = 0
#     while state_index < len(states) and not done:
#         state = states[state_index]
#         state_name = state.value

#         print(f"\n===== [{state_name}] 단계를 시작합니다. =====")
#         steps = STATE_STEPS_ORDER[state_name]

#         step_index = 0
#         while step_index < len(steps) and not done:
#             step_name = steps[step_index]
#             print(f"{step_name} start")

#             var_desc_dict = STEP_VAR_DESCRIPTIONS[state_name][step_name]
#             required_vars = list(var_desc_dict.keys())

#             # 필요한 변수들이 Unknown이면 계속 Q&A 반복
#             while any(
#                 not context.get(var) or context[var] == "Unknown"
#                 for var in required_vars
#             ):
#                 if step_name not in context["step_chat_history"]:
#                     context["step_chat_history"][step_name] = ""

#                 # (A) 질문 생성
#                 question_text = generate_question_for_step(llm, state_name, step_name, context)
#                 timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#                 print("\n[Assistant Question]",question_text.content)
#                 context["step_chat_history"][step_name] += f"\n[{timestamp}] Assistant: {question_text.content}"
#                 context["chat_history"] += f"\n[{timestamp}] Assistant: {question_text.content}"

#                 if (step_name == "style_gen" or step_name=="lyrics_gen"):
#                     pass
#                 else:
#                     # (B) 사용자 답변
#                     user_input = input(f"[{user_name}]: ")

#                     # 대화이력에 누적
#                     timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#                     context["step_chat_history"][step_name] += f"\n[{timestamp}] {user_name}: {user_input}"
#                     context["chat_history"] += f"\n[{timestamp}] {user_name}: {user_input}"


#                 if (
#                     state == ChatbotState.MUSIC_DISCUSSION
#                     and step_name == "music_recreation"

#                 ):
#                     prompt = PromptTemplate(input_variables=["user_input"], template="""
#                     사용자의 답변 "{user_input}"을 분석하세요.

#                     - 만약 사용자가 **생성된 음악에 대해 바꾸고 싶어하는 경우 경우**, "1"을 단독 출력하세요.
#                     - 예시: "바꾸고 싶어", "마음에 안들어", "이 부분은 바꾸고 싶어"

#                     - 만약 사용자가 **생성된 음악에 대해 만족하는 경우**, "0"을 단독 출력하세요.
#                     - 예시: "너무 좋아", "좋다", "마음에 들어", "안 바뀌어도 될 것 같아", "없다", "없어"

#                     - 출력은 반드시 **"0" 또는 "1"만 단독으로 출력**해야 합니다. **다른 단어나 문장은 출력하지 마세요.**
#                     """)
#                     chain = prompt | llm
#                     output = chain.invoke({"user_input": user_input})  # 실행
#                     match = re.search(r'\b[01]\b', output.content) 
#                     recreation_flag=int(match.group())
#                     if (recreation_flag):
#                         print("⇒ 사용자가 '이전 라포 스텝으로 돌아가길 원함' → Music_Creation.making_concept 분기합니다.")
#                         skip_to_state = ChatbotState.MUSIC_CREATION
#                         skip_to_step = "making_concept"  # 돌아가고 싶은 스텝
#                         break  # while 루프 탈출

#                 print("==========step_chat_history========")
#                 print(context["step_chat_history"][step_name])
#                 print("===================")

#                 # (C) 사용자 답변을 바탕으로 변수 추출 (예: extract_reply_for_step)
#                 extract_reply_for_step(llm, state_name, step_name, context, context["step_chat_history"][step_name])


#                 #음악 생성
#                 if (
#                     state == ChatbotState.MUSIC_CREATION
#                     and step_name == "style_gen"
#                     and context.get("style_prompt", "")
#                 ):
#                     music_title=context.get("title", "")
#                     music_lyrics=context.get("lyrics", "")
#                     music_prompt=context.get("style_prompt", "")

#                     # 모든 필수 값이 존재할 때만 실행
#                     if all([music_title, music_lyrics, music_prompt]):
#                         call_suno(music_title, music_lyrics, music_prompt)
#                     else:
#                         print("음악을 생성하기 위해 필요한 정보가 부족합니다.")                    

#             # 만약 skip_to_state가 설정됐다면 현재 스텝 루프 정지
#             if skip_to_state is not None:
#                 break
#             # 스텝 완료
#             print(f"\n--- 스텝 '{step_name}' 완료. 추출된 변수 ---")
#             for var in required_vars:
#                 print(f"{var}: {context.get(var, 'Unknown')}")
#             print("---------------------------------------")

#             step_index += 1

#         # 만약 skip_to_state가 설정됐다면, 그쪽으로 점프
#         if skip_to_state:
#             # 다음에 진행할 state 인덱스
#             state_index = states.index(skip_to_state)
#             # 그 안에서 원하는 step 인덱스
#             if skip_to_step:
#                 all_steps = STATE_STEPS_ORDER[skip_to_state.value]
#                 if skip_to_step in all_steps:
#                     step_index = all_steps.index(skip_to_step)
#                 else:
#                     step_index = 0

#             # 사용 후 초기화
#             skip_to_state = None
#             skip_to_step = None

#         else:
#             # 다음 State로 넘어감
#             state_index += 1

#     print("\n모든 진행이 끝났습니다. 수고하셨습니다.")
#     print("수집된 변수:", context)

#     save_chat_history(context,user_name)


        
if __name__ == '__main__':
    dotenv.load_dotenv()
    port = int(os.getenv("PORT", 5000))  # Render 환경 변수 PORT 사용
    app.run(host="0.0.0.0", port=port)