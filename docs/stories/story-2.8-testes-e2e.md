# Story 2.8 — Testes E2E + Fallbacks + Validação Final da Fase 2
**Status:** 🔲 Pendente  
**Sprint:** 2  
**Estimativa:** 1 hora  
**Agente:** @dev  
**PRD Ref:** Seção 11 — Critérios de Aceitação Globais (DoD)  
**Arch Ref:** Seção 7 — Fluxo Completo + Seção 8 — Tratamento de Erros  
**Depende de:** Stories 2.1–2.7 ✅ (todas implementadas)  
**Bloqueia:** @devops deploy final da Fase 2

---

## User Story

**Como** time IAEO,  
**Quero** validar que toda a Fase 2 funciona de ponta a ponta — do quiz até o PDF no WhatsApp — incluindo os cenários de fallback,  
**Para que** o produto seja lançado com confiança e sem surpresas para os primeiros leads reais.

---

## Contexto para o @dev

Esta é a story de validação final. Todos os componentes das stories 2.1–2.7 devem estar implementados antes de executar os testes desta story. O objetivo é validar o fluxo completo e garantir que os fallbacks funcionam.

**Esta story não implementa código novo** — apenas executa testes e documenta resultados. Se um teste falhar, o bug deve ser corrigido na story correspondente.

