from flask import Flask, request, jsonify
from flask_cors import CORS
from render_script import process_lectures
from render_script import Lecture

app = Flask(__name__)
CORS(app)  # Allow requests from React

@app.route('/api/generate-schedule', methods=['POST'])
def generate_schedule():
    raw_lecture_data = request.json

    mapped_lecture_data = []

    raw_lecture: dict
    for raw_lecture in raw_lecture_data:
        mapped_lecture_data.append(Lecture(
            raw_lecture.get('start'),
            raw_lecture.get('duration'),
            raw_lecture.get('class_name'),
            raw_lecture.get('class_location'),
            raw_lecture.get('days'),
            raw_lecture.get('color'),
            raw_lecture.get('isLab'),
        ))

    # Your existing Python logic here
    result = process_lectures(mapped_lecture_data)

    # with open('test.html', "w") as f:
    #     f.write(result)

    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)