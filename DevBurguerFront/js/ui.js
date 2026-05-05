/**
 * UI.JS
 * Funções de atualização da interface
 */

/** Renderiza os botões de categoria no cardápio */
function renderizarCategorias() {
    ELEMENTS.categoriesContainer.innerHTML = CONFIG.categorias
        .map(
            categoria => `
            <button
                class="category-btn ${categoria.id === 'todos' ? 'active' : ''}"
                data-categoria="${categoria.id}"
            >
                ${categoria.icon} ${categoria.label}
            </button>
        `
        )
        .join('');
}

/**
 * Filtra e renderiza produtos por categoria.
 * Usa event delegation — recebe o evento do listener centralizado.
 * @param {string} categoria
 * @param {HTMLElement} btnClicado
 */
function filtrarPorCategoria(categoria, btnClicado) {
    APP_STATE.categoriaAtiva = categoria;

    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (btnClicado) btnClicado.classList.add('active');

    renderizarProdutos(categoria);
}

/**
 * Renderiza os produtos no grid principal.
 * @param {string} [categoria='todos']
 */
function renderizarProdutos(categoria = 'todos') {
    const produtos = getProdutosByCategoria(categoria);

    ELEMENTS.productsGrid.innerHTML = produtos
        .map(
            produto => `
            <div class="card">
                <div class="card-header">
                    <img
                        src="${produto.imagem || 'https://via.placeholder.com/300x200/1c1c21/888888?text=Sem+Foto'}"
                        alt="${produto.nome}"
                        class="card-img-top"
                        loading="lazy"
                    >
                </div>
                <div class="card-content">
                    <div class="card-text-area">
                        <h3 class="card-title">${produto.nome}</h3>
                        <p class="card-description">${produto.descricao}</p>
                    </div>
                    <div class="card-footer">
                        <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                        <button class="btn btn-primary btn-sm" data-action="add" data-id="${produto.id}">
                            <span class="btn-icon">+</span> Add
                        </button>
                    </div>
                </div>
            </div>
        `
        )
        .join('');
}

/** Renderiza os produtos em destaque (Top 3) */
function renderizarTopProdutos() {
    const topProdutos = getProdutosDestaque(CONFIG.topProducts);

    const medalhas = [
        { classe: 'medalha-ouro',   icone: '👑 1º Lugar' },
        { classe: 'medalha-prata',  icone: '🥈 2º Lugar' },
        { classe: 'medalha-bronze', icone: '🥉 3º Lugar' },
    ];

    ELEMENTS.topProductsGrid.innerHTML = topProdutos
        .map((produto, indice) => {
            const medalha = medalhas[indice] || { classe: '', icone: '' };
            const destaqueTop1 = indice === 0 ? 'card-top-1' : '';

            return `
                <div class="card card-top-item ${destaqueTop1}">
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
                            <button class="btn btn-primary btn-sm btn-comprar-destaque" data-action="add" data-id="${produto.id}">
                                <span class="btn-icon">🛒</span> Eu Quero!
                            </button>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}

/* ============================================================
   CONTROLES DE VISIBILIDADE (carrinho / checkout)
   ============================================================ */

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
    ELEMENTS.checkoutModal.classList.add('active');
    fecharCarrinho();
    document.body.style.overflow = 'hidden';
}

function fecharCheckout() {
    ELEMENTS.checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

/* ============================================================
   ATUALIZAÇÃO DO FORMULÁRIO DE CHECKOUT
   ============================================================ */

/**
 * Alterna entre modos de entrega (delivery / retirada),
 * ajusta campos obrigatórios e recalcula totais.
 */
function updateDeliveryType() {
    const tipoEntrega = document.querySelector('input[name="deliveryType"]:checked').value;
    const customerAddressForm = document.getElementById('customerAddressForm');
    const shopAddressInfo     = document.getElementById('shopAddressInfo');
    const addressLegend       = document.getElementById('addressLegend');

    if (tipoEntrega === 'pickup') {
        customerAddressForm.style.display = 'none';
        shopAddressInfo.style.display     = 'block';
        addressLegend.textContent         = '🏪 Endereço para Retirada';
        ELEMENTS.address.removeAttribute('required');
        ELEMENTS.neighborhood.removeAttribute('required');
    } else {
        customerAddressForm.style.display = 'block';
        shopAddressInfo.style.display     = 'none';
        addressLegend.textContent         = '🏠 Endereço de Entrega';
        ELEMENTS.address.setAttribute('required', 'required');
        ELEMENTS.neighborhood.setAttribute('required', 'required');
    }

    // Verifica se o troco ainda deve aparecer após a mudança
    updatePaymentMethod();
    // Recalcula totais conforme tipo de entrega
    carrinhoGlobal.atualizarResumo();
}

/**
 * Exibe ou oculta o campo de troco conforme pagamento e tipo de entrega.
 * Regra: troco só aparece em pagamento com dinheiro + entrega em domicílio.
 */
function updatePaymentMethod() {
    const pagamento   = document.querySelector('input[name="payment"]:checked')?.value ?? '';
    const tipoEntrega = document.querySelector('input[name="deliveryType"]:checked')?.value ?? 'delivery';

    const mostrarTroco = pagamento === 'dinheiro' && tipoEntrega === 'delivery';

    ELEMENTS.changeFieldset.style.display = mostrarTroco ? 'block' : 'none';

    if (mostrarTroco) {
        ELEMENTS.changeAmount.addEventListener('input', calcularTroco);
    } else {
        ELEMENTS.changeAmount.value = '';
        document.getElementById('changeResult').style.display = 'none';
        ELEMENTS.changeAmount.removeEventListener('input', calcularTroco);
    }
}

/** Calcula e exibe o troco com base no valor digitado */
function calcularTroco() {
    const valorDigitado = parseFloat(ELEMENTS.changeAmount.value);
    const tipoEntrega   = document.querySelector('input[name="deliveryType"]:checked').value;
    const totalPedido   = carrinhoGlobal.getTotal(tipoEntrega === 'delivery');

    const changeResultDiv      = document.getElementById('changeResult');
    const calculatedChangeSpan = document.getElementById('calculatedChange');

    if (!isNaN(valorDigitado) && valorDigitado > totalPedido) {
        calculatedChangeSpan.textContent = formatarMoeda(valorDigitado - totalPedido);
        changeResultDiv.style.display    = 'block';
    } else if (!isNaN(valorDigitado) && valorDigitado === totalPedido) {
        calculatedChangeSpan.textContent = 'Não precisa de troco 😉';
        changeResultDiv.style.display    = 'block';
    } else {
        changeResultDiv.style.display = 'none';
    }
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

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
 * Adiciona um produto ao carrinho (chamado via event delegation).
 * @param {number} produtoId
 */
function adicionarAoCarrinho(produtoId) {
    carrinhoGlobal.adicionar(produtoId);
}

/**
 * Formata um valor numérico como moeda brasileira.
 * @param {number} valor
 * @returns {string}
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Valida o formulário de checkout.
 * @returns {boolean}
 */
function validarFormulario() {
    const form = ELEMENTS.checkoutForm;

    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    const tipoEntrega = document.querySelector('input[name="deliveryType"]:checked').value;
    if (tipoEntrega === 'delivery') {
        if (!ELEMENTS.address.value.trim() || !ELEMENTS.neighborhood.value.trim()) {
            mostrarToast('Preencha os dados de entrega!', 'error');
            return false;
        }
    }

    return true;
}

console.log('✅ UI.js carregado com sucesso');
