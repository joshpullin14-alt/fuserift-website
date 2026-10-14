@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is needed for the local preview. See README.md.
  pause
  exit /b 1
)
node tools\build-check.mjs
if errorlevel 1 (
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4173/"
node tools\serve.mjs
pause
