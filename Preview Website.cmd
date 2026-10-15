@echo off
cd /d "%~dp0"
if not exist node_modules (echo Run npm ci once in this folder before previewing. & pause & exit /b 1)
node tools/build-check.mjs
if errorlevel 1 (pause & exit /b 1)
echo Open http://127.0.0.1:4174/ in your browser.
node tools/preview-community.mjs
pause
