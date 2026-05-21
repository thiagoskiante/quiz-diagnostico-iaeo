# Story 1.1 — Estrutura Base HTML/CSS + State Machine
**Status:** ✅ CONCLUÍDO — Implementado e validado pelo @po em 21/05/2026  
**Sprint:** 1  
**Estimativa:** 30 minutos  
**Agente:** @dev  
**PRD Ref:** FR-01, NFR (performance, mobile-first)  
**Arch Ref:** Seção 3 — Arquitetura do Frontend, Fase 1  

---

## User Story

**Como** visitante da landing page do Quiz Diagnóstico IAEO,  
**Quero** ver uma página que carrega rapidamente e navega entre telas sem recarregar,  
**Para que** eu possa completar o quiz sem interrupções ou lentidão.

---

## Contexto para o @dev

Esta é a **primeira story** — cria a fundação de tudo. Sem lógica de quiz ainda. Apenas:
1. O esqueleto HTML com todas as seções presentes (mas ocultas)
2. O CSS base com variáveis de cor e componentes
3. A state machine básica que alterna qual seção está visível

As seções são: `intro`, `quiz`, `captura`, `processando`, `resultado`, `youtube-redirect`.

Todas começam com `class="hidden"` exceto `intro` que começa visível.

**Constantes já definidas (usar exatamente assim):**
```javascript
const N8N_WEBHOOK_URL = 'https://skiante-dev.iaeo.com.br/webhook/Imers%C3%A3odesenvolvimento';
const KIWIFY_URL      = 'https://pay.kiwify.com.br/fJCNgjy';
const YOUTUBE_URL     = 'https://www.youtube.com/@thiagoskiante?sub_confirmation=1';
```
⚠️ Nota: A URL do webhook tem "Imersão" com acento — encode como `Imers%C3%A3o` na URL.

**Estrutura de arquivos a criar:**
```
quiz-diagnostico-iaeo/
├── index.html
├── style.css
├── quiz.js
├── vercel.json
└── assets/
    └── (pasta vazia por ora — logo virá depois)
```

---

## Critérios de Aceitação

### CA-1.1.1 — Estrutura HTML completa
- [ ] `index.html` existe com DOCTYPE, lang="pt-BR", meta charset, meta viewport
- [ ] Existem 6 seções com IDs: `#section-intro`, `#section-quiz`, `#section-captura`, `#section-processando`, `#section-resultado`, `#section-youtube`
- [ ] Todas as seções têm `class="section hidden"` exceto `#section-intro` que tem apenas `class="section"`
- [ ] `<link rel="stylesheet" href="style.css">` no `<head>`
- [ ] `<script src="quiz.js" defer></script>` antes do `</body>`

### CA-1.1.2 — CSS base com design system IAEO
- [ ] `style.css` define CSS variables no `:root`:
  - `--color-primary: #6C3FE8` (roxo IAEO)
  - `--color-secondary: #00D4AA` (verde-água IAEO)
  - `--color-dark: #0D0D0D`
  - `--color-light: #F8F8F8`
  - `--color-text: #1A1A1A`
  - `--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- [ ] Classe `.hidden` definida como `display: none !important`
- [ ] Classe `.section` definida com `min-height: 100vh`, `display: flex`, `flex-direction: column`
- [ ] Reset básico: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
- [ ] Body com `font-family: var(--font-family)`, `background: var(--color-dark)`, `color: var(--color-text)`

### CA-1.1.3 — State Machine funcional
- [ ] `quiz.js` define objeto `state` com propriedade `current` iniciando em `'intro'`
- [ ] Função `goTo(section)` que:
  - Remove classe `hidden` da seção destino
  - Adiciona classe `hidden` a todas as outras seções
  - Atualiza `state.current`
- [ ] Botão "Começar" na seção intro chama `goTo('quiz')` ao ser clicado
- [ ] Transição funciona sem recarregar a página

### CA-1.1.4 — vercel.json com headers de segurança
- [ ] `vercel.json` existe com os headers definidos na Arquitetura (seção 6):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] CSP com `connect-src` apontando para `https://skiante-dev.iaeo.com.br`

### CA-1.1.5 — Performance base
- [ ] `quiz.js` carrega com atributo `defer` (não bloqueia renderização)
- [ ] Sem bibliotecas externas (sem jQuery, sem Bootstrap, sem React)
- [ ] Sem Google Fonts (usar system fonts definidas no CSS)

### CA-1.1.6 — Seção Intro com conteúdo real
- [ ] `#section-intro` contém:
  - Título: "Descubra em 5 minutos se sua empresa está pronta para IA"
  - Subtítulo: "Responda 10 perguntas e receba seu diagnóstico personalizado"
  - Botão CTA: "Começar diagnóstico" (chama `goTo('quiz')`)
  - Placeholder para logo IAEO (`<img src="assets/logo-iaeo.png" alt="IAEO" class="logo">` — arquivo não existe ainda, não quebrar se ausente)

---

## Definição de Pronto (DoD)

- [ ] Todos os CAs acima passam
- [ ] Abrir `index.html` no browser: tela intro aparece
- [ ] Clicar em "Começar": transição para seção quiz (pode estar vazia)
- [ ] Sem erros no console do browser
- [ ] Arquivo `vercel.json` válido (JSON bem formado)

---

## O que NÃO fazer nesta story

- ❌ Não implementar perguntas do quiz (isso é Story 1.2)
- ❌ Não implementar formulário de captura (isso é Story 1.3)
- ❌ Não fazer POST para n8n (isso é Story 1.3)
- ❌ Não criar conta na Vercel nem fazer deploy (isso é Story 1.4)

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Rastreamento: PRD FR-01 + NFR Performance + ARCH Fase 1*
