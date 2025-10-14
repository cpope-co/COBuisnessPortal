# Deploy application to development server
# This script copies the built Angular application to the dev server

$DevServerPath = "\\10.1.0.251\cnodevsrv"  # Updated to IP address
$SourcePath = "dist\cobusiness-portal\browser"

Write-Host "Deploying application to dev server..." -ForegroundColor Green

# Check if source directory exists
if (!(Test-Path $SourcePath)) {
    Write-Error "Source directory '$SourcePath' not found. Please run 'npm run build:dev' first."
    exit 1
}

# Test network connectivity first
Write-Host "Testing network connectivity to dev server..." -ForegroundColor Yellow
if (!(Test-Connection -ComputerName "10.1.0.251" -Count 1 -Quiet)) {
    Write-Error "Cannot reach dev server at 10.1.0.251. Please check network connectivity."
    exit 1
}

# Check if network path is accessible
if (!(Test-Path $DevServerPath)) {
    Write-Host "Dev server path '$DevServerPath' is not accessible." -ForegroundColor Red
    Write-Host "Attempting to create the directory..." -ForegroundColor Yellow
    
    try {
        New-Item -ItemType Directory -Path $DevServerPath -Force | Out-Null
        Write-Host "Successfully created dev server directory." -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to create dev server directory: $_"
        Write-Host "Please ensure you have proper network permissions to access $DevServerPath" -ForegroundColor Yellow
        exit 1
    }
}

try {
    Write-Host "Copying files from '$SourcePath' to '$DevServerPath'..." -ForegroundColor Cyan
    
    # Create a local backup directory instead of trying to backup on network share
    $LocalBackupPath = "backup\dev-deployment-$(Get-Date -Format 'yyyyMMddHHmmss')"
    
    # Create backup directory locally
    if (!(Test-Path "backup")) {
        New-Item -ItemType Directory -Path "backup" -Force | Out-Null
    }
    
    # Create backup of current dev server files (if any exist)
    if (Get-ChildItem -Path $DevServerPath -ErrorAction SilentlyContinue) {
        Write-Host "Creating local backup of current dev server files at: $LocalBackupPath" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $LocalBackupPath -Force | Out-Null
        Copy-Item -Path "$DevServerPath\*" -Destination $LocalBackupPath -Recurse -Force -ErrorAction Continue
    }

    # Clear the destination directory first
    Write-Host "Clearing destination directory..." -ForegroundColor Yellow
    Get-ChildItem -Path $DevServerPath | Remove-Item -Recurse -Force -ErrorAction Continue

    # Copy all files from the built application to the dev server
    Copy-Item -Path "$SourcePath\*" -Destination $DevServerPath -Recurse -Force

    # Verify the copy operation by checking for key files
    $indexExists = Test-Path "$DevServerPath\index.html"
    $mainJsExists = Get-ChildItem -Path $DevServerPath -Filter "main*.js" | Select-Object -First 1
    
    if ($indexExists -and $mainJsExists) {
        Write-Host "Deployment verification successful!" -ForegroundColor Green
        Write-Host "Key files found: index.html and $($mainJsExists.Name)" -ForegroundColor Green
    } else {
        Write-Warning "Deployment verification failed - missing key files!"
    }
    
    Write-Host "Application deployed to dev server successfully!" -ForegroundColor Green
    Write-Host "Application URL: http://10.1.0.251/" -ForegroundColor Cyan
    Write-Host "Files deployed to: $DevServerPath" -ForegroundColor Cyan
    
    if (Test-Path $LocalBackupPath) {
        Write-Host "Backup created at: $LocalBackupPath" -ForegroundColor Yellow
    }
}
catch {
    Write-Error "Failed to deploy application: $_"
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "1. Ensure you have write permissions to $DevServerPath" -ForegroundColor Yellow
    Write-Host "2. Check if the network share is mounted correctly" -ForegroundColor Yellow
    Write-Host "3. Verify VPN connection if required" -ForegroundColor Yellow
    exit 1
}