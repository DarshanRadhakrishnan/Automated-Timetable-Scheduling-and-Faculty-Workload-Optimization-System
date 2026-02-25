@echo off
title Timetable Management System

echo ========================================
echo  Timetable Management System
echo  Frontend: frontend1 (Next.js)
echo  Backend: timetable-backend-mern
echo ========================================

:: Backend
echo Starting Backend...
cd timetable-backend-mern
start "Timetable Backend" cmd /k "npm start"
cd ..

:: Frontend
echo Checking Frontend dependencies...
if not exist "frontend1\node_modules" (
    echo Installing frontend dependencies... This may take a few minutes.
    cd frontend1
    call npm install
    cd ..
)

echo Starting Frontend...
cd frontend1
start "Next.js Frontend" cmd /k "npm run dev"
cd ..

:: Open Browser
echo Waiting for services to start...
timeout /t 10 >nul
start http://localhost:3000

echo.
echo Application started!
echo Backend:   http://localhost:5000
echo Frontend:  http://localhost:3000
echo.
pause
