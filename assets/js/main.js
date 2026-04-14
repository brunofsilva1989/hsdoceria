/* ============================================================
   H&S Doceria — Logica do Sistema de Pedidos
   main.js
   ============================================================ */

/* ──────────────────────────────────────────────────────────
   DADOS DOS PRODUTOS
   Adicione ou remova produtos neste array.
────────────────────────────────────────────────────────── */
const PRODUTOS = [
  {
    id: 1,
    nome: 'Cookie de Nutella',
    preco: 20.00,
    icone: '🍪',
    img: 'assets/img/cookie-nutella.jpg'
  },
  {
    id: 2,
    nome: 'Copo Cookie',
    preco: 50.00,
    icone: '☕',
    img: 'assets/img/copo-cookie.jpg'
  },
  {
    id: 3,
    nome: 'Brownie Recheado',
    preco: 15.00,
    icone: '🍫',
    img: 'assets/img/brownie-recheado.jpg'
  },
  {
    id: 4,
    nome: 'Brownie',
    preco: 8.00,
    icone: '🟫',
    img: 'assets/img/brownie.jpg'
  }
];

/* ──────────────────────────────────────────────────────────
   TAXAS DE ENTREGA POR BAIRRO — SANTO ANDRE
   Edite livremente. Bairros nao listados recebem TAXA_PADRAO.
   Chaves: nome do bairro em minusculo sem acentos.
────────────────────────────────────────────────────────── */
const TAXAS_BAIRROS = {

  /* ─── R$ 8,00 · Centrais e proximos ─── */
  'centro':                  8,
  'vila bastos':             8,
  'vila assuncao':           8,
  'nova petropolis':         8,
  'paraiso':                 8,
  'santa maria':             8,
  'jardim das nacoes':       8,
  'vila pires':              8,
  'vila helena':             8,
  'jardim':                  8,
  'bela vista':              8,
  'jardim bela vista':       8,
  'vila bela vista':         8,
  'parque miami':            8,
  'jardim las americas':     8,
  'jardim america':          8,
  'america':                 8,

  /* ─── R$ 12,00 · Intermediarios ─── */
  'campestre':               12,
  'brasil':                  12,
  'vila humaita':            12,
  'humaita':                 12,
  'bangu':                   12,
  'vila guiomar':            12,
  'guiomar':                 12,
  'jardim las vegas':        12,
  'las vegas':               12,
  'utinga':                  12,
  'parque das nacoes':       12,
  'boa esperanca':           12,
  'curuca':                  12,
  'vila curuca':             12,
  'alzira':                  12,
  'vila alzira':             12,
  'principe de gales':       12,
  'vila principe de gales':  12,
  'jardim santo antonio':    12,
  'santo antonio':           12,
  'jardim stella':           12,
  'stella':                  12,
  'jardim do estadio':       12,
  'santa terezinha':         12,
  'parque novo oratorio':    12,
  'novo oratorio':           12,
  'parque erasmo assuncao':  12,
  'erasmo':                  12,
  'jardim praia grande':     12,
  'praia grande':            12,
  'jardim tatiana':          12,
  'tatiana':                 12,
  'parque gerassi':          12,
  'gerassi':                 12,
  'jardim ipanema':          12,
  'ipanema':                 12,
  'jardim represa':          12,
  'represa':                 12,
  'jardim alvorada':         12,
  'alvorada':                12,

  /* ─── R$ 15,00 · Mais distantes ─── */
  'camilopolis':             15,
  'silveira':                15,
  'capuava':                 15,
  'sertorio':                15,
  'jardim marek':            15,
  'marek':                   15,
  'jardim irene':            15,
  'irene':                   15,
  'jardim cristiane':        15,
  'cristiane':               15,
  'jardim rondon':           15,
  'rondon':                  15,
  'vila alice':              15,
  'jardim alice':            15,
  'pocos':                   15,
  'jardim pocos':            15,
  'jardim saude':            15,
  'saude':                   15,
  'jardim milena':           15,
  'milena':                  15,
  'jardim carla':            15,
  'carla':                   15,
  'borda do campo':          15,
  'recreio da borda do campo': 15,
  'jardim riviera':          15,
  'riviera':                 15,
  'jardim santo alberto':    15,
  'santo alberto':           15,
  'parque miami':            15
};

