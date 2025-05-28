from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from state.therapeutic_connection import therapeutic_connection
from state.lyrics_creation import extraction_source, making_lyrics
from state.music_creation import music_making
from state.music_discussion import music_discussion
from langchain.memory import ConversationSummaryMemory


#시뮬레이션
from state.simulation import user_simulator

#저장위함
import json
from datetime import datetime

load_dotenv()



llm = ChatOpenAI(model="gpt-4.1", temperature=0)
memory = ConversationSummaryMemory(llm=llm, memory_key="history")

def execute_state(func,turn_num, dialogue_json,var_dict):
    save_turn={}
    bot_question=[]
    if turn_num!=0:
        var_dict.update(dialogue_json[turn_num-1]["slot"])
        print(var_dict)
        question, slot, history  = func(json.dumps(var_dict), llm,memory, var_dict, bot_question)
        print(question)
        bot_question.append(question)
        start=turn_num
    else:
        question, slot, history  = func("안녕", llm, memory, var_dict, bot_question)
        start=0
        # print(question, slot, history)
        print(question)
        bot_question.append(question)


    save_turn['state_name']=func.__name__
    save_turn['user_input']="new state start"
    save_turn['chatbot_output']=question
    save_turn['slot']=slot.model_dump()
    save_turn['history']=history
    dialogue_json[turn_num]=save_turn

    while True:
        save_turn={}

        # user_input = user_simulator.predict(input=question)
        user_input=input("user: ")
        
        question, slot, history  = func(user_input, llm,memory, var_dict, bot_question)
        print(question)
        bot_question.append(question)

        save_turn['state_name']=func.__name__
        save_turn['user_input']=user_input
        save_turn['chatbot_output']=question
        save_turn['slot']=slot.model_dump()
        save_turn['history']=history
        dialogue_json[turn_num]=save_turn
        turn_num+=1
        # print(turn_num)
        none_fields = {k: v for k, v in slot.model_dump().items() if v is None}

        if len(none_fields)==0:
            print("all slot filled")

            if (user_input=="next"):
                print("next")
                return turn_num, dialogue_json, var_dict
            
        if func.__name__ =="making_lyrics":
            return turn_num, dialogue_json, var_dict
        
        if (turn_num-start)>20:
            print("over the 20 turn")
            return turn_num, dialogue_json, var_dict
        
def main():
    dialogue_json={}
    var_dict={}

    turn, dialogue_json,var_dict=execute_state(therapeutic_connection, 0, dialogue_json,var_dict)
    memory.clear()
    
    turn, dialogue_json,var_dict=execute_state(extraction_source, turn, dialogue_json,var_dict)
    turn, dialogue_json,var_dict=execute_state(making_lyrics, turn, dialogue_json,var_dict)
    memory.clear()

    turn, dialogue_json,var_dict=execute_state(music_making, turn, dialogue_json,var_dict)
    memory.clear()

    turn, dialogue_json,var_dict=execute_state(music_discussion, turn, dialogue_json,var_dict)
    
    now = datetime.now()
    timestamp = now.strftime("%Y%m%d_%H%M%S")
    filename = f"./log/output_{timestamp}.json"
    with open(filename, "w") as f:
        json.dump(dialogue_json, f)


if __name__ == "__main__":
    main()