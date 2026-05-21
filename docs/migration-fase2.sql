-- ============================================================
-- Migration: fase2_additions
-- Data: 2026-05-21
-- Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO
-- Executar no: Supabase SQL Editor
-- Projeto: twyuozsqiojtbwhfhxme
-- ============================================================

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

-- ============================================================
-- VERIFICAÇÃO (rodar depois da migration)
-- ============================================================

-- Verificar colunas criadas:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'leads'
--   AND column_name IN ('q11_contexto', 'caminho_escolhido', 'pdf_url')
-- ORDER BY column_name;

-- Verificar índices criados:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'leads'
--   AND indexname IN ('idx_leads_caminho', 'idx_leads_wpp_date');
