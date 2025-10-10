# Deploy application to development server
# This script copies the built Angular application to the dev server

$DevServerPath = "\\owen400\cnodevsrv"
$SourcePath = "dist\cobusiness-portal\browser"

Write-Host "Deploying application to dev server..." -ForegroundColor Green

# Check if source directory exists
if (!(Test-Path $SourcePath)) {
    Write-Error "Source directory '$SourcePath' not found. Please run 'npm run build:dev' first."
    exit 1
}

# Create destination directory if it doesn't exist
if (!(Test-Path $DevServerPath)) {
    Write-Host "Creating dev server directory: $DevServerPath" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $DevServerPath -Force | Out-Null
}

try {
    Write-Host "Copying files from '$SourcePath' to '$DevServerPath'..." -ForegroundColor Cyan
    
    # Create a backup of the current dev server files
    $BackupPath = "${DevServerPath}_backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
    if (Test-Path $DevServerPath) {
        Write-Host "Creating backup of current dev server files at: $BackupPath" -ForegroundColor Yellow
        Copy-Item -Path "$DevServerPath\*" -Destination $BackupPath -Recurse -Force
    }

    # Copy all files from the built application to the dev server root
    Copy-Item -Path "$SourcePath\*" -Destination $DevServerPath -Recurse -Force

    # Verify the copy operation by comparing file counts
    $sourceFiles = Get-ChildItem -Path $SourcePath -Recurse | Measure-Object | Select-Object -ExpandProperty Count
    $destFiles = Get-ChildItem -Path $DevServerPath -Recurse | Measure-Object | Select-Object -ExpandProperty Count
    if ($sourceFiles -ne $destFiles) {
        Write-Warning "File count mismatch after copy! Source: $sourceFiles, Destination: $destFiles"
    } else {
        Write-Host "Verification successful: File counts match." -ForegroundColor Green
    }
    
    Write-Host "Application deployed to dev server successfully!" -ForegroundColor Green
    Write-Host "Files copied to: $DevServerPath" -ForegroundColor Cyan
}
catch {
    Write-Error "Failed to deploy application: $_"
    exit 1
}