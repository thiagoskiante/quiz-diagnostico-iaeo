# Story 2.7 — n8n: Workflow de Intenção de Compra
**Status:** 🔲 Pendente  
**Sprint:** 2  
**Estimativa:** 1 hora  
**Agente:** @dev  
**PRD Ref:** FR-03, Seção 9 (Workflow Intenção de Compra)  
**Arch Ref:** Seção 4 — Workflow Novo `quiz-intencao-compra`  
**Depende de:** Story 2.3 ✅ (coluna `caminho_escolhido` existe), Story 2.2 ✅ (frontend dispara o POST)  
**Pode rodar em paralelo com:** Story 2.5, Story 2.6

---

## User Story

**Como** time comercial da IAEO,  
**Quero** receber uma notificação prioritária imediatamente quando um lead clica em "Quero o Diagnóstico IAEO",  
**Para que** possamos entrar em contato enquanto o interesse está quente — não horas depois.

---

## Contexto para o @dev

Esta story cria um **segundo workflow n8n** completamente novo — independente do workflow principal. Ele processa o POST #2 disparado pelo frontend (Story 2.2) quando o lead clica no botão Caminho 1.

**Workflow a criar:**
- **Nome:** `quiz-intencao-compra`
- **Webhook path:** `/intencao-caminho`
- **Nós:** 3 nós (Webhook → Supabase UPDATE → Notificação WhatsApp)

**Diferença do workflow principal:** Este é minúsculo (3 nós) e rápido (~2s). Não gera PDF, não envia PDF. Apenas registra a intenção e alerta o atendente.

---

## Critérios de Aceitação

### CA-2.7.1 — Novo workflow criado no n8n
- [ ] Workflow `quiz-intencao-compra` criado no painel n8n
- [ ] Workflow ATIVADO (toggle ON)
- [ ] Webhook configurado como trigger principal

### CA-2.7.2 — Nó [1] Webhook
- [ ] Tipo: Webhook
- [ ] HTTP Method: POST
- [ ] Path: `intencao-caminho`
- [ ] URL resultante: `https://skiante-dev.iaeo.com.br/webhook/intencao-caminho`
- [ ] Modo: Production (não Test)

**Payload esperado (vindo do frontend):**
```json
{
  "nome": "string",
  "whatsapp": "string",
  "email": "string",
  "empresa": "string",
  "score": "number",
  "trilha": "string (A|B|C)",
  "acao": "caminho1_clicado",
  "timestamp": "ISO8601 string"
}
```

### CA-2.7.3 — Nó [2] Supabase UPDATE caminho_escolhido
- [ ] Nó HTTP Request (PATCH para Supabase REST API)
- [ ] Atualiza o campo `caminho_escolhido` para `'caminho1'` no lead correspondente
- [ ] Busca o lead pelo WhatsApp + janela de tempo recente

**Request Supabase PATCH:**
```
Method: PATCH
URL: https://twyuozsqiojtbwhfhxme.supabase.co/rest/v1/leads
Query params:
  whatsapp=eq.{{ $json.body.whatsapp }}
  created_at=gte.{{ $now.minus(30, 'minutes').toISO() }}
Headers:
  apikey: [Supabase Service Key — configurada no n8n]
  Authorization: Bearer [Supabase Service Key]
  Content-Type: application/json
  Prefer: return=minimal
Body:
  { "caminho_escolhido": "caminho1" }
```
> ⚠️ Usar janela de 30 minutos (em vez de 5 min do workflow principal) — o lead pode demorar mais para clicar no Caminho 1 após ver o resultado.

### CA-2.7.4 — Nó [3] Notificação Prioritária WhatsApp
- [ ] Nó HTTP Request (Evolution API sendText)
- [ ] Envia mensagem de alerta para o número do Rafa/Thiago
- [ ] Mensagem inclui: nome, empresa, score, trilha, WhatsApp do lead
- [ ] Mensagem formatada como urgente

**Request Evolution API (sendText para notificação interna):**
```
POST https://skiante-wpp.iaeo.com.br/message/sendText/imersaorafa

Headers:
  apikey: [Evolution API Key — configurada no n8n]
  Content-Type: application/json

Body:
{
  "number": "554137989777",
  "text": "🔥 INTENÇÃO DE COMPRA\nLead clicou em CAMINHO 1 (Diagnóstico IAEO)\n\nNome: {{ $json.body.nome }}\nEmpresa: {{ $json.body.empresa }}\nScore: {{ $json.body.score }}/190\nTrilha: {{ $json.body.trilha }}\nWhatsApp: {{ $json.body.whatsapp }}\n\nContatar AGORA! ⚡"
}
```
> ⚠️ O número `554137989777` é o WhatsApp interno (Rafa). Verificar com Thiago se este é o número correto para alertas de intenção.

### CA-2.7.5 — Teste funcional
- [ ] Enviar payload de teste via curl ou Postman para `POST https://skiante-dev.iaeo.com.br/webhook/intencao-caminho`
- [ ] Workflow executa sem erros
- [ ] Campo `caminho_escolhido` atualizado para `'caminho1'` no Supabase (verificar no Table Editor)
- [ ] Mensagem de alerta "INTENÇÃO DE COMPRA" recebida no WhatsApp interno (`554137989777`)
- [ ] Workflow principal (`quiz-diagnostico-iaeo`) não foi afetado

**Payload de teste:**
```json
{
  "nome": "Teste Intencao",
  "whatsapp": "554137989777",
  "email": "intencao@teste.com",
  "empresa": "Empresa Teste",
  "score": 160,
  "trilha": "A",
  "acao": "caminho1_clicado",
  "timestamp": "2026-05-21T12:00:00.000Z"
}
```
> ⚠️ Para este teste funcionar, deve existir um lead com whatsapp `554137989777` inserido nos últimos 30 minutos no Supabase. Inserir um antes de testar.

---

## Dev Notes

- Este workflow é **independente** — pode ser criado, ativado e testado sem afetar o workflow principal
- A janela de 30 minutos no PATCH é generosa porque o lead pode demorar para clicar no Caminho 1 após ver o resultado
- Se o mesmo lead clicar em Caminho 1 múltiplas vezes, o campo `caminho_escolhido` será atualizado para `'caminho1'` repetidamente — comportamento correto para MVP
- O número `554137989777` está hardcoded na notificação — confirmar com Thiago se é o número correto para alertas de intenção de compra
- **Credenciais:** Mesmas do workflow principal (Supabase Key e Evolution API Key já configuradas no n8n)

---

## Definição de Pronto (DoD)

- [ ] Workflow `quiz-intencao-compra` criado e ATIVO no n8n
- [ ] Webhook `/intencao-caminho` respondendo (status 200)
- [ ] Teste: `caminho_escolhido = 'caminho1'` atualizado no Supabase
- [ ] Teste: mensagem de alerta "INTENÇÃO DE COMPRA" recebida no WhatsApp interno
- [ ] Workflow principal intacto (regressão)

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Baseada em: PRD-quiz-diagnostico-iaeo-fase2.md FR-03 + ARCH Seção 4 Workflow Intenção de Compra*  
*Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO*
