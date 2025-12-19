from helpers import convert_audio_to_text

if __name__ == "__main__":
    audio_file = "speech/speech_records/input/20251218_151212_556e4b65.wav"
    text = convert_audio_to_text(audio_file)
    print(text)
