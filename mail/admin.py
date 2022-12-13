from django.contrib import admin

from .models import User, Email

#admin: hab
#pas: Habtamu@123
# Register your models here.
admin.site.register(User)
admin.site.register(Email)
