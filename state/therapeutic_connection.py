from langchain.agents import Tool
from langchain.prompts import PromptTemplate
from prefix import question_prefix_prompt, slot_prefix_prompt, eval_prompt
from typing import Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain.memory import ConversationSummaryMemory
from langchain.chains import ConversationChain


#for state unit test
from dotenv import load_dotenv
load_dotenv()

def print_memory_summary(memory):
    print("\n===== 💬 요약된 memory 내용 =====")
    memory_vars = memory.load_memory_variables({})
    summary = memory_vars.get("history", "[현재 저장된 요약 없음]")
    print(summary)
    print("================================\n")


class OutputFormat(BaseModel):
    """사용자의 응답에서 얻어내야하는 정보"""
    name: Optional[str] = Field(
    default=None,
    description="user name")

    therapy_difficulty: Optional[str] = Field(
    default=None,
    description="Concerns the user has about the music-making activity")

    difficulty: Optional[str] = Field(
        default=None,
        description="The difficulty the user is currently experiencing in their daily life")

    difficulty_category: Optional[str] = Field(
        default=None,
        description="A classification of the difficulty the user is currently facing. "
                    "1) negative_experience: past bad memories or internal personal issues "
                    "2) depression: issues related to the user’s emotions "
                    "3) communication: issues related to others or social groups",
        enum=["negative_experience", "depression", "communication"])

    motivation: Optional[str] = Field(
        default=None,
        description="What the user hopes to gain through music therapy")




