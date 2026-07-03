@echo off
title Employee Management System Setup
echo =======================================================
echo     Employee Management System (Django + SQLite)
echo =======================================================
echo.

:: Check for Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in system PATH.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

:: Step 1: Create Virtual Environment
echo [1/5] Creating Python Virtual Environment (venv)...
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created successfully.
) else (
    echo Virtual environment already exists. Skipping creation.
)
echo.

:: Step 2: Activate venv and install dependencies
echo [2/5] Installing dependencies...
call venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo.

:: Step 3: Run Django Database Migrations
echo [3/5] Setting up database and running migrations...
python manage.py makemigrations employees
python manage.py migrate
if %errorlevel% neq 0 (
    echo [ERROR] Database migration failed.
    pause
    exit /b 1
)
echo.

:: Step 4: Create Default Superuser
echo [4/5] Checking/Creating default administrator...
if exist "create_admin.py" (
    python create_admin.py
    del create_admin.py
)
echo.

:: Step 5: Start Server
echo [5/5] Launching server...
echo The application will be running at: http://127.0.0.1:8000/
echo To log in, use:
echo   - Username: admin
echo   - Password: admin123
echo.
echo Press Ctrl+C in this terminal window to stop the server.
echo.
python manage.py runserver
pause