**Ambiente de teste:** Produção (https://diagnostico.thiagoskiante.com.br) — este quiz não tem ambiente de staging.

---

## Critérios de Aceitação

### CA-2.8.1 — Teste E2E Fluxo Principal (Caminho Feliz)

**Passos a executar:**
1. Acessar https://diagnostico.thiagoskiante.com.br
2. Clicar em "Iniciar Diagnóstico" (ou similar)
3. Responder as Q1–Q10 (usar respostas de perfil Trilha A — score alto)
4. Verificar: aparece a tela Q11 (campo aberto) após Q10
5. Digitar resposta com menos de 20 caracteres → confirmar que botão fica desabilitado
6. Digitar resposta com 20+ caracteres → confirmar que botão habilita e contador atualiza
7. Clicar "Ver meu diagnóstico →" → confirmar que vai para o formulário de captura
8. Preencher formulário com dados de teste (usar WhatsApp real de teste)
9. Submeter formulário → confirmar que spinner aparece
10. Aguardar até 60 segundos → confirmar que tela de resultado aparece
11. Verificar WhatsApp de teste: mensagem de texto do Rafa recebida
12. Verificar WhatsApp de teste: PDF recebido como documento (não link)
13. Abrir PDF: verificar que tem o nome da empresa, diagnóstico em texto, oportunidades e próximo passo
14. Verificar Supabase Table Editor: lead inserido com `q11_contexto`, `pdf_url` preenchidos

- [ ] Tela Q11 aparece após Q10 ✅
- [ ] Validação de 20 chars funciona ✅
- [ ] Tela de resultado aparece (< 60s após submeter) ✅
- [ ] Mensagem de texto do Rafa recebida no WhatsApp ✅
- [ ] PDF recebido como documento no WhatsApp ✅
- [ ] PDF abre nativamente (não redireciona para browser) ✅
- [ ] PDF tem conteúdo personalizado (nome empresa, setor mencionado) ✅
- [ ] PDF ≤ 5MB ✅
- [ ] Supabase: `q11_contexto` preenchido ✅
- [ ] Supabase: `pdf_url` preenchida com URL válida ✅

### CA-2.8.2 — Teste E2E Intenção de Compra (Caminho 1)

**Passos a executar (continuar do CA-2.8.1):**
1. Na tela de resultado, clicar em "Quero o Diagnóstico IAEO"
2. Verificar: modal de confirmação aparece imediatamente (< 0.5s)
3. Verificar (no Network tab do DevTools): POST disparado para `/intencao-caminho`
4. Aguardar 5 segundos
5. Verificar Supabase: `caminho_escolhido = 'caminho1'` no lead do teste
6. Verificar WhatsApp interno (`554137989777`): mensagem "INTENÇÃO DE COMPRA" recebida

- [ ] Modal aparece imediatamente ao clicar ✅
- [ ] POST para `/intencao-caminho` visível no Network tab ✅
- [ ] Supabase: `caminho_escolhido = 'caminho1'` ✅
- [ ] Notificação "INTENÇÃO DE COMPRA" recebida no WhatsApp interno ✅

### CA-2.8.3 — Teste de Fallback GPT-4o

**Como testar:**
1. No n8n, temporariamente **desconectar** o nó OpenAI (ou configurar com API key inválida)
2. Executar o workflow manualmente com payload de teste
3. Verificar que o IF de fallback detecta o erro
4. Verificar que o fallback usa conteúdo padrão
5. Verificar que o PDF é gerado mesmo assim (com conteúdo padrão)
6. Verificar que o WhatsApp recebe mensagem + PDF (com conteúdo padrão)
7. Restaurar a configuração correta do nó OpenAI após o teste

- [ ] Fallback ativado quando GPT-4o falha ✅
- [ ] PDF gerado com conteúdo padrão (não vazio) ✅
- [ ] Lead recebe PDF no WhatsApp mesmo com GPT-4o fora ✅
- [ ] Supabase: lead inserido corretamente mesmo com fallback ✅

### CA-2.8.4 — Teste de Fallback PDFMonkey

**Como testar:**
1. No n8n, temporariamente configurar o nó PDFMonkey com Template ID inválido
2. Executar o workflow manualmente com payload de teste
3. Verificar que o IF de fallback detecta ausência de `download_url`
4. Verificar que o workflow NÃO crasha
5. Verificar que a mensagem de texto do Rafa é enviada mesmo sem PDF
6. Verificar Supabase: `pdf_url = null` no lead do teste
7. Restaurar configuração correta após o teste

- [ ] Workflow não crasha quando PDFMonkey falha ✅
- [ ] Lead recebe mensagem de texto do Rafa (sem PDF) ✅
- [ ] Supabase: `pdf_url = null` (não fica com valor inválido) ✅
- [ ] Notificação interna de trilha ainda enviada ✅

### CA-2.8.5 — Teste de Timeout Frontend (15s)

**Como testar:**
1. No n8n, adicionar temporariamente um nó Wait de 16 segundos logo após o Webhook
2. Submeter o formulário no quiz (não executar manualmente no n8n)
3. Verificar que o spinner aparece por 15 segundos
4. Verificar que após 15s o quiz exibe a tela de resultado MESMO SEM resposta do n8n
5. Verificar que a mensagem aparece: "Seu diagnóstico está sendo processado. Você receberá no WhatsApp em instantes."
6. Aguardar: o n8n continua processando em background
7. Verificar que o WhatsApp recebe a mensagem + PDF normalmente (mesmo após o timeout do frontend)
8. Remover o nó Wait após o teste

- [ ] Frontend exibe resultado após 15s mesmo sem resposta do n8n ✅
- [ ] Mensagem de "processando" aparece no caso de timeout ✅
- [ ] WhatsApp recebe PDF normalmente mesmo com timeout no frontend ✅

### CA-2.8.6 — Teste de Regressão Fase 1

Confirmar que nada da Fase 1 foi quebrado:

- [ ] Q1–Q10 e lógica de score funcionam (responder o quiz completo) ✅
- [ ] Trilha A (score alto): resultado exibe Caminho 1 ✅
- [ ] Trilha B/C (score médio/baixo): resultado exibe Caminho 2 ✅
- [ ] Cargo = Colaborador: redirect para YouTube ✅
- [ ] Caminho 2 (Kiwify): botão redireciona para https://pay.kiwify.com.br/fJCNgjy ✅
- [ ] Supabase: leads inseridos com todos os campos da Fase 1 preenchidos ✅
- [ ] Notificação interna por trilha (Rafa) ainda funciona ✅

### CA-2.8.7 — Verificação de segurança

- [ ] Abrir DevTools → Sources: ZERO referências a API keys (OpenAI, PDFMonkey, Supabase service key, Evolution API key) no código JS
- [ ] Abrir DevTools → Network: o POST do formulário vai para o n8n, nunca diretamente para OpenAI ou PDFMonkey
- [ ] `vercel.json` sem mudanças vs Fase 1

---

## Checklist de Colunas Supabase (verificação final)

Acessar Supabase Table Editor e confirmar que um lead de teste real da Fase 2 tem:

| Coluna | Esperado |
|--------|---------|
| `q11_contexto` | Texto digitado pelo usuário (não null) |
| `caminho_escolhido` | `'caminho1'` se clicou Caminho 1, null se não clicou |
| `pdf_url` | URL válida do PDF (https://...pdfmonkey.io...) |
| `score` | Número entre 0 e 190 |
| `trilha` | A, B ou C |
| `q1_faturamento` | Texto (preenchido) |
| `q4_setor` | Texto (preenchido) |
| `nome` | Nome do lead |
| `whatsapp` | WhatsApp com DDI (55...) |

---

## Dev Notes

- Para os testes de fallback, **NUNCA modificar produção permanentemente** — sempre restaurar após o teste
- Documentar os resultados de cada CA no campo de Completion Notes da story
- Se algum CA falhar, identificar a story responsável e corrigir antes de marcar esta story como concluída
- O teste do timeout frontend (CA-2.8.5) é o mais delicado — executar por último e remover o nó Wait imediatamente após

---

## Definição de Pronto (DoD)

- [ ] Todos os CA-2.8.1 a CA-2.8.6 executados e passando ✅
- [ ] Verificação de segurança (CA-2.8.7) passando ✅
- [ ] Nenhuma configuração temporária de teste deixada no n8n
- [ ] Lead de teste real removido do Supabase (ou marcado como teste)
- [ ] Todas as stories 2.1–2.7 marcadas como ✅ CONCLUÍDO

**Após esta story:** @devops pode fazer o commit final e push para GitHub

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Baseada em: PRD-quiz-diagnostico-iaeo-fase2.md Seção 11 + ARCH Seções 7 e 8*  
*Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO*
