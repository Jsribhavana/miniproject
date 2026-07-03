from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('', views.dashboard_view, name='dashboard'),
    path('employee/add/', views.employee_add_view, name='employee_add'),
    path('employee/edit/<int:pk>/', views.employee_edit_view, name='employee_edit'),
    path('employee/delete/<int:pk>/', views.employee_delete_view, name='employee_delete'),
]
