/**
 * CHECKOUT.JS
 * Lógica de finalização de pedido e histórico de pedidos.
 */

/**
 * Finaliza o pedido e envia para o WhatsApp.
 * @param {Event} event
 */
async function finalizarPedido(event) {
    event.preventDefault();
    if (!validarFormulario()) return;

    const dados = {
        nome:        ELEMENTS.clientName.value.trim(),
        telefone:    ELEMENTS.clientPhone.value.trim(),
        tipoEntrega: document.querySelector('input[name="deliveryType"]:checked').value,
        endereco:    ELEMENTS.address.value.trim(),
        bairro:      ELEMENTS.neighborhood.value.trim(),
        complemento: ELEMENTS.complement.value.trim(),
        pagamento:   document.getElementById('paymentMethod').value,
        troco:       ELEMENTS.changeAmount.value ? parseFloat(ELEMENTS.changeAmount.value) : null,
    };

    const resumo     = carrinhoGlobal.gerarResumo(dados);
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${CONSTANTES.WHATSAPP_NUMERO}&text=${encodeURIComponent(resumo)}`;
    window.open(urlWhatsApp, '_blank');

    salvarPedidoNoHistorico(dados, resumo);

    carrinhoGlobal.limpar();
    ELEMENTS.checkoutForm.reset();
    fecharCheckout();

    mostrarToast('✅ Pedido enviado com sucesso! Aguarde contato no WhatsApp.');
}

// ─── Histórico de pedidos ─────────────────────────────────────────────────────

/**
 * Salva o pedido no histórico local (localStorage).
 * @param {Object} dados
 * @param {string} resumo
 */
function salvarPedidoNoHistorico(dados, resumo) {
    try {
        const historico = recuperarHistoricoPedidos();
        historico.push({
            id:       Date.now(),
            data:     new Date().toISOString(),
            cliente:  dados.nome,
            telefone: dados.telefone,
            resumo,
            status:   'pendente',
        });
        localStorage.setItem('devburger_pedidos', JSON.stringify(historico));
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
    } catch {
        return [];
    }
}

/**
 * Gera um relatório consolidado dos pedidos (uso administrativo).
 * @returns {Object|null}
 */
function gerarRelatorioPedidos() {
    const historico = recuperarHistoricoPedidos();
    if (historico.length === 0) return null;

    const hoje = new Date().toDateString();
    return {
        totalPedidos:     historico.length,
        pedidosHoje:      historico.filter(p => new Date(p.data).toDateString() === hoje).length,
        pedidosPendentes: historico.filter(p => p.status === 'pendente').length,
        ultimoPedido:     historico[historico.length - 1],
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

    const csv  = `Data,Cliente,Telefone,Status\n${linhas.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
        href:     url,
        download: `pedidos_devburger_${Date.now()}.csv`,
    });

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ─── Formatação de telefone ───────────────────────────────────────────────────

/**
 * Formata um número de telefone no padrão (XX) XXXXX-XXXX progressivamente.
 * @param {string} tel
 * @returns {string}
 */
function formatarTelefone(tel) {
    const nums = tel.replace(/\D/g, '').slice(0, 11);
    if (nums.length === 0)  return '';
    if (nums.length <= 2)   return `(${nums}`;
    if (nums.length <= 6)   return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10)  return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

// ─── Debug ────────────────────────────────────────────────────────────────────

/** Exibe informações de debug no console (ambiente de desenvolvimento). */
function debugCheckout() {
    console.group('🐛 DEBUG Checkout');
    console.log('Carrinho:',   carrinhoGlobal.itens);
    console.log('Subtotal:',   carrinhoGlobal.getSubtotal());
    console.log('Total:',      carrinhoGlobal.getTotal());
    console.log('Histórico:',  recuperarHistoricoPedidos());
    console.log('Relatório:',  gerarRelatorioPedidos());
    console.groupEnd();
}
