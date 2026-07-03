from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employee_id', models.CharField(max_length=15, unique=True, verbose_name='Employee ID')),
                ('first_name', models.CharField(max_length=50, verbose_name='First Name')),
                ('last_name', models.CharField(max_length=50, verbose_name='Last Name')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='Email Address')),
                ('phone', models.CharField(blank=True, max_length=15, verbose_name='Phone Number')),
                ('department', models.CharField(choices=[('HR', 'Human Resources'), ('Engineering', 'Engineering'), ('Sales', 'Sales'), ('Marketing', 'Marketing'), ('Finance', 'Finance'), ('Support', 'Customer Support'), ('Operations', 'Operations')], default='Engineering', max_length=50)),
                ('designation', models.CharField(max_length=100, verbose_name='Designation/Role')),
                ('salary', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Monthly Salary ($)')),
                ('date_of_joining', models.DateField(verbose_name='Date of Joining')),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active', max_length=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
