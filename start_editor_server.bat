@echo off
cd /d G:\GSD

echo Starting local server for GSD...
echo.
echo Open this URL in your browser:
echo http://localhost:8000/EditorNode/index.html
echo.

start "" http://localhost:8000/EditorNode/index.html

python -m http.server 8000
