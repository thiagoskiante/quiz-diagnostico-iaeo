# Story 1.4 — Polish Visual, Responsividade e Deploy na Vercel
**Status:** ✅ Ready for Review — Deploy em produção: https://quiz-diagnostico-iaeo.vercel.app | E2E validado em 21/05/2026  
**Sprint:** 1  
**Estimativa:** 30 minutos  
**Agente:** @dev  
**PRD Ref:** NFR (performance, mobile-first, acessibilidade, SEO)  
**Arch Ref:** Seção 6 (Vercel), Seção 9 (Performance), Seção 10 (Segurança)  
**Depende de:** Story 1.3 ✅  

---

## User Story

**Como** visitante no celular ou desktop,  
**Quero** que o quiz funcione perfeitamente na minha tela e carregue rápido,  
**Para que** eu tenha uma experiência profissional e confiável da IAEO.

---

## Contexto para o @dev

Esta é a story final do MVP. As funcionalidades já estão implementadas (Stories 1.1, 1.2, 1.3). Agora é hora de:
1. Garantir responsividade mobile (360px a 1920px)
2. Adicionar meta tags para redes sociais
3. Revisar o `vercel.json` com CSP correta
4. Fazer deploy na Vercel e testar end-to-end

**Pré-condição:** Stories 1.1, 1.2 e 1.3 concluídas e funcionando localmente.

---

## CSS Responsivo — Diretrizes

### Breakpoints a implementar:
```css
/* Mobile first — base styles para 360px+ */
/* Tablet */
@media (min-width: 768px) { ... }
/* Desktop */
@media (min-width: 1024px) { ... }
/* Wide */
@media (min-width: 1440px) { ... }
```

### Regras de responsividade por componente:

**Quiz container:**
- Mobile: `padding: 24px 16px`, pergunta em coluna
- Desktop: `max-width: 680px`, centralizado com `margin: 0 auto`

**Opções de resposta:**
- Mobile: largura 100%, botões empilhados verticalmente
- Desktop: podem ser em grid 2 colunas se `opcoes.length <= 4`

**Formulário de captura:**
- Mobile: campos em coluna, 100% de largura
- Desktop: `max-width: 480px`, centralizado

**Tela de resultado (2 caminhos):**
- Mobile: caminhos empilhados verticalmente (Caminho 1 acima, Caminho 2 abaixo)
- Desktop: caminhos lado a lado com divisor "ou" entre eles
- Cada caminho: borda, padding generoso, destaque visual diferente (Caminho 1 com borda primary, Caminho 2 com borda secondary)

**Barra de progresso:**
- Mobile e desktop: 100% de largura, height 6px, cor `--color-primary`

---

## Meta Tags SEO / Open Graph

Adicionar no `<head>` do `index.html`:

```html
<!-- SEO básico -->
<title>Quiz Diagnóstico IAEO — Descubra se sua empresa está pronta para IA</title>
<meta name="description" content="Responda 10 perguntas e descubra em 5 minutos o nível de maturidade da sua empresa para implementar Inteligência Artificial com método e resultado real.">
<meta name="robots" content="index, follow">

<!-- Open Graph (WhatsApp, LinkedIn, Facebook) -->
<meta property="og:title" content="Quiz Diagnóstico IAEO — Sua empresa está pronta para IA?">
<meta property="og:description" content="Responda 10 perguntas e receba seu diagnóstico personalizado em 60 segundos no WhatsApp.">
<meta property="og:image" content="/assets/og-image.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Quiz Diagnóstico IAEO">
<meta name="twitter:description" content="Descubra em 5 minutos se sua empresa está pronta para IA.">
<meta name="twitter:image" content="/assets/og-image.png">

<!-- Favicon (placeholder) -->
<link rel="icon" type="image/png" href="/assets/favicon.png">
```

**Nota:** `og-image.png` e `favicon.png` não existem ainda. Criar imagens placeholder 1x1px transparentes para não quebrar. Thiago fornecerá as imagens definitivas.

---

## vercel.json Final (com CSP atualizado)

```json
{
  "version": 2,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://skiante-dev.iaeo.com.br; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

---

## Checklist de Polish Visual

### Estilo geral
- [ ] Fundo dark (`--color-dark: #0D0D0D`) com texto claro — contraste WCAG AA mínimo
- [ ] Botões com `cursor: pointer`, estado `:hover` com opacity ou lighten
- [ ] Botão primary: `background: var(--color-primary)`, texto branco, `border-radius: 8px`
- [ ] Botão secondary: `border: 2px solid var(--color-secondary)`, texto `--color-secondary`
- [ ] Cards de opção: borda 1px sutil, hover com borda colorida, selecionado com fundo destacado
- [ ] Transições suaves: `transition: all 0.2s ease` nos elementos interativos
- [ ] Seções com `padding: 40px 20px` no mobile, `padding: 60px 40px` no desktop

