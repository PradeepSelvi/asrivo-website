# Load environment variables
$envContent = Get-Content .env
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL").ToString().Split('=')[1].Trim()
$supabaseKey = ($envContent | Select-String "SUPABASE_SERVICE_ROLE_KEY").ToString().Split('=')[1].Trim()

Write-Host "Updating team member emails..." -ForegroundColor Cyan

# Function to update email
function Update-TeamMemberEmail {
    param($namePattern, $newEmail)
    
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    }
    
    # First, get the team member
    $getUrl = "$supabaseUrl/rest/v1/team_members?name=ilike.*$namePattern*&select=id,name,email"
    try {
        $response = Invoke-RestMethod -Uri $getUrl -Method Get -Headers $headers
        
        if ($response.Count -gt 0) {
            foreach ($member in $response) {
                Write-Host "Found: $($member.name) - Current email: $($member.email)" -ForegroundColor Yellow
                
                # Update the email
                $updateUrl = "$supabaseUrl/rest/v1/team_members?id=eq.$($member.id)"
                $body = @{ email = $newEmail } | ConvertTo-Json
                
                $updateResponse = Invoke-RestMethod -Uri $updateUrl -Method Patch -Headers $headers -Body $body
                Write-Host "Updated $($member.name) to: $newEmail" -ForegroundColor Green
            }
        } else {
            Write-Host "No member found matching: $namePattern" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Update Sivaganesh
Update-TeamMemberEmail -namePattern "Sivaganesh" -newEmail "sivaganesh@asrivotech.in"

# Update Karthik
Update-TeamMemberEmail -namePattern "Karthik" -newEmail "karthick@asrivotech.in"

# Update Yogeshwaran
Update-TeamMemberEmail -namePattern "Yogesh" -newEmail "yogesh@asrivotech.in"

Write-Host "`nEmail updates completed!" -ForegroundColor Cyan