const TAXA_PADRAO = 12;   // Para bairros nao mapeados

/* ──────────────────────────────────────────────────────────
   CONFIGURACOES
────────────────────────────────────────────────────────── */
const HORARIO_INICIO  = { h: 14, m: 30 };
const HORARIO_FIM     = { h: 18, m:  0 };
//const WHATSAPP_NUM = '5511951260263';
const WHATSAPP_NUM    = '5511912959858';

/* ──────────────────────────────────────────────────────────
   CONFIGURACOES PIX
   Preencha com os dados da titular da conta PIX.
────────────────────────────────────────────────────────── */
const PIX_CHAVE  = '11951260263';          // Chave PIX (telefone, CPF, e-mail ou chave aleatoria)
const PIX_NOME   = 'H e S Doceria';        // Nome do recebedor (max 25 chars, sem acentos)
const PIX_CIDADE = 'Santo Andre';          // Cidade do recebedor (max 15 chars, sem acentos)

/* ──────────────────────────────────────────────────────────
   ESTADO GLOBAL DA APLICACAO
────────────────────────────────────────────────────────── */
const estado = {
  carrinho:      {},           // { produtoId: quantidade }
  tipoEntrega:   'retirada',   // 'retirada' | 'entrega'
  taxaEntrega:   0,
  cidadeOK:      true,
  formaPagamento: 'dinheiro'   // 'dinheiro' | 'pix'
};

/* ══════════════════════════════════════════════════════════
   INICIALIZACAO
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  verificarHorario();
  renderizarCardapio();
  configurarEventos();
  atualizarResumo();
});

/* ══════════════════════════════════════════════════════════
   CONTROLE DE HORARIO
══════════════════════════════════════════════════════════ */

/**
 * Verifica se o horario atual esta dentro do periodo de atendimento.
 * Exibe banner e desabilita botao caso esteja fora.
 * @returns {boolean}
 */
function verificarHorario() {
  const agora  = new Date();
  const inicio = HORARIO_INICIO.h * 60 + HORARIO_INICIO.m;
  const fim    = HORARIO_FIM.h    * 60 + HORARIO_FIM.m;
  const atual  = agora.getHours() * 60 + agora.getMinutes();

  const dentroDHorario = true; // TESTE — remover esta linha e descomentar a de baixo depois
  // const dentroDHorario = atual >= inicio && atual < fim;

  const banner    = document.getElementById('hours-banner');
  const btnEnviar = document.getElementById('send-btn');
  const msgFora   = document.getElementById('out-of-hours-msg');

  if (!dentroDHorario) {
    if (banner)    banner.classList.remove('hidden');
    if (btnEnviar) btnEnviar.disabled = true;
    if (msgFora)   msgFora.classList.remove('hidden');
  } else {
    if (banner)    banner.classList.add('hidden');
    if (btnEnviar) btnEnviar.disabled = false;
    if (msgFora)   msgFora.classList.add('hidden');
  }

  return dentroDHorario;
}

/* ══════════════════════════════════════════════════════════
   CARDAPIO — RENDERIZACAO
══════════════════════════════════════════════════════════ */

