@echo off
setlocal EnableExtensions

cd /d "%~dp0\..\.."

set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

if not exist ".cursor\hooks\state" mkdir ".cursor\hooks\state"

echo %DATE% %TIME% cwd=%CD% >> ".cursor\hooks\state\hook-invoked.txt"

"C:\Python314\python.exe" -X utf8 -u "%~dp0capture.py"

exit /b %ERRORLEVEL%
