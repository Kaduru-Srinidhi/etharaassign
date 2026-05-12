@echo off
echo Setting up Team Task Manager...
echo.

echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Backend installation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo Frontend installation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo Setup complete! 
echo.
echo To start development:
echo 1. Backend: cd backend && npm run dev
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Make sure PostgreSQL is running and configure .env files before starting!
pause
