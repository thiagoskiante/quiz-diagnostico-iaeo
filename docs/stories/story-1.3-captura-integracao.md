# Story 1.3 — Formulário de Captura + Integração n8n + Tela de Resultado
**Status:** ✅ CONCLUÍDO — Implementado e validado pelo @po em 21/05/2026  
**Sprint:** 1  
**Estimativa:** 1 hora  
**Agente:** @dev  
**PRD Ref:** FR-04, FR-05, FR-06, FR-07, Seção 9 (Textos), Seção 11 (Webhook)  
**Arch Ref:** Seção 3 (PROCESSING/RESULT), Seção 4 (n8n), Seção 8 (Erros)  
**Depende de:** Story 1.2 ✅  

---

## User Story

**Como** visitante que completou o quiz,  
**Quero** preencher meus dados e receber meu diagnóstico na tela e no WhatsApp,  
**Para que** eu possa escolher o melhor caminho para implementar IA na minha empresa.

---

## Contexto para o @dev

Esta story implementa:
1. **Formulário de captura** — aparece após Q10, antes do resultado
2. **POST para n8n** — envia todos os dados com o payload completo
3. **Tela de processando** — spinner enquanto aguarda resposta
4. **Tela de resultado** — dois caminhos para todos os leads

**Pré-condição:** Story 1.2 concluída. `state.score`, `state.trilha`, `state.answers` populados.

---

## Formulário de Captura (seção `#section-captura`)

### HTML da seção (implementar dentro de `#section-captura`):

```html
<div class="captura-container">
  <div class="captura-header">
    <div class="loading-dots">
      <span></span><span></span><span></span>
    </div>
    <h2>Gerando seu diagnóstico personalizado...</h2>
    <p>Preencha abaixo para receber no WhatsApp em 60 segundos.</p>
  </div>

  <form id="form-captura" novalidate>
    <div class="field-group">
      <label for="nome">Nome completo *</label>
      <input type="text" id="nome" name="nome" required placeholder="Seu nome completo" autocomplete="name">
      <span class="field-error" id="erro-nome"></span>
    </div>

    <div class="field-group">
      <label for="whatsapp">WhatsApp *</label>
      <input type="tel" id="whatsapp" name="whatsapp" required placeholder="(11) 99999-9999" autocomplete="tel">
      <span class="field-error" id="erro-whatsapp"></span>
    </div>

    <div class="field-group">
      <label for="email">E-mail *</label>
      <input type="email" id="email" name="email" required placeholder="seu@email.com" autocomplete="email">
      <span class="field-error" id="erro-email"></span>
    </div>

    <div class="field-group">
      <label for="empresa">Nome da empresa *</label>
      <input type="text" id="empresa" name="empresa" required placeholder="Nome da sua empresa" autocomplete="organization">
      <span class="field-error" id="erro-empresa"></span>
    </div>

    <div class="field-group">
      <label for="cargo">Seu cargo *</label>
      <input type="text" id="cargo" name="cargo" required placeholder="Ex: CEO, Diretor, Sócio" autocomplete="organization-title">
      <span class="field-error" id="erro-cargo"></span>
    </div>

    <button type="submit" id="btn-submeter" class="btn-primary">
      Ver meu diagnóstico →
    </button>
  </form>
</div>
```

---

## Validações do Formulário (implementar em quiz.js)

```javascript
function validarFormulario(dados) {
  const erros = {};

  // Nome: mínimo 3 caracteres
  if (!dados.nome || dados.nome.trim().length < 3) {
    erros.nome = 'Por favor, informe seu nome completo.';
  }

  // WhatsApp: aceita formatos com ou sem máscara, extrai apenas números
  const wppNumeros = dados.whatsapp.replace(/\D/g, '');
  if (wppNumeros.length < 10 || wppNumeros.length > 11) {
    erros.whatsapp = 'Informe um WhatsApp válido com DDD (ex: 11999999999).';
  }

  // E-mail: regex básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dados.email)) {
    erros.email = 'Informe um e-mail válido.';
  }

  // Empresa: mínimo 2 caracteres
  if (!dados.empresa || dados.empresa.trim().length < 2) {
    erros.empresa = 'Por favor, informe o nome da sua empresa.';
  }

  // Cargo: obrigatório
  if (!dados.cargo || dados.cargo.trim().length < 2) {
    erros.cargo = 'Por favor, informe seu cargo.';
  }

  return erros;
}
```

