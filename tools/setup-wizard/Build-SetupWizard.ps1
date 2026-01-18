Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Builds a standalone EXE from SetupWizard.ps1 using ps2exe.
# NOTE: This requires Windows PowerShell (not pwsh) and the ps2exe module.

$here = $PSScriptRoot
$in = Join-Path $here 'SetupWizard.ps1'
$outDir = Join-Path $here 'dist'
$out = Join-Path $outDir 'SST-SetupWizard.exe'

if (-not (Test-Path $in)) {
  throw "Missing input script: $in"
}

if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

# Install ps2exe if needed
if (-not (Get-Module -ListAvailable -Name ps2exe)) {
  Write-Host 'ps2exe not found. Installing for current user...'
  try {
    Set-PSRepository -Name 'PSGallery' -InstallationPolicy Trusted | Out-Null
  } catch {
    # ignore
  }
  Install-Module ps2exe -Scope CurrentUser -Force
}

Import-Module ps2exe

Write-Host "Building $out ..."

# -noConsole hides the console window
Invoke-ps2exe -inputFile $in -outputFile $out -noConsole -title 'SST Setup Wizard'

Write-Host "Done: $out"
