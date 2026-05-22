$PDFMONKEY_KEY = 'WJPfuEZKFq8Qruvmyk2z'
$TEMPLATE_ID = '7437C9F4-94C8-4985-ACEB-D90BAC8D2A50'

Write-Host "Buscando template PDFMonkey..." -ForegroundColor Cyan
$template = Invoke-RestMethod -Uri "https://api.pdfmonkey.io/api/v1/document_templates/$TEMPLATE_ID" `
    -Headers @{'Authorization'="Bearer $PDFMONKEY_KEY"} -Method Get

Write-Host "Template: $($template.document_template.name)" -ForegroundColor Green
Write-Host "ID: $($template.document_template.id)" -ForegroundColor Green

$html = $template.document_template.body
Write-Host "HTML size: $($html.Length) chars" -ForegroundColor Yellow

$html | Out-File -FilePath 'C:\Users\thisc\meu-projeto-iaeo\quiz-diagnostico-iaeo\docs\template-atual.html' -Encoding utf8
Write-Host "Salvo em template-atual.html" -ForegroundColor Green

# Mostrar o HTML completo
Write-Host "`n=== HTML DO TEMPLATE ===" -ForegroundColor Cyan
Write-Host $html
