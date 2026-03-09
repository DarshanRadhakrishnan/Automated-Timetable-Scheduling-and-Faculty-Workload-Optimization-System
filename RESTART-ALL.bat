@echo off
echo Stopping existing backend and frontend processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is running.
) else (
    echo MongoDB is stopped. Starting local instance...
    cd timetable-backend-mern
    start "MongoDB Local" /min cmd /c "start-mongodb.bat"
    cd ..
    timeout /t 5 >nul
)

echo Starting backend (timetable-backend-mern)...
cd timetable-backend-mern
start "Timetable Backend" cmd /k "npm start"
cd ..

echo Checking Frontend dependencies...
if not exist "frontend1\node_modules" (
    echo Installing frontend dependencies... This may take a few minutes.
    cd frontend1
    call npm install
    cd ..
)

echo Starting frontend (frontend1)...
cd frontend1
start "Next.js Frontend" cmd /k "npm run dev"
cd ..

echo Opening browser...
timeout /t 10 >nul
start http://localhost:3000

echo Web application restarted!
pause
