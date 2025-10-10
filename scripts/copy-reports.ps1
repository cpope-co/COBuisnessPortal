# Copy reports to development server
# This script copies test coverage, cypress reports, and unit test reports to the dev server

$DevServerPath = "\\owen400\cnodevsrv"
$ReportsPath = "$DevServerPath\reports"

Write-Host "Copying reports to dev server..." -ForegroundColor Green

# Create report directories if they don't exist
$Directories = @(
    $ReportsPath,
    "$ReportsPath\coverage",
    "$ReportsPath\cypress", 
    "$ReportsPath\unit-tests"
)

foreach ($Dir in $Directories) {
    if (!(Test-Path $Dir)) {
        Write-Host "Creating directory: $Dir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
    }
}

# Copy reports with error handling
try {
    Write-Host "Copying coverage reports..." -ForegroundColor Cyan
    if (Test-Path "coverage") {
        try {
            Copy-Item -Path "coverage\*" -Destination "$ReportsPath\coverage\" -Recurse -Force -ErrorAction Continue
        } catch {
            Write-Error "Error copying coverage reports: $_"
        }
    } else {
        Write-Host "No coverage reports found" -ForegroundColor Yellow
        try {
            Copy-Item -Path "cypress\reports\*" -Destination "$ReportsPath\cypress\" -Recurse -Force -ErrorAction Continue
        }
        catch {
            Write-Error "Error copying Cypress reports: $_"
        }

    Write-Host "Copying Cypress reports..." -ForegroundColor Cyan
    if (Test-Path "cypress\reports") {
        try {
            Copy-Item -Path "cypress\reports\*" -Destination "$ReportsPath\cypress\" -Recurse -Force -ErrorAction Continue
        } catch {
            Write-Error "Error copying Cypress reports: $_"
        }
    } else {
        Write-Host "No Cypress reports found" -ForegroundColor Yellow
    }

    Write-Host "Copying unit test reports..." -ForegroundColor Cyan
    if (Test-Path "reports\unit-tests") {
        # Find the most recent browser-specific report directory
        $BrowserDirs = Get-ChildItem -Path "reports\unit-tests" -Directory | Sort-Object LastWriteTime -Descending
        if ($BrowserDirs.Count -gt 0) {
            $LatestBrowserDir = $BrowserDirs[0]
            Write-Host "Using latest unit test report from: $($LatestBrowserDir.Name)" -ForegroundColor Yellow
            
            # Copy the contents of the latest browser directory
            try {
                Copy-Item -Path "$($LatestBrowserDir.FullName)\*" -Destination "$ReportsPath\unit-tests\" -Recurse -Force -ErrorAction Continue
            } catch {
                Write-Error "Error copying unit test reports: $_"
            }
        } else {
            Write-Host "No unit test browser directories found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No unit test reports found" -ForegroundColor Yellow
    }

    Write-Host "All reports copied to dev server successfully!" -ForegroundColor Green
}
catch {
    Write-Error "Failed to copy reports: $_"
    exit 1
}