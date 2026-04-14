@echo off
setlocal

cd /d "%~dp0"

echo [1/2] Validate current game_data.js
py validate_game_data.py

if errorlevel 1 (
  echo.
  echo Validation failed.
  pause
  exit /b %errorlevel%
)

echo.
echo [2/2] Generate script.generated.xlsx from game_data.js
py json_to_generated_xlsx.py

if errorlevel 1 (
  echo.
  echo Generated xlsx export failed.
  pause
  exit /b %errorlevel%
)

echo.
echo Data to generated xlsx complete.
pause
