@echo off
title Timetable Management System - Full Stack Startup

echo ========================================
echo  Timetable Management System
echo  Full Stack Startup Script
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "timetable-backend-mern" (
    echo ERROR: Please run this script from the project root directory
    echo Expected to find: timetable-backend-mern folder
    pause
    exit /b 1
)

if not exist "timetable-frontend-react" (
    echo ERROR: Please run this script from the project root directory
    echo Expected to find: timetable-frontend-react folder
    pause
    exit /b 1
)

echo [1/3] Starting MongoDB (if not already running)...
echo Note: Make sure MongoDB is installed and running
echo.

echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd timetable-backend-mern && npm start"
timeout /t 3 /nobreak > nul
echo Backend started on http://localhost:5000
echo.

echo [3/3] Starting Frontend React App...
start "Frontend React App" cmd /k "cd timetable-frontend-react && npm run dev"
timeout /t 3 /nobreak > nul
echo Frontend started on http://localhost:5173
echo.

echo ========================================
echo  All services started successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend UI:  http://localhost:5173
echo.
echo Press any key to open the browser...
pause > nul

:: Open the frontend in default browser
start http://localhost:5173

echo.
echo To stop the servers, close the terminal windows
echo or press Ctrl+C in each window
echo.
pause
