from django.contrib import admin

from .models import *


class FefuMailInline(admin.StackedInline):
    model = FefuMail
    readonly_fields = ['email', 'status']
    exclude = ['token']
    can_delete = False


class UserProfileAdmin(admin.ModelAdmin):
    inlines = [FefuMailInline]

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(FefuMail)

admin.site.register(Group)
admin.site.register(Transaction)

admin.site.register(Task)
admin.site.register(Service)