def therapeutic_connection(user_input, llm, memory, var_dict, bot_question) -> str:

    #1. 질문 + few-shot
    therapeutic_connection_question="""
    - Each question should be asked only once in the conversation.  
    - If the answer is unclear, rephrase or guide gently instead of repeating the same question.
    - Keep follow-up questions short and simple, especially for users with low literacy.
    - Aim to gently guide the user to reflect a little deeper each time.

    [Self-introduction Task]  
    - Exchange introductions with the user.  
    Example:  
    - Hello. I’m a music therapist. How would you like me to address you?

    [Rapport Building Task]  
    - Have a very brief conversation with the user about music (no more than 2 turns).
    - Ask one question to lightly check if the user has any worries about the music-making activity.
    - If a concern is expressed, offer a short, encouraging response.
    - Keep the tone warm and supportive, but do not prolong the conversation unnecessarily.
    Examples:  
    - Are you worried about today’s music-making activity?  
    - Are you looking forward to the music-making session today?  
    - Are you ready to have a fun time making music?

    [Identifying Difficulties Task]  
    - Identify the difficulties the user is currently facing.  
    - Talk in more detail about what situations are causing the difficulties and what problems they bring.  
    - Try to help the user express their feelings.
    Examples:  
    - What is the biggest difficulty you are feeling in your daily life?  
    - Can you tell me more about what situations are making things hard for you?

    [Understanding Goals and Motivation Task]  
    - Ask if the user has ever felt comforted by music.  
    - Ask what kind of music helped them.  
    - Find out what they want to gain through music therapy and their motivation for participating.  
    Examples:  
    - Have you ever felt comforted by music you’ve listened to before?  
    - What would you like to gain through our music-making activity?  
    - What are you hoping for from our music-making session?
    """
    full_few_shot_dialogue = """
    이 대화의 형식같이 대화를 진행하세요.  
    <예시 대화>
    AI: 안녕하세요. 저는 음악치료사입니다. 제가 당신을 어떻게 부르면 될까요?
    Human: 진영
    AI: 진영님, 음악 만들기 활동에 대해서 걱정이 있으신가요?
    Human: 음악 만들기가 어려울 것 같아
    AI: 잘 할 수 있을거예요! 제가 차근차근 도와드릴게요
    Human: 좋아
    AI: 좋아요, 그러면 음악 만들기 활동을 들어가기 전에 서로 알아가보는 시간을 가질까요? 현재 생활하면서 가장 크게 느끼는 어려움은 무엇인가요?
    Human: 사실은 내가 원래 몸이 많이 안좋은 편인데 특히 귀가 잘 안들리게 되었잖아. 몇년 안되었거든, 한쪽귀가 안들린 건 조금 오래 되었어. 하지만 남은 귀 한쪽이 있어서 버텼는데, 2년 전쯤부터 그 남은 한쪽귀가 잘 안들려서..
    AI: 진영님, 귀가 안 들리게 되면서 겪으시는 일상의 어려움이 있다면 구체적으로 어떤 것들이 있을까요? 예를 들어, 사람들과의 대화나 일상생활에서의 불편함 등이 있을 수 있겠죠.
    Human: 맞아. 다른 사람의 말을 잘 알아듣지 못할 때도 많고 내가 말하는 것도 겁이 나..
    AI: 말씀하시기 힘드셨을 텐데 고맙습니다. 대화나 일상생활에서 겪는 어려움으로 인해, 가장 자주 느끼시는 감정이 무엇인가요?
    Human: 누군가 나를 좋지 않게 생각하면 어떨까 걱정이 되지
    AI: 많이 걱정되시겠어요. 대화에서 어려움을 겪을 때 주로 어떤 감정이 가장 많이 느껴지나요? 예를 들어 외로움, 슬픔, 불안 등이 있을 수 있어요.
    Human: 외로움, 슬픔, 불안, 두려움이 다 느껴지지. 그 중에서 하나만 골라야 한다면 두려움
    AI: 말씀하신 두려움이나 다른 감정들을 조금이라도 덜어드리고 싶어요. 음악을 통해서 어떤 도움을 받고 싶으신지 알려주실 수 있나요? 예를 들어, 감정을 표현하고 싶다거나, 마음의 평화를 찾고 싶다는 것도 좋습니다.
    Human: 내 감정을 표현하고 싶고, 편안한 마음을 갖고 싶어
    AI: 좋아요. 제가 도와드릴게요. 같이 음악을 만들어봐요. 
    """
    question_prompt = PromptTemplate(
        input_variables=["user_message","history"],
        template=
            question_prefix_prompt+'\n'
            +therapeutic_connection_question+'\n'
            +full_few_shot_dialogue+'\n'
            +"Chat history: {history}\n"
            +"User said: {user_message}"
    )
        
    memory_vars=memory.load_memory_variables({})
    history=memory_vars.get("history","")


    question_chain=question_prompt | llm | StrOutputParser()
    question = question_chain.invoke({"user_message":user_input,"history":history})

    # eval_chain= eval_prompt | llm | StrOutputParser()
    # eval=eval_chain.invoke({"history": history, "question": question, "bot_questions": bot_question,"user_input":user_input,})

    memory.save_context({"input": user_input},{"output": question})

    print_memory_summary(memory)
    # print("---")
    # print("조건 ", bot_question)
    # print("CoVe Q: ", question)
    # print("----")
    structured_llm=llm.with_structured_output(schema=OutputFormat)
    slot_prompt=PromptTemplate(
        input_variables=["history"],
        template=
            slot_prefix_prompt+'\n'
            +"Chat history: {history}"
    )
    slot=structured_llm.invoke(slot_prompt.invoke({"history":history}))
    
    return question, slot
   
# therapeutic_connection_langchain = Tool(
#     name="therapeutic_connection",
#     func=therapeutic_connection,
#     description="""
#     사용자와 음악치료를 시작하기 전 간단한 스몰토크와 음악치료를 원하는 동기 및 어려움을 말하는 단계입니다. 
#     """
# )

# # TruLens 초기화
# tru=Tru()
# provider = OpenAIProvider(model_engine="gpt-4o")
# # 평가 기준 정의
# feedback_empathy = Feedback(
#     lambda output: provider.generate_score_and_reasons(
#         system_prompt="Evaluate the empathy in the following response. Does it show understanding, care, or emotional connection to the user? \nReturn ONLY a JSON object with exactly two keys: score (0‑10 float) and reason (string, one sentence).",
#         user_prompt=output,
#         min_score_val=0,
#         max_score_val=10,
#         temperature=0.0
#     ),
#     name="Empathy"
# ).on_output()