---

## Payload para o n8n (implementar em quiz.js)

```javascript
function montarPayload(dadosFormulario) {
  // Normaliza WhatsApp: apenas números, com 55 no início se não tiver
  const wppNumeros = dadosFormulario.whatsapp.replace(/\D/g, '');
  const whatsappFormatado = wppNumeros.startsWith('55') ? wppNumeros : '55' + wppNumeros;

  // Captura UTMs da URL
  const urlParams = new URLSearchParams(window.location.search);

  return {
    // Dados de contato
    nome: dadosFormulario.nome.trim(),
    whatsapp: whatsappFormatado,
    email: dadosFormulario.email.trim().toLowerCase(),
    empresa: dadosFormulario.empresa.trim(),
    cargo: dadosFormulario.cargo.trim(),

    // Respostas do quiz
    q1_faturamento:    state.answers.q1 || null,
    q2_funcionarios:   state.answers.q2 || null,
    q3_cargo:          state.answers.q3 || null,
    q4_setor:          state.answers.q4 || null,
    q5_dor:            state.answers.q5 || null,
    q6_experiencia_ia: state.answers.q6 || null,
    q7_sistemas:       state.answers.q7 || null,
    q8_decisao:        state.answers.q8 || null,
    q9_urgencia:       state.answers.q9 || null,
    q10_investimento:  state.answers.q10 || null,

    // Score e trilha (internos)
    score:  state.score,
    trilha: state.trilha,

    // UTMs
    utm_source:   urlParams.get('utm_source')   || null,
    utm_medium:   urlParams.get('utm_medium')   || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    referrer:     document.referrer             || null,

    // Metadata
    user_agent: navigator.userAgent
  };
}
```

---

## POST para n8n (implementar em quiz.js)

```javascript
async function enviarParaN8n(payload) {
  const TIMEOUT_MS = 10000; // 10 segundos

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { sucesso: response.ok, status: response.status };
  } catch (erro) {
    clearTimeout(timeoutId);
    // Falha silenciosa — exibir resultado mesmo assim (ADR-002)
    console.warn('n8n indisponível, exibindo resultado sem salvar:', erro.message);
    return { sucesso: false, status: 0 };
  }
}
```

---

## Fluxo de Submit do Formulário

```javascript
// Implementar no event listener do form-captura
document.getElementById('form-captura').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('btn-submeter');

  // 1. Coleta dados
  const dados = {
    nome:     document.getElementById('nome').value,
    whatsapp: document.getElementById('whatsapp').value,
    email:    document.getElementById('email').value,
    empresa:  document.getElementById('empresa').value,
    cargo:    document.getElementById('cargo').value,
  };

  // 2. Valida
  const erros = validarFormulario(dados);
  if (Object.keys(erros).length > 0) {
    exibirErros(erros); // mostrar mensagens de erro nos campos
    return;
  }

  // 3. UI Lock — previne clique duplo
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  // 4. Vai para tela de processando
  goTo('processando');

  // 5. Salva nome e empresa no state para personalização
  state.captura = dados;

  // 6. Envia para n8n (com timeout e fallback silencioso)
  const payload = montarPayload(dados);
  await enviarParaN8n(payload);

  // 7. Exibe resultado (independente do resultado do n8n)
  exibirResultado();
});
```

---

## Tela de Resultado (seção `#section-resultado`)

### HTML da seção:

