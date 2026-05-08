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
 * Renderiza os produtos agrupados por categoria (Estilo Prateleira/Netflix).
 * @param {string} [categoria='todos']
 */
function renderizarProdutos(categoria = 'todos') {
    // Tenta executar a renderização. Se houver erro, captura no console.
    try {
        // 1. Filtra as categorias que devem aparecer
        const categoriasParaRenderizar = categoria === 'todos' 
            ? CONFIG.categorias.filter(c => c.id !== 'todos') 
            : CONFIG.categorias.filter(c => c.id === categoria);

        let htmlFinal = '';

        // 2. Cria a prateleira para cada categoria listada
        categoriasParaRenderizar.forEach(cat => {
            const produtosDaCategoria = getProdutosByCategoria(cat.id);

            // Renderiza apenas se houver produtos vinculados a esta categoria
            if (produtosDaCategoria && produtosDaCategoria.length > 0) {
                htmlFinal += `
                    <div class="category-group">
                        <h3 class="category-group-title">${cat.icon} ${cat.label}</h3>
                        
                        <!-- Container que desliza lateralmente no mobile -->
                        <div class="products-row">
                            ${produtosDaCategoria.map(produto => `
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
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        // 3. Verifica se o container existe na página e injeta o HTML final
        if (ELEMENTS.productsGrid) {
            ELEMENTS.productsGrid.innerHTML = htmlFinal;
        }

    } catch (error) {
        // Registra o erro no modo desenvolvedor (F12) caso algo falhe
        console.error("Erro ao renderizar o cardápio:", error);
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
        .map((produto, indice) => {
            const medalha = medalhas[indice] || { classe: '', icone: '' };
            
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
    const pagamento = document.getElementById('paymentMethod')?.value || '';
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
 * Valida o formulário de checkout antes de enviar o pedido.
 * Verifica validade padrão do HTML, regras de tamanho de nome e telefone.
 * @returns {boolean} Retorna true se tudo estiver correto, ou false se houver erro.
 */
function validarFormulario() {
    const form = ELEMENTS.checkoutForm;

    // 1. Validação padrão do HTML
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    // 2. Validação do Nome (Mínimo de 3 caracteres)
    const nome = ELEMENTS.clientName.value.trim();
    if (nome.length < 3) {
        mostrarToast('O nome deve ter pelo menos 3 letras.', 'error');
        ELEMENTS.clientName.focus();
        return false;
    }

    // 3. Validação do Telefone (Apenas Celular/WhatsApp)
    const telefoneDigitado = ELEMENTS.clientPhone.value;
    const telefonePuro = telefoneDigitado.replace(/\D/g, ''); 

    // Regra atualizada: Se for DIFERENTE (!==) de 11, dá erro.
    if (telefonePuro.length !== 11) {
        mostrarToast('Digite o DDD e o número completo do WhatsApp (11 dígitos).', 'error');
        ELEMENTS.clientPhone.focus(); 
        return false; // Interrompe o envio
    }

    // 4. Validação de Endereço (Modo Delivery)
    const tipoEntrega = document.querySelector('input[name="deliveryType"]:checked').value;
    if (tipoEntrega === 'delivery') {
        if (!ELEMENTS.address.value.trim() || !ELEMENTS.neighborhood.value.trim()) {
            mostrarToast('Preencha os dados de entrega!', 'error');
            return false;
        }
    }
    // 5. Validação de Pagamento e Troco
    const paymentSelect = document.getElementById('paymentMethod');
    
    // Se o pagamento for em dinheiro, fazemos a checagem do troco
    if (paymentSelect && paymentSelect.value === 'dinheiro') {
        const changeAmountInput = document.getElementById('changeAmount').value;
        
        // Só validamos se o cliente digitou algo no troco
        if (changeAmountInput) {
            const valorTroco = parseFloat(changeAmountInput);
            
            // Pega o texto do Total do Carrinho. 
            const elementoTotal = document.getElementById('modalTotal'); 
            
            if (elementoTotal) {
                // Transforma o texto "R$ 55,00" no número matemático 55.00
                const textoTotal = elementoTotal.innerText;
                const valorTotalPedido = parseFloat(textoTotal.replace('R$', '').replace(',', '.').trim());

                // A mágica acontece aqui: se o troco for menor que o total, BLOQUEIA!
                if (valorTroco < valorTotalPedido) {
                    mostrarToast(`Erro: O troco não pode ser menor que o total (R$ ${valorTotalPedido.toFixed(2)}).`, 'error');
                    document.getElementById('changeAmount').focus();
                    return false; // Interrompe o envio do pedido!
                }
            }
        }
    }

    // Se chegou até aqui, tudo está 100% correto.
    return true; 
}
/**
 * Feedback em tempo real para o campo de telefone.
 * Conta os números e avisa o cliente a cada tecla digitada.
 */
document.addEventListener('DOMContentLoaded', () => {
    const inputTelefone = document.getElementById('clientPhone');
    const feedbackTelefone = document.getElementById('phoneFeedback');

    if (inputTelefone && feedbackTelefone) {
        inputTelefone.addEventListener('input', function(e) {
            const telefonePuro = e.target.value.replace(/\D/g, '');
            const qtdNumeros = telefonePuro.length;

            if (qtdNumeros === 0) {
                feedbackTelefone.style.display = 'none';
                return;
            }

            feedbackTelefone.style.display = 'block';

            // Nova Lógica: Apenas 11 números importam
            if (qtdNumeros < 11) {
                const faltam = 11 - qtdNumeros;
                feedbackTelefone.style.color = '#ef4444'; // Vermelho
                feedbackTelefone.innerText = `Faltam ${faltam} número(s) para o WhatsApp.`;
            
            } else if (qtdNumeros === 11) {
                feedbackTelefone.style.color = '#22c55e'; // Verde
                feedbackTelefone.innerText = `Número de WhatsApp completo! ✔️`;
            }
        });
    }
});

/**
 * Alterna a exibição dos campos de Cartão ou Troco 
 * dependendo da forma de pagamento selecionada.
 */
document.addEventListener('DOMContentLoaded', () => {
    const paymentMethod = document.getElementById('paymentMethod');
    const cardTypeContainer = document.getElementById('cardTypeContainer');
    const changeContainer = document.getElementById('changeContainer');

    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            // Primeiro, escondemos os dois campos para resetar a tela
            cardTypeContainer.style.display = 'none';
            changeContainer.style.display = 'none';

            // Depois, mostramos apenas o que o cliente escolheu
            if (this.value === 'cartao') {
                cardTypeContainer.style.display = 'block';
            } else if (this.value === 'dinheiro') {
                changeContainer.style.display = 'block';
            }
        });
    }
});
/**
 * Calcula o troco em tempo real e exibe alertas se o valor for insuficiente.
 */
document.addEventListener('DOMContentLoaded', () => {
    const inputTroco = document.getElementById('changeAmount');
    const feedbackTroco = document.getElementById('changeFeedback');

    if (inputTroco && feedbackTroco) {
        inputTroco.addEventListener('input', function(e) {
            // Converte o que o cliente digitou em número decimal
            const valorDigitado = parseFloat(e.target.value);

            // Se o campo estiver vazio ou o valor for inválido, esconde o aviso
            if (isNaN(valorDigitado) || valorDigitado <= 0) {
                feedbackTroco.style.display = 'none';
                return;
            }

            // ⚠️ ATENÇÃO: Pegamos o Total do Carrinho (Ajuste o 'cart-total' para o ID correto do seu site!)
            const elementoTotal = document.getElementById('modalTotal'); 
            
            if (!elementoTotal) {
                console.error("Não achei o total do carrinho para calcular o troco!");
                return;
            }

            // Limpa o texto "R$ 55,00" e transforma no número 55.00 para fazer a conta
            const textoTotal = elementoTotal.innerText;
            const valorTotalPedido = parseFloat(textoTotal.replace('R$', '').replace(',', '.').trim());

            // Mostra o texto de aviso na tela
            feedbackTroco.style.display = 'block';

            // Fazendo as comparações matemáticas
            if (valorDigitado < valorTotalPedido) {
                // Cenário 1: Cliente colocou dinheiro a menos!
                feedbackTroco.style.color = '#ef4444'; // Vermelho
                feedbackTroco.innerText = `Valor insuficiente! Faltam R$ ${(valorTotalPedido - valorDigitado).toFixed(2).replace('.', ',')}.`;
            
            } else if (valorDigitado === valorTotalPedido) {
                // Cenário 2: Cliente colocou o valor exato
                feedbackTroco.style.color = '#eab308'; // Amarelo
                feedbackTroco.innerText = `Valor exato! Não precisa enviar troco.`;
            
            } else {
                // Cenário 3: Tudo certo, calculamos o troco!
                const troco = valorDigitado - valorTotalPedido;
                feedbackTroco.style.color = '#22c55e'; // Verde
                feedbackTroco.innerText = `O entregador levará R$ ${troco.toFixed(2).replace('.', ',')} de troco.`;
            }
        });
    }
});

console.log('✅ UI.js carregado com sucesso');
