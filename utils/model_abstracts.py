import uuid
from django.db import models

class Model(models.Model):
    """"Extends classic Django model with UUID"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    class Meta:
        abstract = True