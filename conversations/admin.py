from django.contrib import admin
from .models import Theme, Scenario

# Register your models here.
@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    pass
@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    pass