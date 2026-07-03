import os
import sys
from pathlib import Path
import django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
def create_default_superuser():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'employee_management.settings')
    django.setup()
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        print(f"\n=======================================================")
        print(f"Default admin user created successfully!")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"=======================================================\n")
    else:
        print("\nAdmin user already exists. Skipping creation.\n")

if __name__ == '__main__':
    create_default_superuser()
