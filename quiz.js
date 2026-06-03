/* =============================================
   QUIZ DIAGNÓSTICO IAEO
   Stories: 1.1 (state machine) + 1.2 (quiz engine) + 1.3 (captura + integração)
   ============================================= */

// ─── CONSTANTES ───────────────────────────────
const N8N_WEBHOOK_URL  = 'https://skiante-dev.iaeo.com.br/webhook/Imersaodesenvolvi';
const N8N_INTENCAO_URL = 'https://skiante-dev.iaeo.com.br/webhook/intencao-caminho';
const KIWIFY_URL       = 'https://pay.kiwify.com.br/fJCNgjy';
const SALES_PAGE_URL   = 'https://deploy-lemon-alpha.vercel.app'; // Sales page v7 premium — identidade IAEO
const WHATSAPP_URL     = 'https://wa.me/554137952570?text=Ol%C3%A1!%20Vim%20pelo%20Quiz%20IAEO%20e%20tenho%20interesse%20no%20Diagn%C3%B3stico';
const YOUTUBE_URL      = 'https://www.youtube.com/@thiagoskiante?sub_confirmation=1';
const Q11_MIN_CHARS    = 20;

// ─── STATE MACHINE ────────────────────────────
const state = {
  current:     'intro',
  perguntaIdx: 0,
  answers:     {},  // { q1: 'texto escolhido', q2: 'texto', ... }
  score:       0,
  trilha:      null,
  enviado:     false,
  captura:     null  // dados do formulário (nome, whatsapp, email, empresa, cargo)
};

