/**
 * UI.JS
 * Funções de atualização da interface e utilitários de apresentação.
 */

// ─── Cardápio ─────────────────────────────────────────────────────────────────

/** Renderiza os botões de categoria no cardápio */
function renderizarCategorias() {
    ELEMENTS.categoriesContainer.innerHTML = CONFIG.categorias
        .map(cat => `
            <button
                class="category-btn ${cat.id === 'todos' ? 'active' : ''}"
                data-categoria="${cat.id}"
            >
                ${cat.icon} ${cat.label}
            </button>
        `)
        .join('');
}

/**
 * Filtra e renderiza produtos por categoria.
 * Usa event delegation — recebe o evento do listener centralizado.
 */
function filtrarPorCategoria(categoria, btnClicado) {
    APP_STATE.categoriaAtiva = categoria;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (btnClicado) btnClicado.classList.add('active');
    renderizarProdutos(categoria);
}

/**
 * Renderiza os produtos agrupados por categoria (estilo prateleira/Netflix).
 * @param {string} [categoria='todos']
 */
function renderizarProdutos(categoria = 'todos') {
    try {
        const categoriasParaRenderizar = categoria === 'todos'
            ? CONFIG.categorias.filter(c => c.id !== 'todos')
            : CONFIG.categorias.filter(c => c.id === categoria);

        const htmlFinal = categoriasParaRenderizar
            .map(cat => {
                const produtos = getProdutosByCategoria(cat.id);
                if (!produtos || produtos.length === 0) return '';

                return `
                <div class="category-group">
                    <h3 class="category-group-title">${cat.icon} ${cat.label}</h3>
                    <div class="products-row">
                        ${produtos.map(produto => _renderizarCard(produto)).join('')}
                    </div>
                </div>`;
            })
            .join('');

        if (ELEMENTS.productsGrid) {
            ELEMENTS.productsGrid.innerHTML = htmlFinal;
        }
    } catch (error) {
        console.error('Erro ao renderizar o cardápio:', error);
    }
}

/** Renderiza os produtos em destaque (Top 3) */
function renderizarTopProdutos() {
    const topProdutos = getProdutosDestaque(CONFIG.topProducts);

    const medalhas = [
        { classe: 'medalha-ouro',   icone: '🥇 1º Lugar' },
        { classe: 'medalha-prata',  icone: '🥈 2º Lugar' },
        { classe: 'medalha-bronze', icone: '🥉 3º Lugar' },
    ];

    ELEMENTS.topProductsGrid.innerHTML = topProdutos
        .map((produto, i) => {
            const medalha = medalhas[i] || { classe: '', icone: '' };
            return `
                <div class="card card-top-item">
                    <div class="card-header">
                        <img
                            src="${produto.imagem || 'https://via.placeholder.com/300x200/1c1c21/888888?text=Sem+Foto'}"
                            alt="${produto.nome}"
                            class="card-img-top"
                            loading="lazy"
                        >
                        <span class="badge-ranking ${medalha.classe}">${medalha.icone}</span>
                    </div>
                    <div class="card-content">
                        <div class="card-text-area">
                            <h3 class="card-title">${produto.nome}</h3>
                            <p class="card-description">${produto.descricao}</p>
                        </div>
                        <div class="card-footer">
                            <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                            <button class="btn btn-primary btn-sm" data-action="add" data-id="${produto.id}">
                                <span class="btn-icon">🛒</span> Eu Quero!
                            </button>
                        </div>
                    </div>
                </div>`;
        })
        .join('');
}

/**
 * Gera o HTML de um card de produto.
 * FIX: extraído de renderizarProdutos para evitar duplicação de template.
 * @param {Object} produto
 * @returns {string}
 */
function _renderizarCard(produto) {
    return `
        <div class="card ${produto.promo ? 'card-promo' : ''}">
            <div class="card-header">
                ${produto.tag ? `<span class="badge-promo">${produto.tag}</span>` : ''}
                <img
                    src="${produto.imagem || 'https://via.placeholder.com/300x200/1c1c21/888888?text=Sem+Foto'}"
                    alt="${produto.nome}"
                    class="card-img-top"
                    loading="lazy"
                >
            </div>
            <div class="card-content">
                <div class="card-text-area">
                    <h3 class="card-title">${produto.emoji} ${produto.nome}</h3>
                    <p class="card-description">${produto.descricao}</p>
                </div>
                <div class="card-footer">
                    <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                    <button class="btn btn-primary btn-sm" data-action="add" data-id="${produto.id}">
                        <span class="btn-icon">+</span> Add
                    </button>
                </div>
            </div>
        </div>`;
}

