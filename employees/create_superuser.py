import os
import sys

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'employee_management.settings')

try:
    import django
    django.setup()
    from django.contrib.auth import get_user_model
except Exception as e:
    print(f"[-] Django setup failed: {e}")
    sys.exit(1)

def create_admin():
    User = get_user_model()
    # Default credentials (can be overridden using environment variables in Render Dashboard)
    username = os.environ.get('ADMIN_USERNAME', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
    password = os.environ.get('ADMIN_PASSWORD', 'admin123')

    print("=" * 60)
    print("[*] AUTOMATIC ADMIN SUPERUSER CHECK & CREATION")
    print("=" * 60)

    try:
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"[+] Default superuser '{username}' created successfully!")
        else:
            print(f"[.] Superuser '{username}' already exists. Skipping creation.")
    except Exception as e:
        print(f"[-] Failed to create superuser: {e}")

if __name__ == '__main__':
    create_admin()
