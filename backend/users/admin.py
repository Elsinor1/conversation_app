from django.contrib import admin
from .models import Language, LanguageLevel, Level, InvitationCode


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    pass

@admin.register(LanguageLevel)
class LanguageLevelAdmin(admin.ModelAdmin):
    pass

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    pass

@admin.register(InvitationCode)
class InvitationCodeAdmin(admin.ModelAdmin):
    pass