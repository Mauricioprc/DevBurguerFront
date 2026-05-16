/**
 * CART.JS
 * Gerenciamento do carrinho de compras com suporte a adicionais e observações.
 */

// ─── Tabela de adicionais disponíveis ─────────────────────────────────────────
const ADICIONAIS_DISPONIVEIS = [
    { id: 'bacon',      nome: 'Bacon',              preco: 5.00 },
    { id: 'cheddar',    nome: 'Cheddar',            preco: 3.00 },
    { id: 'ovo',        nome: 'Ovo',                preco: 2.00 },
    { id: 'hamburguer', nome: 'Hamburguer',         preco: 7.00 },
    { id: 'mussarela',  nome: 'Mussarela',          preco: 3.00 },
    { id: 'presunto',   nome: 'Presunto',           preco: 3.00 },
    { id: 'alface',     nome: 'Alface',             preco: 2.00 },
    { id: 'milho',      nome: 'Milho',              preco: 3.00 },
    { id: 'ervilha',    nome: 'Ervilha',            preco: 3.00 },
    { id: 'frango',     nome: 'Frango Desfiado',    preco: 5.00 },
    { id: 'catupiry',   nome: 'Catupiry',           preco: 3.00 },
    { id: 'calabresa',  nome: 'Calabresa',          preco: 5.00 },
    { id: 'contrafile', nome: 'Contra Filé',        preco: 5.00 },
    { id: 'molhocasa',  nome: 'Molho da Casa',      preco: 2.00 },
    { id: 'blend',      nome: 'Blend 180g',         preco: 9.00 },
    { id: 'onionrings', nome: 'Onion Rings',        preco: 5.00 },
    { id: 'costela',    nome: 'Costela Desfiada',   preco: 8.00 },
    { id: 'cebola',     nome: 'Cebola Caramelizada',preco: 8.00 },
    { id: 'barbecue',   nome: 'Barbecue',           preco: 1.00 },
];

// FIX: categorias bloqueadas 
const CATEGORIAS_SEM_ADICIONAIS = new Set(['bebidas', 'sucos', 'alcoolicas', 'milkshakes']);

// ─── Utilitário: calcula o valor dos adicionais de uma lista de IDs ───────────
function calcularValorAdicionais(listaIds) {
    return listaIds.reduce((soma, addId) => {
        const add = ADICIONAIS_DISPONIVEIS.find(a => a.id === addId);
        return soma + (add ? add.preco : 0);
    }, 0);
}

// ─── Classe principal do carrinho ─────────────────────────────────────────────
class Carrinho {
    constructor() {
        this.itens = [];
        this.carregarDoLocal();
    }

    /** Adiciona um produto ao carrinho com identificador único */
    adicionar(produtoId) {
        const produto = getProdutoById(produtoId);
        if (!produto) return;

        this.itens.push({
            cartId:    `${produtoId}-${Date.now()}`,
            id:        produtoId,
            nome:      produto.nome,
            preco:     produto.preco,
            emoji:     produto.emoji,
            categoria: produto.categoria || '',
            quantidade:1,
            adicionais:[],
            observacao:'',
        });

        this.salvarNoLocal();
        this.atualizar();
        mostrarToast(`${produto.nome} adicionado ao carrinho!`);
        abrirCarrinho();
    }

    remover(indice) {
        this.itens.splice(indice, 1);
        this.salvarNoLocal();
        this.atualizar();
    }

    alterarQuantidade(indice, quantidade) {
        if (quantidade <= 0) {
            this.remover(indice);
        } else {
            this.itens[indice].quantidade = quantidade;
            this.salvarNoLocal();
            this.atualizar();
        }
    }

    // FIX: indice vinha como string do dataset; forçar Number garante o splice correto
    toggleAdicional(indice, adicionalId, isChecked) {
        const item = this.itens[Number(indice)];
        if (!item) return;

        if (isChecked) {
            if (!item.adicionais.includes(adicionalId)) item.adicionais.push(adicionalId);
        } else {
            item.adicionais = item.adicionais.filter(id => id !== adicionalId);
        }

        this.salvarNoLocal();
        this.atualizar(true);
    }

    atualizarObservacao(indice, texto) {
        // FIX: mesma coerção de tipo que toggleAdicional
        const item = this.itens[Number(indice)];
        if (!item) return;
        item.observacao = texto;
        this.salvarNoLocal();
    }

    limpar() {
        this.itens = [];
        this.salvarNoLocal();
        this.atualizar();
    }

    // ─── Cálculos ─────────────────────────────────────────────────────────────

