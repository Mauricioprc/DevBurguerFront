/**
 * UI.JS
 * Funções de atualização da interface
 */

/**
 * Renderiza as categorias
 */
function renderizarCategorias() {
    ELEMENTS.categoriesContainer.innerHTML = CONFIG.categorias
        .map(categoria => `
            <button 
                class="category-btn ${categoria.id === 'todos' ? 'active' : ''}" 
                onclick="filtrarPorCategoria('${categoria.id}')"
            >
                ${categoria.icon} ${categoria.label}
            </button>
        `)
        .join('');
}

/**
 * Filtra e renderiza produtos por categoria
 */
function filtrarPorCategoria(categoria) {
    APP_STATE.categoriaAtiva = categoria;

    // Atualiza botões ativos
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Renderiza produtos
    renderizarProdutos(categoria);
}

/**
 * Renderiza os produtos no grid
 */
function renderizarProdutos(categoria = 'todos') {
    const produtos = getProdutosByCategoria(categoria);

    ELEMENTS.productsGrid.innerHTML = produtos
        .map(produto => `
            <div class="card">
                <div class="card-image">${produto.emoji}</div>
                <div class="card-content">
                    <h3 class="card-title">${produto.nome}</h3>
                    <p class="card-description">${produto.descricao}</p>
                    <div class="card-footer">
                        <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                        <button class="btn btn-primary btn-sm" onclick="adicionarAoCarrinho(${produto.id})">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `)
        .join('');
}

/**
 * Renderiza as promoções
 */
function renderizarPromocoes() {
    ELEMENTS.promotionsGrid.innerHTML = PROMOCOES
        .map(promo => `
            <div class="card">
                <div class="card-image">${promo.emoji}</div>
                <div class="card-content">
                    ${promo.tag ? `<span class="badge badge-primary">${promo.tag}</span>` : ''}
                    <h3 class="card-title">${promo.nome}</h3>
                    <p class="card-description">${promo.descricao}</p>
                    <div class="card-footer">
                        <span class="preco">R$ ${promo.preco.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `)
        .join('');
}

/**
 * Renderiza os produtos em destaque
 */
function renderizarTopProdutos() {
    const topProdutos = getProdutosDestaque(CONFIG.topProducts);

    ELEMENTS.topProductsGrid.innerHTML = topProdutos
        .map((produto, indice) => `
            <div class="card">
                <div class="card-image">
                    ${produto.emoji}
                    <span class="badge badge-primary" style="position: absolute; top: 10px; right: 10px;">
                        🔥 #${indice + 1}
                    </span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${produto.nome}</h3>
                    <p class="card-description">${produto.descricao}</p>
                    <div class="card-footer">
                        <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                        <button class="btn btn-primary btn-sm" onclick="adicionarAoCarrinho(${produto.id})">
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        `)
        .join('');
}

/**
 * Abre o carrinho
 */
function abrirCarrinho() {
    ELEMENTS.cartPanel.classList.add('active');
    ELEMENTS.cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha o carrinho
 */
function fecharCarrinho() {
    ELEMENTS.cartPanel.classList.remove('active');
    ELEMENTS.cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

/**
 * Abre o modal de checkout
 */
function abrirCheckout() {
    if (carrinhoGlobal.itens.length === 0) {
        mostrarToast('Adicione itens ao carrinho!', 'error');
        return;
    }

    ELEMENTS.checkoutModal.classList.add('active');
    fecharCarrinho();
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha o modal de checkout
 */
function fecharCheckout() {
    ELEMENTS.checkoutModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

/**
 * Atualiza o tipo de entrega
 */
function updateDeliveryType() {
    const tipoEntrega = document.querySelector('input[name="deliveryType"]:checked').value;

    if (tipoEntrega === 'pickup') {
        ELEMENTS.addressFieldset.style.display = 'none';
        ELEMENTS.address.removeAttribute('required');
        ELEMENTS.neighborhood.removeAttribute('required');
        ELEMENTS.deliveryFee.textContent = 'R$ 0,00';
        ELEMENTS.modalDeliveryFee.textContent = 'R$ 0,00';
    } else {
        ELEMENTS.addressFieldset.style.display = 'block';
        ELEMENTS.address.setAttribute('required', 'required');
        ELEMENTS.neighborhood.setAttribute('required', 'required');
        ELEMENTS.deliveryFee.textContent = `R$ ${CONSTANTES.TAXA_ENTREGA.toFixed(2)}`;
        ELEMENTS.modalDeliveryFee.textContent = `R$ ${CONSTANTES.TAXA_ENTREGA.toFixed(2)}`;
    }

    carrinhoGlobal.atualizarResumo();
}

/**
 * Atualiza o método de pagamento
 */
function updatePaymentMethod() {
    const pagamento = document.querySelector('input[name="payment"]:checked').value;

    if (pagamento === 'dinheiro') {
        ELEMENTS.changeFieldset.style.display = 'block';
    } else {
        ELEMENTS.changeFieldset.style.display = 'none';
        ELEMENTS.changeAmount.value = '';
    }
}

/**
 * Mostra notificação toast
 */
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, CONSTANTES.TEMPO_TOAST);
}

/**
 * Adiciona produto ao carrinho
 */
function adicionarAoCarrinho(produtoId) {
    carrinhoGlobal.adicionar(produtoId);
}

/**
 * Formata valor monetário
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

/**
 * Valida formulário
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
