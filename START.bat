@echo off
REM ===========================================================================
REM  CEMS - One-click setup & run for Windows 10/11
REM  Just double-click this file. It installs everything and starts the app.
REM ===========================================================================
title CEMS Setup
echo.
echo   Starting CEMS setup...
echo   (A few windows will open automatically. Please keep them open.)
echo.

REM Run the PowerShell engine with relaxed execution policy, no profile.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

REM Keep this window open if the script exits early so the user can read errors.
echo.
echo   Setup window finished. You can close this window.
pause
