@echo off
title Timetable Scheduler - Startup
color 0A

echo.
echo ============================================================
echo    TIMETABLE SCHEDULER - AUTOMATED STARTUP
echo ============================================================
echo.

:: ─── Step 1: Kill existing processes on port 5000 and 3000 ───
echo [1/5] Clearing ports 5000 and 3000...

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    echo       Killing process %%a on port 5000
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo       Killing process %%a on port 3000
    taskkill /f /pid %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul
echo       [OK] Ports cleared.
echo.

:: ─── Step 2: Start Backend ───
echo [2/5] Starting Backend (port 5000)...
start "Timetable Backend :5000" cmd /k "cd /d "%~dp0timetable-backend-mern" && echo Backend starting... && node index.js"
echo       [OK] Backend window launched.
echo.

:: ─── Step 3: Wait for backend to be ready ───
echo [3/5] Waiting for backend to initialise...
timeout /t 8 /nobreak >nul

:check_backend
netstat -aon 2>nul | findstr ":5000 " | findstr "LISTENING" >nul
if errorlevel 1 (
    echo       Backend not ready yet, waiting 2 more seconds...
    timeout /t 2 /nobreak >nul
    goto check_backend
)
echo       [OK] Backend is up on port 5000.
echo.

:: ─── Step 4: Start Frontend ───
echo [4/5] Starting Frontend (port 3000)...
start "Timetable Frontend :3000" cmd /k "cd /d "%~dp0frontend1" && echo Frontend starting... && npm run dev"
echo       [OK] Frontend window launched.
echo.

:: ─── Step 5: Wait for frontend then open browser ───
echo [5/5] Waiting for frontend to compile...
timeout /t 20 /nobreak >nul

:check_frontend
netstat -aon 2>nul | findstr ":3000 " | findstr "LISTENING" >nul
if errorlevel 1 (
    echo       Frontend not ready yet, waiting 3 more seconds...
    timeout /t 3 /nobreak >nul
    goto check_frontend
)
echo       [OK] Frontend is up on port 3000.
echo.

:: ─── Open Browser ───
echo Opening browser at http://localhost:3000 ...
start "" "http://localhost:3000"

echo.
echo ============================================================
echo   ALL SERVICES RUNNING
echo ============================================================
echo.
echo   Backend  : http://localhost:5000
echo   Frontend : http://localhost:3000
echo.
echo   Login    : admin@timetable.com
echo   Password : Admin@123
echo.
echo   Close the Backend and Frontend terminal windows
echo   to stop the servers.
echo ============================================================
echo.
pause
