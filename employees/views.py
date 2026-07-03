from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login as auth_login, logout as auth_logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.db.models import Q, Count
from django.core.paginator import Paginator
from .models import Employee
from .forms import EmployeeForm


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                messages.success(request, f"Welcome back, {username}!")
                return redirect('dashboard')
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})


def logout_view(request):
    auth_logout(request)
    messages.info(request, "You have been successfully logged out.")
    return redirect('login')


@login_required
def dashboard_view(request):
    # Fetch filter and search parameters
    search_query = request.GET.get('q', '').strip()
    dept_filter = request.GET.get('department', '').strip()
    status_filter = request.GET.get('status', '').strip()

    # Base Queryset
    employee_list = Employee.objects.all()

    # Apply search filter
    if search_query:
        employee_list = employee_list.filter(
            Q(employee_id__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(designation__icontains=search_query)
        )

    # Apply department filter
    if dept_filter:
        employee_list = employee_list.filter(department=dept_filter)

    # Apply status filter
    if status_filter:
        employee_list = employee_list.filter(status=status_filter)

    # Statistics Calculations (based on the filtered or raw list, let's base it on total DB for dashboard context)
    total_count = Employee.objects.count()
    active_count = Employee.objects.filter(status='Active').count()
    inactive_count = Employee.objects.filter(status='Inactive').count()
    
    # Department breakdown (for graphs)
    dept_counts = Employee.objects.values('department').annotate(count=Count('id'))
    dept_labels = [item['department'] for item in dept_counts]
    dept_values = [item['count'] for item in dept_counts]
    unique_depts = len(dept_counts)

    # Pagination: 10 employees per page
    paginator = Paginator(employee_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Get departments and status options for filters
    departments = Employee.DEPARTMENT_CHOICES

    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'dept_filter': dept_filter,
        'status_filter': status_filter,
        'departments': departments,
        
        # Stats
        'total_count': total_count,
        'active_count': active_count,
        'inactive_count': inactive_count,
        'unique_depts': unique_depts,
        
        # Charts lists
        'dept_labels': dept_labels,
        'dept_values': dept_values,
    }
    return render(request, 'dashboard.html', context)


@login_required
def employee_add_view(request):
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        if form.is_valid():
            employee = form.save()
            messages.success(request, f"Employee {employee.full_name} added successfully!")
            return redirect('dashboard')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = EmployeeForm()
    return render(request, 'employee_form.html', {'form': form, 'title': 'Add Employee'})


@login_required
def employee_edit_view(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    if request.method == 'POST':
        form = EmployeeForm(request.POST, instance=employee)
        if form.is_valid():
            form.save()
            messages.success(request, f"Employee {employee.full_name} details updated!")
            return redirect('dashboard')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = EmployeeForm(instance=employee)
    return render(request, 'employee_form.html', {'form': form, 'title': 'Edit Employee', 'employee': employee})


@login_required
def employee_delete_view(request, pk):
    employee = get_object_or_404(Employee, pk=pk)
    if request.method == 'POST':
        name = employee.full_name
        employee.delete()
        messages.success(request, f"Employee {name} has been deleted.")
        return redirect('dashboard')
    return render(request, 'employee_confirm_delete.html', {'employee': employee})
