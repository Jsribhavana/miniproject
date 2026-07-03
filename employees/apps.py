from django.apps import AppConfig
import sys


class EmployeesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'employees'

    def ready(self):
        # Prevent running migrations during administrative command tasks
        skip_commands = {'makemigrations', 'migrate', 'collectstatic', 'showmigrations', 'flush', 'sqlmigrate'}
        if not any(arg in skip_commands for arg in sys.argv):
            from django.core.management import call_command
            try:
                # Run database migrations automatically
                call_command('migrate', interactive=False)
                
                # Auto-create superuser if it doesn't exist
                from django.contrib.auth import get_user_model
                User = get_user_model()
                username = 'admin'
                email = 'admin@example.com'
                password = 'admin123'
                
                if not User.objects.filter(username=username).exists():
                    User.objects.create_superuser(username, email, password)
                    print("Auto-setup: Created default superuser admin/admin123 successfully.")
            except Exception as e:
                print(f"Auto-migration/setup failed: {e}", file=sys.stderr)

