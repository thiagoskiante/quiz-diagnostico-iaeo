$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'
$BASE_DIR = 'C:\Users\thisc\meu-projeto-iaeo\quiz-diagnostico-iaeo\docs'

$newSystemPrompt = [System.IO.File]::ReadAllText("$BASE_DIR\novo-prompt-system.txt", [System.Text.Encoding]::UTF8)
$newUserPrompt = [System.IO.File]::ReadAllText("$BASE_DIR\novo-prompt-user.txt", [System.Text.Encoding]::UTF8)

Write-Host "System: $($newSystemPrompt.Length) chars"
Write-Host "User: $($newUserPrompt.Length) chars"

$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get

$gptNode = $wf.nodes | Where-Object { $_.id -eq 'ai-04' }
$gptNode.parameters.messages.values[0].content = $newSystemPrompt
$gptNode.parameters.messages.values[1].content = $newUserPrompt
$gptNode.parameters.options.maxTokens = 4000
$gptNode.parameters.options.temperature = 0.6

$payload = @{
    name        = $wf.name
    nodes       = $wf.nodes
    connections = $wf.connections
    settings    = $wf.settings
    staticData  = $wf.staticData
} | ConvertTo-Json -Depth 50 -Compress

Write-Host "Payload: $($payload.Length) chars"
$payload | Out-File -FilePath "$BASE_DIR\payload-debug.json" -Encoding utf8
Write-Host "Salvo em payload-debug.json"

$test = $payload | ConvertFrom-Json
Write-Host "JSON valido: $($test.nodes.Count) nodes"

Write-Host "Enviando PUT..."
$result = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" `
    -Headers @{'X-N8N-API-KEY'=$N8N_KEY; 'Content-Type'='application/json'} `
    -Method Put `
    -Body $payload
Write-Host "SUCCESS! Active: $($result.active)"
$updatedGpt = $result.nodes | Where-Object { $_.id -eq 'ai-04' }
Write-Host "maxTokens: $($updatedGpt.parameters.options.maxTokens)"
Write-Host "Sys len salvo: $($updatedGpt.parameters.messages.values[0].content.Length)"
