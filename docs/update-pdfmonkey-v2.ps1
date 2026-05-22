$PDFMONKEY_KEY = 'SSfXZLjGc4Mamfzs2MjvTaGj9ax59j4z'
$TEMPLATE_ID = '7437C9F4-94C8-4985-ACEB-D90BAC8D2A50'
$BASE_DIR = 'C:\Users\thisc\meu-projeto-iaeo\quiz-diagnostico-iaeo\docs'

$newHtml = [System.IO.File]::ReadAllText("$BASE_DIR\novo-template-pdf.html", [System.Text.Encoding]::UTF8)
Write-Host "HTML: $($newHtml.Length) chars" -ForegroundColor Cyan

# Primeiro GET para ver a estrutura atual
Write-Host "Verificando template atual..." -ForegroundColor Cyan
try {
    $current = Invoke-RestMethod -Uri "https://api.pdfmonkey.io/api/v1/document_templates/$TEMPLATE_ID" `
        -Headers @{'Authorization'="Bearer $PDFMONKEY_KEY"} -Method Get
    Write-Host "Template encontrado: $($current.document_template.name)" -ForegroundColor Green
    Write-Host "Engine: $($current.document_template.engine)" -ForegroundColor Green
    $fields = ($current.document_template | Get-Member -MemberType NoteProperty).Name
    Write-Host "Campos: $($fields -join ', ')" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "GET falhou: HTTP $statusCode" -ForegroundColor Red
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Erro: $($reader.ReadToEnd())" -ForegroundColor Red
    exit
}

# Tentar PATCH com o campo correto
$payload = @{
    document_template = @{
        body = $newHtml
    }
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "`nEnviando PATCH..." -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod `
        -Uri "https://api.pdfmonkey.io/api/v1/document_templates/$TEMPLATE_ID" `
        -Method Patch `
        -Headers @{'Authorization'="Bearer $PDFMONKEY_KEY"; 'Content-Type'='application/json'} `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($payload))
    Write-Host "✅ Atualizado! Nome: $($result.document_template.name)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "PATCH falhou: HTTP $statusCode" -ForegroundColor Red
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorBody = $reader.ReadToEnd()
    Write-Host "Detalhe do erro: $errorBody" -ForegroundColor Red
}
