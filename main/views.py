from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.models import User
from .models import *

def index(request):
    return render(request, 'main/index.html', [])

def user(request, user_id):
    return render(request, 'main/userpage.html', {
        'profile': get_object_or_404(Profile, pk=user_id),
    })
