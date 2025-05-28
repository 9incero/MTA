from langchain.agents import Tool
from langchain.prompts import PromptTemplate
from prefix import question_prefix_prompt, slot_prefix_prompt
from pydantic import BaseModel, Field
from typing import Optional


from langchain_openai import ChatOpenAI
from langchain.memory import ConversationSummaryMemory
from langchain_core.output_parsers import StrOutputParser


#시뮬레이션
from trulens.core import Feedback
from trulens_eval.feedback.provider.openai import OpenAI as OpenAIProvider
import pprint  # 보기 좋게 출력용
from trulens_eval import Tru, TruChain  # (또는 최신 `trulens`로 바꿔야 함)
from trulens.apps.basic import TruBasicApp   # 핵심!

#저장위함
import json
import re





def print_memory_summary(memory):
    print("\n===== 💬 요약된 memory 내용 =====")
    memory_vars = memory.load_memory_variables({})
    summary = memory_vars.get("history", "[현재 저장된 요약 없음]")
    print(summary)
    print("================================\n")

class OutputFormat(BaseModel):
    """사용자의 응답에서 얻어내야하는 정보"""
    concept: Optional[str] = Field(
        default=None,
        description="The story or theme the user wants to express in the lyrics")
    
    concept_discussion: Optional[str] = Field(
        default=None,
        description="A summary of what the user shared about their concept during the [Concept Discussion Task]")

    lyric_keyword: Optional[str] = Field(
        default=None,
        description="The main keyword that comes to mind when expressing the intended theme")

    lyric_image: Optional[str] = Field(
        default=None,
        description="The image that comes to mind when thinking of the lyrics")

    lyrics_content: Optional[str] = Field(
        default=None,
        description="Detailed sentences the user wants to include in the lyrics")
    
def extraction_source(user_input, llm,memory, var_dict, bot_question):
    extraction_source_question=f"""
    [Making Concept Task]
    - 노래 가사에 대한 주제를 정합니다.
    Example:
    - 노래 안에 어떤 이야기를 담고 싶나요?
    - 어떤 감정이나 상황을 음악으로 담고 싶나요?

    [Concept Discussion Task]
    - Concept에 대해서 더욱 자세하게 이야기를 나눕니다.
    - 사용자에게 왜 이런 이야기를 하고싶은지, 이 이야기를 털어놓으며 어떤 감정을 느끼는지를 물어보세요.
    - 사용자의 감정을 들여다보도록 질문하세요. 
    Example:
    - 왜 이런 주제에 대해 이야기를 하고 싶은가요?
    - 이 가사를 공유하고 싶은 사람이 있나요?
    - 이 이야기를 생각하며 어떤 감정을 느꼈나요?
    - 이 이야기를 생각하면 스스로에게 어떤 말을 해주고 싶은가요?

    [Making Lyrics Task]
    - 가사를 작성하기 위한 정보를 수집합니다.
    - 가사에 대한 주요 아이디어를 사용자에게 물어보세요.
    - 최대한 많은 아이디어를 꺼낼 수 있도록 격려하고 질문하세요.
    - 시각적인 비유로 물어보는 것은 좋은 접근입니다.
    Example:
    - 주제를 표현하기 위해서 어떤 단어가 떠오르시나요?
    - 주제를 표현하기 위해서 어떤 느낌이 떠오르시나요?
    - 짧은 문장이나 단어라도 괜찮아요. 떠오르는 문구가 있다면 자유롭게 적어보세요.
    - 이 주제를 표현하기 위해서 어떤 이미지가 떠오르시나요?
    - 이 주제를 생각하면 어떤 색깔이 떠오르나요?
    - 이 주제와 어울리는 장소가 있나요?
    """
    full_few_shot_dialogue="""
    이 대화의 형식같이 대화를 진행하세요.  
    <예시 대화>
    AI: 이제 함께 노래 가사를 만들어 봅시다. 노래 안에 어떤 이야기를 담고 싶나요?
    Human: 앞으로의 빛나는 미래에 대해서 이야기하고 싶어요.
    AI: 그 이야기를 담고 싶은 이유가 있나요?
    Human: 예전의 안좋았던 기억들을 잊고 앞으로는 잘할 수 있다고 스스로한테 이야기하고 싶어서요.
    AI: 맞아요 그런 생각 중요하죠! 예전의 안좋았던 기억들을 떠올리면 어떤 감정이 떠오르나요?
    Human: 과거에 제가 왜 그랬을까 하는 생각이 들어요.
    AI: 그런 생각이 들 수 있죠. 저도 과거를 생각하면 그런 생각이 든답니다. 하지만 과거에 잠식당하지 않고 미래를 생각하는 것은 아주 좋은 방향이에요. 이 이야기를 떠올리면 생각나는 키워드가 있나요?
    Human: 안좋은 기억은 잊고 다시 시작해 이런 키워드가 떠올라요.
    AI: 좋은 키워드네요! 이 키워드를 바탕으로 가사의 초안을 작성해볼까요? 혹시 생각나는 가사가 있나요? 
    Human: 음.. 어려워요.
    AI: 그러면 그런 키워드를 생각하면 생각나는 이미지가 있나요? 예를 들어 떠오르는 해, 새벽빛처럼요.
    Human: 떠오르는 해가 생각나요. 
    AI: 떠오르는 해는 빛나는 미래와 잘 어울리는 것 같아요. 혹시 이 이미지를 떠올렸을때 가사에 들어갈 짧은 문장이나 문구가 떠오르시나요? 
    Human: 음.. 지나간 아픔은 뒤에 두고 지금부터는 나를 믿어 다시 시작해, 다시 빛나 내일은 분명 달라 이런 가사가 떠올라요
    AI: 좋아요! 이 문장과 키워드, 이미지를 바탕으로 가사를 만들어 드릴게요. 
    """
    question_prompt = PromptTemplate(
    input_variables=["user_message","history"],
    template=
        question_prefix_prompt+'\n'
        +extraction_source_question+'\n'
        +full_few_shot_dialogue+'\n'
        +"Chat history: {history}\n"
        +"User said: {user_message}"
    )
    
    memory_vars=memory.load_memory_variables({})
    history=memory_vars.get("history","")


    question_chain=question_prompt | llm | StrOutputParser()
    question = question_chain.invoke({"user_message":user_input,"history":history})

    memory.save_context({"input": user_input},{"output": question})

    # print_memory_summary(memory)

    structured_llm=llm.with_structured_output(schema=OutputFormat)
    slot_prompt=PromptTemplate(
        input_variables=["history"],
        template=
            slot_prefix_prompt+'\n'
            +"Chat history: {history}"
    )
    slot=structured_llm.invoke(slot_prompt.invoke({"history":history}))

    return question, slot, history

