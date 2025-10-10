# Consolidate unit test reports
# This script copies the most recent browser-specific unit test report to a consistent location

$UnitTestsPath = "reports\unit-tests"

Write-Host "Consolidating unit test reports..." -ForegroundColor Green

if (Test-Path $UnitTestsPath) {
    # Find the most recent browser-specific report directory
    $BrowserDirs = Get-ChildItem -Path $UnitTestsPath -Directory | Sort-Object LastWriteTime -Descending
    
    if ($BrowserDirs.Count -gt 0) {
        $LatestBrowserDir = $BrowserDirs[0]
        Write-Host "Using latest report from: $($LatestBrowserDir.Name)" -ForegroundColor Cyan
        Write-Host "Last modified: $($LatestBrowserDir.LastWriteTime)" -ForegroundColor Yellow
        
        # Copy the index.html from the latest browser directory to the root of unit-tests
        $SourceFile = Join-Path $LatestBrowserDir.FullName "index.html"
        $DestFile = Join-Path $UnitTestsPath "index.html"
        
        if (Test-Path $SourceFile) {
            Copy-Item -Path $SourceFile -Destination $DestFile -Force
            Write-Host "Consolidated report created at: $DestFile" -ForegroundColor Green
            
            # Also copy any assets
            $AssetsSource = Join-Path $LatestBrowserDir.FullName "*"
            $FilteredAssets = Get-ChildItem -Path $AssetsSource -Exclude "index.html"
            if ($FilteredAssets.Count -gt 0) {
                Copy-Item -Path $FilteredAssets -Destination $UnitTestsPath -Recurse -Force
                Write-Host "Assets copied as well" -ForegroundColor Cyan
            }
        } else {
            Write-Error "No index.html found in $($LatestBrowserDir.FullName)"
        }
    } else {
        Write-Host "No browser-specific report directories found" -ForegroundColor Yellow
    }
} else {
    Write-Error "Unit tests directory not found: $UnitTestsPath"
}