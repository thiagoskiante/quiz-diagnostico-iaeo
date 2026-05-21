# Story 2.5 — n8n: Geração de PDF (PDFMonkey) + Salvar URL no Supabase
**Status:** 🔲 Pendente  
**Sprint:** 2  
**Estimativa:** 2–3 horas  
**Agente:** @dev  
**PRD Ref:** FR-05, Seção 9  
**Arch Ref:** Seção 4 — Nós [5] e [6] + Seção 6 — PDFMonkey  
**Depende de:** Story 2.3 ✅ (coluna pdf_url existe no Supabase), Story 2.4 ✅ (GPT-4o gera JSON)  
**Requer ação de Thiago:** ✅ CONCLUÍDO — Conta criada, template criado, credenciais fornecidas

---

## User Story

**Como** lead que preencheu o quiz,  
**Quero** receber no WhatsApp um PDF com diagnóstico personalizado da minha operação,  
**Para que** eu veja valor concreto antes de qualquer contato comercial.

---

## Contexto para o @dev

Esta é a story mais complexa da Fase 2. Ela conecta o conteúdo gerado pelo GPT-4o (Story 2.4) com o serviço PDFMonkey para gerar um PDF real, e depois salva a URL do PDF no Supabase.

**Pré-requisito humano (Thiago deve fazer antes desta story):**
1. Criar conta em https://pdfmonkey.io
2. Criar template "relatorio-oportunidade-iaeo" no painel PDFMonkey com o HTML da ARCH Seção 6
3. Anotar: Template ID e API Key do PDFMonkey

**Fluxo desta story:**
```
[4] GPT-4o retorna JSON → [5] PDFMonkey gera PDF → retorna URL → [6] Supabase UPDATE pdf_url
```

**Fallback (se PDFMonkey falhar):**
```
[5] PDFMonkey erro → [5b IF] detecta → [6b] Supabase UPDATE pdf_url = null → continua sem PDF
```

---

## Critérios de Aceitação

### CA-2.5.1 — Template PDFMonkey criado (ação de Thiago) ✅ CONCLUÍDO
- [x] Conta PDFMonkey criada em https://pdfmonkey.io (login: thiago@iaeo.com.br)
- [ ] Template "relatorio-oportunidade-iaeo" criado com o HTML/CSS da Seção 6 da ARCH
- [ ] Template tem as variáveis Handlebars: `{{empresa}}`, `{{nome}}`, `{{data}}`, `{{logo_url}}`, `{{diagnostico}}`, `{{oportunidades}}` (array), `{{por_onde_comecar}}`, `{{whatsapp_rafa}}`, `{{kiwify_url}}`
- [x] Template ID: `7437C9F4-94C8-4985-ACEB-D90BAC8D2A50` — configurar no n8n como `PDFMONKEY_TEMPLATE_ID`
- [x] API Key fornecida — configurar no n8n como `PDFMONKEY_API_KEY` (credencial já com Thiago)

