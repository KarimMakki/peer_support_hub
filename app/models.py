from django.db import models
from django.utils import timezone
from datetime import timedelta

# Create your models here.

class KudosLog(models.Model):
    """Log of all kudos given"""
    timestamp = models.DateTimeField(auto_now_add=True)
    from_email = models.EmailField()
    to_email = models.EmailField()
    reason = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'kudos_log'
        indexes = [
            models.Index(fields=['to_email']),
            models.Index(fields=['from_email', 'to_email', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.from_email} -> {self.to_email} at {self.timestamp}"


class KudosView(models.Model):
    """Aggregated view of kudos counts per receiver"""
    to_email = models.EmailField(unique=True)
    total_count = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'kudos_view'
        indexes = [
            models.Index(fields=['to_email']),
        ]
    
    def __str__(self):
        return f"{self.to_email}: {self.total_count} kudos"
