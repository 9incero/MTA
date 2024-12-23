import dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import traceback
from analyzer.music import MusicAnalyzer
from chatbot.chat import submit_message, wait_on_run, get_response
app = Flask(__name__)
CORS(app)


# @app.route('/analysis', methods=['POST'])
# def analyze_music():
#     try:
#         post_data = request.json
#         music_path = post_data['url']
#         lyrics = post_data.get('lyrics', '""')
#         print(music_path, lyrics)
#         la = MusicAnalyzer(music_path, lyrics)
#         la.analyze()
#         result = la.get_final_format()

#         # response result to client
#         return jsonify(result), 200
#     except Exception as e:
#         error_message = {
#             'error': str(e),
#             'traceback': traceback.format_exc()
#         }
#         # 로그에 상세 오류 정보 출력
#         print(json.dumps(error_message, indent=4))
#         return jsonify(error_message), 400


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
        
        la = MusicAnalyzer(music_path, lyrics)
        la.analyze()
        result = la.get_final_format()

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

@app.route('/chatting', methods=['POST'])
def music_discussion():
    data = request.get_json()
    user_message = data.get('userMessage')

    # 메시지를 제출하고 assistant 실행
    run = submit_message(user_message['content'])
    run = wait_on_run(run)
    try:
        # 응답 확인 및 상태 전환 처리
        messages = get_response()
        print(messages)
        messages_json = [{'role': msg.role, 'content': msg.content[0].text.value} for msg in messages]
        return jsonify(messages_json)
    
    except Exception as e:
        # 에러를 콘솔에 출력하고 클라이언트에 반환
        print("Error:", e)
        return jsonify({'error': str(e)}), 500

        
if __name__ == '__main__':
    dotenv.load_dotenv()
    app.run(host="0.0.0.0",port=10000)
