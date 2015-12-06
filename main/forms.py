from django import forms
from django.contrib.auth import models as auth_models
from django.contrib.auth import forms as auth_forms
from .models import UserProfile


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

        }
