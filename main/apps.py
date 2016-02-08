from django.apps import AppConfig


class MainConfig(AppConfig):
    name = 'main'
    verbose_name = 'Приложение WitCoin'

    def ready(self):
        from actstream import registry as actstream_registry
        actstream_registry.register(self.get_model('Task'))
        actstream_registry.register(self.get_model('TaskUser'))
        actstream_registry.register(self.get_model('Transaction'))
        from django.contrib.auth.models import User
        actstream_registry.register(User)
        from threadedcomments.models import ThreadedComment
        actstream_registry.register(ThreadedComment)
