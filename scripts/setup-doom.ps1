#Requires -Version 5.1
# Requires -RunAsAdministrator is optional; uncomment if needed

param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Downloads DOOM shareware and creates a .jsdos bundle for js-dos v8.
# Requirements: PowerShell 5.1+, .NET Framework 4.5+ (for Expand-Archive)

$DOOM_DIR = Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "public") "doom"
$TEMP_DIR = Join-Path $env:TEMP "doom-setup-$(Get-Random)"

# Cleanup function
function Cleanup {
    if (Test-Path $TEMP_DIR) {
        Remove-Item -Recurse -Force $TEMP_DIR -ErrorAction SilentlyContinue
    }
}

Write-Host "=== DOOM Shareware Setup ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Create output directory
    New-Item -ItemType Directory -Force -Path $DOOM_DIR | Out-Null

    # Step 1: Download DOOM shareware
    Write-Host "[1/3] Downloading DOOM shareware..." -ForegroundColor Green

New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

$doom_zip = Join-Path $TEMP_DIR "doom.zip"
$download_success = $false

$urls = @(
    "https://archive.org/download/DoomsharewareEpisode/doom.ZIP",
    "https://archive.org/download/doom-shareware/DOOM1.WAD.zip",
    "https://doomwiki.org/w/images/a/a4/DOOM1.WAD.zip"
)

foreach ($url in $urls) {
    try {
        Write-Host "  Trying: $url"
        Invoke-WebRequest -Uri $url -OutFile $doom_zip -TimeoutSec 30 -ErrorAction Stop
        $download_success = $true
        Write-Host "  Downloaded successfully!" -ForegroundColor Yellow
        break
    }
    catch {
        Write-Host "  Failed: $_" -ForegroundColor DarkYellow
    }
}

if (-not $download_success) {
    Write-Host "Error: Failed to download DOOM shareware." -ForegroundColor Red
    throw "Download failed"
}

# Step 2: Extract game files
Write-Host "[2/3] Extracting game files..." -ForegroundColor Green

$extract_dir = Join-Path $TEMP_DIR "extract"
New-Item -ItemType Directory -Force -Path $extract_dir | Out-Null

try {
    Expand-Archive -Path $doom_zip -DestinationPath $extract_dir -Force
}
catch {
    Write-Host "Error: Could not extract ZIP file. $_" -ForegroundColor Red
    throw $_
}

# Find the WAD and EXE (case-insensitive)
$WAD = Get-ChildItem -Path $extract_dir -Filter "doom1.wad" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
$EXE = Get-ChildItem -Path $extract_dir -Filter "doom.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if ([string]::IsNullOrEmpty($WAD)) {
    Write-Host "Error: Could not find DOOM1.WAD in archive." -ForegroundColor Red
    throw "DOOM1.WAD not found"
}

# Step 3: Create .jsdos bundle
Write-Host "[3/3] Creating .jsdos bundle..." -ForegroundColor Green

$BUNDLE_DIR = Join-Path $TEMP_DIR "bundle"
$jsdos_dir = Join-Path $BUNDLE_DIR ".jsdos"
New-Item -ItemType Directory -Force -Path $jsdos_dir | Out-Null

# Copy game files
Copy-Item -Path $WAD -Destination (Join-Path $BUNDLE_DIR "DOOM1.WAD") -Force
if ($EXE) {
    Copy-Item -Path $EXE -Destination (Join-Path $BUNDLE_DIR "DOOM.EXE") -Force
}

# Create DOSBox config
$dosbox_conf = @"
[sdl]
autolock=true

[cpu]
core=auto
cputype=auto
cycles=max

[mixer]
rate=44100

[autoexec]
@echo off
mount c .
c:
DOOM.EXE
"@

$dosbox_conf_path = Join-Path $jsdos_dir "dosbox.conf"
Set-Content -Path $dosbox_conf_path -Value $dosbox_conf -Encoding ASCII

# Create the doom.zip bundle
$doom_bundle = Join-Path $DOOM_DIR "doom.zip"

try {
    $items_to_compress = @()
    $items_to_compress += (Join-Path $BUNDLE_DIR ".jsdos")
    $items_to_compress += (Join-Path $BUNDLE_DIR "DOOM1.WAD")
    if (Test-Path (Join-Path $BUNDLE_DIR "DOOM.EXE")) {
        $items_to_compress += (Join-Path $BUNDLE_DIR "DOOM.EXE")
    }

    Compress-Archive -Path $items_to_compress -DestinationPath $doom_bundle -Force
}
catch {
    Write-Host "Error: Could not create ZIP bundle. $_" -ForegroundColor Red
    throw $_
}

Write-Host ""
Write-Host "Done! Bundle created at $doom_bundle" -ForegroundColor Green
Write-Host ""
Write-Host "To play: bun run dev, then enter the Konami code on any page." -ForegroundColor Cyan
Write-Host "Konami code: ↑ ↑ ↓ ↓ ← → ← → B A" -ForegroundColor Cyan
}
finally {
    Cleanup
}
