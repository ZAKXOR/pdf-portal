# Clears Firefox's download history list (the entries shown in the downloads
# panel/library) from the default profile's places.sqlite. This mirrors what
# Firefox's "Clear Downloads" button does: it removes the download annotations
# but leaves bookmarks and browsing history untouched.
#
# Firefox keeps places.sqlite locked while it is running, so close Firefox
# first. If the DB is locked this script warns and exits without failing.

$base = Join-Path $env:APPDATA 'Mozilla\Firefox'
$ini  = Join-Path $base 'profiles.ini'

if (-not (Test-Path $ini)) {
    Write-Host "Firefox profiles.ini not found at $ini - skipping download-history clear."
    exit 0
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
    Write-Host "Could not locate a Firefox profile folder. Skipping download-history clear."
    exit 0
}

$places = Join-Path $profilePath 'places.sqlite'
if (-not (Test-Path $places)) {
    Write-Host "places.sqlite not found in $profilePath - nothing to clear."
    exit 0
}

# Windows 10/11 ships winsqlite3.dll in System32, so we can talk to SQLite
# without bundling sqlite3.exe.
Add-Type -Namespace WinSqlite -Name Native -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("winsqlite3.dll", CharSet = System.Runtime.InteropServices.CharSet.Ansi)]
public static extern int sqlite3_open(string filename, out System.IntPtr db);

[System.Runtime.InteropServices.DllImport("winsqlite3.dll", CharSet = System.Runtime.InteropServices.CharSet.Ansi)]
public static extern int sqlite3_exec(System.IntPtr db, string sql, System.IntPtr callback, System.IntPtr arg, out System.IntPtr errmsg);

[System.Runtime.InteropServices.DllImport("winsqlite3.dll")]
public static extern int sqlite3_close(System.IntPtr db);
'@

$db = [System.IntPtr]::Zero
$rc = [WinSqlite.Native]::sqlite3_open($places, [ref]$db)
if ($rc -ne 0) {
    Write-Host "Could not open places.sqlite (code $rc). Skipping."
    [WinSqlite.Native]::sqlite3_close($db) | Out-Null
    exit 0
}

# Wait briefly if Firefox still holds the lock, then clear the download list.
$sql = @"
PRAGMA busy_timeout = 3000;
DELETE FROM moz_annos WHERE anno_attribute_id IN (
  SELECT id FROM moz_anno_attributes
  WHERE name IN ('downloads/destinationFileURI', 'downloads/metaData')
);
PRAGMA wal_checkpoint(TRUNCATE);
"@

$err = [System.IntPtr]::Zero
$rc = [WinSqlite.Native]::sqlite3_exec($db, $sql, [System.IntPtr]::Zero, [System.IntPtr]::Zero, [ref]$err)
[WinSqlite.Native]::sqlite3_close($db) | Out-Null

if ($rc -eq 0) {
    Write-Host "Cleared Firefox download history list."
} elseif ($rc -eq 5) {
    Write-Host "places.sqlite is locked (is Firefox open?). Close Firefox to clear its download list."
} else {
    $msg = if ($err -ne [System.IntPtr]::Zero) { [System.Runtime.InteropServices.Marshal]::PtrToStringAnsi($err) } else { "code $rc" }
    Write-Host "Could not clear download history: $msg"
}

exit 0