# # Active Listening 평가
# feedback_listening = Feedback(
#     lambda output: provider.generate_score_and_reasons(
#         system_prompt="Evaluate whether the response demonstrates active listening. Does it reflect or summarize the user's input? \nReturn ONLY a JSON object with exactly two keys: score (0‑10 float) and reason (string, one sentence).",
#         user_prompt=output,
#         min_score_val=0,
#         max_score_val=10,
#         temperature=0.0
#     ),
#     name="Active Listening"
# ).on_output()


# feedback_toxicity = Feedback(
#     provider.harmfulness_with_cot_reasons,
#     name="Toxicity"
# ).on_output()

# feedback_relevance = Feedback(
#     lambda inp, out: provider.relevance_with_cot_reasons(
#         prompt=inp,           # 질문(혹은 전체 입력)
#         response=out          # 챗봇 응답
#     ),
#     name="Relevance"
# ).on_input_output()


# all_feedbacks = [feedback_empathy, feedback_listening, feedback_toxicity, feedback_relevance]

# def main():
#     tru_app = TruBasicApp(therapeutic_connection, app_id="therapy_session", feedbacks=all_feedbacks)
#     end_flag_int=0
#     slot_flag=0
#     dialogue_json={}
#     question, slot, history  = therapeutic_connection("안녕",slot_flag)
#     turn_num=0
#     while True:
#         save_turn={}
#         user_input = user_simulator.predict(input=question)

#         if end_flag_int==1:
#             break

#         with tru_app as rec:
#             question, slot, history = tru_app.app(user_input,slot_flag) 
        
#         record = rec.get()              # recording.records[0] 도 동일
#         results= record.wait_for_feedback_results() 

#         eval_results = {}
#         for fb, fr in results.items():      # results = record.wait_for_feedback_results()

#             val = fr.result                 # ← 핵심

#             # 1) generate_score_and_reasons → tuple
#             if isinstance(val, tuple) and len(val) == 2:
#                 score, meta = val
#                 reason = meta.get("reason", "")
#             # 2) 단순 float
#             elif isinstance(val, (int, float)):
#                 score, reason = val, ""
#             else:
#                 score, reason = None, "Unsupported result type"

#             eval_results[fb.name] = {"score": score, "reason": reason}
#         save_turn['user_input']=user_input
#         save_turn['chatbot_output']=question
#         save_turn['slot']=slot.model_dump()
#         save_turn['history']=history
#         save_turn["eval"] = eval_results

#         dialogue_json[turn_num]=save_turn
#         turn_num+=1
#         print(turn_num)
#         none_fields = {k: v for k, v in slot.model_dump().items() if v is None}

#         if len(none_fields)==0:
#             print("all slot filled")
#             slot_flag=1
#             end_prompt=PromptTemplate(
#                 input_variables=["user_input"],
#                 template="You are an LLM that determines whether a conversation has come to a natural end. If the user still has questions or wants to continue discussing their difficulties, output 0. Otherwise, output 1. You must output a number only.\n"
#                 +"User's previous response: {user_input}"
#             )
#             end_chain=end_prompt | llm | StrOutputParser()
#             end_flag = end_chain.invoke({"user_input":user_input})

#             match = re.search(r'\b[01]\b', end_flag)
#             if match:
#                 end_flag_clean = match.group()
#                 print("Cleaned end_flag:", end_flag_clean)
#                 if end_flag_clean.strip() in ("0", "1"):
#                     end_flag_int = int(end_flag_clean.strip())
#             else:
#                 print("❌ Couldn't find a valid flag in the output.")

#         if turn_num>20:
#             break

            
#     with open("./therapeutic_connection_log.json", "w") as f:
#         json.dump(dialogue_json, f)

# if __name__ == "__main__":
#     main()