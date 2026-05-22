$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$EXEC_ID = '382'

$exec = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/executions/$EXEC_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get

$execJson = $exec | ConvertTo-Json -Depth 50
$execJson | Out-File -FilePath 'C:\Users\thisc\exec382-full.json' -Encoding utf8
Write-Host "Salvo em exec382-full.json ($($execJson.Length) chars)"

# Tentar extrair o output do no GPT
$data = $exec.data
if ($data -and $data.resultData -and $data.resultData.runData) {
    $runData = $data.resultData.runData
    $nodeNames = $runData | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    Write-Host "Nos com output: $($nodeNames -join ', ')"

    foreach ($nodeName in $nodeNames) {
        if ($nodeName -like '*GPT*' -or $nodeName -like '*gpt*' -or $nodeName -like '*Relat*') {
            Write-Host "`n=== $nodeName ==="
            $nodeData = $runData.$nodeName
            $nodeJson = $nodeData | ConvertTo-Json -Depth 20
            Write-Host $nodeJson.Substring(0, [Math]::Min(3000, $nodeJson.Length))
        }
    }
}
