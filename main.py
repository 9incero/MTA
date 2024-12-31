import dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import traceback
from analyzer.music import MusicAnalyzer
import os
from chatbot.chat import submit_message, wait_on_run, get_response
import requests
from io import BytesIO

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
    port = int(os.getenv("PORT", 10000))  # Render 환경 변수 PORT 사용
    app.run(host="0.0.0.0", port=port)