import streamlit as st
from dotenv import load_dotenv

load_dotenv() ##load all the environment variables
import os
import sys
import time
import requests
import tempfile
from pydub import AudioSegment
from io import BytesIO
import google.generativeai as genai
from pytube import YouTube
from youtube_transcript_api import YouTubeTranscriptApi

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
api__key = os.getenv("api_key")


prompt="You are Youtube Video Summarizer.You will be taking the transcript text summarizing the entire video and providing the important summary"
promptLocal="Summarize the entire content provide the important summary"

##getting the transcript from yt vedios
def extract_transcript_details(youtube_video_url):
    try:
        video_id=youtube_video_url.split("=")[1]
        print(video_id)
        transcript_text=YouTubeTranscriptApi.get_transcript(video_id)
    
        transcript=""
        for i in transcript_text:
            transcript+= " " + i["text"]

        return transcript
    
    except Exception as e:
        raise e


##getting the summary based on prompt from google Gemini Pro
def generate_gemini_content(transcript_text,prompt):

    model=genai.GenerativeModel("gemini-pro")
    response=model.generate_content(prompt+transcript_text)
    return response.text


st.title("Video Digest")
youtube_link=st.text_input("Enter Youtube Vedio Link : ")


## Function to extract audio from video file
def extract_audio(video_file):
    # Save the uploaded video to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video_file:
        temp_video_file.write(video_file.read())
        temp_video_path = temp_video_file.name

    # Load video file
    audio = AudioSegment.from_file(temp_video_path)
    return audio
    
# File uploader for video
video_file = st.file_uploader("Upload a video file", type=["mp4", "mov", "avi", "mkv"])

#Speech to Text Setup and Get the Summary for local file
def transcribe_audio(filename):
    bar=st.progress(0)
    def read_file(filename,chunk_size=5242880):
        with open(filename,'rb') as _file:
            while True:
                data = _file.read(chunk_size)
                if not data:
                    break
                yield data
    headers = {'authorization': api__key}
    response = requests.post('https://api.assemblyai.com/v2/upload',
                             headers=headers,
                             data=read_file(filename))
    audio_url=response.json()['upload_url']
    bar.progress(20)
     #st.info(audio file has been uploaded to AssemblyAI')

    #4.Transcribe uploaded audio file
    endpoint = "https://api.assemblyai.com/v2/transcript"
    json={
        "audio_url":audio_url
    }
    headers ={
        "authorization":api__key,
        "content-type": "application/json"
    }
    transcript_input_response=requests.post(endpoint,json=json,headers=headers)
    bar.progress(40)
    #st.info('4. Transcribing uploaded file')

    # 5.Extract Transcript ID
    transcript_id=transcript_input_response.json()["id"]
    bar.progress(60)
    #st.info('5. Extract transcript ID')


    # 6. Retrieve transcription results
    endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    headers = {
        "authorization": api__key,
    }
    transcript_output_response = requests.get(endpoint, headers=headers)
    bar.progress(80)
    #st.info('6. Retrieve transcription results')

    # Check if transcription is complete
    from time import sleep

    while transcript_output_response.json()['status'] != 'completed':
        sleep(5)
        #st.warning('Transcription is processing ...')
        transcript_output_response = requests.get(endpoint, headers=headers)

    # 7. Get Summary
    st.header('Summary')
    bar.progress(90)
    text=transcript_output_response.json()["text"]
    summary=generate_gemini_content(text,promptLocal)
    st.write(summary)
    bar.progress(100)

#Get the Summary for local video
if video_file:
    st.video(video_file)
    if st.button("Get Summary"):
        #st.write("Extracting audio...")
        audio = extract_audio(video_file)
        if audio:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio_file:
                audio.export(temp_audio_file.name, format="mp3")
                temp_audio_path = temp_audio_file.name
            #st.write("Transcribing audio...")
            transcript_text = transcribe_audio(temp_audio_path)
            if transcript_text:
                st.header('Transcription Output')

#Streamlit UI for Youtube link
if youtube_link:
    video_id=youtube_link.split("=")[1]
    print(video_id)
    st.image(f"http://img.youtube.com/vi/{video_id}/0.jpg",use_column_width=True)

    if st.button("Get Summary"):
        transcript_text=extract_transcript_details(youtube_link)

        if transcript_text:
            summary=generate_gemini_content(transcript_text,prompt)
            st.markdown("Summary : ")
            st.write(summary)
