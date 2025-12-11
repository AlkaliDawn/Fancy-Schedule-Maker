#!/home/3velynnn/.virtualenvs/my-virtualenv/bin/python

import io
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from render_script import process_lectures, get_pdf_bytes
from render_script import Lecture

app = Flask(__name__)
CORS(app)  # Allow requests from React

def map_lecture_data(raw_lecture_data):

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

    return mapped_lecture_data

@app.route('/api/generate-schedule', methods=['POST'])
def generate_schedule():
    raw_lecture_data = request.json

    mapped_lecture_data = map_lecture_data(raw_lecture_data)

    result = process_lectures(mapped_lecture_data)

    return jsonify(result)

@app.route('/api/retrieve_pdf', methods=['POST'])
def get_pdf():
    raw_lecture_data = request.json
    mapped_lecture_data = map_lecture_data(raw_lecture_data)

    pdf_bytes = get_pdf_bytes(mapped_lecture_data)

    buffer = io.BytesIO(pdf_bytes)
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="schedule.pdf"
    )

if __name__ == '__main__':
    app.run(port=5000, debug=True)