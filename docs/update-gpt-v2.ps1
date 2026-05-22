$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'

Write-Host "Buscando workflow..." -ForegroundColor Cyan
$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get
Write-Host "Carregado: $($wf.nodes.Count) nos" -ForegroundColor Green

# Converter para JSON, modificar como string, e fazer PUT
$wfJson = $wf | ConvertTo-Json -Depth 50

Write-Host "Workflow JSON: $($wfJson.Length) chars" -ForegroundColor Yellow

# Verificar o maxTokens atual
if ($wfJson -match '"maxTokens":\s*(\d+)') {
    Write-Host "maxTokens atual: $($matches[1])" -ForegroundColor Yellow
}

# Substituir maxTokens de 1500 para 4000
$wfJson = $wfJson -replace '"maxTokens":\s*1500', '"maxTokens": 4000'

# Substituir temperatura de 0.7 para 0.6
$wfJson = $wfJson -replace '"temperature":\s*0\.7', '"temperature": 0.6'

Write-Host "Alteracoes de tokens/temperatura aplicadas" -ForegroundColor Green

# Verificar se a alteracao funcionou
if ($wfJson -match '"maxTokens":\s*4000') {
    Write-Host "maxTokens=4000 confirmado no JSON" -ForegroundColor Green
} else {
    Write-Host "AVISO: maxTokens nao foi alterado" -ForegroundColor Red
}

# Converter de volta para objeto para enviar apenas os campos necessarios
$wfObj = $wfJson | ConvertFrom-Json

# Payload reduzido
$payload = @{
    name        = $wfObj.name
    nodes       = $wfObj.nodes
    connections = $wfObj.connections
    settings    = $wfObj.settings
    staticData  = $wfObj.staticData
} | ConvertTo-Json -Depth 50

Write-Host "`nSalvando no n8n (apenas tokens/temperatura)..." -ForegroundColor Cyan
$result = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" `
    -Headers @{'X-N8N-API-KEY'=$N8N_KEY; 'Content-Type'='application/json'} `
    -Method Put -Body $payload

Write-Host "Salvo! Active: $($result.active)" -ForegroundColor Green

$updatedGpt = $result.nodes | Where-Object { $_.id -eq 'ai-04' }
Write-Host "Max tokens no servidor: $($updatedGpt.parameters.options.maxTokens)" -ForegroundColor Green
Write-Host "Temperatura no servidor: $($updatedGpt.parameters.options.temperature)" -ForegroundColor Green
