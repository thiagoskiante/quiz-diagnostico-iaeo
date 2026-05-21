# Story 2.1 — Frontend: Pergunta 11 + Payload Atualizado
**Status:** 🔲 Pendente  
**Sprint:** 2  
**Estimativa:** 1 hora  
**Agente:** @dev  
**PRD Ref:** FR-01, FR-07  
**Arch Ref:** Seção 3 — Arquitetura do Frontend — Fase 2  
**Depende de:** Story 1.1–1.5 ✅ (Fase 1 concluída e em produção)  
**Pode rodar em paralelo com:** Story 2.3 (Supabase migration — independente)

---

## User Story

**Como** visitante do Quiz Diagnóstico IAEO,  
**Quero** responder uma pergunta aberta sobre minha dificuldade antes de preencher meus dados,  
**Para que** receba um diagnóstico mais personalizado e relevante à minha realidade.

---

## Contexto para o @dev

Esta story adiciona a **Pergunta 11 (Q11)** ao quiz existente. O quiz já está em produção em https://diagnostico.thiagoskiante.com.br — os arquivos a modificar são:
- `quiz-diagnostico-iaeo/index.html`
- `quiz-diagnostico-iaeo/style.css`
- `quiz-diagnostico-iaeo/quiz.js`

**O fluxo muda de:**
```
QUIZ (Q10) → CAPTURE_GATE → PROCESSING → RESULT
```

**Para:**
```
QUIZ (Q10) → Q11_GATE → CAPTURE_GATE → PROCESSING → RESULT
```

A seção Q11 aparece APÓS Q10 ser respondida e ANTES do formulário de captura de dados (nome/WhatsApp/email).

**REGRA DE OURO:** ZERO mudanças na lógica das Q1–Q10, no sistema de score, nas trilhas A/B/C ou no formulário de captura. Adicionar apenas, nunca modificar fluxo existente.

---

## Critérios de Aceitação

### CA-2.1.1 — Nova seção HTML no index.html
- [ ] Seção `#section-q11` adicionada entre `#section-quiz` e `#section-captura`
- [ ] Seção começa com `class="section hidden"` (oculta por padrão)
- [ ] Contém: bloco de label "Quase lá! Uma última pergunta antes do seu diagnóstico."
- [ ] Contém: `<h2>` com o texto da pergunta
- [ ] Contém: `<textarea id="q11-input" class="q11-textarea" minlength="20">` com placeholder correto
- [ ] Contém: contador `<p class="q11-counter"><span id="q11-chars">0</span> caracteres (mínimo 20)</p>`
- [ ] Contém: `<button id="btn-q11-avancar" class="btn-primary" disabled>Ver meu diagnóstico →</button>`

**HTML exato a inserir (copiar da ARCH Seção 3):**
```html
<section id="section-q11" class="section hidden">
  <div class="quiz-container">
    <p class="bloco-label">Quase lá! Uma última pergunta antes do seu diagnóstico.</p>
    <h2 class="pergunta-texto">
      Conta pra gente: qual é a maior dificuldade da sua operação hoje?
      O que você imagina como solução e como enxerga esse caminho?
    </h2>
    <textarea
      id="q11-input"
      class="q11-textarea"
      minlength="20"
      placeholder="Ex: Nosso maior gargalo é o atendimento ao cliente. Respondemos tarde, perdemos vendas. Imagino que um chatbot poderia ajudar, mas não sei por onde começar..."
    ></textarea>
    <p class="q11-counter"><span id="q11-chars">0</span> caracteres (mínimo 20)</p>
    <button id="btn-q11-avancar" class="btn-primary" disabled>
      Ver meu diagnóstico →
    </button>
  </div>
</section>
```

### CA-2.1.2 — Estilos CSS para Q11 (style.css)
- [ ] Classe `.q11-textarea` adicionada com: `width: 100%`, `min-height: 140px`, `padding: 16px`, `border: 2px solid rgba(255,255,255,0.1)`, `border-radius: 8px`, `background: rgba(255,255,255,0.05)`, `color: var(--color-light)`, `resize: vertical`
- [ ] `.q11-textarea:focus` com `outline: none` e `border-color: var(--color-primary)`
- [ ] `.q11-textarea::placeholder` com `color: rgba(255,255,255,0.35)` e `font-style: italic`
- [ ] Classe `.q11-counter` com `font-size: 0.8rem`, `color: rgba(255,255,255,0.4)`, `text-align: right`, `margin-top: 6px`

