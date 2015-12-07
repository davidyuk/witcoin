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
        'users_top': sorted(UserProfile.objects.all(), key=lambda a: a.balance(), reverse=True)[:5],
        'users_last': sorted(UserProfile.objects.all(), key=lambda a: a.user.date_joined, reverse=True)[:5],
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
    _user = get_object_or_404(User, username=username)
    return render(request, 'main/userpage.html', {
        'profile': _user.userprofile,
        'transactions': getpager(
            Transaction.objects.filter(Q(user_to=_user.id) | Q(user_from=_user.id)).order_by('-timestamp_create'),
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


def transaction(request, pk):
    trans = get_object_or_404(Transaction, pk=pk)
    status_editable = request.user.userprofile in [trans.user_to, trans.user_from] and trans.status is None
    if request.method == "POST":
        if status_editable:
            if request.user.userprofile == trans.user_from:
                if request.POST['status'] != 'ok' or request.user.userprofile.balance() >= trans.amount:
                    trans.status = request.POST['status'] == 'ok'
                    trans.timestamp_confirm = timezone.now()
                    trans.save()
                return HttpResponseRedirect(reverse('transaction', args=[trans.pk]))
            if request.user.userprofile == trans.user_to:
                trans.delete()
                return HttpResponseRedirect(reverse('home'))

    return render(request, 'main/transaction.html', {
        'transaction': trans,
        'status_editable': status_editable
    })


def transaction_all(request):
    return render(request, 'main/transaction_all.html', {
        'transactions': getpager(
            Transaction.objects.order_by('-timestamp_create'),
            request.GET.get('page')
        )
    })