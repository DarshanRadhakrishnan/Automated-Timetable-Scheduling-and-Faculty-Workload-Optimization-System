@echo off
echo Stopping existing backend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1


echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is running.
) else (
    echo MongoDB is stopped. Starting local instance...
    cd timetable-backend-mern
    start "MongoDB Local" /min call start-mongodb.bat
    cd ..
    timeout /t 5 >nul
)

echo Starting backend...
cd timetable-backend-mern
start "Timetable Backend" npm start
cd ..

echo Opening frontend...
timeout /t 2 >nul
start timetable-frontend\index.html

echo Web application restarted!
pause
