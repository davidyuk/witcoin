from .fefu_mail import fefu_send_mail, fefu_from_mail
from .task import task, TaskCreateView, TaskDeleteView, TaskUpdateView, TaskListView
from .transaction import transaction, transaction_create, TransactionFilterView
from .user import user, register, FeedFilterView, settings, home, password_reset_confirm, password_reset_done, password_reset_complete
from .views import index
from .service import ServiceCreateView, ServiceDetailView, ServiceListView, ServiceUpdateView, ServiceDeleteView