function goTo(section) {
  const sections = [
    'intro', 'quiz', 'q11', 'captura', 'processando', 'resultado', 'youtube'
  ];
  sections.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) {
      if (s === section) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
  state.current = section;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── DADOS DAS PERGUNTAS ──────────────────────
const PERGUNTAS = [
  // ── BLOCO 1: PERFIL ───────────────────────────────────────
  {
    id: 'q1',
    bloco: 'Seu perfil',
    texto: 'Qual é o seu papel hoje?',
    especial: 'colaborador-redirect',
    opcoes: [
      { texto: 'Sou dono ou sócio da empresa',              pontos: 15, redirect: false },
      { texto: 'Sou gestor ou diretor de uma área',         pontos: 10, redirect: false },
      { texto: 'Sou colaborador querendo aprender',         pontos: 0,  redirect: true  },
      { texto: 'Estou começando meu negócio',               pontos: 8,  redirect: false }
    ]
  },
  {
    id: 'q2',
    bloco: 'Seu perfil',
    texto: 'Qual é o principal setor do seu negócio?',
    opcoes: [
      { texto: 'Serviços / Consultoria',       pontos: 0 },
      { texto: 'Saúde / Clínica',              pontos: 0 },
      { texto: 'Varejo / E-commerce',          pontos: 0 },
      { texto: 'Indústria / Manufatura',       pontos: 0 },
      { texto: 'Educação / Infoproduto',       pontos: 0 },
      { texto: 'Logística / Transporte',       pontos: 0 },
      { texto: 'Outro',                        pontos: 0 }
    ]
  },
  {
    id: 'q3',
    bloco: 'Seu perfil',
    texto: 'Quantas pessoas trabalham na sua empresa?',
    opcoes: [
      { texto: 'Só eu (solopreneur)',    pontos: 5  },
      { texto: '2 a 10 pessoas',        pontos: 10 },
      { texto: '11 a 50 pessoas',       pontos: 20 },
      { texto: 'Mais de 50',            pontos: 25 }
    ]
  },

  // ── BLOCO 2: DOR ─────────────────────────────────────────
  {
    id: 'q4',
    bloco: 'Onde está a perda',
    texto: 'O que mais consome tempo da sua equipe hoje?',
    opcoes: [
      { texto: 'Atendimento e respostas repetitivas',          pontos: 0 },
      { texto: 'Relatórios, planilhas e controles manuais',    pontos: 0 },
      { texto: 'Captação e qualificação de leads',             pontos: 0 },
      { texto: 'Operação e processos internos',                pontos: 0 }
    ]
  },
  {
    id: 'q5',
    bloco: 'Onde está a perda',
    texto: 'Sua empresa já perdeu venda ou cliente por falta de agilidade?',
    opcoes: [
      { texto: 'Sim, frequentemente',      pontos: 25 },
      { texto: 'Às vezes acontece',        pontos: 20 },
      { texto: 'Raramente',                pontos: 10 },
      { texto: 'Não consigo medir isso',   pontos: 5  }
    ]
  },
  {
    id: 'q6',
    bloco: 'Onde está a perda',
    texto: 'Como você toma decisões no negócio hoje?',
    opcoes: [
      { texto: 'Na intuição e experiência',             pontos: 5  },
      { texto: 'Com dados mas de forma manual',         pontos: 10 },
      { texto: 'Com dados em tempo real',               pontos: 20 },
      { texto: 'Não tenho dados suficientes',           pontos: 8  }
    ]
  },

  // ── BLOCO 3: MATURIDADE COM IA ───────────────────────────
  {
    id: 'q7',
    bloco: 'Sua relação com IA',
    texto: 'Qual é sua experiência com IA hoje?',
    opcoes: [
      { texto: 'Nunca usei no negócio',                          pontos: 10 },
      { texto: 'Testei o ChatGPT mas não apliquei de verdade',   pontos: 20 },
      { texto: 'Uso algumas ferramentas pontualmente',           pontos: 15 },
      { texto: 'Já tenho algo implementado mas quero mais',      pontos: 25 }
    ]
  },
  {
    id: 'q8',
    bloco: 'Sua relação com IA',
    texto: 'O que te trava de implementar IA hoje?',
    opcoes: [
      { texto: 'Não sei por onde começar',                pontos: 0 },
      { texto: 'Tenho medo de gastar e não usar',         pontos: 0 },
      { texto: 'Falta tempo da equipe',                   pontos: 0 },
      { texto: 'Não sei se faz sentido pro meu negócio',  pontos: 0 }
    ]
  },

  // ── BLOCO 4: INTENÇÃO ────────────────────────────────────
  {
    id: 'q9',
    bloco: 'Próximo passo',
    texto: 'Se você soubesse onde IA gera retorno, o que faria?',
    opcoes: [
      { texto: 'Tentaria implementar sozinho',         pontos: 10 },
      { texto: 'Contrataria alguém pra fazer',         pontos: 25 },
      { texto: 'Quero entender antes de decidir',      pontos: 15 },
      { texto: 'Dependeria do investimento',           pontos: 20 }
    ]
  },
  {
    id: 'q10',
    bloco: 'Próximo passo',
    texto: 'Quanto sua empresa investiria para ter IA aplicada com método?',
    opcoes: [
      { texto: 'Menos de R$ 5 mil',      pontos: 5  },
      { texto: 'R$ 5k a R$ 20k',         pontos: 15 },
      { texto: 'R$ 20k a R$ 60k',        pontos: 25 },
      { texto: 'Acima de R$ 60k',        pontos: 30 },
      { texto: 'Depende do retorno',     pontos: 20 }
    ]
  }
];

// ─── LÓGICA DE SEGMENTAÇÃO (INTERNA) ─────────
function calcularTrilha(answers, score) {
  // Trilha baseada no tamanho da empresa (q3) + score
  const tamanho = answers.q3;
  if (tamanho === 'Só eu (solopreneur)' || tamanho === '2 a 10 pessoas') return 'A';
  if ((tamanho === 'Mais de 50') && score >= 70) return 'C';
  if (score >= 40) return 'B';
  return 'A'; // fallback conservador
}

// ─── CÁLCULO DE FATURAMENTO PRA RECOMENDAÇÃO DE NÍVEL ─────
// Mapeamento baseado em tamanho (q3) já que não temos mais q1=faturamento
function calcularFaturamentoEstimado(answers) {
  const tamanho = answers.q3 || '';
  const investimento = answers.q10 || '';
  // Se disposição de investimento é alta → provavelmente médio/grande porte
  if (investimento === 'R$ 20k a R$ 60k' || investimento === 'Acima de R$ 60k') {
    return 'De R$ 500k a R$ 1M/mês'; // → recomenda nivel-2 (R$8k)
  }
  if (tamanho === 'Mais de 50' || tamanho === '11 a 50 pessoas') {
    return 'De R$ 500k a R$ 1M/mês'; // → recomenda nivel-2
  }
  return 'Até R$ 100 mil/mês'; // → recomenda nivel-1 (R$97)
}

// ─── RENDERIZAÇÃO DO QUIZ ─────────────────────
function renderizarPergunta() {
  const idx  = state.perguntaIdx;
  const perg = PERGUNTAS[idx];
  const total = PERGUNTAS.length;
  const progPercent = Math.round(((idx + 1) / total) * 100);

  // Atualiza progresso
  document.getElementById('progress-bloco').textContent =
    `Bloco — ${perg.bloco}`;
  document.getElementById('progress-texto').textContent =
    `Pergunta ${idx + 1} de ${total}`;
  document.getElementById('progress-bar').style.width = `${progPercent}%`;

  // Botão voltar
  const btnVoltar = document.getElementById('btn-voltar');
  if (idx > 0) {
    btnVoltar.classList.remove('hidden');
  } else {
    btnVoltar.classList.add('hidden');
  }

  // Determina se tem muitas opções (5+) para layout coluna única no desktop
  const muitasOpcoes = perg.opcoes.length >= 5;

  // Renderiza pergunta e opções
  const container = document.getElementById('quiz-content');
  container.innerHTML = `
    <p class="quiz-pergunta">${perg.texto}</p>
    <div class="quiz-opcoes${muitasOpcoes ? ' muitas-opcoes' : ''}">
      ${perg.opcoes.map((op, i) => `
        <button
          class="opcao-btn${state.answers[perg.id] === op.texto ? ' selecionada' : ''}"
          onclick="selecionarOpcao(${idx}, ${i})"
          data-idx="${i}"
        >
          ${op.texto}
        </button>
      `).join('')}
    </div>
  `;
}

function selecionarOpcao(pergIdx, opcaoIdx) {
  const perg  = PERGUNTAS[pergIdx];
  const opcao = perg.opcoes[opcaoIdx];

  // Subtrai pontos da resposta anterior (se existir)
  if (state.answers[perg.id] !== undefined) {
    const opcaoAnterior = perg.opcoes.find(o => o.texto === state.answers[perg.id]);
    if (opcaoAnterior) {
      state.score -= opcaoAnterior.pontos;
    }
  }

  // Registra nova resposta e soma pontos
  state.answers[perg.id] = opcao.texto;
  state.score += opcao.pontos;

  // Verifica desvio colaborador (Q3)
  if (perg.especial === 'colaborador-redirect' && opcao.redirect === true) {
    goTo('youtube');
    return;
  }

  // Avança para próxima pergunta ou Q11 (Fase 2)
  if (pergIdx < PERGUNTAS.length - 1) {
    state.perguntaIdx = pergIdx + 1;
    renderizarPergunta();
  } else {
    // Quiz completo — calcula trilha e vai para Q11 (Fase 2: antes da captura)
    state.trilha = calcularTrilha(state.answers, state.score);
    goTo('q11');
  }
}

function voltarPergunta() {
  if (state.perguntaIdx > 0) {
    // Remove pontos da resposta atual (se existir)
    const perg = PERGUNTAS[state.perguntaIdx];
    if (state.answers[perg.id] !== undefined) {
      const opcaoAtual = perg.opcoes.find(o => o.texto === state.answers[perg.id]);
      if (opcaoAtual) {
        state.score -= opcaoAtual.pontos;
        delete state.answers[perg.id];
      }
    }
    state.perguntaIdx--;
    renderizarPergunta();
  }
}

// ─── VALIDAÇÃO DO FORMULÁRIO ──────────────────
function limparErros() {
  ['nome', 'whatsapp', 'email', 'empresa', 'cargo'].forEach(field => {
    const input = document.getElementById(`input-${field}`);
    const erro  = document.getElementById(`erro-${field}`);
    if (input) input.classList.remove('erro');
    if (erro)  erro.textContent = '';
  });
}

function mostrarErro(field, mensagem) {
  const input = document.getElementById(`input-${field}`);
  const erro  = document.getElementById(`erro-${field}`);
  if (input) input.classList.add('erro');
  if (erro)  erro.textContent = mensagem;
}

function validarFormulario() {
  limparErros();
  let valido = true;

  const nome     = document.getElementById('input-nome').value.trim();
  const whatsapp = document.getElementById('input-whatsapp').value.trim();
  const email    = document.getElementById('input-email').value.trim();
  const empresa  = document.getElementById('input-empresa').value.trim();
  const cargo    = document.getElementById('input-cargo').value.trim();

  if (!nome || nome.length < 3) {
    mostrarErro('nome', 'Por favor, informe seu nome completo.');
    valido = false;
  }

  const wClean = whatsapp.replace(/\D/g, '');
  if (!wClean || wClean.length < 10 || wClean.length > 13) {
    mostrarErro('whatsapp', 'Informe um WhatsApp válido (ex: 11 99999-9999).');
    valido = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    mostrarErro('email', 'Informe um e-mail válido.');
    valido = false;
  }

  if (!empresa || empresa.length < 2) {
    mostrarErro('empresa', 'Informe o nome da empresa.');
    valido = false;
  }

  if (!cargo || cargo.length < 2) {
    mostrarErro('cargo', 'Informe seu cargo.');
    valido = false;
  }

  return valido;
}

// ─── MONTAGEM DO PAYLOAD ──────────────────────
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source:   params.get('utm_source')   || null,
    utm_medium:   params.get('utm_medium')   || null,
    utm_campaign: params.get('utm_campaign') || null
  };
}

