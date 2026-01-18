#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Sets up Windows Firewall rules for SST Dashboard remote access.

.DESCRIPTION
    This script creates inbound firewall rules to allow remote access to:
    - SST Dashboard (Vite dev server) on port 3000
    - SST API Server (Node.js) on port 3001
    
    Run this script as Administrator on the server machine.

.NOTES
    After running this script, you can access the dashboard from your home PC using:
    http://<server-ip>:3000
    
    Make sure to also configure your router's port forwarding if accessing from outside your LAN.
#>

param(
    [int]$DashboardPort = 3000,
    [int]$ApiPort = 3001,
    [switch]$Remove
)

$ErrorActionPreference = "Stop"

# Rule names
$dashboardRuleName = "SST Dashboard (Port $DashboardPort)"
$apiRuleName = "SST API Server (Port $ApiPort)"

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Add-FirewallRule {
    param(
        [string]$Name,
        [int]$Port,
        [string]$Description
    )
    
    # Check if rule already exists
    $existingRule = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Status "  Rule '$Name' already exists. Updating..." "Yellow"
        Remove-NetFirewallRule -DisplayName $Name
    }
    
    # Create new rule
    New-NetFirewallRule `
        -DisplayName $Name `
        -Description $Description `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $Port `
        -Action Allow `
        -Profile Any `
        -Enabled True | Out-Null
    
    Write-Status "  Created rule: $Name (TCP $Port)" "Green"
}

function Remove-FirewallRule {
    param([string]$Name)
    
    $existingRule = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Remove-NetFirewallRule -DisplayName $Name
        Write-Status "  Removed rule: $Name" "Yellow"
    } else {
        Write-Status "  Rule '$Name' not found" "Gray"
    }
}

# Header
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SST Dashboard Firewall Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($Remove) {
    Write-Status "Removing firewall rules..." "Yellow"
    Write-Host ""
    
    Remove-FirewallRule -Name $dashboardRuleName
    Remove-FirewallRule -Name $apiRuleName
    
    Write-Host ""
    Write-Status "Firewall rules removed successfully!" "Green"
} else {
    Write-Status "Creating firewall rules for remote access..." "Cyan"
    Write-Host ""
    
    # Add dashboard rule
    Add-FirewallRule `
        -Name $dashboardRuleName `
        -Port $DashboardPort `
        -Description "Allows remote access to SST Dashboard web interface"
    
    # Add API rule
    Add-FirewallRule `
        -Name $apiRuleName `
        -Port $ApiPort `
        -Description "Allows remote access to SST API server"
    
    Write-Host ""
    Write-Status "Firewall rules created successfully!" "Green"
    Write-Host ""
    
    # Get server IP addresses
    Write-Status "Your server IP addresses:" "Cyan"
    $ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | 
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
        Select-Object -ExpandProperty IPAddress
    
    foreach ($ip in $ipAddresses) {
        Write-Host "  - $ip" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ACCESS YOUR DASHBOARD FROM HOME PC" -ForegroundColor Cyan  
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($ip in $ipAddresses) {
        Write-Host "  Dashboard: " -NoNewline -ForegroundColor Gray
        Write-Host "http://${ip}:${DashboardPort}" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Status "IMPORTANT NOTES:" "Magenta"
    Write-Host "  1. Make sure the dashboard is running with: npm run dev -- --host" -ForegroundColor White
    Write-Host "  2. Make sure the API server is running" -ForegroundColor White
    Write-Host "  3. If accessing from outside your network, configure port forwarding" -ForegroundColor White
    Write-Host "     on your router for ports $DashboardPort and $ApiPort" -ForegroundColor White
    Write-Host ""
    
    # Verify rules
    Write-Status "Verifying rules..." "Cyan"
    $rules = Get-NetFirewallRule -DisplayName "SST*" -ErrorAction SilentlyContinue | 
        Select-Object DisplayName, Enabled, Direction, Action
    
    if ($rules) {
        $rules | Format-Table -AutoSize
    }
}

Write-Host ""
