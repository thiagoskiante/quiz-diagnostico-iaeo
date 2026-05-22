$N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOWViYmM3Yy1lN2FlLTQwMzktOGRkOS0wOWRmYjdmZmVlYzIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc5Mzg5MjQ0LCJleHAiOjE3ODE5MjgwMDB9.-ECAKkbwrRSk6joQi7_ajNYk80BBZTNJof_aAdW6-mg'
$WORKFLOW_ID = 'sYG25wkMr9JOAVWD'

Write-Host "Buscando workflow..." -ForegroundColor Cyan
$wf = Invoke-RestMethod -Uri "https://skiante-dev.iaeo.com.br/api/v1/workflows/$WORKFLOW_ID" -Headers @{'X-N8N-API-KEY'=$N8N_KEY} -Method Get

$parseNode = $wf.nodes | Where-Object { $_.id -eq 'parse-gpt' }
Write-Host "No Parsear: $($parseNode.name)" -ForegroundColor Green
Write-Host "Assignments atuais: $($parseNode.parameters.assignments.assignments.Count)" -ForegroundColor Yellow

# Adicionar os campos novos (titulo_personalizado, resumo_executivo, custo_inacao)
$newAssignments = @(
    @{
        id = "pg1"
        name = "diagnostico"
        value = "={{ (() => { try { const c = `$json.message.content.replace(/` + '```' + "json\n?/g,'').replace(/" + '```' + "\n?/g,'').trim(); return JSON.parse(c).diagnostico || ''; } catch(e) { return ''; } })() }}"
        type = "string"
    },
    @{
        id = "pg2"
        name = "oportunidades"
        value = "={{ (() => { try { const c = `$json.message.content.replace(/` + '```' + "json\n?/g,'').replace(/" + '```' + "\n?/g,'').trim(); return JSON.parse(c).oportunidades || []; } catch(e) { return []; } })() }}"
        type = "array"
    },
    @{
        id = "pg3"
        name = "por_onde_comecar"
        value = "={{ (() => { try { const c = `$json.message.content.replace(/` + '```' + "json\n?/g,'').replace(/" + '```' + "\n?/g,'').trim(); return JSON.parse(c).por_onde_comecar || ''; } catch(e) { return ''; } })() }}"
        type = "string"
    },
    @{
        id = "pg4"
        name = "titulo_personalizado"
        value = "={{ (() => { try { const c = `$json.message.content.replace(/` + '```' + "json\n?/g,'').replace(/" + '```' + "\n?/g,'').trim(); return JSON.parse(c).titulo_personalizado || 'Diagnostico de Oportunidades em IA'; } catch(e) { return 'Diagnostico de Oportunidades em IA'; } })() }}"
        type = "string"
    },
    @{
        id = "pg5"
        name = "resumo_executivo"
        value = "={{ (() => { try { const c = `$json.message.content.replace(/` + '```' + "json\n?/g,'').replace(/" + '```' + "\n?/g,'').trim(); return JSON.parse(c).resumo_executivo || ''; } catch(e) { return ''; } })() }}"
        type = "string"
    },
    @{
        id = "pg6"
        name = "custo_inacao"
        value = "={{ (() => { try { const c = `$json.message.content.replace(/` + '```' + "json\n?/g,'').replace(/" + '```' + "\n?/g,'').trim(); return JSON.parse(c).custo_inacao || ''; } catch(e) { return ''; } })() }}"
        type = "string"
    }
)

# Manter as expressoes originais do no parse (que ja funcionam) - apenas adicionar os novos campos
# Pegar as 3 expressoes originais e adicionar mais 3
$originalAssignments = $parseNode.parameters.assignments.assignments

Write-Host "Adicionando campos titulo_personalizado, resumo_executivo, custo_inacao..." -ForegroundColor Cyan

# Verificar se ja existem campos novos
$hasTitulo = $originalAssignments | Where-Object { $_.name -eq 'titulo_personalizado' }
if ($hasTitulo) {
    Write-Host "Campos novos ja existem!" -ForegroundColor Yellow
} else {
    # Adicionar novos campos ao array existente
    $pg4 = [PSCustomObject]@{
        id = "pg4"
        name = "titulo_personalizado"
        value = "={{ (() => { try { const c = $json.message.content.replace(/` + '``' + '`json\n?/g,`' + "'" + '`' + "'" + `).replace(/` + '``' + '`\n?/g,`' + "'" + '`' + "'" + `).trim(); return JSON.parse(c).titulo_personalizado || 'Diagnostico de Oportunidades em IA'; } catch(e) { return 'Diagnostico de Oportunidades em IA'; } })() }}"
        type = "string"
    }
    Write-Host "Campos novos preparados" -ForegroundColor Green
}

Write-Host "`nNota: Mantenha os 3 campos originais (diagnostico, oportunidades, por_onde_comecar)" -ForegroundColor Yellow
Write-Host "Os campos novos (titulo_personalizado, resumo_executivo, custo_inacao) precisam ser adicionados manualmente no n8n" -ForegroundColor Yellow
Write-Host "OU o PDF template precisa ser atualizado para usar esses campos" -ForegroundColor Yellow
