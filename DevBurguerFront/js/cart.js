/**
 * CART.JS
 * Gerenciamento do carrinho de compras
 */

class Carrinho {
    constructor() {
        this.itens = [];
        this.carregarDoLocal();
    }

    /**
     * Adiciona um produto ao carrinho
     */
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

    /**
     * Remove um item do carrinho
     */
    remover(indice) {
        this.itens.splice(indice, 1);
        this.salvarNoLocal();
        this.atualizar();
    }

    /**
     * Altera a quantidade de um item
     */
    alterarQuantidade(indice, quantidade) {
        if (quantidade <= 0) {
            this.remover(indice);
        } else {
            this.itens[indice].quantidade = quantidade;
            this.salvarNoLocal();
            this.atualizar();
        }
    }

    /**
     * Limpa o carrinho
     */
    limpar() {
        this.itens = [];
        this.salvarNoLocal();
        this.atualizar();
    }

    /**
     * Calcula o subtotal
     */
    getSubtotal() {
        return this.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }

    /**
     * Calcula o total com entrega
     */
    getTotal(comEntrega = true) {
        const subtotal = this.getSubtotal();
        const taxa = comEntrega ? CONSTANTES.TAXA_ENTREGA : 0;
        return subtotal + taxa;
    }

    /**
     * Retorna a quantidade total de itens
     */
    getQuantidadeTotal() {
        return this.itens.reduce((total, item) => total + item.quantidade, 0);
    }

    /**
     * Salva o carrinho no localStorage
     */
    salvarNoLocal() {
        localStorage.setItem('devburger_carrinho', JSON.stringify(this.itens));
    }

    /**
     * Carrega o carrinho do localStorage
     */
    carregarDoLocal() {
        const dados = localStorage.getItem('devburger_carrinho');
        if (dados) {
            try {
                this.itens = JSON.parse(dados);
            } catch (e) {
                console.error('Erro ao carregar carrinho:', e);
                this.itens = [];
            }
        }
    }

    /**
     * Atualiza a UI do carrinho
     */
    atualizar() {
        this.atualizarContagem();
        this.atualizarItens();
        this.atualizarResumo();
    }

    /**
     * Atualiza o contador de itens
     */
    atualizarContagem() {
        const total = this.getQuantidadeTotal();
        ELEMENTS.cartCount.textContent = total;
        ELEMENTS.cartCount.style.display = total > 0 ? 'flex' : 'none';
    }

    /**
     * Atualiza a lista de itens no carrinho
     */
    atualizarItens() {
        if (this.itens.length === 0) {
            ELEMENTS.cartItems.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>';
            ELEMENTS.checkoutBtn.disabled = true;
            return;
        }

        ELEMENTS.cartItems.innerHTML = this.itens.map((item, indice) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.emoji} ${item.nome}</div>
                    <div class="cart-item-price">R$ ${(item.preco * item.quantidade).toFixed(2)}</div>
                </div>
                <div class="quantity-control">
                    <button class="qty-btn" onclick="carrinhoGlobal.alterarQuantidade(${indice}, ${item.quantidade - 1})">−</button>
                    <span class="qty-display">${item.quantidade}</span>
                    <button class="qty-btn" onclick="carrinhoGlobal.alterarQuantidade(${indice}, ${item.quantidade + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="carrinhoGlobal.remover(${indice})">🗑️</button>
            </div>
        `).join('');

        ELEMENTS.checkoutBtn.disabled = false;
    }

    /**
     * Atualiza o resumo de valores
     */
    atualizarResumo() {
        const subtotal = this.getSubtotal();
        const taxa = CONSTANTES.TAXA_ENTREGA;
        const total = this.getTotal();

        ELEMENTS.subtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
        ELEMENTS.deliveryFee.textContent = `R$ ${taxa.toFixed(2)}`;
        ELEMENTS.total.textContent = `R$ ${total.toFixed(2)}`;

        // Atualiza também no modal
        ELEMENTS.modalSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
        ELEMENTS.modalDeliveryFee.textContent = `R$ ${taxa.toFixed(2)}`;
        ELEMENTS.modalTotal.textContent = `R$ ${total.toFixed(2)}`;
    }

    /**
     * Retorna os dados para envio ao WhatsApp
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
        if (taxa > 0) {
            mensagem += `Taxa Entrega: R$ ${taxa.toFixed(2)}\n`;
        }
        mensagem += `*Total: R$ ${total.toFixed(2)}*\n`;

        mensagem += `\n📍 *ENTREGA:*\n`;
        if (dados.tipoEntrega === 'delivery') {
            mensagem += `${dados.endereco}, ${dados.bairro}`;
            if (dados.complemento) {
                mensagem += `, ${dados.complemento}`;
            }
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