// ─── Visibilidade: carrinho e checkout ────────────────────────────────────────

function abrirCarrinho() {
    ELEMENTS.cartPanel.classList.add('active');
    ELEMENTS.cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharCarrinho() {
    ELEMENTS.cartPanel.classList.remove('active');
    ELEMENTS.cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function abrirCheckout() {
    if (carrinhoGlobal.itens.length === 0) {
        mostrarToast('Adicione itens ao carrinho!', 'error');
        return;
    }
    
    // Ativa o painel (o CSS fará o deslize lateral)
    ELEMENTS.checkoutModal.classList.add('active');
    
    // Fecha o carrinho para não ficarem dois painéis abertos
    fecharCarrinho();
    
    // Bloqueia o scroll do fundo
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function fecharCheckout() {
    ELEMENTS.checkoutModal.classList.remove('active');
    
    // Devolve o scroll ao utilizador
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

// ─── Formulário de checkout ───────────────────────────────────────────────────

/**
 * Alterna entre modos delivery / retirada,
 * ajusta campos obrigatórios e recalcula totais.
 */
function updateDeliveryType() {
    const tipoEntrega         = document.querySelector('input[name="deliveryType"]:checked').value;
    const customerAddressForm = document.getElementById('customerAddressForm');
    const shopAddressInfo     = document.getElementById('shopAddressInfo');
    const addressLegend       = document.getElementById('addressLegend');
    const isPickup            = tipoEntrega === 'pickup';

    // FIX: usa propriedade hidden em vez de style.display inline
    customerAddressForm.hidden = isPickup;
    shopAddressInfo.hidden     = !isPickup;

    addressLegend.textContent = isPickup ? '🏪 Endereço para Retirada' : '🏠 Endereço de Entrega';

    ELEMENTS.address.required      = !isPickup;
    ELEMENTS.neighborhood.required = !isPickup;

    updatePaymentMethod();
    carrinhoGlobal.atualizarResumo();
}

/**
 * Exibe/oculta campos de cartão ou troco conforme pagamento selecionado.
 * FIX: referência a ELEMENTS.changeFieldset removida — o elemento correto é
 * changeContainer (id existente no HTML).
 */
function updatePaymentMethod() {
    const pagamento       = document.getElementById('paymentMethod')?.value ?? '';
    const cardContainer   = document.getElementById('cardTypeContainer');
    const changeContainer = document.getElementById('changeContainer');

    // FIX: usa hidden em vez de style.display, mais semântico e menos verboso
    if (cardContainer)   cardContainer.hidden   = pagamento !== 'cartao';
    if (changeContainer) changeContainer.hidden = pagamento !== 'dinheiro';

    // Limpa o campo de troco quando o pagamento muda
    if (pagamento !== 'dinheiro') {
        ELEMENTS.changeAmount.value = '';
        const changeResult = document.getElementById('changeResult');
        if (changeResult) changeResult.hidden = true;
    }
}

// ─── Feedback em tempo real ───────────────────────────────────────────────────

/**
 * Feedback do campo de telefone enquanto o usuário digita.
 * FIX: era um DOMContentLoaded anônimo solto no meio do arquivo —
 * agora é uma função nomeada chamada no bootstrap de main.js.
 */
function iniciarFeedbackTelefone() {
    const inputTelefone  = ELEMENTS.clientPhone;
    const feedbackElem   = document.getElementById('phoneFeedback');
    if (!inputTelefone || !feedbackElem) return;

    inputTelefone.addEventListener('input', e => {
        const nums = e.target.value.replace(/\D/g, '');
        if (nums.length === 0) {
            feedbackElem.hidden = true;
            return;
        }

        feedbackElem.hidden = false;
        if (nums.length < 11) {
            feedbackElem.style.color = '#ef4444';
            feedbackElem.textContent = `Faltam ${11 - nums.length} número(s) para o WhatsApp.`;
        } else {
            feedbackElem.style.color = '#22c55e';
            feedbackElem.textContent = 'Número de WhatsApp completo! ✔️';
        }
    });
}

/**
 * Feedback do campo de troco em tempo real.
 * FIX: era um DOMContentLoaded anônimo solto — agora função nomeada.
 * FIX: leitura do total agora usa carrinhoGlobal.getTotal() em vez de
 * parsear o texto do DOM (frágil e dependente de formatação).
 */
function iniciarFeedbackTroco() {
    const inputTroco   = ELEMENTS.changeAmount;
    const feedbackElem = document.getElementById('changeFeedback');
    if (!inputTroco || !feedbackElem) return;

    inputTroco.addEventListener('input', e => {
        const valorDigitado = parseFloat(e.target.value);

        if (isNaN(valorDigitado) || valorDigitado <= 0) {
            feedbackElem.hidden = true;
            return;
        }

        const tipoEntrega     = document.querySelector('input[name="deliveryType"]:checked')?.value ?? 'delivery';
        const valorTotalPedido = carrinhoGlobal.getTotal(tipoEntrega === 'delivery');

        feedbackElem.hidden = false;

        if (valorDigitado < valorTotalPedido) {
            feedbackElem.style.color = '#ef4444';
            feedbackElem.textContent = `Valor insuficiente! Faltam R$ ${(valorTotalPedido - valorDigitado).toFixed(2).replace('.', ',')}.`;
        } else if (valorDigitado === valorTotalPedido) {
            feedbackElem.style.color = '#eab308';
            feedbackElem.textContent = 'Valor exato! Não precisa de troco.';
        } else {
            const troco = valorDigitado - valorTotalPedido;
            feedbackElem.style.color = '#22c55e';
            feedbackElem.textContent = `O entregador levará R$ ${troco.toFixed(2).replace('.', ',')} de troco.`;
        }
    });
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

/**
 * Exibe uma notificação toast temporária.
 * @param {string} mensagem
 * @param {'success'|'error'|'warning'|'info'} [tipo='success']
 */
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), CONSTANTES.TEMPO_TOAST);
}

/**
 * Atalho para adicionar produto ao carrinho via event delegation.
 * @param {number} produtoId
 */
function adicionarAoCarrinho(produtoId) {
    carrinhoGlobal.adicionar(produtoId);
}

/**
 * Formata valor numérico como moeda brasileira.
 * @param {number} valor
 * @returns {string}
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Valida o formulário de checkout.
 * FIX: leitura do total agora usa carrinhoGlobal.getTotal() em vez de
 * parsear innerHTML (lógica duplicada e frágil que existia em dois lugares).
 * @returns {boolean}
 */
function validarFormulario() {
    // 1. Validar Nome
    const nome = ELEMENTS.clientName.value.trim();
    if (!nome) {
        mostrarToast('Por favor, informe o seu Nome Completo.', 'error');
        ELEMENTS.clientName.focus();
        return false;
    }
    if (nome.length < 3) {
        mostrarToast('O nome deve ter pelo menos 3 letras.', 'error');
        ELEMENTS.clientName.focus();
        return false;
    }

    // 2. Validar Telefone
    const telefonePuro = ELEMENTS.clientPhone.value.replace(/\D/g, '');
    if (!telefonePuro) {
        mostrarToast('Por favor, informe o seu Telefone.', 'error');
        ELEMENTS.clientPhone.focus();
        return false;
    }
    if (telefonePuro.length !== 11) {
        mostrarToast('Digite o DDD e o número completo do WhatsApp (11 dígitos).', 'error');
        ELEMENTS.clientPhone.focus();
        return false;
    }

    // 3. Validar Endereço (apenas se for entrega em casa)
    const tipoEntrega = document.querySelector('input[name="deliveryType"]:checked').value;
    if (tipoEntrega === 'delivery') {
        if (!ELEMENTS.address.value.trim()) {
            mostrarToast('Por favor, informe a Rua e o Número para entrega.', 'error');
            ELEMENTS.address.focus();
            return false;
        }
        if (!ELEMENTS.neighborhood.value.trim()) {
            mostrarToast('Por favor, informe o Bairro para entrega.', 'error');
            ELEMENTS.neighborhood.focus();
            return false;
        }
    }

    // 4. Validar Forma de Pagamento
    const pagamento = document.getElementById('paymentMethod').value;
    if (!pagamento) {
        mostrarToast('Por favor, selecione uma Forma de Pagamento.', 'error');
        document.getElementById('paymentMethod').focus();
        return false;
    }

    // 5. Validar Troco (apenas se for dinheiro)
    if (pagamento === 'dinheiro') {
        const valorTroco = parseFloat(ELEMENTS.changeAmount.value);
        if (!isNaN(valorTroco) && valorTroco > 0) {
            // Usa a API do carrinho para saber o total exato
            const totalPedido = carrinhoGlobal.getTotal(tipoEntrega === 'delivery');
            if (valorTroco < totalPedido) {
                mostrarToast(`Erro: O troco não pode ser menor que o total (R$ ${totalPedido.toFixed(2).replace('.', ',')}).`, 'error');
                ELEMENTS.changeAmount.focus();
                return false;
            }
        }
    }

    // Se chegou até aqui, está tudo perfeito!
    return true;
}
