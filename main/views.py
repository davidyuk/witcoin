from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from .models import *
from django.db.models import Avg, Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from .forms import *
from django.contrib.auth import authenticate, login


def index(request):
    return render(request, 'main/index.html', {
        'users_top': sorted(UserProfile.objects.all(), key=lambda a: a.balance())[:5],
        'users_last': sorted(UserProfile.objects.all(), key=lambda a: a.user.date_joined)[:5],
        'users_count': UserProfile.objects.count(),
        'money_all': 10000,
        'money_avg': Transaction.objects.aggregate(Avg('amount'))['amount__avg'],
    })


def register(request):
    if request.method == "POST":
        user_form = UserCreationForm(data=request.POST)
        profile_form = UserProfileCreationForm(data=request.POST)
        if user_form.is_valid() and profile_form.is_valid():
            new_user = user_form.save()
            profile_form = profile_form.save(commit=False)
            profile_form.user = new_user
            profile_form.save()
            new_user = authenticate(username=request.POST['username'], password=request.POST['password1'])
            login(request, new_user)
            return HttpResponseRedirect(reverse('home'))
    else:
        user_form = UserCreationForm()
        profile_form = UserProfileCreationForm()
    return render(request, 'registration/register.html', {
        'userForm': user_form, 'userProfileForm': profile_form
    })


@login_required
def settings(request):
    if request.method == "POST":
        user_form = UserEditingForm(data=request.POST, instance=request.user)
        profile_form = UserProfileEditingForm(data=request.POST, instance=request.user.userprofile)
        if user_form.is_valid() and profile_form.is_valid():
            curr_user = user_form.save()
            profile_form.save()
            return HttpResponseRedirect(reverse('home'))
    else:
        user_form = UserEditingForm(instance=request.user)
        profile_form = UserProfileEditingForm(instance=request.user.userprofile)
    return render(request, 'main/settings.html', {
        'userForm': user_form, 'userProfileForm': profile_form
    })


def getpager(objects, page=1, objects_per_page=25):
    paginator = Paginator(objects, objects_per_page)
    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)


def user(request, username):
    user = get_object_or_404(User, username=username)
    return render(request, 'main/userpage.html', {
        'profile': get_object_or_404(UserProfile, pk=user.id),
        'contacts': Contact.objects.filter(user=user.id),
        'transactions': getpager(
            Transaction.objects.filter(Q(user_to=user.id) | Q(user_from=user.id)),
            request.GET.get('page')
        )
    })


@login_required
def home(request):
    return HttpResponseRedirect(reverse('user', args=[request.user.username]))


@login_required
def transaction_create(request):
    if request.method == "POST":
        form = TransactionCreationForm(request.POST, user=request.user.userprofile)
        if form.is_valid():
            form.save()
            if 'from' in request.GET:
                return HttpResponseRedirect(request.GET['from'])
            else:
                return HttpResponseRedirect(reverse('home'))
    else:
        form = TransactionCreationForm(user=request.user.userprofile)
    return render(request, 'main/transaction_create.html', {'form': form})
def transaction_all(request):
    return render(request, 'main/transaction_all.html', {
        'transactions': getpager(
            Transaction.objects.all(),
            request.GET.get('page')
        )
    })