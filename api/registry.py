from inspect import isclass
from django.db.models import Model

class ActionRegistry(dict):
    """ Registry class for API actions"""

    def __init__(self, **kwargs):
        self._reverse = dict()
        return super().__init__(kwargs)

    
    def register(self, model_class, action_name=None):
        subclass = issubclass(model_class, Model)
        if subclass and action_name is None:
            action_name = model_class.__name__.lower();
        if subclass and action_name not in self:
            self[action_name] = model_class
            self._reverse[model_class] = action_name
            return True
        return False


    def unregister(self, action_name):
        if (action_name not in self):
            return False
        cls = self[action_name]
        del self[action_name]
        del self._reverse[cls]
        return True


    def check(self, action_name):
        return action_name in self


    def reverse(self, model):
        if isinstance(model, Model):
            model = type(model)
        elif isclass(model) and not issubclass(model, Model):
            return None
        return self._reverse.get(model)


registry = ActionRegistry()
register = registry.register
unregister = registry.unregister
check = registry.check
reverse = registry.reverse