/** Gera os cards de produto no grid do cardapio. */
function renderizarCardapio() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '';

  PRODUTOS.forEach(produto => {
    const qty  = estado.carrinho[produto.id] || 0;
    const card = document.createElement('div');
    card.className = 'product-card';
    card.id = 'product-card-' + produto.id;

    card.innerHTML =
      '<div class="product-img-wrap">' +
        '<div class="product-emoji-fallback">' + produto.icone + '</div>' +
        '<img' +
          ' src="' + produto.img + '"' +
          ' alt="' + produto.nome + '"' +
          ' onload="this.previousElementSibling.style.display=\'none\'"' +
          ' onerror="this.style.display=\'none\'"' +
        '>' +
      '</div>' +
      '<div class="product-info">' +
        '<span class="product-name">' + produto.nome + '</span>' +
        '<span class="product-price">' + formatMoeda(produto.preco) + '</span>' +
        '<div class="qty-control">' +
          '<button' +
            ' class="qty-btn"' +
            ' id="minus-' + produto.id + '"' +
            ' onclick="diminuirQtd(' + produto.id + ')"' +
            (qty === 0 ? ' disabled' : '') +
            ' aria-label="Diminuir quantidade de ' + produto.nome + '"' +
          '>&#8722;</button>' +
          '<span class="qty-number" id="qty-' + produto.id + '">' + qty + '</span>' +
          '<button' +
            ' class="qty-btn"' +
            ' id="plus-' + produto.id + '"' +
            ' onclick="aumentarQtd(' + produto.id + ')"' +
            ' aria-label="Aumentar quantidade de ' + produto.nome + '"' +
          '>+</button>' +
        '</div>' +
      '</div>';

    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════════════════════
   CONTROLES DE QUANTIDADE
══════════════════════════════════════════════════════════ */

/** Adiciona 1 unidade do produto ao carrinho. */
function aumentarQtd(id) {
  estado.carrinho[id] = (estado.carrinho[id] || 0) + 1;
  sincronizarBotoesCard(id);
  atualizarCarrinho();
}

/** Remove 1 unidade do produto do carrinho (minimo 0). */
function diminuirQtd(id) {
  if (!estado.carrinho[id]) return;
  estado.carrinho[id]--;
  if (estado.carrinho[id] === 0) delete estado.carrinho[id];
  sincronizarBotoesCard(id);
  atualizarCarrinho();
}

/** Atualiza o contador e estado do botao menos no card do produto. */
function sincronizarBotoesCard(id) {
  const qtdEl    = document.getElementById('qty-' + id);
  const minusBtn = document.getElementById('minus-' + id);
  const qty      = estado.carrinho[id] || 0;
  if (qtdEl)    qtdEl.textContent = qty;
  if (minusBtn) minusBtn.disabled = qty === 0;
}

/* ══════════════════════════════════════════════════════════
   CARRINHO
══════════════════════════════════════════════════════════ */

/** Re-renderiza a secao do carrinho com os itens atuais. */
function atualizarCarrinho() {
  const itensEl       = document.getElementById('cart-items');
  const vazioEl       = document.getElementById('cart-empty');
  const subtotalWrap  = document.getElementById('cart-subtotal');
  const subtotalValEl = document.getElementById('cart-subtotal-value');

  const itens = Object.entries(estado.carrinho);

  if (itens.length === 0) {
    if (itensEl)      itensEl.classList.add('hidden');
    if (subtotalWrap) subtotalWrap.classList.add('hidden');
    if (vazioEl)      vazioEl.classList.remove('hidden');
    atualizarResumo();
    return;
  }

  if (vazioEl)      vazioEl.classList.add('hidden');
  if (itensEl)      itensEl.classList.remove('hidden');
  if (subtotalWrap) subtotalWrap.classList.remove('hidden');

  itensEl.innerHTML = '';
  let subtotal = 0;

  itens.forEach(function(par) {
    const id      = parseInt(par[0]);
    const qty     = par[1];
    const produto = PRODUTOS.find(function(p) { return p.id === id; });
    if (!produto) return;

    const sub = produto.preco * qty;
    subtotal += sub;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML =
      '<span class="cart-item-name">' + produto.icone + ' ' + produto.nome + '</span>' +
      '<span class="cart-item-qty">' + qty + 'x</span>' +
      '<span class="cart-item-price">' + formatMoeda(sub) + '</span>' +
      '<button class="cart-item-remove" onclick="removerDoCarrinho(' + id + ')" aria-label="Remover ' + produto.nome + '">&#10005;</button>';

    itensEl.appendChild(div);
  });

  if (subtotalValEl) subtotalValEl.textContent = formatMoeda(subtotal);
  atualizarResumo();
}

/** Remove completamente um produto do carrinho. */
function removerDoCarrinho(id) {
  delete estado.carrinho[id];
  sincronizarBotoesCard(id);
  atualizarCarrinho();
}

/* ══════════════════════════════════════════════════════════
   CONFIGURACAO DE EVENTOS
══════════════════════════════════════════════════════════ */
function configurarEventos() {

  /* ─── Radio de tipo de entrega ─── */
  var radios = document.querySelectorAll('input[name="delivery"]');
  radios.forEach(function(radio) {
    radio.addEventListener('change', onMudancaTipoEntrega);
  });

  /* ─── Radio de forma de pagamento ─── */
  var radiosPgto = document.querySelectorAll('input[name="payment"]');
  radiosPgto.forEach(function(radio) {
    radio.addEventListener('change', onMudancaPagamento);
  });

  /* ─── Mascara e busca de CEP ─── */
  var cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', function() {
      cepInput.value = mascaraCEP(cepInput.value);
      if (cepInput.value.replace(/\D/g, '').length === 8) {
        buscarCEP();
      }
    });
  }

  /* ─── Mascara de telefone ─── */
  var phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      phoneInput.value = mascaraTelefone(phoneInput.value);
    });
  }

  /* ─── Recalcular taxa ao sair do campo Bairro ─── */
  var neighInput = document.getElementById('neighborhood');
  if (neighInput) {
    neighInput.addEventListener('blur', function() {
      if (estado.tipoEntrega === 'entrega' && neighInput.value.trim()) {
        calcularTaxaEntrega(neighInput.value);
        atualizarResumo();
      }
    });
  }

  /* ─── Revalidar cidade ao sair do campo ─── */
  var cityInput = document.getElementById('city');
  if (cityInput) {
    cityInput.addEventListener('blur', function() {
      if (estado.tipoEntrega === 'entrega') {
        validarCidade(cityInput.value);
      }
    });
  }
}

