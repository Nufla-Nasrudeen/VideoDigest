import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai 
import requests
from pydub import AudioSegment
import tempfile
from time import sleep
from flask_cors import CORS

# Set the ffmpeg path for pydub
#AudioSegment.converter = os.path.join(os.getcwd(), "venv", "ffmpeg", "ffmpeg.exe")
AudioSegment.converter = "/opt/homebrew/bin/ffmpeg"


load_dotenv()

app = Flask(__name__)
#CORS(app)  # Enable CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:8081"}})  # Enable CORS for localhost:8081


genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
api__key = os.getenv("API_KEY")

prompt = "You are Youtube Video Summarizer. You will be taking the transcript text summarizing the entire video and providing the important summary"
promptLocal = "Summarize the entire content provide the important summary"

def extract_transcript_details(youtube_video_url):
    try:
        video_id = youtube_video_url.split("=")[1]
        transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = ""
        for i in transcript_text:
            transcript += " " + i["text"]
        return transcript
    except Exception as e:
        raise e

def generate_gemini_content(transcript_text, prompt):
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt + transcript_text)
    return response.text

@app.route('/summarize_youtube', methods=['POST'])
def summarize_youtube():
    data = request.get_json()
    youtube_link = data.get('url')
    transcript_text = extract_transcript_details(youtube_link)
    summary = generate_gemini_content(transcript_text, prompt)
    return jsonify({'summary': summary})

@app.route('/summarize_local', methods=['POST'])
def summarize_local():
    file = request.files['file']
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video_file:
        temp_video_file.write(file.read())
        temp_video_path = temp_video_file.name

    audio = AudioSegment.from_file(temp_video_path)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio_file:
        audio.export(temp_audio_file.name, format="mp3")
        temp_audio_path = temp_audio_file.name

    def read_file(filename, chunk_size=5242880):
        with open(filename, 'rb') as _file:
            while True:
                data = _file.read(chunk_size)
                if not data:
                    break
                yield data

    headers = {'authorization': api__key}
    response = requests.post('https://api.assemblyai.com/v2/upload', headers=headers, data=read_file(temp_audio_path))
    audio_url = response.json()['upload_url']

    endpoint = "https://api.assemblyai.com/v2/transcript"
    json = {
        "audio_url": audio_url
    }
    headers = {
        "authorization": api__key,
        "content-type": "application/json"
    }
    transcript_input_response = requests.post(endpoint, json=json, headers=headers)
    transcript_id = transcript_input_response.json()["id"]

    endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    headers = {
        "authorization": api__key,
    }
    transcript_output_response = requests.get(endpoint, headers=headers)

    while transcript_output_response.json()['status'] != 'completed':
        sleep(5)
        transcript_output_response = requests.get(endpoint, headers=headers)

    text = transcript_output_response.json()["text"]
    summary = generate_gemini_content(text, promptLocal)
    return jsonify({'summary': summary})

if __name__ == '__main__':
    app.run(debug=True)