    getSubtotal() {
        return this.itens.reduce((total, item) => {
            // FIX: usa helper em vez de repetir a lógica inline
            const valorAdicionais = calcularValorAdicionais(item.adicionais);
            return total + (item.preco + valorAdicionais) * item.quantidade;
        }, 0);
    }

    getTotal(comEntrega = true) {
        return this.getSubtotal() + (comEntrega ? CONSTANTES.TAXA_ENTREGA : 0);
    }

    getQuantidadeTotal() {
        return this.itens.reduce((total, item) => total + item.quantidade, 0);
    }

    // ─── Persistência ─────────────────────────────────────────────────────────

    salvarNoLocal() {
        localStorage.setItem('devburger_carrinho', JSON.stringify(this.itens));
    }

    carregarDoLocal() {
        try {
            const dados = localStorage.getItem('devburger_carrinho');
            this.itens = dados ? JSON.parse(dados) : [];
            // Garante compatibilidade com pedidos salvos antes desta versão
            this.itens.forEach(item => {
                if (!item.adicionais) item.adicionais = [];
                if (!item.observacao) item.observacao = '';
                if (!item.categoria)  item.categoria  = '';
            });
        } catch {
            this.itens = [];
        }
    }

    // ─── Atualização de UI ────────────────────────────────────────────────────

    atualizar(manterEstado = false) {
        this.atualizarContagem();
        this.atualizarItens(manterEstado);
        this.atualizarResumo();
    }

    atualizarContagem() {
        const total = this.getQuantidadeTotal();
        ELEMENTS.cartCount.textContent = total;
        ELEMENTS.cartCount.style.display = total > 0 ? 'flex' : 'none';
    }

    /** Constrói o HTML dos itens com área de personalização expansível */
    atualizarItens(manterEstado) {
        if (this.itens.length === 0) {
            ELEMENTS.cartItems.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>';
            ELEMENTS.checkoutBtn.disabled = true;
            return;
        }

        // Preserva quais <details> estavam abertos antes de re-renderizar
        const openStates = Array.from(
            document.querySelectorAll('.cart-item-customization')
        ).map(el => el.open);

        ELEMENTS.cartItems.innerHTML = this.itens.map((item, indice) => {
            const categoriaItem = (item.categoria || '').toLowerCase();

            // FIX: verificação agora usa Set com IDs exatos, em vez de includes com strings parciais
            const aceitaAdicionais = !CATEGORIAS_SEM_ADICIONAIS.has(categoriaItem);

            // FIX: usa helper centralizado
            const valorAdicionais = calcularValorAdicionais(item.adicionais);
            const precoDisplay    = (item.preco + valorAdicionais) * item.quantidade;

            const checkboxesHtml = aceitaAdicionais
                ? ADICIONAIS_DISPONIVEIS.map(add => {
                    const checked = item.adicionais.includes(add.id) ? 'checked' : '';
                    return `
                        <label class="addon-label">
                            <input type="checkbox" class="addon-checkbox"
                                data-index="${indice}" value="${add.id}" ${checked}>
                            ${add.nome} (+R$ ${add.preco.toFixed(2)})
                        </label>`;
                }).join('')
                : '';

            const isOpen = manterEstado && openStates[indice] ? 'open' : '';

            return `
            <div class="cart-item">
                <div class="cart-item-main">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.emoji} ${item.nome}</div>
                        <div class="cart-item-price">R$ ${precoDisplay.toFixed(2)}</div>
                    </div>
                    <div class="quantity-control">
                        <button class="qty-btn" data-action="decrement" data-index="${indice}">−</button>
                        <span class="qty-display">${item.quantidade}</span>
                        <button class="qty-btn" data-action="increment" data-index="${indice}">+</button>
                    </div>
                    <button class="remove-btn" data-action="remove" data-index="${indice}">🗑️</button>
                </div>

                <details class="cart-item-customization" ${isOpen}>
                    <summary>Personalizar ${aceitaAdicionais ? '(Adicionais e Obs)' : '(Observação)'}</summary>
                    ${aceitaAdicionais ? `<div class="addons-list">${checkboxesHtml}</div>` : ''}
                    <textarea class="obs-input" data-index="${indice}"
                        placeholder="${aceitaAdicionais ? 'Alguma observação? (ex: Sem salada, mal passado...)' : 'Alguma observação?'}"
                    >${item.observacao}</textarea>
                </details>
            </div>`;
        }).join('');

        ELEMENTS.checkoutBtn.disabled = false;
        this._configurarEventosCustomizacao();
    }

