from django.contrib import admin
from .models import KudosLog, KudosView

# Register your models here.

@admin.register(KudosLog)
class KudosLogAdmin(admin.ModelAdmin):
    list_display = ('from_email', 'to_email', 'timestamp', 'reason')
    list_filter = ('timestamp',)
    search_fields = ('from_email', 'to_email')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)

@admin.register(KudosView)
class KudosViewAdmin(admin.ModelAdmin):
    list_display = ('to_email', 'total_count', 'last_updated')
    list_filter = ('last_updated',)
    search_fields = ('to_email',)
    readonly_fields = ('last_updated',)
    ordering = ('-total_count',)
