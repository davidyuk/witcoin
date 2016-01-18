from django_filters.widgets import RangeWidget


class CustomRangeWidget(RangeWidget):
    def __init__(self, widget, attrs={}):
        attrs_start = {'placeholder': 'От'}
        attrs_start.update(attrs)
        attrs_stop = {'placeholder': 'До'}
        attrs_stop.update(attrs)
        super(RangeWidget, self).__init__((widget(attrs_start), widget(attrs_stop)), attrs)

    def format_output(self, rendered_widgets):
        rendered_widgets.insert(1, ' — ')
        return '<table class="range-widget"><tr><td>' + '</td><td>'.join(rendered_widgets) + '</td></tr></table>'
