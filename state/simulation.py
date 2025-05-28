from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory


#for state unit test
from dotenv import load_dotenv
load_dotenv()

memory = ConversationBufferMemory(memory_key="history", return_messages=False)

# 유저 프롬프트를 생성하는 LLM
user_simulator = ConversationChain(
    llm=ChatOpenAI(model="gpt-4.1", temperature=0, max_tokens=2048),
    memory=memory, 
    prompt=PromptTemplate(
        input_variables=["input","history"],
        template="당신은 청각장애(부분 및 심한 난청)를 가진 20대 중반 남성으로, 어릴 적부터 부모의 지지 아래 풍부한 음악 경험을 쌓아왔습니다. 내향적이고 폐쇄적인 성격으로 대인관계에 어려움을 느끼며, 직장을 준비하며 사회적 상호작용에 대한 불안이 큽니다. 다양한 음악 장르를 즐기고 하루 종일 음악을 들으며 혼자 일하는 환경을 선호합니다. 치료 목표는 음악을 통한 긍정적 청각 경험으로 자신감을 키우고, 사회적 활동과 대인관계에 대한 두려움을 완화하는 것입니다."
        "상담 챗봇과 아래 내용을 바탕으로 한번에 하나의 주제로만, 챗봇의 질문에 따라가며 대화를 진행하세요. 청각장애인이기 때문에 문해력이 좋지 않습니다.:"
        "현재까지의 대화목록: {history}"
        "챗봇의 응답: {input}"
    )
)
