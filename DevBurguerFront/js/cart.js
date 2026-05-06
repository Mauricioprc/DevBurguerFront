/**
 * CART.JS
 * Gerenciamento do carrinho de compras com suporte a adicionais e observações.
 */

// 1. Tabela Estática de Adicionais baseada na sua solicitação
const ADICIONAIS_DISPONIVEIS = [
    { id: 'bacon', nome: 'Bacon', preco: 5.00 },
    { id: 'cheddar', nome: 'Cheddar', preco: 3.00 },
    { id: 'ovo', nome: 'Ovo', preco: 2.00 },
    { id: 'hamburguer', nome: 'Hamburguer', preco: 7.00 },
    { id: 'mussarela', nome: 'Mussarela', preco: 3.00 },
    { id: 'presunto', nome: 'Presunto', preco: 3.00 },
    { id: 'alface', nome: 'Alface', preco: 2.00 },
    { id: 'milho', nome: 'Milho', preco: 3.00 },
    { id: 'ervilha', nome: 'Ervilha', preco: 3.00 },
    { id: 'frango', nome: 'Frango Desfiado', preco: 5.00 },
    { id: 'catupiry', nome: 'Catupiry', preco: 3.00 },
    { id: 'calabresa', nome: 'Calabresa', preco: 5.00 },
    { id: 'contrafile', nome: 'Contra File', preco: 5.00 },
    { id: 'molhocasa', nome: 'Molho da casa', preco: 2.00 },
    { id: 'blend', nome: 'Blend 180G', preco: 9.00 },
    { id: 'onionrings', nome: 'Onion Rings', preco: 5.00 },
    { id: 'costela', nome: 'Costela Desfiada', preco: 8.00 },
    { id: 'cebola', nome: 'Cebola Caramelizada', preco: 8.00 },
    { id: 'barbecue', nome: 'Barbecue', preco: 1.00 }
];

class Carrinho {
    constructor() {
        this.itens = [];
        this.carregarDoLocal();
    }

    /** Adiciona um novo produto ao carrinho, criando um identificador único para ele */
    adicionar(produtoId) {
        const produto = getProdutoById(produtoId);
        if (!produto) return;

        // Ao invés de somar quantidade, criamos um item novo sempre para permitir customizações separadas
        const uniqueCartId = `${produtoId}-${Date.now()}`;

        this.itens.push({
            cartId: uniqueCartId,
            id: produtoId,
            nome: produto.nome,
            preco: produto.preco,
            emoji: produto.emoji,
            quantidade: 1,
            adicionais: [], // Lista de IDs de adicionais escolhidos
            observacao: ''  // Texto de observação
        });

        this.salvarNoLocal();
        this.atualizar();
        mostrarToast(`${produto.nome} adicionado ao carrinho!`);
        
        // UX: Abre o carrinho automaticamente para o cliente ver e já poder customizar
        abrirCarrinho();
    }

    /** Remove um item do carrinho pelo índice */
    remover(indice) {
        this.itens.splice(indice, 1);
        this.salvarNoLocal();
        this.atualizar();
    }

    /** Altera a quantidade de um item */
    alterarQuantidade(indice, quantidade) {
        if (quantidade <= 0) {
            this.remover(indice);
        } else {
            this.itens[indice].quantidade = quantidade;
            this.salvarNoLocal();
            this.atualizar();
        }
    }
    
    /** Marca ou desmarca um adicional em um item específico */
    toggleAdicional(indice, adicionalId, isChecked) {
        const item = this.itens[indice];
        if (!item) return;

        if (isChecked) {
            // Adiciona se não existir
            if (!item.adicionais.includes(adicionalId)) item.adicionais.push(adicionalId);
        } else {
            // Remove se desmarcado
            item.adicionais = item.adicionais.filter(id => id !== adicionalId);
        }
        
        this.salvarNoLocal();
        this.atualizar(true); // O parâmetro true indica que não queremos perder o estado visual do HTML
    }