/** Executado ao trocar a forma de pagamento (dinheiro / pix). */
function onMudancaPagamento(evt) {
  estado.formaPagamento = evt.target.value;
  var pixPanel = document.getElementById('pix-panel');

  if (estado.formaPagamento === 'pix') {
    if (pixPanel) pixPanel.classList.remove('hidden');
    setTextContent('pix-key-display', PIX_CHAVE);
    atualizarQRCode();
  } else {
    if (pixPanel) pixPanel.classList.add('hidden');
  }

  atualizarAvisoPIX();
}

/**
 * Exibe o aviso correto do PIX conforme tipo de entrega:
 * - Retirada: pode pagar agora e enviar comprovante
 * - Entrega:  pagar somente na hora da entrega
 */
function atualizarAvisoPIX() {
  var w = document.getElementById('pix-warning');
  if (!w) return;
  w.style.display = (estado.formaPagamento === 'pix') ? 'block' : 'none';
}

/** Executado ao trocar o tipo de entrega (retirada / entrega). */
function onMudancaTipoEntrega(evt) {
  estado.tipoEntrega = evt.target.value;
  var endSection = document.getElementById('address-section');
  atualizarAvisoPIX();

  if (estado.tipoEntrega === 'entrega') {
    if (endSection) endSection.classList.remove('hidden');

    /* Recalcular taxa se bairro ja estiver preenchido */
    var bairro = getVal('neighborhood');
    if (bairro.trim()) {
      calcularTaxaEntrega(bairro);
    }

  } else {
    if (endSection) endSection.classList.add('hidden');
    estado.taxaEntrega = 0;
    estado.cidadeOK    = true;

    /* Limpar feedbacks de endereco */
    ocultarEl('delivery-fee-card');
    ocultarEl('cep-error');
    ocultarEl('city-error');
    removerErroInput('city');
  }

  atualizarResumo();
}

/* ══════════════════════════════════════════════════════════
   BUSCA DE CEP (ViaCEP)
══════════════════════════════════════════════════════════ */

