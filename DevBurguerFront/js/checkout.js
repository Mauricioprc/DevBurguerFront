/**
 * CHECKOUT.JS
 * Lógica de finalização de pedido e histórico de pedidos
 */

/**
 * Finaliza o pedido e envia para WhatsApp
 * @param {Event} event
 */
async function finalizarPedido(event) {
    event.preventDefault();

    if (!validarFormulario()) return;

    const dados = {
        nome: ELEMENTS.clientName.value.trim(),
        telefone: ELEMENTS.clientPhone.value.trim(),
        tipoEntrega: document.querySelector('input[name="deliveryType"]:checked').value,
        endereco: ELEMENTS.address.value.trim(),
        bairro: ELEMENTS.neighborhood.value.trim(),
        complemento: ELEMENTS.complement.value.trim(),
        pagamento: document.querySelector('input[name="payment"]:checked').value,
        troco: ELEMENTS.changeAmount.value ? parseFloat(ELEMENTS.changeAmount.value) : null,
    };

    const resumo = carrinhoGlobal.gerarResumo(dados);
    const urlWhatsApp = `https://wa.me/${CONSTANTES.WHATSAPP_NUMERO}?text=${encodeURIComponent(resumo)}`;

    window.open(urlWhatsApp, '_blank');

    salvarPedidoNoHistorico(dados, resumo);

    carrinhoGlobal.limpar();
    ELEMENTS.checkoutForm.reset();
    fecharCheckout();

    mostrarToast('✅ Pedido enviado com sucesso! Aguarde contato no WhatsApp.');
    console.log('📤 Pedido enviado para WhatsApp:', resumo);
}

/**
 * Salva o pedido no histórico local (localStorage)
 * @param {Object} dados
 * @param {string} resumo
 */
function salvarPedidoNoHistorico(dados, resumo) {
    try {
        const historico = recuperarHistoricoPedidos();

        historico.push({
            id: Date.now(),
            data: new Date().toISOString(),
            cliente: dados.nome,
            telefone: dados.telefone,
            resumo,
            status: 'pendente',
        });

        localStorage.setItem('devburger_pedidos', JSON.stringify(historico));
        console.log('💾 Pedido salvo no histórico');
    } catch (e) {
        console.error('Erro ao salvar pedido:', e);
    }
}

/**
 * Retorna o histórico de pedidos do localStorage.
 * @returns {Array}
 */
function recuperarHistoricoPedidos() {
    try {
        return JSON.parse(localStorage.getItem('devburger_pedidos')) || [];
    } catch (e) {
        console.error('Erro ao recuperar histórico:', e);
        return [];
    }
}

/**
 * Gera um relatório de pedidos (útil para fins administrativos).
 * @returns {Object|null}
 */
function gerarRelatorioPedidos() {
    const historico = recuperarHistoricoPedidos();

    if (historico.length === 0) {
        console.log('Nenhum pedido registrado');
        return null;
    }

    const hoje = new Date().toDateString();

    return {
        totalPedidos: historico.length,
        pedidosHoje: historico.filter(p => new Date(p.data).toDateString() === hoje).length,
        pedidosPendentes: historico.filter(p => p.status === 'pendente').length,
        ultimoPedido: historico[historico.length - 1],
        historico,
    };
}

/**
 * Exporta os pedidos como arquivo CSV para download.
 */
function exportarPedidosCSV() {
    const historico = recuperarHistoricoPedidos();

    if (historico.length === 0) {
        alert('Nenhum pedido para exportar');
        return;
    }

    const linhas = historico.map(pedido => {
        const data = new Date(pedido.data).toLocaleString('pt-BR');
        return `"${data}","${pedido.cliente}","${pedido.telefone}","${pedido.status}"`;
    });

    const csv = `Data,Cliente,Telefone,Status\n${linhas.join('\n')}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
        href: url,
        download: `pedidos_devburger_${Date.now()}.csv`,
    });

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('📊 Pedidos exportados em CSV');
}

/**
 * Formata um número de telefone no padrão (XX) XXXXX-XXXX.
 * @param {string} tel
 * @returns {string}
 */
function formatarTelefone(tel) {
    const nums = tel.replace(/\D/g, '');
    if (nums.length === 11) {
        return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    }
    return tel;
}

/**
 * Verifica se um número de telefone é válido (10 ou 11 dígitos).
 * @param {string} tel
 * @returns {boolean}
 */
function validarTelefone(tel) {
    const nums = tel.replace(/\D/g, '');
    return nums.length >= 10 && nums.length <= 11;
}

/**
 * Exibe informações de debug no console (desenvolvimento).
 */
function debugCheckout() {
    console.group('🐛 DEBUG Checkout');
    console.log('Carrinho:', carrinhoGlobal.itens);
    console.log('Subtotal:', carrinhoGlobal.getSubtotal());
    console.log('Total:', carrinhoGlobal.getTotal());
    console.log('Histórico:', recuperarHistoricoPedidos());
    console.log('Relatório:', gerarRelatorioPedidos());
    console.groupEnd();
}

console.log('✅ Checkout.js carregado com sucesso');
