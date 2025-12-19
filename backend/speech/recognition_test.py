from helpers import convert_audio_to_text, SpeechRecognizer

if __name__ == "__main__":
    audio_file = "speech_records/test/test.wav"
    # text = convert_audio_to_text(audio_file)
    recognizer = SpeechRecognizer(audio_file, language='de-DE')
    transcribed_text = recognizer.transcribe()
    print(f"Transcribed text: {transcribed_text}")
    print(f"Transcribed segments: {recognizer.transcribed_text}")