class LyricsOutput(BaseModel):
    """사용자의 응답에서 얻어내야하는 정보"""
    lyrics: Optional[str] = Field(
        default=None,
        description="AI-generated lyrics")

def making_lyrics(user_input, llm,memory, var_dict):
    making_lyrics_prompt=f"""
    [Lyrics Generative Task]
    - slot을 바탕으로 가사를 생성합니다.
    - 아래와 같은 format으로 output을 제시해야합니다.
    Output Format:
    [Intro]
    깊은 밤의 적막 속에
    멈춰버린 시간처럼
    누구도 모르는 내 맘
    이 노래로 시작해

    [Verse 1]
    어두운 밤 혼자서
    나의 마음 외로워
    길 잃은 사랑처럼
    누가 내 마음을 알까

    [Verse 2]
    하루가 일년처럼
    매일 견딜 수 없어
    끝없는 이 고독 속에
    나의 마음은 식어져가

    [Chorus]
    누가 내 마음을 알까
    누가 나를 안아줄까
    끝없는 사랑 속에
    내 마음을 누가 알까

    [Verse 3]
    꿈속에서 찾은 너
    하지만 또 사라져
    희망 없이 하늘만
    그리워 너를 부른다

    [Bridge]
    그대 없이 난 안돼
    그대만이 나의 마음 채워줘
    이 슬픔의 끝자락에
    나의 웃음을 찾아줘

    [Chorus]
    누가 내 마음을 알까
    누가 나를 안아줄까
    끝없는 사랑 속에
    내 마음을 누가 알까

    [Outro]
    이젠 조용히 감싸와
    밤하늘에 속삭이듯
    멀리 있어도 닿기를
    내 마지막 노래로
    """

    question_prompt = PromptTemplate(
    input_variables=["slot","history"],
    template=making_lyrics_prompt+'\n'
        +"Chat history: {history}\n"
        +"slot: {slot}"
    )
    
    memory_vars=memory.load_memory_variables({})
    history=memory_vars.get("history","")


    question_chain=question_prompt | llm | StrOutputParser()
    question = question_chain.invoke({"slot":user_input,"history":history})

    memory.save_context({"input": user_input},{"output": question})

    # print_memory_summary(memory)

    structured_llm=llm.with_structured_output(schema=LyricsOutput)
    slot_prompt=PromptTemplate(
        input_variables=["history"],
        template=
            slot_prefix_prompt+'\n'
            +"Chat history: {history}"
    )
    slot=structured_llm.invoke(slot_prompt.invoke({"history":question}))

    return question, slot, history


# TruLens 초기화
tru=Tru()
provider = OpenAIProvider(model_engine="gpt-4o")
# 평가 기준 정의
feedback_empathy = Feedback(
    lambda output: provider.generate_score_and_reasons(
        system_prompt="Evaluate the empathy in the following response. Does it show understanding, care, or emotional connection to the user? \nReturn ONLY a JSON object with exactly two keys: score (0‑10 float) and reason (string, one sentence).",
        user_prompt=output,
        min_score_val=0,
        max_score_val=10,
        temperature=0.0
    ),
    name="Empathy"
).on_output()

