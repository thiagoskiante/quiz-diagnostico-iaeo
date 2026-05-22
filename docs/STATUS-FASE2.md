# Status Fase 2 — Quiz Diagnóstico IAEO
**Última atualização:** 21/05/2026

---

## ✅ CONFIGURADO E FUNCIONANDO EM PRODUÇÃO

### Workflows n8n

| Workflow | ID | Nós | Status |
|----------|----|-----|--------|
| `quiz-diagnostico-iaeo` | `sYG25wkMr9JOAVWD` | 22 | ✅ Ativo |
| `quiz-intencao-compra` | `hyg6H1jUs8jO9j1k` | 3 | ✅ Ativo |

---

## Fluxo Completo — quiz-diagnostico-iaeo (22 nós)

```
Webhook Quiz
  → Normalizar Dados (q11_contexto incluído)
  → Salvar Lead Supabase
  → GPT-4o Relatório
  → Parsear GPT Output        ← extrai diagnostico/oportunidades/por_onde_comecar do message.content
  → IF JSON GPT Válido
      true  → Nó 5a - Criar PDF
      false → Fallback GPT → Nó 5a - Criar PDF
  → Nó 5b - Disparar PDF (PATCH status=pending)
  → Wait 12s
  → Nó GET PDF URL
  → IF PDF Gerado
      true  → Nó Atualizar PDF URL (Supabase PATCH)
      false → Nó PDF URL Null (Supabase PATCH null)
  → WhatsApp ao Lead (sendText — mensagem Rafa)
  → IF Tem PDF para Enviar   ← checa Nó GET PDF URL direto
      true  → WhatsApp Enviar PDF (sendMedia document)
      false → pula
  → IF Trilha A → Notif Trilha A
  → IF Trilha B → Notif Trilha B → Notif Trilha C
```

---

## Correções Aplicadas Durante QA (21/05/2026)

### 1. Credential OpenAI
- Criada manualmente no n8n: **"OpenAi account"** (ID: `JhKyov4EA6lu2qIq`)
- Vinculada ao nó GPT-4o via PUT na API

### 2. PDFMonkey payload malformado (422)
- **Problema:** payload era string JSON com interpolação manual — quebrava quando GPT retornava `{` ou `"`
- **Solução:** `specifyBody: json` com `JSON.stringify({document: { payload: JSON.stringify({...}) }})` como expressão n8n

### 3. GPT retornando expressões literais
- **Problema:** campo `content` do user message não tinha `=` no início — n8n tratava como texto literal
- **Solução:** prefixado com `=` para ativar interpolação das expressões `{{ }}`

### 4. IF JSON GPT Válido falhando
- **Problema:** `oportunidades` é array, não string — IF com `notEmpty` em string quebrava
- **Solução:** `typeValidation: loose` + condição `oportunidades.length > 0` (number gt 0)

### 5. Nó Parsear GPT Output (novo)
- **Problema:** GPT retorna `{index, message: {content: "..."}}` — campos ficavam em `message.content`
- **Solução:** novo nó Set entre GPT e IF que extrai e faz JSON.parse do content, expondo `diagnostico`, `oportunidades`, `por_onde_comecar` diretamente

### 6. IF Tem PDF para Enviar sempre false
- **Problema:** checava `$('Nó Atualizar PDF URL').item.json.pdf_url` mas Supabase com `Prefer: return=minimal` retorna `{}`
- **Solução:** checa `$('Nó GET PDF URL').item.json.document.download_url` diretamente

### 7. Prompt GPT reescrito (posicionamento estratégico)
- **Problema:** relatório genérico, não cativava o lead
- **Solução:** prompt completo com contexto da IAEO, posicionamento do Diagnóstico de Viabilidade, uso das palavras do lead, estrutura narrativa consultiva

---

## Prompt GPT Atual (system)

O GPT agora sabe:
- O que é a IAEO e qual o posicionamento
- Que o objetivo é vender o **Diagnóstico de Viabilidade em IA** (a partir de R$ 3.000)
- Que o risco de implementar sem mapear é o argumento central
- Que precisa usar as palavras do lead de volta pra ele (efeito espelho)
- Estrutura narrativa: entender → custo da dor → risco → Diagnóstico de Viabilidade → CTA Rafa

---

## Credenciais em Uso

| Serviço | Onde fica | Observação |
|---------|-----------|------------|
| OpenAI | n8n Credentials (ID: JhKyov4EA6lu2qIq) | Nunca expor no frontend |
| PDFMonkey API Key | Hardcoded no nó (mover para env var) | `SSfXZLjGc4Mamfzs2MjvTaGj9ax59j4z` |
| Supabase Service Key | Hardcoded nos nós | Mover para env var futuramente |
| Evolution API Key | Hardcoded nos nós | `F41E505AF49F-402F-B49D-C997351A3A8F` |

---

## Próximos Passos Sugeridos

- [ ] Testar com lead real (não QA) e coletar feedback do PDF
- [ ] Melhorar template visual do PDF no PDFMonkey
- [ ] Mover chaves de API para variáveis de ambiente n8n
- [ ] Monitorar taxa de fallback GPT (deve ser < 5%)
- [ ] A/B test da mensagem do Rafa
