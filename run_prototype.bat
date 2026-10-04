@echo off
echo ===================================================
echo Starting MEDORA Premium Prototype Server
echo ===================================================
echo.
echo Because the prototype uses modular JavaScript (ES Modules), 
echo it needs a local web server to run securely in your browser.
echo.
echo Please keep this window open and visit:
echo http://localhost:8000
echo.
python -m http.server 8000
pause
