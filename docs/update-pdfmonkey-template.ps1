$PDFMONKEY_KEY = 'SSfXZLjGc4Mamfzs2MjvTaGj9ax59j4z'
$TEMPLATE_ID = '7437C9F4-94C8-4985-ACEB-D90BAC8D2A50'
$BASE_DIR = 'C:\Users\thisc\meu-projeto-iaeo\quiz-diagnostico-iaeo\docs'

$newHtml = [System.IO.File]::ReadAllText("$BASE_DIR\novo-template-pdf.html", [System.Text.Encoding]::UTF8)
Write-Host "HTML lido: $($newHtml.Length) chars" -ForegroundColor Cyan

$payload = @{
    document_template = @{
        body = $newHtml
    }
} | ConvertTo-Json -Depth 10 -Compress

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

Write-Host "Enviando PATCH para PDFMonkey..." -ForegroundColor Cyan

$response = Invoke-WebRequest `
    -Uri "https://api.pdfmonkey.io/api/v1/document_templates/$TEMPLATE_ID" `
    -Method Patch `
    -Headers @{'Authorization'="Bearer $PDFMONKEY_KEY"; 'Content-Type'='application/json; charset=utf-8'} `
    -Body $bodyBytes

Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
$result = $response.Content | ConvertFrom-Json
Write-Host "Template atualizado: $($result.document_template.name)" -ForegroundColor Green
Write-Host "Updated at: $($result.document_template.updated_at)" -ForegroundColor Green
Write-Host "`n✅ Template HTML substituido com sucesso!" -ForegroundColor Green
