$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'

Write-Host "Buscando workflow..." -ForegroundColor Cyan
$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get
Write-Host "Carregado: $($wf.nodes.Count) nos" -ForegroundColor Green

# Encontrar nó pdf-07
$pdfNode = $wf.nodes | Where-Object { $_.id -eq 'pdf-07' }
Write-Host "jsonBody atual (primeiros 80 chars): $($pdfNode.parameters.jsonBody.Substring(0,80))"

# Novo jsonBody correto e completo
$newJsonBody = '={{ JSON.stringify({' + "`n" +
'  document: {' + "`n" +
'    document_template_id: "7437C9F4-94C8-4985-ACEB-D90BAC8D2A50",' + "`n" +
'    payload: JSON.stringify({' + "`n" +
'      empresa: $(''Normalizar Dados'').item.json.empresa,' + "`n" +
'      nome: $(''Normalizar Dados'').item.json.nome,' + "`n" +
'      data: $now.format(''DD/MM/YYYY''),' + "`n" +
'      logo_url: "https://diagnostico.thiagoskiante.com.br/assets/logo-iaeo.png",' + "`n" +
'      diagnostico: $json.diagnostico,' + "`n" +
'      oportunidades: $json.oportunidades,' + "`n" +
'      por_onde_comecar: $json.por_onde_comecar,' + "`n" +
'      whatsapp_rafa: "+55 41 3798-9777",' + "`n" +
'      kiwify_url: "https://pay.kiwify.com.br/fJCNgjy"' + "`n" +
'    }),' + "`n" +
'    meta: "{}"' + "`n" +
'  }' + "`n" +
'}) }}'

Write-Host "Novo jsonBody:" -ForegroundColor Yellow
Write-Host $newJsonBody
Write-Host "Length: $($newJsonBody.Length)"

# Aplicar no nó
$pdfNode.parameters.jsonBody = $newJsonBody

# PUT workflow
$payload = @{
    name        = $wf.name
    nodes       = $wf.nodes
    connections = $wf.connections
    settings    = $wf.settings
    staticData  = $wf.staticData
} | ConvertTo-Json -Depth 50

Write-Host "`nSalvando no n8n..." -ForegroundColor Cyan
$result = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" `
    -Headers @{'X-N8N-API-KEY'=$N8N_KEY; 'Content-Type'='application/json'} `
    -Method Put -Body $payload

Write-Host "Salvo! Active: $($result.active)" -ForegroundColor Green

# Verificar no resultado
$updatedNode = $result.nodes | Where-Object { $_.id -eq 'pdf-07' }
$bodyResult = $updatedNode.parameters.jsonBody
Write-Host "`nConfirmação (primeiros 120 chars):" -ForegroundColor Green
Write-Host $bodyResult.Substring(0, [Math]::Min(120, $bodyResult.Length))
Write-Host "`nContém whatsapp_rafa correto: $($bodyResult.Contains('+55 41 3798-9777'))" -ForegroundColor Green
Write-Host "Contém template ID correto: $($bodyResult.Contains('7437C9F4'))" -ForegroundColor Green
