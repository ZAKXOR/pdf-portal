@echo off
setlocal enabledelayedexpansion
title Recruitment form - install dependencies

REM ============================================================
REM  Installs everything the portal needs on a fresh machine:
REM    - Node.js LTS (via winget, falling back to the MSI)
REM    - Git (via winget, only if missing)
REM    - npm packages for this project
REM  Must run elevated; it re-launches itself as admin if not.
REM ============================================================

REM --- 0. Self-elevate if not running as administrator ---
net session >nul 2>&1
if errorlevel 1 (
  echo Requesting administrator privileges...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 0
)

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_DIR=%%~fI"

echo ============================================
echo  Recruitment form - install dependencies
echo ============================================
echo.

REM --- 1. Node.js ---
where node >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%V in ('node --version') do echo Node.js already installed: %%V
  goto :git
)

echo Installing Node.js LTS...
where winget >nul 2>&1
if not errorlevel 1 (
  winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
  if not errorlevel 1 goto :node_done
  echo winget install failed, falling back to direct download...
)

echo Downloading the Node.js LTS installer...
set "NODE_MSI=%TEMP%\node-lts-x64.msi"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest 'https://nodejs.org/dist/lts/latest/node-lts-x64.msi' -OutFile '%NODE_MSI%'" ^
  || powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$v = (Invoke-RestMethod 'https://nodejs.org/dist/index.json' | Where-Object { $_.lts } | Select-Object -First 1).version; Invoke-WebRequest \"https://nodejs.org/dist/$v/node-$v-x64.msi\" -OutFile '%NODE_MSI%'"
if not exist "%NODE_MSI%" (
  echo Could not download Node.js. Check the internet connection and retry.
  pause
  exit /b 1
)
msiexec /i "%NODE_MSI%" /qn /norestart
if errorlevel 1 (
  echo Node.js installation failed.
  pause
  exit /b 1
)
del /q "%NODE_MSI%" 2>nul

:node_done
REM Pick up the PATH entries the installer just added.
set "PATH=%ProgramFiles%\nodejs;%PATH%"
echo Node.js installed.
echo.

REM --- 2. Git (optional but used by the project scripts) ---
:git
where git >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%V in ('git --version') do echo Git already installed: %%V
  goto :npm
)
where winget >nul 2>&1
if not errorlevel 1 (
  echo Installing Git...
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
) else (
  echo winget unavailable - skipping Git. Install it manually from https://git-scm.com if needed.
)
echo.

REM --- 3. Project npm packages ---
:npm
echo Installing project dependencies (npm install)...
pushd "%PROJECT_DIR%"
call npm install
if errorlevel 1 (
  echo npm install failed.
  popd
  pause
  exit /b 1
)
popd

echo.
echo ============================================
echo  All dependencies installed successfully.
echo  You can now run setup-recruitment-form.bat
echo ============================================
pause
endlocal
