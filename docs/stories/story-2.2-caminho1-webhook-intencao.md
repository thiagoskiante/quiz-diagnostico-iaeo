# Story 2.2 — Frontend: Texto Caminho 1 + Webhook de Intenção de Compra
**Status:** 🔲 Pendente  
**Sprint:** 2  
**Estimativa:** 30 minutos  
**Agente:** @dev  
**PRD Ref:** FR-02, FR-03  
**Arch Ref:** Seção 3 — Arquitetura do Frontend — Fase 2  
**Depende de:** Story 2.1 ✅ (Q11 no frontend)  
**Pode rodar em paralelo com:** Story 2.3, Story 2.7

---

## User Story

**Como** visitante que chegou na tela de resultado (Caminho 1),  
**Quero** ver um texto claro sobre o que o Diagnóstico IAEO oferece e o que custa,  
**Para que** eu tome uma decisão informada antes de clicar no botão de contato.

**Como** time IAEO,  
**Quero** saber imediatamente quando um lead demonstra intenção de compra clicando no Caminho 1,  
**Para que** o atendente possa entrar em contato com prioridade máxima.

---

## Contexto para o @dev

Esta story faz **duas mudanças na tela de resultado** (seção `#section-resultado`):

1. **Atualiza o texto do Caminho 1** — substitui o texto antigo pelo novo aprovado pela IAEO
2. **Adiciona fire-and-forget webhook** — quando o lead clica no botão do Caminho 1, além do modal existente, dispara um POST silencioso para o n8n registrar a intenção

O webhook de intenção é **fire-and-forget**: erro silencioso em try/catch, não bloqueia a UX do usuário. O modal de confirmação aparece normalmente independente do resultado do POST.

**Arquivo a modificar:**
- `quiz-diagnostico-iaeo/index.html` (texto do Caminho 1)
- `quiz-diagnostico-iaeo/quiz.js` (constante + função + listener)

---

## Critérios de Aceitação

### CA-2.2.1 — Texto do Caminho 1 atualizado (index.html)
- [ ] Substituir o texto atual do Caminho 1 pelo texto aprovado abaixo
- [ ] O botão do Caminho 1 mantém o mesmo ID/classe que já tem (não criar novo botão)
- [ ] O texto do valor é: "**A partir de R$ 3.000** *(varia por porte e complexidade)*"

**Texto exato do Caminho 1 (substituir o existente):**
```html
<!-- Caminho 1 — Diagnóstico IAEO -->
<div class="caminho caminho-1">
  <h3>🤝 DIAGNÓSTICO IAEO</h3>
  <p>
    Nosso time analisa sua operação e identifica <strong>por onde começar com IA</strong> 
    — qual processo tem menor complexidade, maior ROI e onde a implementação faz sentido real.
  </p>
  <p>
    Você recebe um estudo de viabilidade completo antes de investir qualquer coisa em tecnologia.
  </p>
  <p class="preco"><strong>A partir de R$ 3.000</strong> <em>(varia por porte e complexidade)</em></p>
  <button id="btn-caminho1" class="btn-caminho btn-caminho1">
    Quero o Diagnóstico IAEO
  </button>
</div>
```
> ⚠️ Verificar o ID/classe real do botão no HTML existente e manter consistente. Adaptar o trecho acima se necessário — o importante é o texto e o preço.

### CA-2.2.2 — Constante do webhook de intenção (quiz.js)
- [ ] Constante `N8N_INTENCAO_URL` adicionada ao bloco de constantes existentes
- [ ] Valor: `'https://skiante-dev.iaeo.com.br/webhook/intencao-caminho'`

```javascript
// Adicionar ao bloco de constantes (junto com N8N_WEBHOOK_URL, KIWIFY_URL, etc.)
const N8N_INTENCAO_URL = 'https://skiante-dev.iaeo.com.br/webhook/intencao-caminho';
```

