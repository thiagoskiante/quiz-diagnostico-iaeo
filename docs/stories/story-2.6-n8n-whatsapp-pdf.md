# Story 2.6 — n8n: WhatsApp — Mensagem do Rafa + Envio do PDF
**Status:** 🔲 Pendente  
**Sprint:** 2  
**Estimativa:** 1 hora  
**Agente:** @dev  
**PRD Ref:** FR-06  
**Arch Ref:** Seção 4 — Nós [7] e [8]  
**Depende de:** Story 2.5 ✅ (PDF gerado e URL disponível)

---

## User Story

**Como** lead que preencheu o quiz,  
**Quero** receber uma mensagem pessoal do Rafa no WhatsApp seguida do meu Relatório de Oportunidade em PDF,  
**Para que** sinta que houve um humano me atendendo e tenha o documento em mãos para analisar.

---

## Contexto para o @dev

Esta story modifica o nó WhatsApp existente (da Fase 1 — enviava mensagem de texto genérica) e **adiciona um segundo nó** para envio do PDF como documento.

**O que muda vs Fase 1:**
- Nó [7]: Mensagem de texto substituída — nova mensagem do Rafa (personalizada com nome)
- Nó [8] NOVO: Envia o PDF como documento via Evolution API (sendMedia)

**Fluxo desta story:**
```
[6] Supabase UPDATE pdf_url → [7] WhatsApp texto (mensagem Rafa) → [8] WhatsApp PDF (documento)
                                                                       ↑ NOVO
```

**Fallback:** Se `pdf_url` for null (PDFMonkey falhou), o nó [8] deve verificar e pular o envio do PDF — não pode crashar o workflow.

---

## Critérios de Aceitação

### CA-2.6.1 — Nó [7] WhatsApp Mensagem do Rafa (modificar nó existente)
- [ ] Mensagem de texto atualizada para o novo texto aprovado
- [ ] Nome do lead interpolado com `{{ $('Normalizar Dados').item.json.nome }}`
- [ ] Instância Evolution API: `imersaorafa` (sem mudança)

**Texto exato da mensagem (configurar no nó HTTP Request Evolution API):**
```
Oi {{ $('Normalizar Dados').item.json.nome }}! Aqui é o Rafa da IAEO, já salva meu contato 😊

Referente ao seu diagnóstico de IA, segue o seu Relatório de Oportunidade 👇

Dá uma analisada, qualquer dúvida me pergunte. E claro — podemos fazer um diagnóstico mais completo e até executar pra você. O que você acha?
```

**Request Evolution API (sendText — sem mudança no formato):**
```
POST https://skiante-wpp.iaeo.com.br/message/sendText/imersaorafa

{
  "number": "{{ $('Normalizar Dados').item.json.whatsapp }}",
  "text": "[mensagem acima]"
}
```

### CA-2.6.2 — Nó [8] WhatsApp PDF (nó novo — sendMedia)
- [ ] Novo nó HTTP Request adicionado após o nó [7]
- [ ] Nó configurado para enviar PDF como documento via Evolution API
- [ ] Verifica se `pdf_url` não é null antes de enviar (via IF node ou expressão condicional)

**Request Evolution API (sendMedia — documento):**
```
POST https://skiante-wpp.iaeo.com.br/message/sendMedia/imersaorafa

Headers:
  apikey: [Evolution API Key — configurada no n8n, nunca exposta]
  Content-Type: application/json

Body:
{
  "number": "{{ $('Normalizar Dados').item.json.whatsapp }}",
  "mediatype": "document",
  "mimetype": "application/pdf",
  "caption": "Relatório de Oportunidade — IAEO",
  "media": "{{ $('Nó Gerar PDF').item.json.document.download_url }}",
  "fileName": "Relatorio-Oportunidade-IAEO.pdf"
}
```
> ⚠️ Verificar o campo exato da URL no output do nó PDFMonkey — pode ser `download_url` ou `url` dependendo da versão da API.

### CA-2.6.3 — Fallback: pdf_url null não crasha o workflow
- [ ] Se `pdf_url` for null (PDFMonkey falhou na Story 2.5), o nó [8] é ignorado
- [ ] Implementar via IF node antes do [8]: `IF pdf_url não é null → [8] WhatsApp PDF`
- [ ] Se pdf_url é null: workflow continua para os nós [9]–[12] de roteamento de trilha (sem enviar PDF)

**IF node antes do [8]:**
```
Condição: {{ $('Nó Atualizar PDF URL').item.json.pdf_url }} !== null
```
- Branch "true": → Nó [8] WhatsApp PDF
- Branch "false": → pula para nó [9] IF Trilha A (sem PDF)

### CA-2.6.4 — Teste funcional
- [ ] Executar workflow manualmente com payload de teste + pdf_url válida
- [ ] Lead (número de teste: `554137989777`) recebe no WhatsApp:
  1. Primeiro: mensagem de texto com nome personalizado
  2. Segundo: PDF como documento (não como link, mas como arquivo .pdf)
- [ ] PDF abre nativamente no WhatsApp (não redireciona para browser)
- [ ] Ordem: texto primeiro, PDF depois (não paralelo)
- [ ] Testar fallback: com pdf_url = null, mensagem de texto chega mas sem PDF (sem erro no workflow)

### CA-2.6.5 — Regressão: nós [9]–[12] intactos
- [ ] Notificação interna para Rafa (Trilha A/B/C) continua funcionando após as mudanças
- [ ] Nós IF Trilha A, IF Trilha B, IF Trilha C permanecem sem modificação

---

## Dev Notes

- A Evolution API `sendMedia` com `mediatype: "document"` envia o arquivo como documento (.pdf) — o WhatsApp exibe o ícone de PDF e permite download/visualização nativa
- Se a URL do PDF expirar antes do envio (timeout do workflow > 7 dias), o sendMedia vai falhar — para MVP, isso é aceitável (PDFMonkey expira em 7 dias)
- Verificar o nome exato do nó que contém o `download_url` do PDFMonkey para usar na expressão `$('Nome do Nó').item.json.campo`
- O número de teste `554137989777` é o WhatsApp do Rafa — usar com cuidado em testes para não spammar

---

## Definição de Pronto (DoD)

- [ ] Nó [7] atualizado com nova mensagem do Rafa (com nome personalizado)
- [ ] Nó [8] adicionado e enviando PDF como documento via Evolution API
- [ ] IF node protege contra pdf_url null (fallback sem crash)
- [ ] Teste: mensagem de texto + PDF chegam no WhatsApp na ordem correta
- [ ] PDF abre nativamente no WhatsApp como documento
- [ ] Regressão: nós [9]–[12] (trilhas + notif interna) intactos

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Baseada em: PRD-quiz-diagnostico-iaeo-fase2.md FR-06 + ARCH Seção 4 Nós [7] e [8]*  
*Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO*