function normalizarWhatsApp(raw) {
  const digits = raw.replace(/\D/g, '');
  // Garante formato 55 + DDD + número
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 11 || digits.length === 10) return '55' + digits;
  return digits;
}

function montarPayload(nome, whatsapp, email, empresa, cargo) {
  const utms = getUTMParams();
  return {
    // Dados de contato
    nome:     nome,
    whatsapp: normalizarWhatsApp(whatsapp),
    email:    email,
    empresa:  empresa,
    cargo:    cargo,

    // Respostas do quiz (novos campos Fase 2)
    q1_papel:          state.answers.q1  || null,  // cargo/papel
    q2_setor:          state.answers.q2  || null,  // setor
    q3_tamanho:        state.answers.q3  || null,  // tamanho equipe
    q4_gargalo:        state.answers.q4  || null,  // o que consome mais tempo
    q5_perda_venda:    state.answers.q5  || null,  // perdeu venda por falta de agilidade
    q6_decisao:        state.answers.q6  || null,  // como toma decisões
    q7_experiencia_ia: state.answers.q7  || null,  // experiência com IA
    q8_travamento:     state.answers.q8  || null,  // o que trava de implementar
    q9_intencao:       state.answers.q9  || null,  // o que faria se soubesse onde
    q10_investimento:  state.answers.q10 || null,  // disposição de investimento

    // Campos legados (mantidos pra compatibilidade com n8n) — derivados dos novos
    q1_faturamento:    calcularFaturamentoEstimado(state.answers),
    q4_setor:          state.answers.q2  || null,  // setor agora está em q2
    q5_dor:            state.answers.q4  || null,  // dor/gargalo agora em q4
    q6_experiencia_ia: state.answers.q7  || null,  // exp. IA agora em q7
    q7_sistemas:       state.answers.q6  || null,  // decisão/dados agora em q6
    q8_decisao:        state.answers.q6  || null,
    q9_urgencia:       state.answers.q9  || null,

    // Q11 — campo aberto (Fase 2)
    q11_contexto: state.answers.q11 || '',

    // Score e trilha (internos)
    score:  state.score,
    trilha: state.trilha,

    // UTM e rastreamento
    utm_source:   utms.utm_source,
    utm_medium:   utms.utm_medium,
    utm_campaign: utms.utm_campaign,
    referrer:     document.referrer || null,
    user_agent:   navigator.userAgent || null
  };
}

