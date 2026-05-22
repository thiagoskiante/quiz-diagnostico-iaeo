$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$wf = Invoke-RestMethod -Uri 'https://skiante-dev.iaeo.com.br/api/v1/workflows/sYG25wkMr9JOAVWD' -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get
$pdfNode = $wf.nodes | Where-Object { $_.id -eq 'pdf-07' }
$body = $pdfNode.parameters.jsonBody
$idx = $body.IndexOf('whatsapp_rafa')
Write-Output "Idx: $idx"
Write-Output "Trecho: $($body.Substring($idx, 60))"

# Mostrar bytes dos chars ao redor das aspas
$trecho = $body.Substring($idx + 14, 30)
Write-Output "Chars em unicode:"
foreach ($c in $trecho.ToCharArray()) {
    Write-Output "  [U+$('{0:X4}' -f [int]$c)] '$c'"
}

# Tentar substituição via string simples
$NOVO = '+55 41 3798-9777'
# Achar o valor entre as aspas após whatsapp_rafa
$start = $body.IndexOf('whatsapp_rafa') + 16  # após "whatsapp_rafa": "
$end = $body.IndexOf('"', $start)
$valorAtual = $body.Substring($start, $end - $start)
Write-Output "Valor atual encontrado: '$valorAtual'"
Write-Output "Length valor atual: $($valorAtual.Length)"

# Substituição manual via Substring
$newBody = $body.Substring(0, $start) + $NOVO + $body.Substring($end)
Write-Output "Contem novo numero: $($newBody.Contains($NOVO))"
