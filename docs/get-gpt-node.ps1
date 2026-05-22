$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'

$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/sYG25wkMr9JOAVWD" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get
Write-Host "Nodes totais: $($wf.nodes.Count)"

foreach ($node in $wf.nodes) {
    if ($node.type -like '*openAi*' -or $node.name -like '*GPT*' -or $node.name -like '*gpt*' -or $node.name -like '*AI*') {
        Write-Host "`n=== NODE: $($node.name) | ID: $($node.id) | TYPE: $($node.type) ==="
        $params = $node.parameters | ConvertTo-Json -Depth 20
        Write-Host $params
    }
}
