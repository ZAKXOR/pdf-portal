@echo off
setlocal enabledelayedexpansion
title Recruitment form - setup

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."

echo ============================================
echo  Recruitment form - setup
echo ============================================
echo.
echo Pick the target directory that will hold the
echo "recruitment-form" download folder...
echo.

REM --- 1. Choose target directory (GUI folder picker, typed fallback) ---
set "TARGET="
for /f "usebackq delims=" %%D in (`powershell -NoProfile -STA -Command "Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = 'Select target directory for recruitment-form'; if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $d.SelectedPath }"`) do set "TARGET=%%D"

if not defined TARGET set /p "TARGET=Enter target directory path: "
if not defined TARGET (
  echo No directory selected. Aborting.
  pause
  exit /b 1
)

REM --- 2. Create the recruitment-form folder inside it ---
set "DOWNLOAD_DIR=%TARGET%\recruitment-form"
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"
echo Folder ready: %DOWNLOAD_DIR%

REM --- 3. Remember the path so on-email-sent.bat can clear it later ---
> "%SCRIPT_DIR%download-dir.txt" echo %DOWNLOAD_DIR%

REM --- 4. Point Firefox's default download folder at it ---
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%set-firefox-download.ps1" -DownloadDir "%DOWNLOAD_DIR%"

REM --- 5. Boot the dev server ---
echo.
echo Starting dev server (npm run dev)...
pushd "%PROJECT_DIR%"
call npm run dev
popd

endlocal
