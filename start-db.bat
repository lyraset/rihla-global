@echo off
REM ── Starts a local MongoDB for Rihla with PERMANENT storage ──
REM Double-click this file and leave the window open while you develop.
REM Data is stored in .mongodb-data inside this project (never resets).

echo Starting local MongoDB for Rihla on port 27017...
echo Keep this window open. Press Ctrl+C to stop.
echo.

if not exist "%~dp0.mongodb-data" mkdir "%~dp0.mongodb-data"

"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "%~dp0.mongodb-data" --port 27017