// ─── INTENÇÃO DE COMPRA — CAMINHO 1 (Fase 2) ─
async function registrarIntencaoCaminho1() {
  const payload = {
    nome:      state.captura?.nome    || '',
    whatsapp:  state.captura ? normalizarWhatsApp(state.captura.whatsapp) : '',
    email:     state.captura?.email   || '',
    empresa:   state.captura?.empresa || '',
    score:     state.score,
    trilha:    state.trilha,
    acao:      'caminho1_clicado',
    timestamp: new Date().toISOString()
  };
  try {
    await fetch(N8N_INTENCAO_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
  } catch (e) {
    // Silencioso — não bloqueia a UX
    console.warn('Webhook intenção falhou:', e);
  }
}

// ─── ENVIO PARA N8N ───────────────────────────
async function enviarParaN8n(payload) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const resp = await fetch(N8N_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  controller.signal
    });
    clearTimeout(timeoutId);
    return resp.ok;
  } catch (err) {
    clearTimeout(timeoutId);
    // Falha silenciosa — não bloqueia o usuário
    console.warn('Webhook n8n indisponível (falha silenciosa):', err.message);
    return false;
  }
}

// ─── CÁLCULO DE PREÇO POR FATURAMENTO (legado — mantido por segurança) ──────
// DEPRECIADA: substituída por calcularNivelRecomendado() abaixo
function calcularPrecoDiagnostico(faturamento) {
  const tabela = {
    'Até R$ 100 mil/mês':        { valor: 'R$ 3.000', detalhe: 'para empresas com faturamento até R$ 100 mil/mês' },
    'De R$ 100k a R$ 500k/mês':  { valor: 'R$ 5.000', detalhe: 'para empresas de R$ 100k a R$ 500k/mês' },
    'De R$ 500k a R$ 1M/mês':    { valor: 'R$ 8.000', detalhe: 'para empresas de R$ 500k a R$ 1M/mês' },
    'Acima de R$ 1M/mês':        { valor: 'R$ 10.000', detalhe: 'para empresas acima de R$ 1M/mês' }
  };
  return tabela[faturamento] || { valor: 'Investimento personalizado', detalhe: '(calculado pelo porte da sua empresa)' };
}

