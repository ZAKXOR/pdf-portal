@echo off
setlocal
REM Runs after a successful email send.
REM Clears the PDFs from the recruitment-form download folder chosen in setup.

set "CFG=%~dp0download-dir.txt"
if not exist "%CFG%" (
  echo download-dir.txt not found - run setup-recruitment-form.bat first.
  exit /b 0
)

set "DOWNLOAD_DIR="
set /p "DOWNLOAD_DIR=" < "%CFG%"
if not defined DOWNLOAD_DIR exit /b 0
if not exist "%DOWNLOAD_DIR%" exit /b 0

del /q "%DOWNLOAD_DIR%\*.pdf" 2>nul
echo Cleared PDFs in %DOWNLOAD_DIR%
exit /b 0
