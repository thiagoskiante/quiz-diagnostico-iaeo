$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'
$NOVO_NUMERO = '+55 41 3798-9777'

Write-Host "Buscando workflow..." -ForegroundColor Cyan
$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get
Write-Host "Carregado: $($wf.nodes.Count) nos" -ForegroundColor Green

# Encontrar nó PDF 5a
$pdfNode = $wf.nodes | Where-Object { $_.id -eq 'pdf-07' }
$body = $pdfNode.parameters.jsonBody

# Substituição manual via IndexOf — evita problemas de encoding com regex
$searchKey = 'whatsapp_rafa": "'
$startKey = $body.IndexOf($searchKey) + $searchKey.Length
$endKey = $body.IndexOf('"', $startKey)
$valorAtual = $body.Substring($startKey, $endKey - $startKey)
Write-Host "Valor atual: '$valorAtual'"

$newBody = $body.Substring(0, $startKey) + $NOVO_NUMERO + $body.Substring($endKey)
$pdfNode.parameters.jsonBody = $newBody
Write-Host "Novo valor aplicado: $NOVO_NUMERO" -ForegroundColor Green
Write-Host "Verificacao: $($newBody.Contains($NOVO_NUMERO))"

# PUT workflow
$payload = @{
    name        = $wf.name
    nodes       = $wf.nodes
    connections = $wf.connections
    settings    = $wf.settings
    staticData  = $wf.staticData
} | ConvertTo-Json -Depth 50

Write-Host "Salvando no n8n..." -ForegroundColor Cyan
$result = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" `
    -Headers @{'X-N8N-API-KEY'=$N8N_KEY; 'Content-Type'='application/json'} `
    -Method Put -Body $payload

Write-Host "Salvo! Active: $($result.active)" -ForegroundColor Green

# Verificar no resultado retornado
$updatedNode = $result.nodes | Where-Object { $_.id -eq 'pdf-07' }
$bodyResult = $updatedNode.parameters.jsonBody
$startCheck = $bodyResult.IndexOf($searchKey) + $searchKey.Length
$endCheck = $bodyResult.IndexOf('"', $startCheck)
$valorFinal = $bodyResult.Substring($startCheck, $endCheck - $startCheck)
Write-Host "Confirmado no servidor: '$valorFinal'" -ForegroundColor Green