    /** Atualiza o texto de observação */
    atualizarObservacao(indice, texto) {
        const item = this.itens[indice];
        if (!item) return;
        item.observacao = texto;
        this.salvarNoLocal();
    }

    /** Esvazia o carrinho */
    limpar() {
        this.itens = [];
        this.salvarNoLocal();
        this.atualizar();
    }

    /** Retorna o subtotal base (lanche) + o valor dos adicionais escolhidos */
    getSubtotal() {
        return this.itens.reduce((total, item) => {
            // Soma o preço de todos os adicionais desse item
            const valorAdicionais = item.adicionais.reduce((soma, addId) => {
                const addObj = ADICIONAIS_DISPONIVEIS.find(a => a.id === addId);
                return soma + (addObj ? addObj.preco : 0);
            }, 0);

            // Preço final do item = (preço base + adicionais) multiplicados pela quantidade
            const precoItem = (item.preco + valorAdicionais) * item.quantidade;
            return total + precoItem;
        }, 0);
    }

    getTotal(comEntrega = true) {
        const taxa = comEntrega ? CONSTANTES.TAXA_ENTREGA : 0;
        return this.getSubtotal() + taxa;
    }

    getQuantidadeTotal() {
        return this.itens.reduce((total, item) => total + item.quantidade, 0);
    }

    salvarNoLocal() {
        localStorage.setItem('devburger_carrinho', JSON.stringify(this.itens));
    }

    carregarDoLocal() {
        try {
            const dados = localStorage.getItem('devburger_carrinho');
            this.itens = dados ? JSON.parse(dados) : [];
            // Tratativa para pedidos antigos que não tinham adicionais no localStorage
            this.itens.forEach(item => {
                if (!item.adicionais) item.adicionais = [];
                if (!item.observacao) item.observacao = '';
            });
        } catch (e) {
            this.itens = [];
        }
    }

    /**
     * @param {boolean} manterEstado - Se true, mantemos as abas abertas enquanto o usuário clica
     */
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

