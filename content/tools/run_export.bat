@echo off
setlocal

cd /d "%~dp0"

echo [1/3] Validate current game_data.js
py validate_game_data.py

if errorlevel 1 (
  echo.
  echo Validation failed.
  pause
  exit /b %errorlevel%
)

echo.
echo [2/3] Export script.xlsx to game_data.js
py export_to_json.py

if errorlevel 1 (
  echo.
  echo Export failed.
  pause
  exit /b %errorlevel%
)

echo.
echo [3/3] Generate script.generated.xlsx and delimited files
py json_to_generated_xlsx.py --with-delimited

if errorlevel 1 (
  echo.
  echo Generated xlsx export failed.
  pause
  exit /b %errorlevel%
)

echo.
echo Export pipeline complete.
pause
