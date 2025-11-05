@echo off
echo ====================================
echo FishLog - Quick Start Script
echo ====================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)
echo Docker found!
echo.

echo [2/5] Starting database...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start database
    pause
    exit /b 1
)
echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul
echo.

echo [3/5] Setting up Prisma...
cd apps\backend
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed
    cd ..\..
    pause
    exit /b 1
)
echo.

echo [4/5] Running migrations...
call npx prisma migrate dev --name init
cd ..\..
echo.

echo [5/5] Setup complete!
echo.
echo ====================================
echo Next steps:
echo ====================================
echo.
echo 1. Start backend:
echo    cd apps\backend
echo    npm run dev
echo.
echo 2. In a NEW terminal, start mobile app:
echo    cd apps\mobile
echo    npm run dev
echo.
echo 3. Press 'w' to open in browser or scan QR code
echo.
echo ====================================
echo.
pause
