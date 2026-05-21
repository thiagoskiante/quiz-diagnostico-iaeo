/* =============================================
   QUIZ DIAGNÓSTICO IAEO
   Stories: 1.1 (state machine) + 1.2 (quiz engine) + 1.3 (captura + integração)
   ============================================= */

// ─── CONSTANTES ───────────────────────────────
const N8N_WEBHOOK_URL = 'https://skiante-dev.iaeo.com.br/webhook/Imersaodesenvolvi';
const KIWIFY_URL      = 'https://pay.kiwify.com.br/fJCNgjy';
const YOUTUBE_URL     = 'https://www.youtube.com/@thiagoskiante?sub_confirmation=1';

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
    'intro', 'quiz', 'captura', 'processando', 'resultado', 'youtube'
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
    especial: 'colaborador-redirect',
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
      { texto: 'Atendimento ao cliente',                         pontos: 0 },
      { texto: 'Vendas e qualificação de leads',                 pontos: 0 },
      { texto: 'Cobrança e financeiro',                          pontos: 0 },
      { texto: 'Operação interna (pedidos, produção, entregas)', pontos: 0 },
      { texto: 'Gestão de dados e relatórios',                   pontos: 0 }
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

// ─── LÓGICA DE SEGMENTAÇÃO (INTERNA) ─────────
function calcularTrilha(answers, score) {
  const faturamento = answers.q1;
  if (faturamento === 'Até R$ 100 mil/mês') return 'A';
  if (faturamento === 'Acima de R$ 1M/mês' && score >= 70) return 'C';
  if (score >= 40) return 'B';
  return 'A'; // fallback conservador
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

  // Avança para próxima pergunta ou captura
  if (pergIdx < PERGUNTAS.length - 1) {
    state.perguntaIdx = pergIdx + 1;
    renderizarPergunta();
  } else {
    // Quiz completo — calcula trilha e vai para captura
    state.trilha = calcularTrilha(state.answers, state.score);
    goTo('captura');
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

    // Respostas do quiz
    q1_faturamento:    state.answers.q1  || null,
    q2_funcionarios:   state.answers.q2  || null,
    q3_cargo:          state.answers.q3  || null,
    q4_setor:          state.answers.q4  || null,
    q5_dor:            state.answers.q5  || null,
    q6_experiencia_ia: state.answers.q6  || null,
    q7_sistemas:       state.answers.q7  || null,
    q8_decisao:        state.answers.q8  || null,
    q9_urgencia:       state.answers.q9  || null,
    q10_investimento:  state.answers.q10 || null,

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

  // Botão Caminho 1 — exibe modal de confirmação
  const btnC1 = document.getElementById('btn-caminho-1');
  if (btnC1) {
    btnC1.addEventListener('click', function() {
      const modal = document.getElementById('modal-caminho1');
      if (modal) modal.classList.remove('hidden');
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
      exibirResultado();
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