/** Consulta a API do ViaCEP e preenche os campos de endereco. */
async function buscarCEP() {
  var cepInput = document.getElementById('cep');
  var cepRaw   = cepInput.value.replace(/\D/g, '');
  if (cepRaw.length !== 8) return;

  /* Mostrar spinner e limpar erros anteriores */
  mostrarEl('cep-spinner');
  ocultarEl('cep-error');
  ocultarEl('city-error');
  limparCamposEndereco();

  try {
    var res  = await fetch('https://viacep.com.br/ws/' + cepRaw + '/json/');
    var data = await res.json();

    if (data.erro) {
      mostrarErroCEP('CEP nao encontrado. Verifique e tente novamente.');
      return;
    }

    /* Preencher campos */
    setInputValue('street',       data.logradouro || '');
    setInputValue('neighborhood', data.bairro      || '');
    setInputValue('city',         data.localidade  || '');
    setInputValue('uf',           data.uf           || '');

    /* Validar cidade */
    validarCidade(data.localidade || '');

    /* Calcular taxa pelo bairro retornado */
    if (data.bairro) {
      calcularTaxaEntrega(data.bairro);
    }

    atualizarResumo();

  } catch (err) {
    mostrarErroCEP('Erro ao buscar o CEP. Verifique sua conexao e tente novamente.');
  } finally {
    ocultarEl('cep-spinner');
  }
}

/** Limpa os campos de endereco preenchidos pelo ViaCEP. */
function limparCamposEndereco() {
  ['street', 'neighborhood', 'city', 'uf'].forEach(function(id) {
    setInputValue(id, '');
  });
}

/** Exibe mensagem de erro abaixo do campo CEP. */
function mostrarErroCEP(msg) {
  var el = document.getElementById('cep-error');
  if (el) {
    el.textContent = '⚠ ' + msg;
    el.classList.remove('hidden');
  }
}

/* ══════════════════════════════════════════════════════════
   VALIDACAO DE CIDADE
══════════════════════════════════════════════════════════ */

/**
 * Verifica se a cidade eh Santo Andre.
 * Atualiza estado.cidadeOK e feedback visual.
 */
function validarCidade(cidade) {
  var cityError = document.getElementById('city-error');
  var cityInput = document.getElementById('city');
  var ehSA      = normalizar(cidade) === 'santo andre';

  if (cidade.trim() && !ehSA) {
    estado.cidadeOK    = false;
    estado.taxaEntrega = 0;
    if (cityError) cityError.classList.remove('hidden');
    if (cityInput) cityInput.classList.add('input-error');
    ocultarEl('delivery-fee-card');
  } else {
    estado.cidadeOK = true;
    if (cityError) cityError.classList.add('hidden');
    if (cityInput) cityInput.classList.remove('input-error');
  }

  atualizarResumo();
}

/* ══════════════════════════════════════════════════════════
   TAXA DE ENTREGA
══════════════════════════════════════════════════════════ */

/**
 * Calcula a taxa de entrega com base no bairro informado.
 * Atualiza estado.taxaEntrega e exibe o card informativo.
 */
function calcularTaxaEntrega(bairro) {
  if (estado.tipoEntrega !== 'entrega') {
    estado.taxaEntrega = 0;
    return;
  }

  var bairroNorm = normalizar(bairro);
  var taxa       = null;

  /* Busca exata */
  if (TAXAS_BAIRROS[bairroNorm] !== undefined) {
    taxa = TAXAS_BAIRROS[bairroNorm];
  } else {
    /* Busca parcial: verifica se o bairro informado contem uma chave conhecida */
    var chaves = Object.keys(TAXAS_BAIRROS);
    for (var i = 0; i < chaves.length; i++) {
      var chave = chaves[i];
      if (bairroNorm.indexOf(chave) !== -1 || chave.indexOf(bairroNorm) !== -1) {
        taxa = TAXAS_BAIRROS[chave];
        break;
      }
    }
  }

  estado.taxaEntrega = (taxa !== null) ? taxa : TAXA_PADRAO;

  /* Exibir card com a taxa */
  var feeCard  = document.getElementById('delivery-fee-card');
  var feeName  = document.getElementById('fee-neighborhood-name');
  var feeValue = document.getElementById('delivery-fee-value');

  if (feeCard)  feeCard.classList.remove('hidden');
  if (feeName)  feeName.textContent  = bairro || 'seu bairro';
  if (feeValue) feeValue.textContent = formatMoeda(estado.taxaEntrega);
}

