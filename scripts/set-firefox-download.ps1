param(
    [Parameter(Mandatory = $true)]
    [string]$DownloadDir
)

# Writes a user.js into Firefox's default profile so that $DownloadDir becomes
# the default download folder. user.js is re-applied on every Firefox launch.

$base = Join-Path $env:APPDATA 'Mozilla\Firefox'
$ini  = Join-Path $base 'profiles.ini'

if (-not (Test-Path $ini)) {
    Write-Host "Firefox profiles.ini not found at $ini - is Firefox installed? Skipping."
    exit 1
}

$lines = Get-Content $ini
$profilePath = $null

# Prefer the profile referenced by an [Install...] section: that's the one
# Firefox actually launches by default.
$section = $null
foreach ($line in $lines) {
    if ($line -match '^\[(.+)\]$') { $section = $matches[1]; continue }
    if ($section -like 'Install*' -and $line -match '^Default=(.+)$') {
        $profilePath = Join-Path $base (($matches[1].Trim()) -replace '/', '\')
        break
    }
}

# Fall back to the [ProfileN] entry flagged Default=1.
if (-not $profilePath) {
    $relPath = $null; $isDefault = $false; $isRelative = $true
    foreach ($line in ($lines + '[__end__]')) {
        if ($line -match '^\[(.+)\]$') {
            if ($isDefault -and $relPath) {
                $profilePath = if ($isRelative) { Join-Path $base $relPath } else { $relPath }
                break
            }
            $relPath = $null; $isDefault = $false; $isRelative = $true
            continue
        }
        if ($line -match '^Path=(.+)$')       { $relPath = $matches[1].Trim() }
        if ($line -match '^IsRelative=(\d)')  { $isRelative = ($matches[1] -eq '1') }
        if ($line -match '^Default=1\s*$')    { $isDefault = $true }
    }
}

if (-not $profilePath -or -not (Test-Path $profilePath)) {
    Write-Host "Could not locate a Firefox profile folder. Skipping download-dir setup."
    exit 1
}

# Backslashes must be doubled inside the JS string literal in user.js.
$escaped = $DownloadDir -replace '\\', '\\'
$userJs  = Join-Path $profilePath 'user.js'

# Drop any download prefs we manage, then append the fresh ones.
$keep = @()
if (Test-Path $userJs) {
    $keep = Get-Content $userJs |
        Where-Object { $_ -notmatch 'browser\.download\.(folderList|dir|useDownloadDir)' }
}
$keep += 'user_pref("browser.download.folderList", 2);'
$keep += "user_pref(`"browser.download.dir`", `"$escaped`");"
$keep += 'user_pref("browser.download.useDownloadDir", true);'

Set-Content -Path $userJs -Value $keep -Encoding ASCII

Write-Host "Firefox download folder set to: $DownloadDir"
Write-Host "Profile updated: $profilePath"
Write-Host "If Firefox is open, restart it for the change to take effect."
