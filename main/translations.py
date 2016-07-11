from django.utils.translation import ungettext_lazy, ugettext_lazy, pgettext_lazy

"""
Removing this code causes makemessages to comment out those PO entries, so don't do that
unless you find a better way to do this
http://stackoverflow.com/questions/7625991/how-to-properly-add-entries-for-computed-values-to-the-django-internationalizati
http://stackoverflow.com/questions/7878028/override-default-django-translations
"""

ungettext_lazy('%d week', '%d weeks')
ungettext_lazy('%d minute', '%d minutes')
ugettext_lazy('Comment')
ugettext_lazy('Threaded comment')
pgettext_lazy('Person name', 'Name')