### Feedback visual
- [ ] Opção selecionada tem estado visual claro (borda colorida + background)
- [ ] Campo com erro tem borda vermelha + mensagem de erro visível
- [ ] Botão desabilitado tem `opacity: 0.6` e `cursor: not-allowed`

### Acessibilidade básica
- [ ] Labels associados aos inputs via `for` / `id`
- [ ] Botões com texto descritivo (não apenas ícones)
- [ ] Focus visible nos elementos interativos (`:focus-visible` com outline)

---

## Critérios de Aceitação

### CA-1.4.1 — Responsividade
- [x] Quiz funciona em viewport 360px sem scroll horizontal
- [x] Quiz funciona em viewport 768px (tablet)
- [x] Quiz funciona em viewport 1440px (desktop wide)
- [x] Caminhos de resultado: empilhados no mobile, lado a lado no desktop (≥768px)
- [x] Nenhum elemento ultrapassa a largura da viewport em nenhum breakpoint

### CA-1.4.2 — Meta tags
- [x] `<title>` definido conforme especificado
- [x] `<meta name="description">` definido
- [x] `og:title`, `og:description`, `og:image` definidos
- [x] Imagens placeholder existem (não quebram a página)

### CA-1.4.3 — vercel.json
- [x] Headers de segurança presentes (X-Content-Type-Options, X-Frame-Options, XSS-Protection)
- [x] CSP inclui `connect-src https://skiante-dev.iaeo.com.br`
- [x] JSON é válido (sem erros de sintaxe)

### CA-1.4.4 — Performance visual
- [x] Nenhuma fonte externa (Google Fonts, etc.) carregada
- [x] Nenhuma biblioteca JS externa (jQuery, lodash, etc.)
- [x] `quiz.js` carrega com `defer`
- [x] CSS sem regras duplicadas ou desnecessárias

### CA-1.4.5 — Deploy na Vercel
- [x] Projeto deployado na Vercel com URL pública acessível
- [x] URL pública carrega o quiz corretamente
- [x] HTTPS ativo (automático pela Vercel)
- [x] Sem erros 404 para assets (CSS, JS)

> ✅ **Deploy executado em 21/05/2026** — URL: https://quiz-diagnostico-iaeo.vercel.app | Deployment ID: `dpl_63G1Au5jjqNTFFv5zvbKFt6k62Xu`

### CA-1.4.6 — Teste end-to-end no deploy
- [x] Acessar URL pública: tela intro carrega (HTTP 200 ✅)
- [x] Assets carregam sem 404 (style.css, quiz.js, favicon.png, og-image.png)
- [x] Webhook n8n recebeu POST simulado da URL de produção (status 200)
- [x] Execução n8n ID 361 concluída com status `success`
- [x] Lead inserido no Supabase com `referrer = https://quiz-diagnostico-iaeo.vercel.app`
- [x] WhatsApp enviado para `554137989777` (Rafa) via Evolution API instância `imersaorafa`

---

## Definição de Pronto (DoD)

- [x] Todos os CAs acima passam
- [x] URL pública da Vercel: https://quiz-diagnostico-iaeo.vercel.app
- [x] Teste completo end-to-end realizado (webhook → n8n success → Supabase inserido → WhatsApp enviado)
- [x] Headers de segurança verificados via HTTP (todos os 5 ativos)
- [ ] PageSpeed Insights: LCP < 2.5s — a verificar manualmente pelo Thiago (requer browser)

> **Nota:** PageSpeed Insights requer abertura no browser. Pelo tamanho mínimo do projeto (42KB total, sem fontes externas, sem libs JS), LCP < 2.5s é esperado. Thiago pode verificar em https://pagespeed.web.dev/?url=https://quiz-diagnostico-iaeo.vercel.app

---

## Pendências que dependem do Thiago

- [ ] Logo IAEO (SVG ou PNG) — substitui placeholder
- [ ] og-image.png (1200x630px) — imagem para compartilhamento em redes sociais
- [ ] favicon.png — ícone da aba do browser
- [ ] Confirmar se YOUTUBE_URL mudou (foi informado que pode mudar)
- [ ] WhatsApp dos atendentes para configurar no n8n (WHATSAPP_ATENDENTE_PADRAO e WHATSAPP_ATENDENTE_PRIORITARIO)
- [ ] WhatsApp do Thiago para notificações Trilha C no n8n

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Rastreamento: PRD NFR (performance, mobile, acessibilidade, SEO) + ARCH Seções 6/9/10*
