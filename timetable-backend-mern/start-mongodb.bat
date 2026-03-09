@echo off
if not exist "C:\mongodb_data" mkdir C:\mongodb_data

echo Starting MongoDB (Safe Mode - No OneDrive)...
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath="C:\mongodb_data" --bind_ip 127.0.0.1 --port 27017

pause