/* ══════════════════════════════════════════════════════════
   RESUMO FINAL
══════════════════════════════════════════════════════════ */

/** Atualiza todos os valores no bloco de Resumo do Pedido. */
function atualizarResumo() {
  var subtotal = calcularSubtotal();
  var taxa     = (estado.tipoEntrega === 'entrega') ? estado.taxaEntrega : 0;
  var total    = subtotal + taxa;

  setTextContent('summary-subtotal', formatMoeda(subtotal));

  if (estado.tipoEntrega === 'entrega') {
    setTextContent('summary-fee-label', 'Taxa de entrega');
    setTextContent('summary-fee', formatMoeda(taxa));
  } else {
    setTextContent('summary-fee-label', 'Tipo de entrega');
    setTextContent('summary-fee', 'Retirada · Gratis ✓');
  }

  var totalEl = document.getElementById('summary-total');
  if (totalEl) {
    totalEl.textContent = formatMoeda(total);
    totalEl.style.color = total > 0 ? 'var(--verde-hover)' : '';
  }

  /* Se PIX estiver ativo, atualizar QR com novo valor */
  if (estado.formaPagamento === 'pix') {
    atualizarQRCode();
  }
}

/** Calcula o subtotal dos itens no carrinho. */
function calcularSubtotal() {
  return Object.keys(estado.carrinho).reduce(function(acc, idStr) {
    var id   = parseInt(idStr);
    var qty  = estado.carrinho[idStr];
    var prod = PRODUTOS.find(function(p) { return p.id === id; });
    return acc + (prod ? prod.preco * qty : 0);
  }, 0);
}

/* ══════════════════════════════════════════════════════════
   VALIDACAO DO FORMULARIO
══════════════════════════════════════════════════════════ */

/**
 * Valida todos os campos antes do envio.
 * @returns {string[]} Lista de mensagens de erro (vazia se tudo OK).
 */
function validarFormulario() {
  var erros = [];

  /* Horario */
  if (!verificarHorario()) {
    erros.push('Fora do horario de atendimento. Pedidos sao aceitos das 14:30 as 18:00.');
  }

  /* Carrinho */
  if (Object.keys(estado.carrinho).length === 0) {
    erros.push('Adicione ao menos um produto ao pedido.');
  }

  /* Dados pessoais */
  var nome  = getVal('name').trim();
  var phone = getVal('phone').replace(/\D/g, '');

  if (!nome) {
    erros.push('Informe seu nome completo.');
  }
  if (!phone) {
    erros.push('Informe seu numero de WhatsApp.');
  } else if (phone.length < 10) {
    erros.push('WhatsApp invalido. Use o formato (11) 99999-9999.');
  }

  /* Endereco (somente para entrega) */
  if (estado.tipoEntrega === 'entrega') {
    if (!getVal('cep').trim())          erros.push('Informe o CEP.');
    if (!getVal('street').trim())       erros.push('Informe a rua / avenida.');
    if (!getVal('number').trim())       erros.push('Informe o numero do endereco.');
    if (!getVal('neighborhood').trim()) erros.push('Informe o bairro.');

    var cidade = getVal('city').trim();
    if (!cidade) {
      erros.push('Informe a cidade.');
    } else if (normalizar(cidade) !== 'santo andre') {
      erros.push('No momento realizamos entregas apenas em Santo Andre.');
    }
  }

  return erros;
}

/* ══════════════════════════════════════════════════════════
   ENVIO DO PEDIDO
══════════════════════════════════════════════════════════ */

