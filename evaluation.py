# evaluation_tool.py
import os, numpy as np, openai
from dotenv import load_dotenv


load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
EMBED_MODEL = "text-embedding-3-small"

def get_embedding(text: str) -> np.ndarray:
    """단일 문자열을 임베딩 벡터(np.array)로 변환"""
    resp = openai.embeddings.create(model=EMBED_MODEL, input=text)
    return np.array(resp.data[0].embedding, dtype=np.float32)

def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))

def update_chat_history(history: list[dict], role: str, content: str):
    """history = [{'role':'user'|'assistant', 'content':..., 'vec':np.array}, ...]"""
    history.append({"role": role,
                    "content": content,
                    "vec": get_embedding(content)})

def is_redundant(new_vec: np.ndarray, history: list[dict],
                 similarity_threshold: float = 0.9) -> bool:
    """이전 assistant 답변과의 최대 유사도가 임계값 이상이면 True"""
    sims = [cosine(new_vec, h["vec"])
            for h in history if h["role"] == "assistant"]
    return sims and max(sims) <= similarity_threshold

def is_on_context(new_vec: np.ndarray, history: list[dict],
                  context_window: int = 3,
                  context_threshold: float = 0.3) -> bool:
    """최근 user 메시지 k개와 새 응답 사이 평균 유사도가 임계값 이상이면 True"""
    recent_users = [h for h in history if h["role"] == "user"][-context_window:]
    if not recent_users:                       # 사용자 메시지가 없으면 True로 통과
        return True
    ctx_vec = np.mean([u["vec"] for u in recent_users], axis=0)
    score = cosine(new_vec, ctx_vec)
    return score >= context_threshold

def evaluate_response(history: list[dict], new_response: str,
                      redun_th: float = 0.9, ctx_th: float = 0.3) -> dict:
    """
    결과 예:
    {
      "redundant": False,
      "on_context": True,
      "redundancy_score": 0.55,
      "context_score": 0.42
    }
    """
    new_vec = get_embedding(new_response)
    redundancy_score = max([cosine(new_vec, h["vec"])
                            for h in history if h["role"] == "assistant"] or [0])
    context_score = cosine(new_vec,
                           np.mean([h["vec"] for h in history if h["role"] == "user"][-3:], axis=0)
                           ) if any(h["role"] == "user" for h in history) else 1.0
    return {"redundant": redundancy_score >= redun_th,
            "on_context": context_score >= ctx_th,
            "redundancy_score": redundancy_score,
            "context_score": context_score}

# ----- 사용 예시 -----
if __name__ == "__main__":
    chat_history = []
    update_chat_history(chat_history, "assistant", "민수님, 이렇게 솔직하게 말씀해주셔서 정말 고마워요.   처음엔 어색할 수 있지만, 짧은 한두 마디라도 충분히 의미가 있어요.   음악을 들으면서 마음이 편해진다면, 그 느낌을 한 번씩 적어보는 것만으로도 큰 도움이 될 거예요.  혹시 음악을 들으면서 적고 싶은 감정이나 단어가 떠오르면, 어떤 것들이 있을까요?   예를 들어 “편안하다”, “그립다”, “조용하다” 같은 단어도 괜찮아요.   생각나는 게 있으면 편하게 말씀해 주세요.")
    update_chat_history(chat_history, "user", " 음… 네, 생각해보면   “편안하다” 말고도   “따뜻하다”, “조용하다”,   “외롭다”, “생각난다”   이런 단어가 떠오를 것 같아요.  가끔은 “슬프다”나   “위로된다”도 생각나요.  노래 들으면서   그때그때 떠오르는 단어를   짧게 적어볼 수 있을 것 같아요.")
    update_chat_history(chat_history, "assistant", "민수님, 이렇게 솔직하게 단어를 나눠주셔서 정말 고마워요.   “따뜻하다”, “조용하다”, “외롭다”, “생각난다”, “슬프다”, “위로된다” 같은 단어들이 민수님의 마음을 잘 보여주는 것 같아요.   음악을 들으면서 떠오르는 감정을 짧게 적어보는 연습, 정말 좋은 시작이에요.  혹시 이런 단어들을 적을 때,   어떤 상황이나 기억이 함께 떠오르는 경우가 있나요?   예를 들어, “따뜻하다”는 가족과의 추억, “외롭다”는 혼자 있는 시간 등   특별히 생각나는 순간이 있다면 알려주셔도 좋아요.   편하게 말씀해 주세요.")
    update_chat_history(chat_history, "user", "음… 네, 그런 게 있어요.  “따뜻하다”는   가족이랑 같이 집에서   노래 들었던 기억이 떠올라요.   엄마가 밥 해주고,   아빠랑 TV 보면서   같이 음악 듣던 때요.  “외롭다”는   혼자 방에 있을 때   밖에서 사람들 소리 들리는데   저는 못 알아들을 때   그럴 때 외로워요.  “생각난다”는   옛날 학교에서   친구들이랑 피아노 쳤던 거   그런 기억이 떠올라요.  “슬프다”는   힘들었던 일이나   누군가랑 멀어진 기억이   생각날 때 그런 것 같아요.  “위로된다”는   노래 가사가   제 마음이랑 비슷할 때   조금 위로받는 느낌이 들어요.  이렇게 음악 들으면   그때그때 기억이랑   감정이 같이 떠오르는 것 같아요.")

    
    candidate = "민수님, 소중한 기억과 감정을 나눠주셔서 정말 고마워요.   음악을 들을 때마다 가족과의 따뜻한 순간, 친구들과의 추억, 그리고 외로움이나 위로받는 감정이 함께 떠오른다는 말이 참 인상적이에요.   민수님이 느끼는 감정 하나하나가 모두 소중하다고 생각해요.  혹시 음악을 들으면서 떠오르는 좋은 기억이나 감정을 조금 더 자주 느끼고 싶으신가요?   아니면, 힘들거나 외로운 감정이 올라올 때는 어떻게 하면 좋을지 궁금하신 점이 있으신가요?   민수님의 생각이 궁금해요."   # 일부러 중복 답변
    result = evaluate_response(chat_history, candidate)
    print(result)



    critique = openai.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        messages=[
        {"role":"system","content":"You are a response evaluator."},
        {"role":"user","content":f"Conversation:\n{chat_history}\n\nNew response:\n{candidate}\n\nEvaluate redundancy (score 1-5) and relevance (1-5)"}
        ]
        )
    evaluation_result = critique.choices[0].message.content
    print(evaluation_result)

    new_response = openai.chat.completions.create(
    model="gpt-4o",
    temperature=0,
    messages=[
    {"role":"system","content":"You need to look at the context of the preceding and the evaluator's response to the question and generate new questions in korean only one"},
    {"role":"user","content":f"Conversation:\n{chat_history}\n\n question:\n{candidate}\n\n evlauator's response:\n{evaluation_result}\n\n"}
    ]
    )

    new_result = new_response.choices[0].message.content
    print(new_result)