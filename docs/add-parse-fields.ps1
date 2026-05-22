$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'

Write-Host "Buscando workflow..." -ForegroundColor Cyan
$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get

$parseNode = $wf.nodes | Where-Object { $_.id -eq 'parse-gpt' }
$currentCount = $parseNode.parameters.assignments.assignments.Count
Write-Host "No parse-gpt: $currentCount assignments atuais" -ForegroundColor Yellow

# Verificar se ja tem campos novos
$jaTemTitulo = $parseNode.parameters.assignments.assignments | Where-Object { $_.name -eq 'titulo_personalizado' }
if ($jaTemTitulo) {
    Write-Host "Campos novos ja existem! Nada a fazer." -ForegroundColor Green
    exit
}

# Expressao base (igual as existentes, apenas mudando o campo)
$exprBase = '={{ (() => { try { const c = $json.message.content.replace(/```json\n?/g,' + "'" + "'" + ').replace(/```\n?/g,' + "'" + "'" + ').trim(); return JSON.parse(c).CAMPO_AQUI || FALLBACK_AQUI; } catch(e) { return FALLBACK_AQUI; } })() }}'

$expr4 = $exprBase.Replace('CAMPO_AQUI', 'titulo_personalizado').Replace("FALLBACK_AQUI", "'" + "Diagnostico de Oportunidades em IA" + "'")
$expr5 = $exprBase.Replace('CAMPO_AQUI', 'resumo_executivo').Replace("FALLBACK_AQUI", "'" + "" + "'")
$expr6 = $exprBase.Replace('CAMPO_AQUI', 'custo_inacao').Replace("FALLBACK_AQUI", "'" + "" + "'")

Write-Host "Expr4 (titulo): $($expr4.Substring(0,80))..." -ForegroundColor Cyan

# Criar objetos para novos assignments
$a4 = New-Object PSObject
$a4 | Add-Member -MemberType NoteProperty -Name 'id' -Value 'pg4'
$a4 | Add-Member -MemberType NoteProperty -Name 'name' -Value 'titulo_personalizado'
$a4 | Add-Member -MemberType NoteProperty -Name 'value' -Value $expr4
$a4 | Add-Member -MemberType NoteProperty -Name 'type' -Value 'string'

$a5 = New-Object PSObject
$a5 | Add-Member -MemberType NoteProperty -Name 'id' -Value 'pg5'
$a5 | Add-Member -MemberType NoteProperty -Name 'name' -Value 'resumo_executivo'
$a5 | Add-Member -MemberType NoteProperty -Name 'value' -Value $expr5
$a5 | Add-Member -MemberType NoteProperty -Name 'type' -Value 'string'

$a6 = New-Object PSObject
$a6 | Add-Member -MemberType NoteProperty -Name 'id' -Value 'pg6'
$a6 | Add-Member -MemberType NoteProperty -Name 'name' -Value 'custo_inacao'
$a6 | Add-Member -MemberType NoteProperty -Name 'value' -Value $expr6
$a6 | Add-Member -MemberType NoteProperty -Name 'type' -Value 'string'

# Adicionar ao array existente
$parseNode.parameters.assignments.assignments += $a4
$parseNode.parameters.assignments.assignments += $a5
$parseNode.parameters.assignments.assignments += $a6

$newCount = $parseNode.parameters.assignments.assignments.Count
Write-Host "Assignments apos adicao: $newCount" -ForegroundColor Green

# Gerar payload e salvar para inspeção
$payload = @{
    name        = $wf.name
    nodes       = $wf.nodes
    connections = $wf.connections
    settings    = $wf.settings
    staticData  = $wf.staticData
} | ConvertTo-Json -Depth 50 -Compress

$payload | Out-File -FilePath 'C:\Users\thisc\meu-projeto-iaeo\quiz-diagnostico-iaeo\docs\payload-parse.json' -Encoding utf8
Write-Host "Payload salvo para inspecao: $($payload.Length) chars" -ForegroundColor Yellow

Write-Host "Enviando PUT..." -ForegroundColor Cyan
$result = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" `
    -Headers @{'X-N8N-API-KEY'=$N8N_KEY; 'Content-Type'='application/json'} `
    -Method Put `
    -Body $payload

Write-Host "Salvo! Active: $($result.active)" -ForegroundColor Green

$updatedParse = $result.nodes | Where-Object { $_.id -eq 'parse-gpt' }
$finalCount = $updatedParse.parameters.assignments.assignments.Count
Write-Host "Assignments no servidor: $finalCount" -ForegroundColor Green

if ($finalCount -ge 6) {
    Write-Host "✅ Campos novos adicionados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Esperado 6 campos, obtido $finalCount" -ForegroundColor Red
}
