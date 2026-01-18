#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Opens firewall ports for the SST Server Buddy API.

.DESCRIPTION
    This script creates Windows Firewall rules to allow inbound connections
    to the SST Node.js API. Run this script as Administrator on any new
    machine where you deploy the API.

.PARAMETER ApiPort
    The port the API runs on. Default is 3001.

.PARAMETER RuleName
    The name prefix for the firewall rules. Default is "SST Server Buddy API".

.PARAMETER Remove
    If specified, removes the firewall rules instead of creating them.

.EXAMPLE
    .\Setup-Firewall.ps1
    Creates firewall rules for the default port 3001.

.EXAMPLE
    .\Setup-Firewall.ps1 -ApiPort 8080
    Creates firewall rules for port 8080.

.EXAMPLE
    .\Setup-Firewall.ps1 -Remove
    Removes the firewall rules.
#>

param(
    [int]$ApiPort = 3001,
    [string]$RuleName = "SST Server Buddy API",
    [switch]$Remove
)

# Colors for output
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host $msg -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  SST Server Buddy API - Firewall Setup" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Err "ERROR: This script must be run as Administrator!"
    Write-Info "Right-click PowerShell and select 'Run as Administrator'"
    exit 1
}

if ($Remove) {
    # Remove firewall rules
    Write-Info "Removing firewall rules..."
    
    $tcpRule = Get-NetFirewallRule -DisplayName "$RuleName (TCP)" -ErrorAction SilentlyContinue
    if ($tcpRule) {
        Remove-NetFirewallRule -DisplayName "$RuleName (TCP)"
        Write-Success "  Removed: $RuleName (TCP)"
    } else {
        Write-Warn "  Not found: $RuleName (TCP)"
    }
    
    $udpRule = Get-NetFirewallRule -DisplayName "$RuleName (UDP)" -ErrorAction SilentlyContinue
    if ($udpRule) {
        Remove-NetFirewallRule -DisplayName "$RuleName (UDP)"
        Write-Success "  Removed: $RuleName (UDP)"
    } else {
        Write-Warn "  Not found: $RuleName (UDP)"
    }
    
    Write-Host ""
    Write-Success "Firewall rules removed successfully!"
} else {
    # Create firewall rules
    Write-Info "Creating firewall rules for port $ApiPort..."
    Write-Host ""
    
    # Check if rules already exist
    $existingTcp = Get-NetFirewallRule -DisplayName "$RuleName (TCP)" -ErrorAction SilentlyContinue
    $existingUdp = Get-NetFirewallRule -DisplayName "$RuleName (UDP)" -ErrorAction SilentlyContinue
    
    # TCP Rule
    if ($existingTcp) {
        Write-Warn "  TCP rule already exists, updating..."
        Set-NetFirewallRule -DisplayName "$RuleName (TCP)" -LocalPort $ApiPort
    } else {
        New-NetFirewallRule `
            -DisplayName "$RuleName (TCP)" `
            -Description "Allows inbound TCP connections to the SST Server Buddy API on port $ApiPort" `
            -Direction Inbound `
            -Protocol TCP `
            -LocalPort $ApiPort `
            -Action Allow `
            -Profile Any `
            -Enabled True | Out-Null
        Write-Success "  Created: $RuleName (TCP) - Port $ApiPort"
    }
    
    # UDP Rule (optional but good to have)
    if ($existingUdp) {
        Write-Warn "  UDP rule already exists, updating..."
        Set-NetFirewallRule -DisplayName "$RuleName (UDP)" -LocalPort $ApiPort
    } else {
        New-NetFirewallRule `
            -DisplayName "$RuleName (UDP)" `
            -Description "Allows inbound UDP connections to the SST Server Buddy API on port $ApiPort" `
            -Direction Inbound `
            -Protocol UDP `
            -LocalPort $ApiPort `
            -Action Allow `
            -Profile Any `
            -Enabled True | Out-Null
        Write-Success "  Created: $RuleName (UDP) - Port $ApiPort"
    }
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Success "Firewall rules created successfully!"
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    Write-Info "The API will be accessible on port $ApiPort from other machines."
    Write-Host ""
    Write-Host "To access from another machine, use:" -ForegroundColor White
    Write-Host "  http://<this-machine-ip>:$ApiPort" -ForegroundColor Yellow
    Write-Host ""
    
    # Show local IP addresses
    Write-Info "This machine's IP addresses:"
    Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
        ForEach-Object { 
            Write-Host "  http://$($_.IPAddress):$ApiPort" -ForegroundColor Yellow 
        }
    
    Write-Host ""
    Write-Host "NOTE: If using a cloud provider (AWS, Azure, etc.), you may also need" -ForegroundColor Gray
    Write-Host "      to configure security groups/network rules in their console." -ForegroundColor Gray
}

Write-Host ""
