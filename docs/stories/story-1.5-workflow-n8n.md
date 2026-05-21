# Story 1.5 — Workflow n8n: Supabase + WhatsApp + Notificações Internas
**Status:** ✅ CONCLUÍDO — E2E validado em 21/05/2026  
**Sprint:** 1  
**Estimativa:** 45 minutos  
**Agente:** @dev (executado via REST API — não manual)  
**PRD Ref:** FR-06, FR-07, Seção 10 (Schema Supabase), Seção 11 (Webhook), Seção 9 (Notificações Internas)  
**Arch Ref:** Seção 4 — Arquitetura do n8n, Seção 5 — Schema Supabase  
**Depende de:** Story 1.3 ✅ (payload definido)  
**Pode rodar em paralelo com:** Story 1.4  

> **Por que esta story existe:** Identificada pelo @po durante validação — nenhuma story anterior cobria a criação do workflow n8n. Sem ele, o teste end-to-end da Story 1.4 (CA-1.4.6) não pode ser concluído.

---

## Execução Realizada (por @dev via REST API)

### Supabase
- **Projeto:** `twyuozsqiojtbwhfhxme`
- **Tabela:** `leads` criada via Management API com 25 colunas
- **RLS:** habilitado + policy `service_role_full_access`
- **Índices:** `idx_leads_trilha`, `idx_leads_created_at`, `idx_leads_whatsapp`, `idx_leads_score`

### n8n
- **URL:** `https://skiante-dev.iaeo.com.br`
- **Workflow:** `quiz-diagnostico-iaeo` — ID: `sYG25wkMr9JOAVWD`
- **Status:** ✅ ATIVO — E2E validado (lead inserido no Supabase + WhatsApp recebido)

---

## User Story

**Como** equipe IAEO,  
**Quero** que cada lead capturado seja automaticamente salvo no Supabase e notificado por WhatsApp,  
**Para que** nenhum lead seja perdido e o time comercial seja alertado instantaneamente.

---

## Acesso

- Painel n8n: `https://skiante-dev.iaeo.com.br` (credenciais com Thiago)
- Painel Supabase: dashboard do projeto IAEO (`twyuozsqiojtbwhfhxme`)

---

## Parte 1 — Tabela Supabase ✅ CONCLUÍDA

