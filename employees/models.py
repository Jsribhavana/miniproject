from django.db import models


class Employee(models.Model):
    DEPARTMENT_CHOICES = [
        ('HR', 'Human Resources'),
        ('Engineering', 'Engineering'),
        ('Sales', 'Sales'),
        ('Marketing', 'Marketing'),
        ('Finance', 'Finance'),
        ('Support', 'Customer Support'),
        ('Operations', 'Operations'),
    ]

    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    employee_id = models.CharField(max_length=15, unique=True, verbose_name="Employee ID")
    first_name = models.CharField(max_length=50, verbose_name="First Name")
    last_name = models.CharField(max_length=50, verbose_name="Last Name")
    email = models.EmailField(unique=True, verbose_name="Email Address")
    phone = models.CharField(max_length=15, blank=True, verbose_name="Phone Number")
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, default='Engineering')
    designation = models.CharField(max_length=100, verbose_name="Designation/Role")
    salary = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Monthly Salary ($)")
    date_of_joining = models.DateField(verbose_name="Date of Joining")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.employee_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
