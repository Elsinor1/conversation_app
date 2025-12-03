from rest_framework import serializers

class SpeechToTextSerializer(serializers.Serializer):
    audio = serializers.FileField()
    language = serializers.CharField(max_length=100, required=False)

    def validate_audio(self, value):
        if not value.name.endswith('.wav'):
            raise serializers.ValidationError("File must be a WAV file")
        return value
    
    def validate_language(self, value):
        if value not in ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'zh-CN', 'zh-TW', 'cs-CZ']:
            raise serializers.ValidationError("Invalid language")
        return value