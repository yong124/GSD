@echo off
setlocal

cd /d G:\GSD

if "%QA_CONCURRENCY%"=="" set QA_CONCURRENCY=4

powershell -NoProfile -Command ^
  "Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'node.exe' -and $_.CommandLine -like '*G:\\GSD\\.qa-node*') -or $_.Name -eq 'chrome-headless-shell.exe' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

powershell -NoProfile -Command ^
  "$r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:4173 -TimeoutSec 5; if ($r.StatusCode -ne 200) { exit 1 }"
if errorlevel 1 (
  echo Local QA server is not responding on http://127.0.0.1:4173
  exit /b 1
)

node G:\GSD\.qa-node\qa_fast_batch.js
set EXIT_CODE=%ERRORLEVEL%

echo.
echo Summary: G:\GSD\.qa-artifacts\qa-fast-batch-summary.json
exit /b %EXIT_CODE%