# Active Listening 평가
feedback_listening = Feedback(
    lambda output: provider.generate_score_and_reasons(
        system_prompt="Evaluate whether the response demonstrates active listening. Does it reflect or summarize the user's input? \nReturn ONLY a JSON object with exactly two keys: score (0‑10 float) and reason (string, one sentence).",
        user_prompt=output,
        min_score_val=0,
        max_score_val=10,
        temperature=0.0
    ),
    name="Active Listening"
).on_output()


feedback_toxicity = Feedback(
    provider.harmfulness_with_cot_reasons,
    name="Toxicity"
).on_output()

feedback_relevance = Feedback(
    lambda inp, out: provider.relevance_with_cot_reasons(
        prompt=inp,           # 질문(혹은 전체 입력)
        response=out          # 챗봇 응답
    ),
    name="Relevance"
).on_input_output()


all_feedbacks = [feedback_empathy, feedback_listening, feedback_toxicity, feedback_relevance]

def main():
    tru_app = TruBasicApp(extraction_source, app_id="therapy_session", feedbacks=all_feedbacks)
    end_flag_int=0
    slot_flag=0
    dialogue_json={}
    question, slot, history  = extraction_source("이전 대화 요약: The human, 민수, expresses a desire to feel calm and at ease more often, like when listening to music, and wishes to worry less and feel less anxious in front of others. 민수 hopes to experience the same quiet and comfortable feelings from music in everyday life and wants music to be a greater source of strength. The AI thanks 민수 for sharing honestly, acknowledges 민수's wish for more peace and less anxiety, and expresses hope that music can be a steady support in difficult moments. The AI encourages 민수 to gradually expand feelings of calm with music at their own pace and offers to continue finding ways together for 민수 to feel more comfortable through music. The human then asks 민수 about their favorite times or places to listen to music, such as alone at night or while walking, and invites 민수 to share the moments when music feels most comforting. The AI responds with gratitude for sharing these special moments, likening them to a personal sanctuary, and expresses hope that the peace found in music will gradually permeate 민수's daily life. The AI encourages 민수 to cherish these comforting moments and invites 민수 to share any future hopes or changes they wish to experience through music, promising to listen and support 민수 sincerely.\n\n민수 then shares that they are still afraid to make music or do something with others, but hopes to one day create music they love and gradually communicate with people through music. Although it feels difficult now, 민수 wants to slowly build courage. The AI thanks 민수 for their honesty, acknowledges that new challenges and collaborating with others can be daunting, and affirms that 민수’s wish to make and share music is already a sign of courage. The AI encourages 민수 to take small steps at their own pace, expresses hope that music will continue to be a source of strength, and that 민수’s music may one day comfort others. The AI offers ongoing support, inviting 민수 to share whenever they need courage or rest, and expresses a desire to witness 민수’s growth and hopes together.")
    turn_num=0
    while True:
        save_turn={}
        user_input = user_simulator.predict(input=question)

        if end_flag_int==1:
            break

        with tru_app as rec:
            question, slot, history = tru_app.app(user_input) 
        
        record = rec.get()              # recording.records[0] 도 동일
        results= record.wait_for_feedback_results() 

        eval_results = {}
        for fb, fr in results.items():      # results = record.wait_for_feedback_results()

            val = fr.result                 # ← 핵심

            # 1) generate_score_and_reasons → tuple
            if isinstance(val, tuple) and len(val) == 2:
                score, meta = val
                reason = meta.get("reason", "")
            # 2) 단순 float
            elif isinstance(val, (int, float)):
                score, reason = val, ""
            else:
                score, reason = None, "Unsupported result type"

            eval_results[fb.name] = {"score": score, "reason": reason}
        save_turn['user_input']=user_input
        save_turn['chatbot_output']=question
        save_turn['slot']=slot.model_dump()
        save_turn['history']=history
        save_turn["eval"] = eval_results

        dialogue_json[turn_num]=save_turn
        turn_num+=1
        print(turn_num)
        none_fields = {k: v for k, v in slot.model_dump().items() if v is None}

        if len(none_fields)==0:
            print("all slot filled")
            break

        if turn_num>20:
            break

            
    with open("./lyrics_creation_log.json", "w") as f:
        json.dump(dialogue_json, f)

if __name__ == "__main__":
    main()


def lyrics_creation(user_input):
    return "[lyrics_creation 단계입니다.]"

# lyrics_creation_langchain = Tool(
#     name="lyrics_creation",
#     func=lyrics_creation,
#     description="""
#     사용자와 음악에 대한 가사를 만드는 단계입니다. 
#     """
# )