// ─── NÍVEL RECOMENDADO POR FATURAMENTO (v2) ──────────────────────────────────
// Substitui calcularPrecoDiagnostico() — não remover a antiga até exibirResultadoV2() testado
// Regras baseadas no tamanho da equipe (q3) + disposição de investimento (q10)
function calcularNivelRecomendado(faturamento) {
  // faturamento aqui pode ser o valor direto de q3 (tamanho) ou o estimado
  const tamanho     = state.answers?.q3  || '';
  const investimento = state.answers?.q10 || '';
  const intencao    = state.answers?.q9  || '';

  // Squad: empresa grande + investimento alto
  // nivel-2: empresa média OU investimento médio/alto OU intenção de contratar
  // nivel-1: pequena / solopreneur / quer fazer sozinho

  let recomendado = 'nivel-1';

  if (tamanho === 'Mais de 50' || investimento === 'Acima de R$ 60k') {
    recomendado = 'nivel-2'; // SQUAD fica só por contato
  } else if (
    tamanho === '11 a 50 pessoas' ||
    investimento === 'R$ 20k a R$ 60k' ||
    investimento === 'R$ 5k a R$ 20k' ||
    intencao === 'Contrataria alguém pra fazer'
  ) {
    recomendado = 'nivel-2';
  }
  return {
    recomendado,
    niveis: [
      {
        id: 'nivel-1',
        titulo: 'Auto-Diagnóstico',
        subtitulo: 'Faça você mesmo',
        preco: 'R$ 97',
        cta: 'Quero fazer por conta própria',
        url: SALES_PAGE_URL,  // → passa pela sales page antes do checkout
        icone: '🔵',
        descricao: 'Workbook + Planilha + 5 vídeos + bônus. Acesso vitalício.'
      },
      {
        id: 'nivel-2',
        titulo: 'Diagnóstico IAEO',
        subtitulo: 'Faça com a gente — remoto',
        preco: 'R$ 8.000',
        cta: 'Quero a IAEO me guiando',
        url: WHATSAPP_URL,
        icone: '🟢',
        descricao: 'Reuniões guiadas online + método completo + garantia de entrega.'
      },
      {
        id: 'nivel-3',
        titulo: 'Diagnóstico SQUAD',
        subtitulo: 'Time de especialistas',
        preco: 'A partir de R$ 25.000',
        cta: 'Quero falar sobre o SQUAD',
        url: WHATSAPP_URL,
        icone: '🔴',
        descricao: 'Imersão presencial ou híbrida. Deslocamento negociado à parte.'
      }
    ]
  };
}

