@echo off
REM ============================================================
REM SST Dashboard - Reset to Factory Default
REM ============================================================
REM Run this script before pushing to GitHub to remove:
REM - User databases (auth.db, archive.db)
REM - Environment configuration (.env)
REM - Any cached data
REM ============================================================

title SST Factory Reset

echo.
echo ============================================================
echo            SST Dashboard - Factory Reset
echo ============================================================
echo.
echo WARNING: This will delete all user data and configuration!
echo ============================================================
echo.
echo This script will remove:
echo   - API databases (auth.db, archive.db, positions.db)
echo   - API configuration (.env file)
echo   - Web client build (dist folder)
echo   - Node modules (optional)
echo.

set /p CONFIRM="Are you sure you want to reset to factory default? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo.
    echo Reset cancelled.
    pause
    exit /b 0
)

echo.
echo Resetting...

REM Get script directory
set "SCRIPT_DIR=%~dp0"
set "API_DIR=%SCRIPT_DIR%apps\api"
set "WEB_DIR=%SCRIPT_DIR%apps\web"

REM Remove API databases
echo.
echo [1/5] Removing API databases...
if exist "%API_DIR%\data\auth.db" (
    del /q "%API_DIR%\data\auth.db"
    echo   - Deleted auth.db
)
if exist "%API_DIR%\data\archive.db" (
    del /q "%API_DIR%\data\archive.db"
    echo   - Deleted archive.db
)
if exist "%API_DIR%\data\positions.db" (
    del /q "%API_DIR%\data\positions.db"
    echo   - Deleted positions.db
)
if exist "%API_DIR%\data" (
    REM Remove any other .db files
    del /q "%API_DIR%\data\*.db" 2>nul
    echo   - Cleaned data folder
)

REM Remove API .env (but keep .env.example)
echo.
echo [2/5] Removing API configuration...
if exist "%API_DIR%\.env" (
    del /q "%API_DIR%\.env"
    echo   - Deleted .env
)

REM Remove web client build
echo.
echo [3/5] Removing web client build...
if exist "%WEB_DIR%\dist" (
    rmdir /s /q "%WEB_DIR%\dist"
    echo   - Deleted dist folder
)

REM Ask about node_modules
echo.
set /p REMOVE_MODULES="[4/5] Remove node_modules? This saves space but requires reinstall. (yes/no): "
if /i "%REMOVE_MODULES%"=="yes" (
    echo Removing node_modules (this may take a moment)...
    if exist "%API_DIR%\node_modules" (
        rmdir /s /q "%API_DIR%\node_modules"
        echo   - Deleted API node_modules
    )
    if exist "%WEB_DIR%\node_modules" (
        rmdir /s /q "%WEB_DIR%\node_modules"
        echo   - Deleted Web node_modules
    )
) else (
    echo   - Skipped node_modules
)

REM Clean any temp files
echo.
echo [5/5] Cleaning temporary files...
if exist "%API_DIR%\*.log" del /q "%API_DIR%\*.log" 2>nul
if exist "%WEB_DIR%\*.log" del /q "%WEB_DIR%\*.log" 2>nul

echo.
echo ============================================================
echo.
echo   Factory reset complete!
echo.
echo   The following have been removed:
echo   - User accounts and authentication data
echo   - Archived player data
echo   - Position tracking history
echo   - Server connection settings (.env)
echo   - Web client build files
if /i "%REMOVE_MODULES%"=="yes" (
echo   - Node modules (run Install-SST.bat to reinstall)
)
echo.
echo   IMPORTANT: Clear your browser data too!
echo   Open browser DevTools (F12) -^> Application -^> Local Storage
echo   Delete 'sst-servers' and 'sst-active-server' entries
echo   Or use Incognito/Private mode for testing.
echo.
echo   The project is now ready for GitHub push.
echo.
echo ============================================================
echo.
pause
