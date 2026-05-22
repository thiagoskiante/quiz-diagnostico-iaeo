$payload = @{
    nome = 'Thiago Skiante'
    empresa = 'IAEO Teste'
    email = 'thiago@iaeo.com.br'
    whatsapp = '5541992388703'
    cargo = 'CEO'
    q4_setor = 'Consultoria'
    q5_dor = 'Processos manuais que consomem tempo da equipe'
    q6_experiencia_ia = 'Nunca usei IA na empresa'
    q7_sistemas = 'Excel, WhatsApp, Google Drive'
    q8_decisao = 'Sou o decisor principal'
    q9_urgencia = 'Nos proximos 3 meses'
    q10_investimento = 'Entre R$ 3.000 e R$ 10.000'
    q11_contexto = 'Perco horas toda semana fazendo relatorios manualmente e respondendo as mesmas perguntas no WhatsApp. Quero automatizar isso com IA.'
    score = 145
    trilha = 'A'
} | ConvertTo-Json -Depth 5

Write-Host "Disparando teste final..." -ForegroundColor Cyan
$r = Invoke-RestMethod -Uri 'https://skiante-dev.iaeo.com.br/webhook/Imersaodesenvolvi' -Method Post -Headers @{'Content-Type'='application/json'} -Body $payload
Write-Host "Resposta: $($r.message)" -ForegroundColor Green
Write-Host "Aguarde ~40 segundos para o WhatsApp chegar..." -ForegroundColor Yellow
