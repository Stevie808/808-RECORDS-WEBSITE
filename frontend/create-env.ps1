# PowerShell script to create .env file for frontend
$envContent = @"
REACT_APP_BACKEND_URL=http://localhost:8000
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "✅ Created .env file in frontend directory"
Write-Host "Content:"
Write-Host $envContent
Write-Host ""
Write-Host "⚠️  IMPORTANT: Restart your frontend dev server for changes to take effect!"

