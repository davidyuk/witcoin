from django_filters.widgets import RangeWidget


class CustomRangeWidget(RangeWidget):
    def __init__(self, widget, attrs=None):
        attrs_start = {'placeholder': 'От', **(attrs or {})}
        attrs_stop = {'placeholder': 'До', **(attrs or {})}
        widgets = (widget(attrs_start), widget(attrs_stop))
        super(RangeWidget, self).__init__(widgets, attrs)

    def format_output(self, rendered_widgets):
        rendered_widgets.insert(1, ' — ')
        return '<table class="range-widget"><tr><td>' + '</td><td>'.join(rendered_widgets) + '</td></tr></table>'
