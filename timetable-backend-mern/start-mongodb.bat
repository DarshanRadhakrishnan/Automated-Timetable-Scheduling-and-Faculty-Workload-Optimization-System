@echo off
if not exist "data" mkdir data

echo Starting MongoDB...
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath=".\data" --bind_ip 127.0.0.1 --port 27017

pause