    /** Vincula eventos aos checkboxes e textareas gerados dinamicamente */
    _configurarEventosCustomizacao() {
        document.querySelectorAll('.addon-checkbox').forEach(chk => {
            chk.addEventListener('change', e => {
                this.toggleAdicional(e.target.dataset.index, e.target.value, e.target.checked);
            });
        });

        document.querySelectorAll('.obs-input').forEach(input => {
            input.addEventListener('change', e => {
                this.atualizarObservacao(e.target.dataset.index, e.target.value);
            });
        });
    }

    atualizarResumo() {
        const subtotal   = this.getSubtotal();
        const taxa       = CONSTANTES.TAXA_ENTREGA;
        const inputEntrega = document.querySelector('input[name="deliveryType"]:checked');
        const ehDelivery = inputEntrega ? inputEntrega.value === 'delivery' : true;
        const total      = this.getTotal(ehDelivery);

        const fmt = v => `R$ ${v.toFixed(2)}`;

        if (ELEMENTS.subtotal)        ELEMENTS.subtotal.textContent        = fmt(subtotal);
        if (ELEMENTS.deliveryFee)     ELEMENTS.deliveryFee.textContent     = fmt(taxa);
        if (ELEMENTS.total)           ELEMENTS.total.textContent           = fmt(total);
        if (ELEMENTS.modalSubtotal)   ELEMENTS.modalSubtotal.textContent   = fmt(subtotal);
        if (ELEMENTS.modalDeliveryFee)ELEMENTS.modalDeliveryFee.textContent= fmt(taxa);
        if (ELEMENTS.modalTotal)      ELEMENTS.modalTotal.textContent      = fmt(total);

        // Mostra/oculta a linha de taxa de entrega conforme o tipo selecionado
        const displayRow = ehDelivery ? 'flex' : 'none';
        if (ELEMENTS.deliveryFee)      ELEMENTS.deliveryFee.parentElement.style.display      = displayRow;
        if (ELEMENTS.modalDeliveryFee) ELEMENTS.modalDeliveryFee.parentElement.style.display = displayRow;
    }

    /** Monta a mensagem de texto para o WhatsApp */
    gerarResumo(dados) {
        let msg = `*Pedido DevBurguer* 🔥\n\n`;
        msg += `👤 *Cliente:* ${dados.nome}\n`;
        msg += `📱 *Telefone:* ${dados.telefone}\n`;
        msg += `\n*📦 ITENS DO PEDIDO:*\n`;

        this.itens.forEach(item => {
            // FIX: usa helper centralizado
            const valorAdicionais = calcularValorAdicionais(item.adicionais);
            const totalItem = ((item.preco + valorAdicionais) * item.quantidade).toFixed(2);

            msg += `\n${item.emoji} *${item.quantidade}x ${item.nome}* - R$ ${totalItem}\n`;

            if (item.adicionais.length > 0) {
                const nomes = item.adicionais
                    .map(id => ADICIONAIS_DISPONIVEIS.find(a => a.id === id)?.nome ?? '')
                    .filter(Boolean)
                    .join(', ');
                msg += `   ➕ Adicionais: ${nomes}\n`;
            }

            if (item.observacao.trim()) {
                msg += `   📝 Obs: ${item.observacao}\n`;
            }
        });

        const subtotal = this.getSubtotal();
        const taxa     = dados.tipoEntrega === 'delivery' ? CONSTANTES.TAXA_ENTREGA : 0;
        const total    = subtotal + taxa;

        msg += `\n\n💰 *VALORES:*\n`;
        msg += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
        if (taxa > 0) msg += `Taxa Entrega: R$ ${taxa.toFixed(2)}\n`;
        msg += `*Total: R$ ${total.toFixed(2)}*\n`;

        msg += `\n\n📍 *ENTREGA:*\n`;
        if (dados.tipoEntrega === 'delivery') {
            msg += `${dados.endereco}, ${dados.bairro}`;
            if (dados.complemento) msg += `, ${dados.complemento}`;
            msg += `\n`;
        } else {
            msg += `Retirada em Loja\n${CONFIG.lanchonete.endereco}\n`;
        }

        msg += `\n\n💳 *PAGAMENTO:* ${dados.pagamento.toUpperCase()}\n`;
        if (dados.pagamento === 'dinheiro' && dados.troco) {
            msg += `Troco para: R$ ${dados.troco.toFixed(2)}\n`;
        }

        return msg;
    }
}

// Instância global do carrinho
const carrinhoGlobal = new Carrinho();
