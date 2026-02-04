@echo off
echo Stopping existing backend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo Starting backend...
cd timetable-backend-mern
start "Timetable Backend" npm start
cd ..

echo Opening frontend...
timeout /t 2 >nul
start timetable-frontend\index.html

echo Web application restarted!
pause
