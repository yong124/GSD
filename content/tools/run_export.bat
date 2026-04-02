@echo off
setlocal

cd /d "%~dp0"
python export_to_json.py

if errorlevel 1 (
  echo.
  echo Export failed.
  pause
  exit /b %errorlevel%
)

echo.
echo Export complete.
pause
