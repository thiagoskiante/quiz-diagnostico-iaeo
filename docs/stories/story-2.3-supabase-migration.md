# Story 2.3 — Supabase: Migration — 3 Novas Colunas + Índices
**Status:** 🔲 Pendente  
**Sprint:** 2  
**Estimativa:** 30 minutos  
**Agente:** @dev  
**PRD Ref:** Seção 8 — Schema do Banco de Dados  
**Arch Ref:** Seção 5 — Arquitetura do Banco de Dados — Fase 2  
**Depende de:** Story 1.5 ✅ (tabela leads existente no Supabase)  
**Pode rodar em paralelo com:** Story 2.1, Story 2.2

---

## User Story

**Como** time IAEO,  
**Quero** que a tabela `leads` armazene o contexto qualitativo do lead (Q11), a intenção de compra e a URL do PDF gerado,  
**Para que** possamos personalizar o diagnóstico via IA e analisar conversão futuramente.

---

## Contexto para o @dev

A tabela `leads` já existe no Supabase (projeto `twyuozsqiojtbwhfhxme`) com 25 colunas criadas na Fase 1 (Story 1.5). Esta story apenas **adiciona 3 novas colunas** e **2 novos índices** — sem modificar nada existente.

**Acesso ao Supabase:**
- Dashboard: https://supabase.com/dashboard/project/twyuozsqiojtbwhfhxme
- SQL Editor: disponível no painel do projeto
- Credenciais: com Thiago (não colocar no código)

**IMPORTANTE:** Executar via SQL Editor do painel Supabase — não via código ou arquivo de migration local.

---

## Critérios de Aceitação

### CA-2.3.1 — Novas colunas adicionadas
- [ ] Coluna `q11_contexto TEXT` adicionada (nullable — leads da Fase 1 não têm Q11)
- [ ] Coluna `caminho_escolhido TEXT` adicionada com CHECK constraint: `caminho_escolhido IN ('caminho1', 'caminho2')`
- [ ] Coluna `pdf_url TEXT` adicionada (nullable — inicialmente null até PDF ser gerado)
- [ ] Nenhuma coluna existente foi alterada ou removida

**SQL a executar no Supabase SQL Editor:**
```sql
-- Migration: fase2_additions
-- Data: 2026-05-21
-- Sprint 2 — Fase 2

-- 1. Novas colunas na tabela leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS q11_contexto      TEXT,
  ADD COLUMN IF NOT EXISTS caminho_escolhido TEXT 
    CHECK (caminho_escolhido IN ('caminho1', 'caminho2')),
  ADD COLUMN IF NOT EXISTS pdf_url           TEXT;

-- 2. Índice para análise de intenção de compra
CREATE INDEX IF NOT EXISTS idx_leads_caminho 
  ON public.leads (caminho_escolhido)
  WHERE caminho_escolhido IS NOT NULL;

-- 3. Índice para busca por WhatsApp + data (usado pelo UPDATE do workflow intenção)
CREATE INDEX IF NOT EXISTS idx_leads_wpp_date
  ON public.leads (whatsapp, created_at DESC);
```

### CA-2.3.2 — Verificação pós-migration
- [ ] Executar a query de verificação abaixo e confirmar que as 3 colunas aparecem

**SQL de verificação:**
```sql
-- Verificar colunas criadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND column_name IN ('q11_contexto', 'caminho_escolhido', 'pdf_url')
ORDER BY column_name;

-- Resultado esperado:
-- caminho_escolhido | text | YES
-- pdf_url           | text | YES
-- q11_contexto      | text | YES
```

### CA-2.3.3 — Índices criados
- [ ] Índice `idx_leads_caminho` existe na tabela leads
- [ ] Índice `idx_leads_wpp_date` existe na tabela leads

**SQL de verificação de índices:**
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'leads'
  AND indexname IN ('idx_leads_caminho', 'idx_leads_wpp_date');
```

### CA-2.3.4 — Backward compatibility
- [ ] Inserir um lead de teste via SQL e confirmar que os campos existentes (nome, whatsapp, score, trilha, etc.) continuam funcionando
- [ ] Os 3 novos campos aceitam NULL (leads da Fase 1 sem Q11 não quebram)

**SQL de teste de inserção:**
```sql
-- Teste rápido: inserir com campos novos null (simula lead da Fase 1)
INSERT INTO public.leads (nome, whatsapp, email, empresa, cargo, score, trilha)
VALUES ('Teste Migration F2', '554100000000', 'teste@f2.com', 'Test Co', 'CEO', 100, 'B')
RETURNING id, nome, q11_contexto, caminho_escolhido, pdf_url;

-- Resultado esperado: linha inserida com q11_contexto=NULL, caminho_escolhido=NULL, pdf_url=NULL

-- Limpar após teste
DELETE FROM public.leads WHERE email = 'teste@f2.com';
```

---

## Dev Notes

- Usar `ADD COLUMN IF NOT EXISTS` para idempotência — pode rodar mais de uma vez sem erro
- A constraint CHECK em `caminho_escolhido` só valida valores não-null; NULL é permitido
- Os índices usam `IF NOT EXISTS` — safe para re-executar
- **Não alterar** RLS policies existentes — a policy `service_role_full_access` já cobre as novas colunas automaticamente
- Projeto Supabase: `twyuozsqiojtbwhfhxme`

---

## Definição de Pronto (DoD)

- [ ] SQL de migration executado com sucesso no Supabase SQL Editor
- [ ] 3 novas colunas visíveis no Table Editor do Supabase
- [ ] 2 novos índices confirmados
- [ ] Query de verificação retorna as 3 colunas
- [ ] Teste de inserção com campos novos null: sucesso
- [ ] Nenhuma coluna ou dado existente foi alterado

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Baseada em: PRD-quiz-diagnostico-iaeo-fase2.md Seção 8 + ARCH Seção 5*  
*Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO*
