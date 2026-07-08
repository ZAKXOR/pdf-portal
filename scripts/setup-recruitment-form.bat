@echo off
setlocal enabledelayedexpansion
title Recruitment form - setup

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_DIR=%%~fI"

echo ============================================
echo  Recruitment form - setup
echo ============================================
echo.

REM --- 1. Create the recruitment-form folder inside the repo ---
set "DOWNLOAD_DIR=%PROJECT_DIR%\recruitment-form"
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"
echo Folder ready: %DOWNLOAD_DIR%

REM --- 3. Remember the path so on-email-sent.bat can clear it later ---
> "%SCRIPT_DIR%download-dir.txt" echo %DOWNLOAD_DIR%

REM --- 4. Point Firefox's default download folder at it ---
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%set-firefox-download.ps1" -DownloadDir "%DOWNLOAD_DIR%"

REM --- 5. Install dependencies, then boot the dev server ---
pushd "%PROJECT_DIR%"
echo.
echo Installing dependencies (npm install)...
call npm install
if errorlevel 1 (
  echo npm install failed. Aborting.
  popd
  pause
  exit /b 1
)
echo.
echo Starting dev server (npm run dev)...
call npm run dev
popd

endlocal
