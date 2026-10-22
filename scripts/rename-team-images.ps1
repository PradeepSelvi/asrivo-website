# Script to rename team image files
# Fixes spaces and capitalization issues

$teamDir = "public/team"

Write-Host "Renaming team image files..." -ForegroundColor Cyan

# Check if team directory exists
if (!(Test-Path $teamDir)) {
    Write-Host "Error: $teamDir directory not found!" -ForegroundColor Red
    exit 1
}

# Define rename operations
$renames = @(
    @{Old = "sivaganesh j.jpeg"; New = "sivaganesh-j.jpeg"},
    @{Old = "karthik rajalee.jpeg"; New = "karthik-rajalee.jpeg"},
    @{Old = "karthik rajalee.JPG"; New = "karthik-rajalee.jpeg"},
    @{Old = "KRISHNAKUMAR.jpeg"; New = "krishnakumar.jpeg"},
    @{Old = "KRISHNAKUMAR.JPEG"; New = "krishnakumar.jpeg"}
)

$renamed = 0
$skipped = 0

foreach ($rename in $renames) {
    $oldPath = Join-Path $teamDir $rename.Old
    $newPath = Join-Path $teamDir $rename.New
    
    if (Test-Path $oldPath) {
        if (Test-Path $newPath) {
            Write-Host "  ⚠️  Skipping: $($rename.New) already exists" -ForegroundColor Yellow
            $skipped++
        } else {
            Rename-Item -Path $oldPath -NewName $rename.New
            Write-Host "  ✅ Renamed: $($rename.Old) → $($rename.New)" -ForegroundColor Green
            $renamed++
        }
    } else {
        Write-Host "  ℹ️  Not found: $($rename.Old)" -ForegroundColor Gray
        $skipped++
    }
}

Write-Host ""
Write-Host "Done! Renamed: $renamed, Skipped: $skipped" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Update team member references in the database or config files" -ForegroundColor Yellow