**HTML do template (referência na ARCH Seção 6) — estrutura mínima:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; background: #fff; color: #1a1a1a; }
    .pagina { padding: 48px; min-height: 100vh; page-break-after: always; }
    .capa { background: #0D0D0D; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .capa h1 { font-size: 2.5rem; color: #6C3FE8; margin-bottom: 8px; }
    .capa h2 { font-size: 1.2rem; color: #00D4AA; }
    .capa .empresa { font-size: 1.4rem; font-weight: bold; margin-top: 32px; }
    h2 { color: #6C3FE8; border-bottom: 2px solid #6C3FE8; padding-bottom: 8px; }
    ul li { margin-bottom: 12px; line-height: 1.6; }
    .rodape { font-size: 0.75rem; color: #888; border-top: 1px solid #eee; padding-top: 12px; margin-top: 32px; }
    .caminho { border: 2px solid #6C3FE8; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
    .caminho h3 { color: #6C3FE8; margin-top: 0; }
  </style>
</head>
<body>
  <!-- CAPA -->
  <div class="pagina capa">
    <img src="{{logo_url}}" alt="IAEO" style="height: 60px; margin-bottom: 32px;">
    <h1>Relatório de Oportunidade</h1>
    <h2>Diagnóstico de Maturidade em IA</h2>
    <p class="empresa">{{empresa}}</p>
    <p style="color: #aaa;">Preparado em {{data}}</p>
  </div>

  <!-- PÁGINA 1 — O que é este relatório (FIXA) -->
  <div class="pagina">
    <h2>O que é este relatório</h2>
    <p>Este relatório foi gerado automaticamente com base nas suas respostas ao Quiz Diagnóstico IAEO. Ele representa uma análise inicial do potencial de aplicação de Inteligência Artificial na sua operação. Não é um diagnóstico completo — é um ponto de partida para identificar onde a IA pode gerar resultado real no seu negócio.</p>
    <p>Olá, <strong>{{nome}}</strong>! Preparamos este material especialmente com base no que você nos contou sobre sua empresa.</p>
    <div class="rodape">IAEO — Inteligência Artificial com Método e Resultado</div>
  </div>

  <!-- PÁGINA 2 — Diagnóstico (GERADO PELA IA) -->
  <div class="pagina">
    <h2>Diagnóstico da sua operação</h2>
    <p>{{diagnostico}}</p>
    <div class="rodape">IAEO — Inteligência Artificial com Método e Resultado</div>
  </div>

  <!-- PÁGINA 3 — Oportunidades (GERADO PELA IA) -->
  <div class="pagina">
    <h2>Onde a IA pode gerar resultado</h2>
    <ul>
      {{#each oportunidades}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
    <div class="rodape">IAEO — Inteligência Artificial com Método e Resultado</div>
  </div>

  <!-- PÁGINA 4 — Por onde começar (GERADO PELA IA) -->
  <div class="pagina">
    <h2>Por onde começar</h2>
    <p>{{por_onde_comecar}}</p>
    <div class="rodape">IAEO — Inteligência Artificial com Método e Resultado</div>
  </div>

  <!-- PÁGINA 5 — Próximo passo (FIXA) -->
  <div class="pagina">
    <h2>Próximo passo</h2>
    <div class="caminho">
      <h3>🤝 Diagnóstico IAEO</h3>
      <p>Nosso time faz o estudo de viabilidade completo — identificamos por onde começar, qual processo tem menor complexidade e maior ROI.</p>
      <p><strong>A partir de R$ 3.000</strong></p>
      <p>WhatsApp: <strong>{{whatsapp_rafa}}</strong></p>
    </div>
    <div class="caminho" style="border-color: #00D4AA;">
      <h3>🧭 Auto-Diagnóstico</h3>
      <p>Faça por conta própria com nosso guia completo.</p>
      <p><strong>R$ 97</strong> — <a href="{{kiwify_url}}">Acessar agora</a></p>
    </div>
    <div class="rodape">© IAEO — Inteligência Artificial com Método e Resultado | diagnostico.thiagoskiante.com.br</div>
  </div>
</body>
</html>
```

### CA-2.5.2 — Credenciais PDFMonkey configuradas no n8n
- [ ] `PDFMONKEY_API_KEY` configurada no n8n (Settings → Environment Variables) — valor com Thiago
- [ ] `PDFMONKEY_TEMPLATE_ID` configurada no n8n — valor: `7437C9F4-94C8-4985-ACEB-D90BAC8D2A50`
- [ ] Credenciais NUNCA expostas no frontend ou em arquivos commitados

### CA-2.5.3 — Nós [5a] e [5b] HTTP Request (PDFMonkey) adicionados ao workflow

> ⚠️ **DESCOBERTO NO TESTE:** PDFMonkey exige 2 chamadas para gerar PDF:
> - **[5a] POST** → cria documento em `draft`, retorna `id`
> - **[5b] PATCH** com `status: "pending"` → dispara a geração real

### CA-2.5.3a — Nó [5a] POST criar documento
- [ ] Nó HTTP Request adicionado após o nó OpenAI (ou após o nó de fallback [4b])
- [ ] Method: `POST`
- [ ] URL: `https://api.pdfmonkey.io/api/v1/documents`
- [ ] Header: `Authorization: Bearer {{$env.PDFMONKEY_API_KEY}}`
- [ ] Header: `Content-Type: application/json`
- [ ] Body (JSON) — **`payload` deve ser string JSON, não objeto; `meta` deve ser `"{}"`:**
```json
{
  "document": {
    "document_template_id": "7437C9F4-94C8-4985-ACEB-D90BAC8D2A50",
    "payload": "{ \"empresa\": \"{{ $('Normalizar Dados').item.json.empresa }}\", \"nome\": \"{{ $('Normalizar Dados').item.json.nome }}\", \"data\": \"{{ $now.format('DD [de] MMMM [de] YYYY') }}\", \"logo_url\": \"https://diagnostico.thiagoskiante.com.br/assets/logo-iaeo.png\", \"diagnostico\": \"{{ $json.diagnostico }}\", \"oportunidades\": {{ $json.oportunidades }}, \"por_onde_comecar\": \"{{ $json.por_onde_comecar }}\", \"whatsapp_rafa\": \"41 99999-9999\", \"kiwify_url\": \"https://pay.kiwify.com.br/fJCNgjy\" }",
    "meta": "{}"
  }
}
```
- [ ] Response esperada: `{ "document": { "id": "...", "status": "draft" } }` — `download_url` ainda vazio neste momento

### CA-2.5.3b — Nó [5b] PATCH disparar geração
> ⚠️ **OBRIGATÓRIO:** PDFMonkey não gera o PDF automaticamente no POST. É necessário um segundo PATCH com `status: "pending"`.

- [ ] Nó HTTP Request [5b] adicionado após o [5a]
- [ ] Method: `PATCH`
- [ ] URL: `https://api.pdfmonkey.io/api/v1/documents/{{ $json.document.id }}`
- [ ] Header: `Authorization: Bearer {{$env.PDFMONKEY_API_KEY}}`
- [ ] Header: `Content-Type: application/json`
- [ ] Body: `{ "document": { "status": "pending" } }`
- [ ] Response: `status: "pending"` — geração iniciada

### CA-2.5.4 — Aguardar geração + GET URL final
> **Testado e validado:** PDF gerado em ~12 segundos após o PATCH.

- [ ] Nó Wait de **12 segundos** adicionado após o [5b]
- [ ] Nó HTTP Request GET adicionado após o Wait:
  - URL: `https://api.pdfmonkey.io/api/v1/documents/{{ $('Nó 5a - Criar PDF').item.json.document.id }}`
  - Header: `Authorization: Bearer {{$env.PDFMONKEY_API_KEY}}`
- [ ] Response esperada: `{ "document": { "status": "success", "download_url": "https://pdfmonkey-store.s3..." } }`
- [ ] Extrair `download_url` do campo `document.download_url`

### CA-2.5.5 — Nó IF para fallback do PDFMonkey
- [ ] Nó IF adicionado após o GET de status
- [ ] Verifica se `download_url` está presente e não é null/vazio
- [ ] Branch "true" (PDF gerado): conecta ao nó [6] Supabase UPDATE
- [ ] Branch "false" (falha): conecta ao nó [6b] que seta `pdf_url = null` e segue para WhatsApp sem PDF

### CA-2.5.6 — Nó [6] Supabase UPDATE pdf_url
- [ ] Nó HTTP Request adicionado (PATCH para Supabase REST API)
- [ ] URL: `https://twyuozsqiojtbwhfhxme.supabase.co/rest/v1/leads?whatsapp=eq.{{whatsapp}}&created_at=gte.{{5_min_ago}}`
- [ ] Method: `PATCH`
- [ ] Headers: `apikey`, `Authorization: Bearer`, `Content-Type: application/json`, `Prefer: return=minimal`
- [ ] Body: `{ "pdf_url": "{{download_url}}" }`

**Query correta para o PATCH (usando WhatsApp + janela de 5 min):**
```
URL: https://twyuozsqiojtbwhfhxme.supabase.co/rest/v1/leads
Query params:
  whatsapp=eq.{{ $('Normalizar Dados').item.json.whatsapp }}
  created_at=gte.{{ $now.minus(5, 'minutes').toISO() }}
```

### CA-2.5.7 — Teste de geração E2E
- [ ] Executar workflow manualmente com payload de teste (incluindo q11_contexto)
- [ ] GPT-4o retorna JSON com 3 seções
- [ ] PDFMonkey recebe o payload e retorna ID do documento
- [ ] Após 8 segundos, GET retorna `download_url` com URL válida
- [ ] URL do PDF é acessível no browser (abre PDF)
- [ ] PDF tem ≤ 5MB (verificar no browser ao abrir)
- [ ] `pdf_url` atualizada no Supabase Table Editor

---

## Dev Notes

- PDFMonkey pode ter latência variável (3–15s). O Wait de 8s é conservador — se necessário aumentar para 12s
- A `download_url` gerada pelo PDFMonkey expira em 7 dias — para MVP isso é aceitável
- Se a logo `logo-iaeo.png` não existir em `assets/`, usar um placeholder por ora — a logo pode ser adicionada depois
- **Verificar nome do nó OpenAI** para usar corretamente nas referências `$('Nome do Nó').item.json.campo`
- O `$now` no n8n pode ser `$DateTime.now()` dependendo da versão — verificar

---

## Definição de Pronto (DoD)

- [ ] Template HTML criado e publicado no PDFMonkey (ação de Thiago)
- [ ] Credenciais PDFMonkey configuradas no n8n (não expostas)
- [ ] Nós [5] POST + Wait + GET + [5b IF] + [6] UPDATE funcionando
- [ ] PDF gerado com conteúdo IA acessível via URL válida
- [ ] `pdf_url` salva no Supabase após geração
- [ ] PDF ≤ 5MB e abre corretamente no browser
- [ ] Fallback: se PDFMonkey falhar, fluxo continua (pdf_url = null)

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Baseada em: PRD-quiz-diagnostico-iaeo-fase2.md FR-05 + ARCH Seção 4 [5][6] + Seção 6*  
*Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO*
