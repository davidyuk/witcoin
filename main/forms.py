from django import forms
from django.contrib.auth import models as auth_models
from django.contrib.auth import forms as auth_forms
from .models import UserProfile, Transaction, FefuMail
from django.utils import timezone


class UserCreationForm(auth_forms.UserCreationForm):
    def __init__(self, *args, **kwargs):
        super(UserCreationForm, self).__init__(*args, **kwargs)
        self.make_fields_required()

    def make_fields_required(self):
        self.fields['username'].widget.attrs['autofocus'] = 'autofocus'
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True
        self.fields['email'].required = True
        self.fields['first_name'].widget.is_required = True
        self.fields['last_name'].widget.is_required = True
        self.fields['email'].widget.is_required = True

    class Meta:
        model = auth_models.User
        fields = ['username', 'first_name', 'last_name', 'email']


class UserProfileCreationForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["about", "group"]
        widgets = {
            'about': forms.Textarea(attrs={'rows': 5}),
        }
        help_texts = {
            'about': 'Этот текст отобразится на вашей странице, его можно будет изменить позже.',
        }


class UserEditingForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(UserEditingForm, self).__init__(*args, **kwargs)
        self.make_fields_required()

    make_fields_required = UserCreationForm.make_fields_required
    Meta = UserCreationForm.Meta


class UserProfileEditingForm(forms.ModelForm):
    class Meta(UserProfileCreationForm.Meta):
        help_texts = {
            'about': 'Этот текст отображается на вашей странице.'
        }


class TransactionCreationForm(forms.ModelForm):
    TRANSACTION_CREATION_TYPES = (
        ('transfer', 'Перевести средства пользователю'),
        ('offer', 'Предложить пользователю перевести средства вам'),
    )

    type = forms.ChoiceField(label='Тип', choices=TRANSACTION_CREATION_TYPES, widget=forms.RadioSelect)
    user = forms.ModelChoiceField(label='Пользователь', queryset=UserProfile.objects.all())

    def __init__(self, *args, **kwargs):
        self.user_curr = kwargs.pop('user', None)
        super(TransactionCreationForm, self).__init__(*args, **kwargs)
        self.fields['user'].queryset = UserProfile.objects.exclude(pk=self.user_curr.pk)

    def clean(self):
        cleaned_data = super(TransactionCreationForm, self).clean()
        if cleaned_data.get('type', 'transfer') != 'offer' and cleaned_data.get('amount', 0) > self.user_curr.balance():
            self.add_error('amount', 'Недостаточно средств, доступно %s.' % self.user_curr.balance())

    def save(self, force_insert=False, force_update=False, commit=True):
        m = super(TransactionCreationForm, self).save(commit=False)
        m.user_from = self.user_curr
        m.user_to = self.cleaned_data['user']
        if self.cleaned_data['type'] == 'transfer':
            m.timestamp_confirm = timezone.now()
            m.status = True
        else:
            m.user_to, m.user_from = m.user_from, m.user_to
        if commit:
            m.save()
        return m

    class Meta:
        model = Transaction
        fields = ['type', 'user', 'description', 'amount']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3})
        }
        help_texts = {
            'description': 'Описание причины перевода.',
            'amount': 'Может быть не целым числом.'
        }


class FefuMailRegisterForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        self.user_curr = kwargs.pop('user', None)
        super(FefuMailRegisterForm, self).__init__(*args, **kwargs)

    def clean_email(self):
        data = self.cleaned_data['email']
        if data.split('@')[1] != 'students.dvfu.ru':
            raise forms.ValidationError("Неправильный домен.")
        if FefuMail.objects.filter(email=data, status=True).count() > 0:
            raise forms.ValidationError("Email уже зарегистрирован.")
        return data

    def save(self, force_insert=False, force_update=False, commit=True):
        m = super(FefuMailRegisterForm, self).save(commit=False)
        m.user = self.user_curr
        if commit:
            m.save()
        return m

    class Meta:
        model = FefuMail
        fields = ['email']
        help_texts = {
            'email': 'Email должен быть в домене students.dvfu.ru.',
        }
