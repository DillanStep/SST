@echo off
title SST Dashboard - Web Client
color 0A

setlocal

echo ========================================
echo    SST Dashboard - Web Client
echo ========================================
echo.

cd /d "%~dp0"

echo Checking for dependencies...
if not exist "node_modules\.bin\vite.cmd" (
    echo Installing dependencies including dev dependencies...
    call npm install --include=dev
    echo.
)

echo Starting web client on http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
