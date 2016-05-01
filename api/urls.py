from django.conf.urls import url, include
from .views import get_vote, post_vote, VOTE_DIRECTIONS

directions_string = '|'.join(VOTE_DIRECTIONS.keys())

urlpatterns = [
    url(r'^vote/(?P<action>\w+)/(?P<id>\d+)/', include([
        url(r'^$', get_vote, name='get_vote'),
        url(r'^(?P<direction>%s)/?$' % directions_string, post_vote, name='post_vote')
    ])),
]