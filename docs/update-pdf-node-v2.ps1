$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'

Write-Host "Buscando workflow..." -ForegroundColor Cyan
$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get

$pdfNode = $wf.nodes | Where-Object { $_.id -eq 'pdf-07' }
Write-Host "No pdf-07 encontrado: $($pdfNode.name)" -ForegroundColor Green
Write-Host "jsonBody atual (primeiros 200 chars): $($pdfNode.parameters.jsonBody.Substring(0,200))" -ForegroundColor Yellow

# Novo jsonBody com todos os 6 campos do GPT
$newJsonBody = '={{ JSON.stringify({' + "`n" +
'  document: {' + "`n" +
'    document_template_id: "7437C9F4-94C8-4985-ACEB-D90BAC8D2A50",' + "`n" +
'    payload: JSON.stringify({' + "`n" +
'      empresa: $(' + "'" + 'Normalizar Dados' + "'" + ').item.json.empresa,' + "`n" +
'      nome: $(' + "'" + 'Normalizar Dados' + "'" + ').item.json.nome,' + "`n" +
'      data: $now.format(' + "'" + 'DD/MM/YYYY' + "'" + '),' + "`n" +
'      logo_url: "https://diagnostico.thiagoskiante.com.br/assets/logo-iaeo.png",' + "`n" +
'      titulo_personalizado: $json.titulo_personalizado,' + "`n" +
'      resumo_executivo: $json.resumo_executivo,' + "`n" +
'      diagnostico: $json.diagnostico,' + "`n" +
'      oportunidades: $json.oportunidades,' + "`n" +
'      custo_inacao: $json.custo_inacao,' + "`n" +
'      por_onde_comecar: $json.por_onde_comecar,' + "`n" +
'      whatsapp_rafa: "+55 41 3798-9777",' + "`n" +
'      kiwify_url: "https://pay.kiwify.com.br/fJCNgjy"' + "`n" +
'    }),' + "`n" +
'    meta: "{}"' + "`n" +
'  }' + "`n" +
'}) }}'

Write-Host "`nNovo jsonBody ($($newJsonBody.Length) chars):" -ForegroundColor Cyan
Write-Host $newJsonBody

$pdfNode.parameters.jsonBody = $newJsonBody

$payload = @{
    name        = $wf.name
    nodes       = $wf.nodes
    connections = $wf.connections
    settings    = $wf.settings
    staticData  = $wf.staticData
} | ConvertTo-Json -Depth 50 -Compress

Write-Host "`nSalvando no n8n..." -ForegroundColor Cyan
$result = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" `
    -Headers @{'X-N8N-API-KEY'=$N8N_KEY; 'Content-Type'='application/json'} `
    -Method Put `
    -Body $payload

Write-Host "Salvo! Active: $($result.active)" -ForegroundColor Green

$updatedPdf = $result.nodes | Where-Object { $_.id -eq 'pdf-07' }
$body = $updatedPdf.parameters.jsonBody
Write-Host "`nConfirmacoes:" -ForegroundColor Green
Write-Host "  titulo_personalizado: $($body.Contains('titulo_personalizado'))"
Write-Host "  resumo_executivo: $($body.Contains('resumo_executivo'))"
Write-Host "  custo_inacao: $($body.Contains('custo_inacao'))"
Write-Host "  whatsapp_rafa correto: $($body.Contains('+55 41 3798-9777'))"
Write-Host "  template ID correto: $($body.Contains('7437C9F4'))"
Write-Host "`n✅ No pdf-07 atualizado com 6 campos GPT!" -ForegroundColor Green