// ─── RENDERIZAR CARDS DE NÍVEL (v2) ──────────────────────────────────────────
function renderizarCardsNiveis(resultado) {
  const wrapper = document.getElementById('niveis-wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = resultado.niveis.map(nivel => {
    const isRecomendado = nivel.id === resultado.recomendado;
    return `
      <div class="nivel-card${isRecomendado ? ' nivel-card--recomendado' : ''}" data-nivel="${nivel.id}">
        ${isRecomendado ? '<div class="nivel-badge-recomendado">⭐ RECOMENDADO PARA VOCÊ</div>' : ''}
        <div class="nivel-icone">${nivel.icone}</div>
        <h3 class="nivel-titulo">${nivel.titulo}</h3>
        <p class="nivel-subtitulo">${nivel.subtitulo}</p>
        <p class="nivel-descricao">${nivel.descricao}</p>
        <p class="nivel-preco">${nivel.preco}</p>
        <a
          href="${nivel.url}"
          target="_blank"
          class="btn ${isRecomendado ? 'btn-primary' : 'btn-secondary'} btn-full nivel-cta"
          data-nivel-id="${nivel.id}"
        >
          ${nivel.cta}
        </a>
      </div>
    `;
  }).join('');

  // Registrar clique nos caminhos que abrem WhatsApp (intenção de contato)
  wrapper.querySelectorAll('[data-nivel-id="nivel-2"], [data-nivel-id="nivel-3"]').forEach(btn => {
    btn.addEventListener('click', function() {
      if (typeof registrarIntencaoCaminho1 === 'function') {
        registrarIntencaoCaminho1();
      }
    });
  });
}

// ─── EXIBIÇÃO DO RESULTADO ────────────────────
function exibirResultado() {
  const nome    = state.captura?.nome?.split(' ')[0] || 'você';
  const empresa = state.captura?.empresa || 'sua empresa';

  // Personalização do título (G3: formato correto da Story 1.3)
  document.getElementById('resultado-titulo').textContent =
    `✅ ${nome}, seu diagnóstico está pronto!`;

  document.getElementById('resultado-subtitulo').textContent =
    `Com base nas respostas de ${empresa}, identificamos o estágio atual ` +
    `da sua operação e o caminho mais rápido para implementar IA com resultado real.`;

  // Preço dinâmico do Caminho 1 conforme faturamento (q1)
  const preco = calcularPrecoDiagnostico(state.answers?.q1);
  const elValor   = document.getElementById('caminho-preco-valor');
  const elDetalhe = document.getElementById('caminho-preco-detalhe');
  if (elValor)   elValor.textContent   = preco.valor;
  if (elDetalhe) elDetalhe.textContent = preco.detalhe;

  // Botão Caminho 1 — exibe modal de confirmação + dispara webhook de intenção (Fase 2)
  const btnC1 = document.getElementById('btn-caminho-1');
  if (btnC1) {
    btnC1.addEventListener('click', function() {
      const modal = document.getElementById('modal-caminho1');
      if (modal) modal.classList.remove('hidden');
      registrarIntencaoCaminho1(); // fire-and-forget — sem await, não bloqueia UX
    });
  }

  // Botão fechar modal
  const btnFechar = document.getElementById('btn-fechar-modal');
  if (btnFechar) {
    btnFechar.addEventListener('click', function() {
      const modal = document.getElementById('modal-caminho1');
      if (modal) modal.classList.add('hidden');
    });
  }

  // Botão Caminho 2 — abre Kiwify
  const btnC2 = document.getElementById('btn-caminho-2');
  if (btnC2) {
    btnC2.addEventListener('click', function() {
      window.open(KIWIFY_URL, '_blank');
    });
  }

  goTo('resultado');
}

// ─── EXIBIÇÃO DO RESULTADO v2 (3 caminhos abertos) ───────────────────────────
function capitalizarEmpresa(str) {
  // Siglas conhecidas ficam em maiúsculo total
  const siglas = ['iaeo', 'ltda', 'sa', 'me', 'epp', 'mei', 'bi', 'ti', 'cia'];
  return str.split(' ').map(palavra => {
    const lower = palavra.toLowerCase();
    if (siglas.includes(lower)) return palavra.toUpperCase();
    return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
  }).join(' ');
}

