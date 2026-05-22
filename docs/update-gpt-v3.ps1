$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'
$BASE_DIR = 'C:\Users\thisc\meu-projeto-iaeo\quiz-diagnostico-iaeo\docs'

# Ler prompts dos arquivos (UTF-8)
$newSystemPrompt = [System.IO.File]::ReadAllText("$BASE_DIR\novo-prompt-system.txt", [System.Text.Encoding]::UTF8)
$newUserPrompt = [System.IO.File]::ReadAllText("$BASE_DIR\novo-prompt-user.txt", [System.Text.Encoding]::UTF8)

Write-Host "System prompt lido: $($newSystemPrompt.Length) chars" -ForegroundColor Cyan
Write-Host "User prompt lido: $($newUserPrompt.Length) chars" -ForegroundColor Cyan

# Buscar workflow
Write-Host "`nBuscando workflow..." -ForegroundColor Cyan
$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get
Write-Host "Carregado: $($wf.nodes.Count) nos" -ForegroundColor Green

# Encontrar no GPT
$gptNode = $wf.nodes | Where-Object { $_.id -eq 'ai-04' }
Write-Host "No GPT: $($gptNode.name) | maxTokens atual: $($gptNode.parameters.options.maxTokens)" -ForegroundColor Yellow

# Atualizar conteúdo dos messages
$gptNode.parameters.messages.values[0].content = $newSystemPrompt
$gptNode.parameters.messages.values[1].content = $newUserPrompt
$gptNode.parameters.options.maxTokens = 4000
$gptNode.parameters.options.temperature = 0.6

# Serializar para JSON com Depth alto
$payload = @{
    name        = $wf.name
    nodes       = $wf.nodes
    connections = $wf.connections
    settings    = $wf.settings
    staticData  = $wf.staticData
} | ConvertTo-Json -Depth 50 -Compress

Write-Host "Payload gerado: $($payload.Length) chars" -ForegroundColor Yellow

# Verificar se o user prompt está no payload
if ($payload -like '*Diagnóstico*' -or $payload -like '*Diagn*stico*') {
    Write-Host "User prompt presente no payload: OK" -ForegroundColor Green
}

# Converter para bytes UTF-8
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

Write-Host "`nEnviando PUT para n8n..." -ForegroundColor Cyan

$response = Invoke-WebRequest `
    -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" `
    -Method Put `
    -Headers @{'X-N8N-API-KEY'=$N8N_KEY; 'Content-Type'='application/json; charset=utf-8'} `
    -Body $bodyBytes

Write-Host "Status HTTP: $($response.StatusCode)" -ForegroundColor Green

$result = $response.Content | ConvertFrom-Json
Write-Host "Workflow active: $($result.active)" -ForegroundColor Green

# Verificar o no atualizado
$updatedGpt = $result.nodes | Where-Object { $_.id -eq 'ai-04' }
Write-Host "maxTokens no servidor: $($updatedGpt.parameters.options.maxTokens)" -ForegroundColor Green
Write-Host "temperatura no servidor: $($updatedGpt.parameters.options.temperature)" -ForegroundColor Green

$sysLen = $updatedGpt.parameters.messages.values[0].content.Length
$usrLen = $updatedGpt.parameters.messages.values[1].content.Length
Write-Host "System prompt salvo: $sysLen chars" -ForegroundColor Green
Write-Host "User prompt salvo: $usrLen chars" -ForegroundColor Green

# Verificar se o novo conteúdo está lá
if ($updatedGpt.parameters.messages.values[0].content -like '*benchmarks*') {
    Write-Host "`n✅ System prompt com benchmarks de setor: CONFIRMADO!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ System prompt pode nao ter sido atualizado" -ForegroundColor Red
}

if ($updatedGpt.parameters.messages.values[1].content -like '*titulo_personalizado*') {
    Write-Host "✅ User prompt com titulo_personalizado: CONFIRMADO!" -ForegroundColor Green
} else {
    Write-Host "⚠️ User prompt pode nao ter sido atualizado" -ForegroundColor Red
}

Write-Host "`n✅ Script concluido!" -ForegroundColor Green