**CSS exato a adicionar:**
```css
/* Textarea Q11 */
.q11-textarea {
  width: 100%;
  min-height: 140px;
  padding: 16px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  color: var(--color-light);
  font-family: var(--font-family);
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.q11-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.q11-textarea::placeholder {
  color: rgba(255,255,255,0.35);
  font-style: italic;
}

.q11-counter {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  text-align: right;
  margin-top: 6px;
}
```

### CA-2.1.3 — Estado Q11_GATE no quiz.js
- [ ] Constante `Q11_MIN_CHARS = 20` adicionada ao bloco de constantes existentes
- [ ] A função `avancarPergunta()` (ou equivalente) ao detectar que Q10 foi respondida, chama `goTo('q11')` em vez de `goTo('captura')`
- [ ] Event listener no `q11Input` atualiza o contador de caracteres em tempo real
- [ ] Botão `#btn-q11-avancar` permanece `disabled` enquanto `q11Input.value.trim().length < 20`
- [ ] Ao clicar o botão, armazena `state.answers.q11 = q11Input.value.trim()` e chama `goTo('captura')`

**Código JS a adicionar:**
```javascript
// Constante (adicionar ao bloco de constantes)
const Q11_MIN_CHARS = 20;

// Após responder Q10, vai para Q11_GATE (não para captura)
// Encontrar a chamada goTo('captura') no final de avancarPergunta() e trocar por:
// if (state.currentQuestion === PERGUNTAS.length - 1) {
//   goTo('q11');
//   return;
// }

// Lógica de validação Q11 (adicionar no bloco de event listeners)
const q11Input = document.getElementById('q11-input');
const btnQ11 = document.getElementById('btn-q11-avancar');
const q11Counter = document.getElementById('q11-chars');

q11Input.addEventListener('input', () => {
  const len = q11Input.value.trim().length;
  q11Counter.textContent = len;
  btnQ11.disabled = len < Q11_MIN_CHARS;
});

btnQ11.addEventListener('click', () => {
  state.answers.q11 = q11Input.value.trim();
  goTo('captura');
});
```

### CA-2.1.4 — Payload do webhook atualizado
- [ ] Função `montarPayload()` (ou equivalente) inclui `q11_contexto: state.answers.q11 || ''`
- [ ] Campo `q11_contexto` posicionado após `q10_investimento` no objeto payload

### CA-2.1.5 — Teste funcional
- [ ] Ao responder Q10 e clicar em avançar, a tela de Q11 aparece (não vai para captura)
- [ ] Botão "Ver meu diagnóstico" fica desabilitado com 0–19 caracteres
- [ ] Contador mostra número correto de caracteres em tempo real
- [ ] Com 20+ caracteres o botão habilita
- [ ] Ao clicar o botão, vai para o formulário de captura
- [ ] Q1–Q10, score e trilha continuam funcionando normalmente (regressão)
- [ ] Abrir DevTools → Console não mostra erros

---

## Dev Notes

- **Não criar novo arquivo** — modificar os 3 existentes: `index.html`, `style.css`, `quiz.js`
- Verificar onde exatamente no `quiz.js` a transição de Q10 para a captura é feita — pode ser em `avancarPergunta()` ou em outro handler de clique
- A `goTo()` existente já sabe mostrar/ocultar seções — apenas passar `'q11'` como argumento
- O `state.answers` já é um objeto — apenas adicionar a chave `q11`
- **Verificar:** `#section-captura` tem alguma lógica de reset? Se sim, garantir que não limpa o state.answers.q11

---

## Definição de Pronto (DoD)

- [ ] `#section-q11` existe e renderiza corretamente no HTML
- [ ] Estilos Q11 aplicados (textarea visualmente integrado ao design existente)
- [ ] Fluxo Q10 → Q11 → Captura funciona sem errors no console
- [ ] Validação de 20 chars funcionando
- [ ] `q11_contexto` presente no payload (verificar no Network tab do DevTools)
- [ ] Regressão Q1–Q10 + score + trilhas intactos

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Baseada em: PRD-quiz-diagnostico-iaeo-fase2.md FR-01, FR-07 + ARCH Seção 3*  
*Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO*
