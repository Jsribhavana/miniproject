from django import forms
from .models import Employee


class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = [
            'employee_id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'department',
            'designation',
            'salary',
            'date_of_joining',
            'status',
        ]
        widgets = {
            'employee_id': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. EMP102'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'John'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Doe'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'john.doe@company.com'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+1 (555) 019-2834'}),
            'department': forms.Select(attrs={'class': 'form-select'}),
            'designation': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Senior Developer'}),
            'salary': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '5000.00', 'step': '0.01'}),
            'date_of_joining': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
        }

    def clean_salary(self):
        salary = self.cleaned_data.get('salary')
        if salary is not None and salary <= 0:
            raise forms.ValidationError("Salary must be a positive decimal number.")
        return salary