```html
<div class="resultado-container">
  <div class="resultado-header">
    <span class="checkmark">✅</span>
    <h1 id="resultado-titulo">Seu diagnóstico está pronto!</h1>
    <p id="resultado-subtitulo"></p>
    <p class="resultado-sintese">
      Sua empresa já tem o perfil e a maturidade necessários para avançar 
      com inteligência artificial aplicada ao negócio. 
      A questão agora é: <strong>como você quer chegar lá?</strong>
    </p>
  </div>

  <div class="caminhos-wrapper">

    <!-- Caminho 1 -->
    <div class="caminho caminho-1">
      <div class="caminho-icon">🤝</div>
      <h2>A IAEO faz por você</h2>
      <p>
        Nosso time conduz o diagnóstico completo junto com você — 
        mapeamos os processos, identificamos onde a IA gera mais retorno 
        e entregamos um plano de implementação em 90 dias.
      </p>
      <p class="caminho-valor"><strong>Investimento:</strong> A partir de R$ 3.000</p>
      <button id="btn-caminho-1" class="btn-primary btn-caminho">
        Quero que a IAEO faça por mim
      </button>
    </div>

    <div class="caminhos-divisor">
      <span>ou</span>
    </div>

    <!-- Caminho 2 -->
    <div class="caminho caminho-2">
      <div class="caminho-icon">🧭</div>
      <h2>Você faz por conta própria</h2>
      <p>
        Receba o Auto-Diagnóstico IAEO: um mapa passo a passo para você 
        analisar, mapear e decidir por qual caminho trilhar na sua empresa — 
        no seu ritmo.
      </p>
      <p class="caminho-valor"><strong>Investimento:</strong> R$ 97</p>
      <button id="btn-caminho-2" class="btn-secondary btn-caminho">
        Quero fazer eu mesmo — R$97
      </button>
    </div>

  </div>

  <!-- Modal de confirmação Caminho 1 -->
  <div id="modal-caminho1" class="modal hidden">
    <div class="modal-content">
      <p>✅ Ótimo! Nossa equipe entrará em contato em breve pelo WhatsApp.</p>
      <p>Fique de olho nas mensagens!</p>
      <button id="btn-fechar-modal" class="btn-primary">Entendido!</button>
    </div>
  </div>
</div>
```

### Lógica do resultado (implementar em quiz.js):

```javascript
function exibirResultado() {
  const nome = state.captura?.nome?.split(' ')[0] || 'você'; // primeiro nome
  const empresa = state.captura?.empresa || 'sua empresa';

  // Personaliza título e subtítulo
  document.getElementById('resultado-titulo').textContent =
    `✅ ${nome}, seu diagnóstico está pronto!`;

  document.getElementById('resultado-subtitulo').textContent =
    `Com base nas respostas de ${empresa}, identificamos o estágio atual ` +
    `da sua operação e o caminho mais rápido para implementar IA com resultado real.`;

  // Botão Caminho 1 — exibe modal
  document.getElementById('btn-caminho-1').addEventListener('click', () => {
    document.getElementById('modal-caminho1').classList.remove('hidden');
  });

  // Botão fechar modal
  document.getElementById('btn-fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-caminho1').classList.add('hidden');
  });

  // Botão Caminho 2 — abre Kiwify em nova aba
  document.getElementById('btn-caminho-2').addEventListener('click', () => {
    window.open(KIWIFY_URL, '_blank');
  });

  goTo('resultado');
}
```

---

## Seção "Processando" (`#section-processando`)

```html
<div class="processando-container">
  <div class="spinner"></div>
  <h2>Analisando suas respostas...</h2>
  <p>Seu diagnóstico personalizado está sendo preparado.</p>
</div>
```

