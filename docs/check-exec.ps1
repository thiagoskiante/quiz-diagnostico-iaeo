$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$execs = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/executions?workflowId=sYG25wkMr9JOAVWD&limit=3" -Headers @{'X-N8N-API-KEY'=$N8N_KEY}
foreach ($e in $execs.data) {
    $dur = '?'
    if ($e.stoppedAt -and $e.startedAt) {
        $s = [datetime]$e.startedAt
        $f = [datetime]$e.stoppedAt
        $dur = [int]($f - $s).TotalSeconds
    }
    Write-Host "ID: $($e.id) | Status: $($e.status) | Duracao: ${dur}s | Finished: $($e.finished)"
}
