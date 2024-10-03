from django.contrib import admin
from .models import Language, LanguageLevel


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    pass

@admin.register(LanguageLevel)
class LanguageLevelAdmin(admin.ModelAdmin):
    pass
