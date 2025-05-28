import json

# JSON 파일 열기
with open('./log/output_20250525_195718.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# 데이터 출력
print(data)

dialog=[]

for i in data:
    dialog.append('user:'+'\t'+data[i]['user_input'].replace('\n', ' '))
    dialog.append('bot:'+'\t'+data[i]['chatbot_output'].replace('\n', ' '))

with open('clean_output_20250525_195718.txt', 'w') as file:
    for item in dialog:
        file.write(item + '\n')
