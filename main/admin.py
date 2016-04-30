from django.contrib import admin

from .models import *

admin.site.register(UserProfile)
admin.site.register(Group)
admin.site.register(Transaction)

admin.site.register(Task)
admin.site.register(Service)
