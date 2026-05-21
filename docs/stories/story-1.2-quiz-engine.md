# Story 1.2 — Quiz Engine: Perguntas, Score e Navegação
**Status:** ✅ CONCLUÍDO — Implementado e validado pelo @po em 21/05/2026  
**Sprint:** 1  
**Estimativa:** 1 hora  
**Agente:** @dev  
**PRD Ref:** FR-01, FR-02, FR-03, Seção 8 (Tabela de Pontuação)  
**Arch Ref:** Seção 3 — State Machine, SCORE_MAP, calcularTrilha()  
**Depende de:** Story 1.1 ✅  

---

## User Story

**Como** visitante que iniciou o quiz,  
**Quero** responder 10 perguntas navegando de forma clara com progresso visível,  
**Para que** eu possa concluir o diagnóstico sem me perder ou se frustrar.

---

## Contexto para o @dev

Esta story implementa o **coração do quiz**: o array de perguntas, a renderização dinâmica, a barra de progresso, a lógica de score e o desvio especial para Colaborador na Q3.

A seção `#section-quiz` (criada na Story 1.1, mas vazia) agora ganha vida.

**Pré-condição:** Story 1.1 concluída. `goTo()` funciona. CSS base existe.

---

## Dados Completos das Perguntas

Implementar exatamente este array em `quiz.js`:

```javascript
const PERGUNTAS = [
  {
    id: 'q1',
    bloco: 'Qualificação de Porte',
    texto: 'Qual o faturamento médio mensal da sua empresa?',
    opcoes: [
      { texto: 'Até R$ 100 mil/mês',        pontos: 5  },
      { texto: 'De R$ 100k a R$ 500k/mês',  pontos: 15 },
      { texto: 'De R$ 500k a R$ 1M/mês',    pontos: 20 },
      { texto: 'Acima de R$ 1M/mês',         pontos: 30 }
    ]
  },
  {
    id: 'q2',
    bloco: 'Qualificação de Porte',
    texto: 'Quantos colaboradores trabalham na sua empresa?',
    opcoes: [
      { texto: '1 a 10',        pontos: 5  },
      { texto: '11 a 50',       pontos: 15 },
      { texto: '51 a 200',      pontos: 20 },
      { texto: 'Mais de 200',   pontos: 25 }
    ]
  },
  {
    id: 'q3',
    bloco: 'Qualificação de Porte',
    texto: 'Qual é seu cargo na empresa?',
    especial: 'colaborador-redirect', // flag para lógica especial
    opcoes: [
      { texto: 'Sou o dono ou sócio',              pontos: 15, redirect: false },
      { texto: 'Sou diretor ou gestor',             pontos: 10, redirect: false },
      { texto: 'Sou colaborador ou analista',       pontos: 0,  redirect: true  }
    ]
  },
  {
    id: 'q4',
    bloco: 'Setor e Dor Principal',
    texto: 'Em qual setor sua empresa atua?',
    opcoes: [
      { texto: 'Construção Civil e Engenharia', pontos: 0 },
      { texto: 'Indústria e Manufatura',        pontos: 0 },
      { texto: 'Logística e Transporte',        pontos: 0 },
      { texto: 'Serviços B2B',                  pontos: 0 },
      { texto: 'Saúde e Clínicas',              pontos: 0 },
      { texto: 'Varejo e Distribuição',         pontos: 0 },
      { texto: 'Tecnologia e Software',         pontos: 0 },
      { texto: 'Outro',                         pontos: 0 }
    ]
  },
  {
    id: 'q5',
    bloco: 'Setor e Dor Principal',
    texto: 'Qual processo da sua empresa mais consome tempo e gera retrabalho hoje?',
    opcoes: [
      { texto: 'Atendimento ao cliente',                    pontos: 0 },
      { texto: 'Vendas e qualificação de leads',            pontos: 0 },
      { texto: 'Cobrança e financeiro',                     pontos: 0 },
      { texto: 'Operação interna (pedidos, produção, entregas)', pontos: 0 },
      { texto: 'Gestão de dados e relatórios',              pontos: 0 }
    ]
  },
  {
    id: 'q6',
    bloco: 'Maturidade Digital',
    texto: 'Sua empresa já tentou implementar IA ou automação?',
    opcoes: [
      { texto: 'Nunca tentamos',                                    pontos: 10 },
      { texto: 'Já tentamos por conta própria, resultado fraco',   pontos: 20 },
      { texto: 'Contratamos alguém, ficou no meio do caminho',     pontos: 25 },
      { texto: 'Temos automações funcionando',                      pontos: 15 }
    ]
  },
  {
    id: 'q7',
    bloco: 'Maturidade Digital',
    texto: 'Sua empresa usa ERP, CRM ou sistema centralizado de dados?',
    opcoes: [
      { texto: 'Não, usamos planilha e WhatsApp',  pontos: 5  },
      { texto: 'Sim, mas mal aproveitado',          pontos: 15 },
      { texto: 'Sim, e bem usado',                  pontos: 20 }
    ]
  },
  {
    id: 'q8',
    bloco: 'Maturidade Digital',
    texto: 'Como você toma decisões estratégicas hoje?',
    opcoes: [
      { texto: 'Intuição e experiência',              pontos: 5  },
      { texto: 'Relatórios manuais semanais',         pontos: 10 },
      { texto: 'Dashboards e dados em tempo real',    pontos: 20 }
    ]
  },
  {
    id: 'q9',
    bloco: 'Urgência e Investimento',
    texto: 'Em quanto tempo você quer ver IA funcionando na sua empresa?',
    opcoes: [
      { texto: 'Já comecei a buscar, é urgente',     pontos: 25 },
      { texto: 'Próximos 3 meses',                   pontos: 20 },
      { texto: 'Próximos 6 meses',                   pontos: 10 },
      { texto: 'Estou pesquisando, sem prazo',        pontos: 5  }
    ]
  },
  {
    id: 'q10',
    bloco: 'Urgência e Investimento',
    texto: 'Quanto sua empresa investiria para ter IA aplicada com método em 90 dias?',
    opcoes: [
      { texto: 'Menos de R$ 5 mil',      pontos: 5  },
      { texto: 'R$ 5k a R$ 20k',         pontos: 15 },
      { texto: 'R$ 20k a R$ 60k',        pontos: 25 },
      { texto: 'Acima de R$ 60k',        pontos: 30 },
      { texto: 'Depende do retorno',     pontos: 20 }
    ]
  }
];
```

