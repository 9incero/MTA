import dotenv

from flask import Flask, request, jsonify

from analyzer.music import MusicAnalyzer

app = Flask(__name__)


@app.route('/analysis', methods=['Post'])
def analyze_music():
    try:
        post_data = request.json
        music_path = post_data['url']
        lyrics = post_data['lyrics']

        la = MusicAnalyzer(music_path, lyrics)
        la.analyze()
        result = la.get_final_format()

        # response result to client
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    dotenv.load_dotenv()
    app.run(debug=True)
