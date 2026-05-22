# 🛠️ Guia — n8n Fase 2 (Estado Atual)
> ⚠️ **FASE 2 JÁ ESTÁ CONFIGURADA E FUNCIONANDO.** Este guia é referência histórica.
> Para ver o status atual, consulte `STATUS-FASE2.md`.

---

## Workflows Ativos

| Workflow | ID | URL Webhook |
|----------|----|-------------|
| `quiz-diagnostico-iaeo` | `sYG25wkMr9JOAVWD` | `POST /webhook/Imersaodesenvolvi` |
| `quiz-intencao-compra` | `hyg6H1jUs8jO9j1k` | `POST /webhook/intencao-caminho` |

---

## Credenciais Configuradas

### OpenAI
- Nome no n8n: `OpenAi account`
- ID: `JhKyov4EA6lu2qIq`
- Modelo: `gpt-4o`, temperatura 0.7, max 1500 tokens, responseFormat: json_object

### PDFMonkey
- Template ID: `7437C9F4-94C8-4985-ACEB-D90BAC8D2A50`
- API Key: configurada no nó (Bearer header)

---

## Estrutura de Nós — quiz-diagnostico-iaeo (22 nós)

### Nó 1 — Webhook Quiz
- POST `/webhook/Imersaodesenvolvi`
- Recebe payload completo do frontend incluindo `q11_contexto`

### Nó 2 — Normalizar Dados
- Set node com 24 campos
- Inclui `q11_contexto` mapeado de `$json.body.q11_contexto`

### Nó 3 — Salvar Lead Supabase
- POST `https://twyuozsqiojtbwhfhxme.supabase.co/rest/v1/leads`
- Salva todos os campos incluindo `q11_contexto`

### Nó 4 — GPT-4o Relatório
- Tipo: `@n8n/n8n-nodes-langchain.openAi` (typeVersion 1.8)
- Credential: `OpenAi account` (ID: JhKyov4EA6lu2qIq)
- System prompt: contexto completo da IAEO + posicionamento Diagnóstico de Viabilidade
- User message: prefixado com `=` para interpolação das expressões n8n

### Nó 5 — Parsear GPT Output ⭐ (novo — adicionado no QA)
- Tipo: Set node
- Extrai `diagnostico`, `oportunidades`, `por_onde_comecar` do `$json.message.content`
- Faz JSON.parse com limpeza de markdown (remove ```json e ```)

### Nó 6 — IF JSON GPT Válido
- Checa: `diagnostico` notEmpty + `oportunidades.length > 0` + `por_onde_comecar` notEmpty
- typeValidation: loose
- true → Nó 5a | false → Fallback GPT

### Nó 7 — Fallback GPT
- Set node com conteúdo fixo caso GPT falhe
- Saída → mesmo Nó 5a

### Nó 8 — Nó 5a - Criar PDF
- POST `https://api.pdfmonkey.io/api/v1/documents`
- Body: `JSON.stringify({document: { payload: JSON.stringify({...dados...}) }})` como expressão n8n
- ⚠️ payload deve ser STRING JSON (JSON.stringify aninhado)

### Nó 9 — Nó 5b - Disparar PDF
- PATCH `https://api.pdfmonkey.io/api/v1/documents/{{ $json.document.id }}`
- Body: `{"document": {"status": "pending"}}`
- ⚠️ OBRIGATÓRIO — sem este nó o PDF não é gerado

### Nó 10 — Wait 12s
- Aguarda 12 segundos fixos

### Nó 11 — Nó GET PDF URL
- GET `https://api.pdfmonkey.io/api/v1/documents/{{ $('Nó 5a - Criar PDF').item.json.document.id }}`

### Nó 12 — IF PDF Gerado
- Checa: `$json.document.download_url` notEmpty
- true → Nó Atualizar PDF URL | false → Nó PDF URL Null

### Nó 13 — Nó Atualizar PDF URL
- PATCH Supabase leads com `pdf_url`
- Query: `whatsapp=eq.{{ whatsapp }}` + `created_at=gte.{{ agora - 5min }}`

### Nó 14 — Nó PDF URL Null
- PATCH Supabase leads com `pdf_url: null`

### Nó 15 — WhatsApp ao Lead
- POST `sendText/imersaorafa`
- Mensagem pessoal do Rafa

### Nó 16 — IF Tem PDF para Enviar ⭐ (corrigido no QA)
- Checa: `$('Nó GET PDF URL').item.json.document.download_url` notEmpty
- ⚠️ NÃO checa o output do Supabase (retorna `{}` com return=minimal)

### Nó 17 — WhatsApp Enviar PDF
- POST `sendMedia/imersaorafa`
- mediatype: document, mimetype: application/pdf

### Nós 18-22 — Roteamento Trilhas A/B/C
- Notificações internas para 554137989777

---

## Workflow quiz-intencao-compra (3 nós)

### Nó 1 — Webhook Intenção
- POST `/webhook/intencao-caminho`
- Recebe: nome, whatsapp, email, empresa, score, trilha

### Nó 2 — Registrar Intenção Supabase
- PATCH leads com `caminho_escolhido: 'caminho1'`
- Query: whatsapp + created_at gte 30min atrás

### Nó 3 — Notificar Thiago
- sendText para 554137989777
- Mensagem: 🔥 INTENÇÃO DE COMPRA com dados do lead

---

## Lições Aprendidas (QA 21/05/2026)

1. **Nó OpenAI n8n** retorna `{message: {content: "..."}}` — nunca diretamente os campos
2. **Campos com expressões n8n** precisam do `=` no início do campo para interpolação funcionar
3. **Supabase com `Prefer: return=minimal`** retorna body vazio `{}` — não usar output para checar valores
4. **PDFMonkey payload** deve ser construído com `JSON.stringify` aninhado para escapar caracteres especiais do GPT
5. **IF com array** — usar `.length > 0` com `typeValidation: loose`, não `notEmpty` com tipo string
