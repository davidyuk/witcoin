from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def getpager(objects, page=1, objects_per_page=25):
    paginator = Paginator(objects, objects_per_page)
    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)
