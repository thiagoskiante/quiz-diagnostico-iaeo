$SUPABASE_URL = 'https://twyuozsqiojtbwhfhxme.supabase.co'
$SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eXVvenNxaW9qdGJ3aGZoeG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzA3MzAsImV4cCI6MjA2Mzk0NjczMH0.JvlGb_5bE8_hMH6qhFIpVkJhMR5T7eJt1FHb3ykEdPE'

$headers = @{
    'apikey' = $SUPABASE_KEY
    'Authorization' = "Bearer $SUPABASE_KEY"
}

$leads = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/leads?order=created_at.desc&limit=3" -Headers $headers -Method Get

foreach ($lead in $leads) {
    Write-Host "--- LEAD ---"
    Write-Host "Nome: $($lead.nome)"
    Write-Host "Email: $($lead.email)"
    Write-Host "WhatsApp: $($lead.whatsapp)"
    Write-Host "Created: $($lead.created_at)"
    Write-Host "PDF URL: $($lead.pdf_url)"
    Write-Host ""
}