---

## Lógica de Segmentação Interna (implementar em quiz.js)

```javascript
// INTERNO — nunca exibir ao usuário
function calcularTrilha(answers, score) {
  const faturamento = answers.q1;
  if (faturamento === 'Até R$ 100 mil/mês') return 'A';
  if (faturamento === 'Acima de R$ 1M/mês' && score >= 70) return 'C';
  if (score >= 40) return 'B';
  return 'A'; // fallback conservador
}
```

---

## Critérios de Aceitação

### CA-1.2.1 — Renderização dinâmica de perguntas
- [ ] A seção `#section-quiz` renderiza o texto da pergunta atual dinamicamente
- [ ] As opções são renderizadas como botões/cards clicáveis
- [ ] Apenas UMA pergunta aparece por vez
- [ ] O bloco temático é exibido acima da pergunta (ex: "Bloco 1 — Qualificação de Porte")

### CA-1.2.2 — Barra de progresso
- [ ] Barra de progresso visível indicando "Pergunta X de 10"
- [ ] Barra atualiza a cada pergunta avançada
- [ ] Progresso visual (barra preenchida proporcionalmente)

### CA-1.2.3 — Navegação voltar/avançar
- [ ] Botão "Voltar" aparece a partir da pergunta 2
- [ ] Ao voltar, a resposta anterior fica pré-selecionada (estado persistido)
- [ ] Botão "Avançar" (ou seleção de opção) avança para próxima pergunta
- [ ] Não é possível avançar sem selecionar uma opção

### CA-1.2.4 — Acúmulo de score
- [ ] `state.score` é incrementado com os pontos da opção selecionada
- [ ] `state.answers` armazena o texto da opção selecionada por questão (ex: `{ q1: 'Acima de R$ 1M/mês', q2: '11 a 50', ... }`)
- [ ] Ao voltar e mudar resposta, score é recalculado corretamente (subtrai pontos antigos, adiciona novos)

### CA-1.2.5 — Desvio Colaborador (Q3)
- [ ] Se usuário seleciona "Sou colaborador ou analista" na Q3:
  - Estado muda para `'youtube'`
  - `goTo('youtube')` é chamado
  - Usuário NÃO vê formulário de captura
  - Seção `#section-youtube` exibe mensagem: "Que bom ter você aqui! Preparamos conteúdo especial no YouTube para você entender como a IA pode transformar sua área. Veja agora!"
  - Botão "Assistir no YouTube" abre `YOUTUBE_URL` em nova aba (`window.open`)

### CA-1.2.6 — Conclusão do quiz
- [ ] Ao responder a Q10, `goTo('captura')` é chamado automaticamente
- [ ] `state.score` contém o total correto
- [ ] `state.trilha` é calculado via `calcularTrilha()` e armazenado em `state`
- [ ] `state.trilha` é apenas para uso interno (não exibido ao usuário em nenhum momento)

### CA-1.2.7 — Score máximo correto
- [ ] Teste mental: responder todas as opções de maior pontuação resulta em score = 190
  - Q1: 30, Q2: 25, Q3: 15, Q4: 0, Q5: 0, Q6: 25, Q7: 20, Q8: 20, Q9: 25, Q10: 30 = 190

---

## Definição de Pronto (DoD)

- [ ] Todos os CAs acima passam
- [ ] Navegar pelas 10 perguntas completas sem erro no console
- [ ] Voltar da Q5 para Q4 mantém resposta selecionada
- [ ] Responder "Colaborador" na Q3 redireciona para seção youtube (não para captura)
- [ ] Responder Q10 exibe seção de captura (vazia por ora — Story 1.3 implementa)
- [ ] `console.log(state)` após Q10 mostra score e trilha corretos

---

## O que NÃO fazer nesta story

- ❌ Não implementar formulário de captura (Story 1.3)
- ❌ Não fazer POST para n8n (Story 1.3)
- ❌ Não estilizar além do necessário para funcionar (Story 1.4 faz polish)
- ❌ Não exibir a trilha (A/B/C) ao usuário em nenhum lugar

---

*Story criada por River (SM Agent — IAEO Framework)*  
*Rastreamento: PRD FR-01 + FR-02 + FR-03 + Seção 8 + ARCH State Machine*
