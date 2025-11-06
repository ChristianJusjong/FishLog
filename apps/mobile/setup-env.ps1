# Hook - Android Environment Setup Script for Windows
# Run this with PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Hook - Android Build Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: This script should be run as Administrator for best results." -ForegroundColor Yellow
    Write-Host "Some settings might not be applied correctly." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit
    }
}

# Function to check if Java is installed
function Test-Java {
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        if ($javaVersion -match "17\.") {
            Write-Host "[OK] Java 17 found: $javaVersion" -ForegroundColor Green
            return $true
        } else {
            Write-Host "[!] Java found but not version 17: $javaVersion" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "[X] Java not found!" -ForegroundColor Red
        Write-Host "    Download from: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
        return $false
    }
}

# Function to find Android SDK
function Find-AndroidSDK {
    $possiblePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:APPDATA\Android\Sdk",
        "C:\Android\Sdk",
        "$env:ProgramFiles\Android\Sdk",
        "${env:ProgramFiles(x86)}\Android\Sdk"
    )

    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            Write-Host "[OK] Android SDK found: $path" -ForegroundColor Green
            return $path
        }
    }

    Write-Host "[X] Android SDK not found!" -ForegroundColor Red
    Write-Host "    Install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
    return $null
}

# Function to find Java Home
function Find-JavaHome {
    try {
        $javaPath = (Get-Command java -ErrorAction Stop).Path
        $javaHome = Split-Path (Split-Path $javaPath -Parent) -Parent

        if (Test-Path "$javaHome\bin\java.exe") {
            Write-Host "[OK] JAVA_HOME: $javaHome" -ForegroundColor Green
            return $javaHome
        }
    } catch {
        # Try common installation locations
        $possiblePaths = @(
            "$env:ProgramFiles\Eclipse Adoptium\jdk-17*",
            "$env:ProgramFiles\Java\jdk-17*",
            "${env:ProgramFiles(x86)}\Eclipse Adoptium\jdk-17*",
            "C:\Program Files\Eclipse Adoptium\jdk-17*"
        )

        foreach ($pattern in $possiblePaths) {
            $paths = Get-ChildItem -Path (Split-Path $pattern -Parent) -Directory -Filter (Split-Path $pattern -Leaf) -ErrorAction SilentlyContinue
            if ($paths) {
                $javaHome = $paths[0].FullName
                Write-Host "[OK] JAVA_HOME: $javaHome" -ForegroundColor Green
                return $javaHome
            }
        }
    }

    Write-Host "[X] Could not determine JAVA_HOME" -ForegroundColor Red
    return $null
}

# Main setup
Write-Host "Step 1: Checking Prerequisites..." -ForegroundColor Cyan
Write-Host ""

$javaOk = Test-Java
$androidSDK = Find-AndroidSDK
$javaHome = Find-JavaHome

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray

if (-not $javaOk) {
    Write-Host ""
    Write-Host "SETUP INCOMPLETE: Java 17 is required" -ForegroundColor Red
    Write-Host "Please install Java 17 from:" -ForegroundColor Yellow
    Write-Host "https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not $androidSDK) {
    Write-Host ""
    Write-Host "SETUP INCOMPLETE: Android SDK is required" -ForegroundColor Red
    Write-Host "Please install Android Studio from:" -ForegroundColor Yellow
    Write-Host "https://developer.android.com/studio" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 2: Configuring Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidSDK, 'User')
Write-Host "[+] Set ANDROID_HOME = $androidSDK" -ForegroundColor Green

# Set JAVA_HOME if found
if ($javaHome) {
    [System.Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, 'User')
    Write-Host "[+] Set JAVA_HOME = $javaHome" -ForegroundColor Green
}

# Update PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('PATH', 'User')
$pathsToAdd = @(
    "$androidSDK\platform-tools",
    "$androidSDK\tools",
    "$androidSDK\tools\bin",
    "$androidSDK\emulator"
)

$pathUpdated = $false
foreach ($path in $pathsToAdd) {
    if ($currentPath -notlike "*$path*") {
        $currentPath = "$currentPath;$path"
        $pathUpdated = $true
        Write-Host "[+] Added to PATH: $path" -ForegroundColor Green
    } else {
        Write-Host "[-] Already in PATH: $path" -ForegroundColor Gray
    }
}

if ($pathUpdated) {
    [System.Environment]::SetEnvironmentVariable('PATH', $currentPath, 'User')
}

Write-Host ""
Write-Host "Step 3: Verifying Setup..." -ForegroundColor Cyan
Write-Host ""

# Reload environment variables for current session
$env:ANDROID_HOME = $androidSDK
if ($javaHome) {
    $env:JAVA_HOME = $javaHome
}
$env:PATH = $currentPath

# Verify tools
$adbPath = "$androidSDK\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "[OK] adb found at: $adbPath" -ForegroundColor Green
} else {
    Write-Host "[!] adb not found - SDK may be incomplete" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment Variables Set:" -ForegroundColor White
Write-Host "  ANDROID_HOME = $androidSDK" -ForegroundColor Cyan
if ($javaHome) {
    Write-Host "  JAVA_HOME    = $javaHome" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "IMPORTANT: You must RESTART your terminal/IDE/VSCode" -ForegroundColor Yellow
Write-Host "for these changes to take effect!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Close and reopen your terminal" -ForegroundColor Gray
Write-Host "  2. Navigate to: apps\mobile" -ForegroundColor Gray
Write-Host "  3. Run: build-android.bat" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