/** Valida o formulario e, se correto, abre o WhatsApp com a mensagem pronta. */
function enviarPedido() {
  var errosEl = document.getElementById('form-errors');
  var erros   = validarFormulario();

  if (erros.length > 0) {
    var html = '<strong>Por favor, corrija os itens abaixo:</strong><ul>';
    erros.forEach(function(e) { html += '<li>' + e + '</li>'; });
    html += '</ul>';
    errosEl.innerHTML = html;
    errosEl.classList.remove('hidden');
    errosEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  errosEl.classList.add('hidden');

  var mensagem = gerarMensagem();
  var url      = 'https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(mensagem);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ══════════════════════════════════════════════════════════
   GERACAO DA MENSAGEM WHATSAPP
══════════════════════════════════════════════════════════ */

/** Gera a mensagem formatada para enviar via WhatsApp. */
function gerarMensagem() {
  var nome      = getVal('name').trim();
  var phone     = getVal('phone').trim();
  var notes     = getVal('notes').trim();
  var subtotal  = calcularSubtotal();
  var taxa      = (estado.tipoEntrega === 'entrega') ? estado.taxaEntrega : 0;
  var total     = subtotal + taxa;
  var tipoLabel = (estado.tipoEntrega === 'entrega') ? 'Entrega' : 'Retirada';

  /* Itens do pedido */
  var linhasItens = Object.keys(estado.carrinho).map(function(idStr) {
    var id   = parseInt(idStr);
    var qty  = estado.carrinho[idStr];
    var prod = PRODUTOS.find(function(p) { return p.id === id; });
    return '• ' + qty + 'x ' + prod.nome + ' — ' + formatMoeda(prod.preco * qty);
  }).join('\n');

  /* Bloco de endereco */
  var blocoEndereco = '';
  if (estado.tipoEntrega === 'entrega') {
    var rua    = getVal('street').trim();
    var num    = getVal('number').trim();
    var bairro = getVal('neighborhood').trim();
    var cidade = getVal('city').trim();
    var uf     = getVal('uf').trim();
    var cep    = getVal('cep').trim();
    var compl  = getVal('complement').trim();

    blocoEndereco =
      '\n\n' +
      '*Endereco de Entrega:*\n' +
      rua + ', ' + num + (compl ? ' — ' + compl : '') + '\n' +
      bairro + ' — ' + cidade + (uf ? '/' + uf : '') + '\n' +
      'CEP: ' + cep;
  } else {
    blocoEndereco = '\n\n*Tipo:* Retirada no local';
  }

  /* Bloco de observacoes */
  var blocoObs = notes ? ('\n\n*Observacoes:*\n' + notes) : '';

  /* Bloco de pagamento — so exibe quando for dinheiro */
  var blocoPgto = (estado.formaPagamento === 'dinheiro')
    ? '\n*Pagamento:* Dinheiro (pagar na entrega/retirada)'
    : '';


  /* Montagem final — apenas formatacao nativa do WhatsApp (ASCII + bullet) */
  return (
    '*H&S Doceria \u2014 Novo Pedido*\n' +
    '--------------------------------\n\n' +
    '*Cliente:* ' + nome + '\n' +
    '*WhatsApp:* ' + phone + '\n' +
    '*Entrega:* ' + tipoLabel +
    blocoEndereco + '\n\n' +
    '*Itens do Pedido:*\n' +
    linhasItens + '\n\n' +
    '*Subtotal:* '          + formatMoeda(subtotal) + '\n' +
    '*Taxa de entrega:* '   + (taxa > 0 ? formatMoeda(taxa) : 'Gr\u00e1tis') + '\n' +
    '*Total Final: '        + formatMoeda(total) + '*' +
    blocoPgto +
    blocoObs + '\n\n' +
    '--------------------------------\n' +
    '_Pedido enviado pelo sistema H&S Doceria_'
  );
}

/* ══════════════════════════════════════════════════════════
   PIX — PAYLOAD, QR CODE E UTILIDADES
══════════════════════════════════════════════════════════ */

/**
 * CRC16/CCITT-FALSE — algoritmo exigido pelo padrao PIX BR.
 * @param {string} str
 * @returns {string} 4 caracteres hexadecimais maiusculos
 */
function crc16PIX(str) {
  var crc = 0xFFFF;
  for (var i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (var j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera o payload PIX Copia e Cola (padrao EMVCo/BACEN).
 * @param {string} chave  - Chave PIX do recebedor
 * @param {string} nome   - Nome do recebedor (max 25 chars)
 * @param {string} cidade - Cidade do recebedor (max 15 chars)
 * @param {number} valor  - Valor total (0 = sem valor fixo)
 * @returns {string} Payload para QR code
 */
function gerarPayloadPIX(chave, nome, cidade, valor) {
  function tlv(id, val) {
    return id + String(val.length).padStart(2, '0') + val;
  }

  var merchant = tlv('00', 'br.gov.bcb.pix') + tlv('01', chave);
  var adicional = tlv('05', '***');

  var payload =
    tlv('00', '01') +
    tlv('26', merchant) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (valor > 0 ? tlv('54', valor.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', nome.substring(0, 25)) +
    tlv('60', cidade.substring(0, 15)) +
    tlv('62', adicional) +
    '6304'; /* placeholder CRC */

  return payload + crc16PIX(payload);
}

/**
 * Gera o QR Code PIX e exibe na tela usando o total atual do pedido.
 * Usa a API publica api.qrserver.com para renderizar a imagem.
 */
function atualizarQRCode() {
  var subtotal = calcularSubtotal();
  var taxa     = (estado.tipoEntrega === 'entrega') ? estado.taxaEntrega : 0;
  var total    = subtotal + taxa;

  var payload = gerarPayloadPIX(PIX_CHAVE, PIX_NOME, PIX_CIDADE, total);

  var img = document.getElementById('pix-qr-img');
  if (img) {
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&ecc=M&data=' + encodeURIComponent(payload);
    img.alt = 'QR Code PIX — ' + formatMoeda(total);
  }
}

/** Copia a chave PIX para a area de transferencia e exibe feedback. */
function copiarChavePIX() {
  if (!navigator.clipboard) {
    /* Fallback para navegadores antigos */
    var tmp = document.createElement('textarea');
    tmp.value = PIX_CHAVE;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    mostrarFeedbackCopia();
    return;
  }
  navigator.clipboard.writeText(PIX_CHAVE).then(mostrarFeedbackCopia);
}

/** Exibe e oculta o feedback 'Copiado!' por 2 segundos. */
function mostrarFeedbackCopia() {
  var fb = document.getElementById('pix-copy-feedback');
  if (!fb) return;
  fb.classList.remove('hidden');
  setTimeout(function() { fb.classList.add('hidden'); }, 2000);
}

/* ══════════════════════════════════════════════════════════
   MASCARAS DE INPUT
══════════════════════════════════════════════════════════ */

/** Formata o valor como CEP: 00000-000 */
function mascaraCEP(v) {
  v = v.replace(/\D/g, '').substring(0, 8);
  if (v.length > 5) return v.substring(0, 5) + '-' + v.substring(5);
  return v;
}

/** Formata o valor como telefone: (11) 99999-9999 ou (11) 9999-9999 */
function mascaraTelefone(v) {
  v = v.replace(/\D/g, '').substring(0, 11);
  if (v.length === 0)  return '';
  if (v.length <= 2)   return '(' + v;
  if (v.length <= 6)   return '(' + v.substring(0, 2) + ') ' + v.substring(2);
  if (v.length <= 10)  return '(' + v.substring(0, 2) + ') ' + v.substring(2, 6) + '-' + v.substring(6);
  return '(' + v.substring(0, 2) + ') ' + v.substring(2, 7) + '-' + v.substring(7);
}

/* ══════════════════════════════════════════════════════════
   UTILITARIOS
══════════════════════════════════════════════════════════ */

/** Formata valor numerico como moeda brasileira (R$ 0,00). */
function formatMoeda(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

/**
 * Normaliza texto: minusculo, sem acentos, sem espacos extras.
 * Usado para comparacoes de bairro e cidade.
 */
function normalizar(str) {
  return (str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Retorna o value de um input pelo id (ou '' se nao encontrado). */
function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

/** Define o value de um input pelo id. */
function setInputValue(id, val) {
  var el = document.getElementById(id);
  if (el) el.value = val;
}

/** Define o textContent de um elemento pelo id. */
function setTextContent(id, text) {
  var el = document.getElementById(id);
  if (el) el.textContent = text;
}

/** Oculta um elemento pelo id (adiciona classe hidden). */
function ocultarEl(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

/** Exibe um elemento pelo id (remove classe hidden). */
function mostrarEl(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/** Remove a classe de erro visual de um input. */
function removerErroInput(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('input-error');
}