    /** Constrói o HTML de cada item com a área de opções expansível */
    atualizarItens(manterEstado) {
        if (this.itens.length === 0) {
            ELEMENTS.cartItems.innerHTML = '<div class="cart-empty">Seu carrinho está vazio</div>';
            ELEMENTS.checkoutBtn.disabled = true;
            return;
        }

        // UX: Mapeia quais "details" estavam abertos para não fecharem ao clicar num checkbox
        const openStates = Array.from(document.querySelectorAll('.cart-item-customization')).map(el => el.open);

        ELEMENTS.cartItems.innerHTML = this.itens.map((item, indice) => {
            // Calcula o preço final do item para exibição
            const valorAdicionais = item.adicionais.reduce((soma, addId) => {
                const obj = ADICIONAIS_DISPONIVEIS.find(a => a.id === addId);
                return soma + (obj ? obj.preco : 0);
            }, 0);
            const precoDisplay = (item.preco + valorAdicionais) * item.quantidade;

            // Gera os checkboxes de adicionais
            const checkboxesHtml = ADICIONAIS_DISPONIVEIS.map(add => {
                const isChecked = item.adicionais.includes(add.id) ? 'checked' : '';
                return `
                    <label class="addon-label">
                        <input type="checkbox" class="addon-checkbox" data-index="${indice}" value="${add.id}" ${isChecked}>
                        ${add.nome} (+R$ ${add.preco.toFixed(2)})
                    </label>
                `;
            }).join('');

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
                
                <!-- Área expansível de customização -->
                <details class="cart-item-customization" ${manterEstado && openStates[indice] ? 'open' : ''}>
                    <summary>Personalizar (Adicionais e Obs)</summary>
                    <div class="addons-list">
                        ${checkboxesHtml}
                    </div>
                    <textarea class="obs-input" data-index="${indice}" placeholder="Alguma observação? (ex: Sem salada, mal passado...)">${item.observacao}</textarea>
                </details>
            </div>
            `;
        }).join('');

        ELEMENTS.checkoutBtn.disabled = false;
        
        // Liga os eventos para os checkboxes criados e textarea
        this.configurarEventosCustomizacao();
    }
    
    /** Registra cliques e inputs nas opções que acabamos de gerar na tela */
    configurarEventosCustomizacao() {
        // Eventos dos checkboxes
        document.querySelectorAll('.addon-checkbox').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const indice = e.target.dataset.index;
                const addId = e.target.value;
                this.toggleAdicional(indice, addId, e.target.checked);
            });
        });

        // Eventos das observações (salva ao digitar/sair do campo)
        document.querySelectorAll('.obs-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const indice = e.target.dataset.index;
                this.atualizarObservacao(indice, e.target.value);
            });
        });
    }

    atualizarResumo() {
        const subtotal = this.getSubtotal();
        const taxa = CONSTANTES.TAXA_ENTREGA;
        const inputEntrega = document.querySelector('input[name="deliveryType"]:checked');
        const ehDelivery = inputEntrega ? inputEntrega.value === 'delivery' : true;
        const total = this.getTotal(ehDelivery);

        const formatado = {
            subtotal: `R$ ${subtotal.toFixed(2)}`,
            taxa: `R$ ${taxa.toFixed(2)}`,
            total: `R$ ${total.toFixed(2)}`,
        };

        if (ELEMENTS.subtotal) ELEMENTS.subtotal.textContent = formatado.subtotal;
        if (ELEMENTS.deliveryFee) ELEMENTS.deliveryFee.textContent = formatado.taxa;
        if (ELEMENTS.total) ELEMENTS.total.textContent = formatado.total;
        if (ELEMENTS.modalSubtotal) ELEMENTS.modalSubtotal.textContent = formatado.subtotal;
        if (ELEMENTS.modalDeliveryFee) ELEMENTS.modalDeliveryFee.textContent = formatado.taxa;
        if (ELEMENTS.modalTotal) ELEMENTS.modalTotal.textContent = formatado.total;

        const displayRow = ehDelivery ? 'flex' : 'none';
        if (ELEMENTS.deliveryFee) ELEMENTS.deliveryFee.parentElement.style.display = displayRow;
        if (ELEMENTS.modalDeliveryFee) ELEMENTS.modalDeliveryFee.parentElement.style.display = displayRow;
    }

    /** Inclui os adicionais e observações no gerador para o WhatsApp */
    gerarResumo(dados) {
        let mensagem = `*PEDIDO DevBurguer* 🔥\n\n`;
        mensagem += `👤 *Cliente:* ${dados.nome}\n`;
        mensagem += `📱 *Telefone:* ${dados.telefone}\n`;
        mensagem += `\n*📦 ITENS DO PEDIDO:*\n`;

        this.itens.forEach(item => {
            const valorAdicionais = item.adicionais.reduce((soma, addId) => {
                const obj = ADICIONAIS_DISPONIVEIS.find(a => a.id === addId);
                return soma + (obj ? obj.preco : 0);
            }, 0);
            const totalItem = ((item.preco + valorAdicionais) * item.quantidade).toFixed(2);
            
            mensagem += `\n${item.emoji} *${item.quantidade}x ${item.nome}* - R$ ${totalItem}\n`;
            
            // Adiciona lista de extras se houver
            if (item.adicionais.length > 0) {
                const nomesAdd = item.adicionais.map(addId => {
                    const obj = ADICIONAIS_DISPONIVEIS.find(a => a.id === addId);
                    return obj ? obj.nome : '';
                }).join(', ');
                mensagem += `   ➕ Adicionais: ${nomesAdd}\n`;
            }
            
            // Adiciona a observação se houver
            if (item.observacao.trim() !== '') {
                mensagem += `   📝 Obs: ${item.observacao}\n`;
            }
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
            mensagem += `Troco para: R$ ${dados.troco.toFixed(2)}\n`;
        }

        return mensagem;
    }
}

// Instância global do carrinho
const carrinhoGlobal = new Carrinho();