@echo off
REM CleanMe Script Wrapper
REM This batch file runs the PowerShell cleanup script

echo CleanMe Script - Project Cleanup Utility
echo ==========================================

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo Error: PowerShell is not available on this system.
    echo Please install PowerShell or run the script manually.
    pause
    exit /b 1
)

REM Run the PowerShell script with all arguments passed through
powershell -ExecutionPolicy Bypass -File "%~dp0cleanme.ps1" %*

REM Pause to show results
pause
