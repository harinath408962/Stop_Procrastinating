# Deploy Script
# 1. Build the project (updates docs/ folder)
Write-Host "Building project..." -ForegroundColor Cyan
npm run build

# Check if build succeeded
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting deploy." -ForegroundColor Red
    exit
}

# 2. Git commands
Write-Host "Staging changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing..." -ForegroundColor Cyan
$commitMsg = Read-Host "Enter commit message (default: 'Update deployment')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update deployment"
}
git commit -m "$commitMsg"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host "Done! Deployment updated." -ForegroundColor Green
Write-Host "Please wait ~2 minutes for GitHub Pages to refresh." -ForegroundColor Gray
