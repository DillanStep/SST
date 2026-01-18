<#
.SYNOPSIS
    Resets SST Dashboard to factory default state before GitHub push.

.DESCRIPTION
    This script removes all user data, configuration, and build artifacts:
    - SQLite databases (auth.db, archive.db, positions.db)
    - API .env configuration file
    - Web client dist build folder
    - Optionally: node_modules folders
    
    Run this before pushing to GitHub to ensure no sensitive data is committed.

.PARAMETER Force
    Skip confirmation prompts

.PARAMETER IncludeNodeModules
    Also remove node_modules folders (saves ~500MB but requires reinstall)

.EXAMPLE
    .\Reset-Factory.ps1
    
.EXAMPLE
    .\Reset-Factory.ps1 -Force -IncludeNodeModules
#>

param(
    [switch]$Force,
    [switch]$IncludeNodeModules
)

$ErrorActionPreference = 'Stop'

# Colors
function Write-Header { param($text) Write-Host "`n$text" -ForegroundColor Cyan }
function Write-Success { param($text) Write-Host "  ✓ $text" -ForegroundColor Green }
function Write-Skip { param($text) Write-Host "  - $text" -ForegroundColor DarkGray }
function Write-Warn { param($text) Write-Host "  ! $text" -ForegroundColor Yellow }

# Get paths
$ScriptDir = $PSScriptRoot
$ApiDir = Join-Path $ScriptDir "apps\api"
$WebDir = Join-Path $ScriptDir "apps\web"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║           SST Dashboard - Factory Reset                    ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""
Write-Host "This will remove all user data and configuration:" -ForegroundColor Yellow
Write-Host "  • API databases (auth.db, archive.db, positions.db)"
Write-Host "  • API configuration (.env)"
Write-Host "  • Web client build (dist/)"
if ($IncludeNodeModules) {
    Write-Host "  • Node modules (api & web)" -ForegroundColor Yellow
}
Write-Host ""

# Confirm unless -Force
if (-not $Force) {
    $confirm = Read-Host "Are you sure? Type 'yes' to continue"
    if ($confirm -ne 'yes') {
        Write-Host "`nReset cancelled." -ForegroundColor Gray
        exit 0
    }
}

Write-Host ""
Write-Host "Resetting to factory default..." -ForegroundColor White

# 1. Remove API databases
Write-Header "[1/5] Removing API databases..."
$dataDir = Join-Path $ApiDir "data"
if (Test-Path $dataDir) {
    $dbFiles = Get-ChildItem -Path $dataDir -Filter "*.db" -ErrorAction SilentlyContinue
    foreach ($db in $dbFiles) {
        Remove-Item $db.FullName -Force
        Write-Success "Deleted $($db.Name)"
    }
    if (-not $dbFiles) {
        Write-Skip "No database files found"
    }
} else {
    Write-Skip "Data directory does not exist"
}

# 2. Remove API .env
Write-Header "[2/5] Removing API configuration..."
$envFile = Join-Path $ApiDir ".env"
if (Test-Path $envFile) {
    Remove-Item $envFile -Force
    Write-Success "Deleted .env"
} else {
    Write-Skip ".env does not exist"
}

# Also check for any .env.local or similar
$envLocal = Join-Path $ApiDir ".env.local"
if (Test-Path $envLocal) {
    Remove-Item $envLocal -Force
    Write-Success "Deleted .env.local"
}

# 3. Remove web client build
Write-Header "[3/5] Removing web client build..."
$distDir = Join-Path $WebDir "dist"
if (Test-Path $distDir) {
    Remove-Item $distDir -Recurse -Force
    Write-Success "Deleted dist folder"
} else {
    Write-Skip "dist folder does not exist"
}

# 4. Remove node_modules (optional)
Write-Header "[4/5] Node modules..."
if ($IncludeNodeModules) {
    $apiModules = Join-Path $ApiDir "node_modules"
    $webModules = Join-Path $WebDir "node_modules"
    
    if (Test-Path $apiModules) {
        Write-Host "  Removing API node_modules (this may take a moment)..." -ForegroundColor Gray
        Remove-Item $apiModules -Recurse -Force
        Write-Success "Deleted API node_modules"
    }
    
    if (Test-Path $webModules) {
        Write-Host "  Removing Web node_modules (this may take a moment)..." -ForegroundColor Gray
        Remove-Item $webModules -Recurse -Force
        Write-Success "Deleted Web node_modules"
    }
} else {
    Write-Skip "Skipped (use -IncludeNodeModules to remove)"
}

# 5. Clean temporary/log files
Write-Header "[5/5] Cleaning temporary files..."
$cleaned = 0

# Log files
Get-ChildItem -Path $ApiDir -Filter "*.log" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item $_.FullName -Force
    $cleaned++
}

# TypeScript build info
$tsBuildInfo = Join-Path $WebDir "tsconfig.tsbuildinfo"
if (Test-Path $tsBuildInfo) {
    Remove-Item $tsBuildInfo -Force
    $cleaned++
}

# Vite cache
$viteCache = Join-Path $WebDir "node_modules\.vite"
if (Test-Path $viteCache) {
    Remove-Item $viteCache -Recurse -Force
    $cleaned++
}

if ($cleaned -gt 0) {
    Write-Success "Cleaned $cleaned temporary files"
} else {
    Write-Skip "No temporary files found"
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              Factory Reset Complete!                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "The project is now ready for GitHub push." -ForegroundColor White
Write-Host ""
Write-Host "Removed:" -ForegroundColor Gray
Write-Host "  • User accounts and authentication data"
Write-Host "  • Archived player/position history"
Write-Host "  • Server connection settings"
Write-Host "  • Web client build artifacts"
if ($IncludeNodeModules) {
    Write-Host "  • Node modules (run Install-SST.bat to reinstall)"
}
Write-Host ""