CSS do spinner:
```css
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Critérios de Aceitação

### CA-1.3.1 — Formulário de captura
- [ ] Seção `#section-captura` exibe formulário com 5 campos após conclusão do quiz
- [ ] Todos os 5 campos são obrigatórios: nome, whatsapp, email, empresa, cargo
- [ ] Validação funciona: campo vazio bloqueia submit e exibe mensagem de erro
- [ ] WhatsApp aceita: `11999999999`, `(11) 99999-9999`, `11 99999-9999`
- [ ] E-mail inválido exibe erro específico no campo

### CA-1.3.2 — UI Lock anti-clique-duplo
- [ ] Botão "Ver meu diagnóstico" fica desabilitado após primeiro clique
- [ ] Botão muda texto para "Enviando..." durante processamento

### CA-1.3.3 — Tela de processando
- [ ] `#section-processando` é exibida imediatamente após submit válido
- [ ] Spinner CSS animado é visível
- [ ] Tela muda para resultado após n8n responder (ou após timeout de 10s)

### CA-1.3.4 — POST para n8n
- [ ] Payload enviado contém todos os campos definidos (nome, whatsapp, email, empresa, cargo, q1-q10, score, trilha, utms, user_agent)
- [ ] WhatsApp no payload tem formato numérico com prefixo 55 (ex: `5511999999999`)
- [ ] Content-Type é `application/json`
- [ ] URL do webhook é exatamente: `https://skiante-dev.iaeo.com.br/webhook/Imersaodesenvolvi`

> **Nota @po 21/05/2026:** URL corrigida — o path configurado no n8n e no `quiz.js` é `Imersaodesenvolvi` (sem acento, truncado). O valor anterior `Imers%C3%A3odesenvolvimento` estava incorreto e foi atualizado para refletir a implementação real validada e em produção.

### CA-1.3.5 — Fallback de erro (n8n indisponível)
- [ ] Se n8n não responde em 10s, resultado é exibido mesmo assim
- [ ] Usuário NÃO vê mensagem de erro — experiência continua normalmente
- [ ] Console.warn registra o erro para debug

### CA-1.3.6 — Tela de resultado com 2 caminhos
- [ ] `#section-resultado` exibe título personalizado: "✅ [PRIMEIRO NOME], seu diagnóstico está pronto!"
- [ ] Subtítulo menciona o nome da empresa informado
- [ ] Caminho 1 está visível com descrição e "A partir de R$ 3.000"
- [ ] Caminho 2 está visível com descrição e "R$ 97"
- [ ] Botão "Quero que a IAEO faça por mim" exibe modal de confirmação ao clicar
- [ ] Modal contém: "✅ Ótimo! Nossa equipe entrará em contato em breve pelo WhatsApp."
- [ ] Botão "Quero fazer eu mesmo — R$97" abre `https://pay.kiwify.com.br/fJCNgjy` em nova aba

### CA-1.3.7 — Trilha não exposta
- [ ] Em nenhum lugar da tela de resultado aparece "Trilha A", "Trilha B" ou "Trilha C"
- [ ] Em nenhum lugar aparece o score numérico para o usuário

---

## Definição de Pronto (DoD)

- [ ] Todos os CAs acima passam
- [ ] Preencher formulário com dados inválidos: erros aparecem nos campos corretos
- [ ] Preencher formulário válido: spinner aparece, depois resultado aparece
- [ ] Verificar no Network (DevTools): POST foi feito para a URL correta com payload completo
- [ ] Clicar "Quero que a IAEO faça": modal aparece
- [ ] Clicar "Quero fazer eu mesmo": Kiwify abre em nova aba
- [ ] Sem erros no console (apenas o console.warn intencional se n8n falhar)

---

## O que NÃO fazer nesta story

- ❌ Não exibir trilha (A/B/C) ao usuário
- ❌ Não fazer deploy (Story 1.4)
- ❌ Não criar workflow no n8n (isso é tarefa separada — ver Story 1.4)

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Rastreamento: PRD FR-04 + FR-05 + FR-06 + FR-07 + Seção 9 + ARCH Seção 3/4/8*
