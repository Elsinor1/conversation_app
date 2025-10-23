from django.contrib import admin
from .models import VocabularyWord, VocabularyList, VocabularyPractice, UserVocabularyWord

@admin.register(VocabularyWord)
class VocabularyWordAdmin(admin.ModelAdmin):
    list_display = ['word', 'german_translation', 'czech_translation', 'level']
    list_filter = ['level']
    search_fields = ['word', 'german_translation', 'czech_translation']

@admin.register(VocabularyList)
class VocabularyListAdmin(admin.ModelAdmin):
    list_display = ['name', 'language', 'user']
    list_filter = ['language', 'user']
    search_fields = ['name']

@admin.register(VocabularyPractice)
class VocabularyPracticeAdmin(admin.ModelAdmin):
    list_display = ['id', 'words_count', 'users_count']
    
    def words_count(self, obj):
        return obj.words.count()
    words_count.short_description = 'Words Count'
    
    def users_count(self, obj):
        return obj.user.count()
    users_count.short_description = 'Users Count'

@admin.register(UserVocabularyWord)
class UserVocabularyWordAdmin(admin.ModelAdmin):
    list_display = ['user', 'vocabulary_word', 'learning_status', 'created', 'modified']
    list_filter = ['learning_status', 'user', 'vocabulary_word__level']
    search_fields = ['user__username', 'vocabulary_word__word']
    readonly_fields = ['created', 'modified']