Executado via Management API. Para referência, o SQL equivalente:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  nome          TEXT        NOT NULL,
  whatsapp      TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  empresa       TEXT        NOT NULL,
  cargo         TEXT        NOT NULL,
  q1_faturamento    TEXT,
  q2_funcionarios   TEXT,
  q3_cargo          TEXT,
  q4_setor          TEXT,
  q5_dor            TEXT,
  q6_experiencia_ia TEXT,
  q7_sistemas       TEXT,
  q8_decisao        TEXT,
  q9_urgencia       TEXT,
  q10_investimento  TEXT,
  score   INTEGER NOT NULL CHECK (score >= 0 AND score <= 190),
  trilha  TEXT    NOT NULL CHECK (trilha IN ('A', 'B', 'C')),
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  referrer     TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_trilha      ON public.leads (trilha);
CREATE INDEX IF NOT EXISTS idx_leads_created_at  ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp    ON public.leads (whatsapp);
CREATE INDEX IF NOT EXISTS idx_leads_score       ON public.leads (score DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON public.leads
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Parte 2 — Workflow n8n ✅ ATIVO

### Nome do workflow: `quiz-diagnostico-iaeo` — ID: `sYG25wkMr9JOAVWD`

### Credenciais e configurações ativas:

| Parâmetro | Valor |
|---|---|
| Evolution API URL | `https://skiante-wpp.iaeo.com.br` |
| Evolution API Key | `[REDACTED — configurado no n8n]` |
| Evolution Instância | `imersaorafa` |
| Supabase URL | `https://twyuozsqiojtbwhfhxme.supabase.co/rest/v1/leads` |
| Supabase Key | `[REDACTED — configurado no n8n]` |
| WhatsApp interno (Rafa) | `554137989777` |

> **Nota de segurança:** As credenciais acima ficam **exclusivamente nos nós do n8n**. ZERO referência no frontend.

### Arquitetura dos nós (implementação real — 8 nós):

1. **Webhook Quiz** — `POST /Imersaodesenvolvi` — recebe payload do quiz
2. **Normalizar Dados** (Set, typeVersion 3.4) — extrai os 23 campos de `$json.body.campo`
3. **Salvar Lead Supabase** — HTTP Request POST para REST API do Supabase (specifyBody: keypair)
4. **WhatsApp ao Lead** — HTTP Request POST para Evolution API (instância `imersaorafa`)
5. **IF Trilha A** — `$('Normalizar Dados').item.json.trilha === 'A'`
6. **IF Trilha B** — `$('Normalizar Dados').item.json.trilha === 'B'`
7. **IF Trilha C** — `$('Normalizar Dados').item.json.trilha === 'C'`
8. **Notif Interna** — HTTP Request POST para Evolution API com mensagem formatada por trilha

> **Nota técnica:** Esta instalação do n8n não suporta Switch typeVersion 3. O roteamento é feito com 3 nós IF em cadeia (typeVersion 2). O nó Supabase nativo também apresentou incompatibilidade — substituído por HTTP Request direto para a REST API do Supabase com headers `apikey` + `Authorization: Bearer`.

### Expressões críticas:

- **Set node** → usa `$json.body.campo` (webhook wraps POST body em `.body`)
- **Supabase node** → usa `$json.campo` (direto do output do Set)
- **Evolution/IF nodes** → usa `$('Normalizar Dados').item.json.campo` (referência cruzada)

---

## Critérios de Aceitação

### CA-1.5.1 — Tabela Supabase
- [x] Tabela `leads` existe no Supabase com todas as colunas do schema
- [x] RLS habilitado com policy `service_role_full_access`
- [x] Índices criados (trilha, created_at, whatsapp, score)
- [x] Inserção validada via E2E — lead "Thiago Skiante TESTE FINAL" inserido

### CA-1.5.2 — Workflow n8n ativo
- [x] Workflow `quiz-diagnostico-iaeo` criado (ID: `sYG25wkMr9JOAVWD`)
- [x] Webhook path `/Imersaodesenvolvi` configurado
- [x] Todos os 8 nós conectados na sequência correta
- [x] Workflow ATIVADO (toggle ON) — funcionando

### CA-1.5.3 — Teste de integração E2E ✅ VALIDADO em 21/05/2026
- [x] Payload enviado via webhook processado com sucesso
- [x] Linha inserida no Supabase com todos os campos corretos
- [x] WhatsApp do lead (`554137989777`) recebeu mensagem de confirmação
- [x] Notificação interna (Trilha A) recebida por Rafa com: Nome, Empresa, Score, Setor, WhatsApp

### CA-1.5.4 — Credenciais configuradas nos nós
- [x] Evolution API Key hardcoded nos nós HTTP Request da Evolution
- [x] Supabase Key hardcoded nos nós HTTP Request do Supabase
- [x] ZERO chaves expostas no frontend

---

## Payload de Teste (referência)

```json
{
  "nome": "Thiago Skiante TESTE FINAL",
  "whatsapp": "554137989777",
  "email": "teste@iaeo.com",
  "empresa": "Skiante Dev",
  "cargo": "CEO",
  "score": 170,
  "trilha": "A",
  "q1_faturamento": "De R$ 100k a R$ 500k/mês",
  "q2_funcionarios": "11 a 50",
  "q3_cargo": "Sou o dono ou sócio",
  "q4_setor": "Tech",
  "q5_dor": "Vendas e qualificação de leads",
  "q6_experiencia_ia": "Contratamos alguém, ficou no meio do caminho",
  "q7_sistemas": "Sim, mas mal aproveitado",
  "q8_decisao": "Relatórios manuais semanais",
  "q9_urgencia": "Já comecei a buscar, é urgente",
  "q10_investimento": "R$ 20k a R$ 60k",
  "utm_source": null,
  "utm_medium": null,
  "utm_campaign": null,
  "referrer": null,
  "user_agent": "Mozilla/5.0 teste"
}
```

---

## Definição de Pronto (DoD)

- [x] Tabela `leads` criada no Supabase
- [x] Workflow criado e ativo no n8n
- [x] Supabase Table Editor mostra linha do teste inserida corretamente
- [x] WhatsApp de teste recebido no número do lead
- [x] Notificação interna recebida por Rafa (WhatsApp `554137989777`)
- [x] Todos os 6 nós com status `success` na execução E2E

---

*Story executada por @dev (IAEO Framework) via REST API — não requer configuração manual*  
*Supabase executado: 2026-05-21 via Management API*  
*n8n executado: 2026-05-21 via REST API (API Key JWT)*  
*E2E validado: 2026-05-21 — workflow ID `sYG25wkMr9JOAVWD`*  
*Documentação atualizada por @po (Pax) em 21/05/2026 — reflete implementação real*  
*Rastreamento: PRD FR-06 + FR-07 + Seção 10 + Seção 11 + ARCH Seção 4 + Seção 5*
