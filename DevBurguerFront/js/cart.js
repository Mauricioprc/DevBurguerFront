/**
 * CART.JS
 * Gerenciamento do carrinho de compras
 */

class Carrinho {
    constructor() {
        this.itens = [];
        this.carregarDoLocal();
    }

    /** Adiciona um produto ao carrinho */
    adicionar(produtoId) {
        const produto = getProdutoById(produtoId);
        if (!produto) return;

        const itemExistente = this.itens.find(item => item.id === produtoId);

        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            this.itens.push({
                id: produtoId,
                nome: produto.nome,
                preco: produto.preco,
                emoji: produto.emoji,
                quantidade: 1,
            });
        }

        this.salvarNoLocal();
        this.atualizar();
        mostrarToast(`${produto.nome} adicionado ao carrinho!`);
    }

    /** Remove um item do carrinho pelo índice */
    remover(indice) {
        this.itens.splice(indice, 1);
        this.salvarNoLocal();
        this.atualizar();
    }

    /** Altera a quantidade de um item; remove se chegar a zero */
    alterarQuantidade(indice, quantidade) {
        if (quantidade <= 0) {
            this.remover(indice);
        } else {
            this.itens[indice].quantidade = quantidade;
            this.salvarNoLocal();
            this.atualizar();
        }
    }

    /** Esvazia o carrinho */
    limpar() {
        this.itens = [];
        this.salvarNoLocal();
        this.atualizar();
    }

    /** Retorna o subtotal (sem taxa) */
    getSubtotal() {
        return this.itens.reduce((total, item) => total + item.preco * item.quantidade, 0);
    }

    /**
     * Retorna o total, opcionalmente incluindo a taxa de entrega.
     * @param {boolean} comEntrega
     */
    getTotal(comEntrega = true) {
        const taxa = comEntrega ? CONSTANTES.TAXA_ENTREGA : 0;
        return this.getSubtotal() + taxa;
    }

    /** Retorna a soma de todas as quantidades */
    getQuantidadeTotal() {
        return this.itens.reduce((total, item) => total + item.quantidade, 0);
    }

    /** Persiste o carrinho no localStorage */
    salvarNoLocal() {
        localStorage.setItem('devburger_carrinho', JSON.stringify(this.itens));
    }

    /** Carrega o carrinho do localStorage */
    carregarDoLocal() {
        try {
            const dados = localStorage.getItem('devburger_carrinho');
            this.itens = dados ? JSON.parse(dados) : [];
        } catch (e) {
            console.error('Erro ao carregar carrinho:', e);
            this.itens = [];
        }
    }

    /** Dispara todas as atualizações de UI */
    atualizar() {
        this.atualizarContagem();
        this.atualizarItens();
        this.atualizarResumo();
    }

    /** Atualiza o badge com a quantidade total */
    atualizarContagem() {
        const total = this.getQuantidadeTotal();
        ELEMENTS.cartCount.textContent = total;
        ELEMENTS.cartCount.style.display = total > 0 ? 'flex' : 'none';
    }

    /** Renderiza a lista de itens no painel do carrinho */
    atualizarItens() {
        if (this.itens.length === 0) {
            ELEMENTS.cartItems.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>';
            ELEMENTS.checkoutBtn.disabled = true;
            return;
        }

        ELEMENTS.cartItems.innerHTML = this.itens
            .map(
                (item, indice) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.emoji} ${item.nome}</div>
                    <div class="cart-item-price">R$ ${(item.preco * item.quantidade).toFixed(2)}</div>
                </div>
                <div class="quantity-control">
                    <button class="qty-btn" data-action="decrement" data-index="${indice}">−</button>
                    <span class="qty-display">${item.quantidade}</span>
                    <button class="qty-btn" data-action="increment" data-index="${indice}">+</button>
                </div>
                <button class="remove-btn" data-action="remove" data-index="${indice}">🗑️</button>
            </div>
        `
            )
            .join('');

        ELEMENTS.checkoutBtn.disabled = false;
    }

    /** Atualiza os valores de subtotal, taxa e total no carrinho e no modal */
    atualizarResumo() {
        const subtotal = this.getSubtotal();
        const taxa = CONSTANTES.TAXA_ENTREGA;

        // Determina se é entrega ou retirada para calcular o total correto
        const inputEntrega = document.querySelector('input[name="deliveryType"]:checked');
        const ehDelivery = inputEntrega ? inputEntrega.value === 'delivery' : true;
        const total = this.getTotal(ehDelivery);

        const formatado = {
            subtotal: `R$ ${subtotal.toFixed(2)}`,
            taxa: `R$ ${taxa.toFixed(2)}`,
            total: `R$ ${total.toFixed(2)}`,
        };

        // Atualiza painel do carrinho
        if (ELEMENTS.subtotal)     ELEMENTS.subtotal.textContent     = formatado.subtotal;
        if (ELEMENTS.deliveryFee)  ELEMENTS.deliveryFee.textContent  = formatado.taxa;
        if (ELEMENTS.total)        ELEMENTS.total.textContent        = formatado.total;

        // Atualiza modal de checkout (evita duplicação usando os mesmos elementos)
        if (ELEMENTS.modalSubtotal)    ELEMENTS.modalSubtotal.textContent    = formatado.subtotal;
        if (ELEMENTS.modalDeliveryFee) ELEMENTS.modalDeliveryFee.textContent = formatado.taxa;
        if (ELEMENTS.modalTotal)       ELEMENTS.modalTotal.textContent       = formatado.total;

        // Oculta a linha de taxa quando for retirada
        const displayRow = ehDelivery ? 'flex' : 'none';
        if (ELEMENTS.deliveryFee)      ELEMENTS.deliveryFee.parentElement.style.display      = displayRow;
        if (ELEMENTS.modalDeliveryFee) ELEMENTS.modalDeliveryFee.parentElement.style.display = displayRow;
    }

    /**
     * Monta a mensagem de texto para envio via WhatsApp.
     * @param {Object} dados - Dados coletados do formulário de checkout
     */
    gerarResumo(dados) {
        let mensagem = `*PEDIDO DevBurguer* 🔥\n\n`;
        mensagem += `👤 *Cliente:* ${dados.nome}\n`;
        mensagem += `📱 *Telefone:* ${dados.telefone}\n`;
        mensagem += `\n*📦 ITENS DO PEDIDO:*\n`;

        this.itens.forEach(item => {
            const totalItem = (item.preco * item.quantidade).toFixed(2);
            mensagem += `${item.emoji} ${item.quantidade}x ${item.nome} - R$ ${totalItem}\n`;
        });

        const subtotal = this.getSubtotal();
        const taxa = dados.tipoEntrega === 'delivery' ? CONSTANTES.TAXA_ENTREGA : 0;
        const total = subtotal + taxa;

        mensagem += `\n💰 *VALORES:*\n`;
        mensagem += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
        if (taxa > 0) mensagem += `Taxa Entrega: R$ ${taxa.toFixed(2)}\n`;
        mensagem += `*Total: R$ ${total.toFixed(2)}*\n`;

        mensagem += `\n📍 *ENTREGA:*\n`;
        if (dados.tipoEntrega === 'delivery') {
            mensagem += `${dados.endereco}, ${dados.bairro}`;
            if (dados.complemento) mensagem += `, ${dados.complemento}`;
            mensagem += `\n`;
        } else {
            mensagem += `Retirada em Loja\n`;
            mensagem += `${CONFIG.lanchonete.endereco}\n`;
        }

        mensagem += `\n💳 *PAGAMENTO:* ${dados.pagamento.toUpperCase()}\n`;

        if (dados.pagamento === 'dinheiro' && dados.troco) {
            mensagem += `Troco para: R$ ${dados.troco}\n`;
        }

        mensagem += `\n_Pedido realizado em: ${new Date().toLocaleString('pt-BR')}_`;

        return mensagem;
    }
}

// Instância global do carrinho
const carrinhoGlobal = new Carrinho();

console.log('✅ Cart.js carregado com sucesso');