function exibirResultadoV2() {
  const nome    = state.captura?.nome?.split(' ')[0] || 'você';
  const empresaRaw = state.captura?.empresa || 'sua empresa';
  // Capitaliza preservando siglas: "iaeo teste" → "IAEO Teste"
  const empresa = capitalizarEmpresa(empresaRaw);
  const resultado = calcularNivelRecomendado(state.answers?.q1);

  // 1. Título personalizado com nova frase-bandeira
  const elTitulo = document.getElementById('resultado-titulo');
  if (elTitulo) {
    elTitulo.textContent = `${nome}, descobrimos onde a IA vai gerar LUCRO na ${empresa}`;
  }

  // 2. Subtítulo
  const elSubtitulo = document.getElementById('resultado-subtitulo');
  if (elSubtitulo) {
    elSubtitulo.textContent =
      `Analisamos seu perfil e identificamos o melhor caminho para ${empresa}. ` +
      `Você é quem decide — mas temos uma recomendação:`;
  }

  // 3. Texto de sugestão personalizado
  const elSugestao = document.getElementById('resultado-sugestao');
  if (elSugestao) {
    const nomesNivel = {
      'nivel-1': 'o Auto-Diagnóstico (R$ 97)',
      'nivel-2': 'o Diagnóstico IAEO (R$ 8.000)',
      'nivel-3': 'o Diagnóstico SQUAD'
    };
    elSugestao.textContent =
      `Pelo seu perfil, achamos que ${nomesNivel[resultado.recomendado] || 'o Auto-Diagnóstico'} ` +
      `faz mais sentido pra você. Mas todos os caminhos estão disponíveis:`;
  }

  // 4. Renderizar 3 cards
  renderizarCardsNiveis(resultado);

  goTo('resultado');
}

// ─── ENVIO DO FORMULÁRIO (via addEventListener submit) ────────────────────────
// Registrado no DOMContentLoaded abaixo

// ─── INICIALIZAÇÃO ────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Garante que a intro está visível e inicializa o quiz
  goTo('intro');

  // Pré-renderiza quiz para ter HTML pronto
  renderizarPergunta();

  // ── Submit do formulário de captura (G9: addEventListener em vez de onclick) ──
  const formCaptura = document.getElementById('form-captura');
  if (formCaptura) {
    formCaptura.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Evita duplo envio
      if (state.enviado) return;

      // 1. Coleta dados
      const dados = {
        nome:     document.getElementById('input-nome').value.trim(),
        whatsapp: document.getElementById('input-whatsapp').value.trim(),
        email:    document.getElementById('input-email').value.trim(),
        empresa:  document.getElementById('input-empresa').value.trim(),
        cargo:    document.getElementById('input-cargo').value.trim(),
      };

      // 2. Valida
      if (!validarFormulario()) return;

      // 3. UI Lock — previne clique duplo
      state.enviado = true;
      const btn = document.getElementById('btn-submeter');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
      }

      // 4. Vai para tela de processando
      goTo('processando');

      // 5. Salva dados no state para personalização do resultado (G6)
      state.captura = dados;

      // 6. Monta e envia payload
      const payload = montarPayload(
        dados.nome, dados.whatsapp, dados.email, dados.empresa, dados.cargo
      );
      await enviarParaN8n(payload);

      // 7. Exibe resultado (independente do retorno do n8n — ADR-002)
      exibirResultadoV2(); // v2: 3 caminhos com recomendação destacada
    });
  }

  // ── Máscara de WhatsApp (formata enquanto digita) ──
  const inputWpp = document.getElementById('input-whatsapp');
  if (inputWpp) {
    inputWpp.addEventListener('input', function() {
      let v = this.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 7) {
        v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }
      this.value = v;
    });
  }

  // ── Q11 — Lógica de validação (Fase 2) ──────────────────────────────────
  const q11Input   = document.getElementById('q11-input');
  const btnQ11     = document.getElementById('btn-q11-avancar');
  const q11Counter = document.getElementById('q11-chars');

  if (q11Input && btnQ11 && q11Counter) {
    q11Input.addEventListener('input', function() {
      const len = q11Input.value.trim().length;
      q11Counter.textContent = len;
      btnQ11.disabled = len < Q11_MIN_CHARS;
    });

    btnQ11.addEventListener('click', function() {
      state.answers.q11 = q11Input.value.trim();
      goTo('captura');
    });
  }

  // ── Botão YouTube — usa constante JS (G10) ──
  const btnYoutube = document.getElementById('btn-youtube');
  if (btnYoutube) {
    btnYoutube.addEventListener('click', function() {
      window.open(YOUTUBE_URL, '_blank');
    });
  }

  // ── Fechar modal com ESC ──
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal-caminho1');
      if (modal) modal.classList.add('hidden');
    }
  });
});

// Inicializa o quiz quando a seção quiz fica visível
// (chamado via goTo('quiz') a partir do botão "Começar diagnóstico")
const _goToOriginal = goTo;
window.goTo = function(section) {
  _goToOriginal(section);
  if (section === 'quiz') {
    state.perguntaIdx = 0;
    renderizarPergunta();
  }
};