### CA-2.2.3 — Função registrarIntencaoCaminho1() (quiz.js)
- [ ] Função `registrarIntencaoCaminho1()` implementada conforme especificação
- [ ] Payload contém: `nome`, `whatsapp`, `email`, `empresa`, `score`, `trilha`, `acao: 'caminho1_clicado'`, `timestamp` (ISO8601)
- [ ] Implementada como `async` com `try/catch` silencioso
- [ ] Erro capturado com `console.warn()` — nunca `console.error()` ou `throw`
- [ ] Não usa `await` de forma que bloqueie a UX (fire-and-forget pattern)

**Código exato a adicionar:**
```javascript
async function registrarIntencaoCaminho1() {
  const payload = {
    nome: state.formData.nome,
    whatsapp: state.formData.whatsapp,
    email: state.formData.email,
    empresa: state.formData.empresa,
    score: state.score,
    trilha: state.trilha,
    acao: 'caminho1_clicado',
    timestamp: new Date().toISOString()
  };
  try {
    await fetch(N8N_INTENCAO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // Silencioso — não bloqueia a UX
    console.warn('Webhook intenção falhou:', e);
  }
}
```

### CA-2.2.4 — Event listener no botão Caminho 1 (quiz.js)
- [ ] O event listener do botão Caminho 1 chama AMBOS: exibir modal + `registrarIntencaoCaminho1()`
- [ ] `registrarIntencaoCaminho1()` é chamada **sem await** (fire-and-forget — não bloqueia)
- [ ] O modal de confirmação aparece imediatamente, independente do webhook

```javascript
// Encontrar o event listener do botão Caminho 1 e adicionar a chamada:
btnCaminho1.addEventListener('click', () => {
  document.getElementById('modal-caminho1').classList.remove('hidden'); // lógica existente
  registrarIntencaoCaminho1(); // NOVO — fire-and-forget, sem await
});
```
> ⚠️ Verificar como o listener atual do Caminho 1 está implementado no `quiz.js` existente e adaptar sem quebrar a lógica do modal.

### CA-2.2.5 — Teste funcional
- [ ] Tela de resultado exibe o novo texto do Caminho 1 corretamente
- [ ] Preço "A partir de R$ 3.000" visível
- [ ] Ao clicar no botão Caminho 1, o modal aparece imediatamente (sem delay)
- [ ] Ao clicar no botão Caminho 1, no Network tab do DevTools aparece um POST para `/intencao-caminho` (pode ser pending/failed — o n8n ainda não existe, mas o fetch foi feito)
- [ ] Caminho 2 (Kiwify) não foi alterado e continua funcionando
- [ ] Console sem erros (apenas possível `console.warn` se o webhook falhar por o n8n não estar configurado)

---

## Dev Notes

- O `state.formData` deve já existir após o usuário preencher o formulário de captura. Verificar exatamente como os dados do formulário são armazenados no `state` do quiz.js da Fase 1.
- A função `registrarIntencaoCaminho1()` depende de `state.formData.nome`, `state.formData.whatsapp`, etc. — garantir que esses campos existem no state quando o resultado é exibido.
- **Não modificar** o modal existente do Caminho 1 — apenas adicionar a chamada do webhook.
- O webhook `/intencao-caminho` ainda não existe no n8n (será criado na Story 2.7) — o fetch vai falhar com network error, o que é esperado e silenciado pelo catch.

---

## Definição de Pronto (DoD)

- [ ] Texto do Caminho 1 atualizado conforme especificação
- [ ] `N8N_INTENCAO_URL` definida nas constantes
- [ ] `registrarIntencaoCaminho1()` implementada e conectada ao botão
- [ ] Modal aparece imediatamente ao clicar (sem await que bloqueie)
- [ ] Regressão: Caminho 2 + fluxo principal intactos

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Baseada em: PRD-quiz-diagnostico-iaeo-fase2.md FR-02, FR-03 + ARCH Seção 3*  
*Sprint 2 — Fase 2 do Quiz Diagnóstico IAEO*
