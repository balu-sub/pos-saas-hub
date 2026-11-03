@echo off
setlocal
title Plannest POS Cloud SaaS Hub (pos.plannestapp.com)
color 0B

echo ============================================================
echo   PLANNEST POS - CLOUD SAAS HUB (SUPER ADMIN COCKPIT)
echo   Local Preview: http://localhost:5175
echo   Production:    pos.plannestapp.com
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking dependencies...
if not exist "node_modules" (
    echo Installing node dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo [2/2] Launching Plannest SaaS Hub on port 5175...
start "" "http://localhost:5175"

call npm run dev
if errorlevel 1 (
    echo [ERROR] Server encountered an error.
    pause
)
