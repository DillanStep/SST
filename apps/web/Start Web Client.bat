@echo off
title SST Dashboard - Web Client
color 0A

echo ========================================
echo    SST Dashboard - Web Client
echo ========================================
echo.

cd /d "%~dp0"

echo Checking for node_modules...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting web client on http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
