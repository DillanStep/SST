@echo off
title SST API Server

cd /d "%~dp0"

:loop
echo.
echo ============================================================
echo Starting SST API...
echo ============================================================
echo.

node src/server.js

echo.
echo ============================================================
echo API stopped. Restarting in 3 seconds...
echo (Press Ctrl+C to exit)
echo ============================================================

ping 127.0.0.1 -n 4 > nul
goto loop
