/**
 * CHECKOUT.JS
 * Lógica de finalização de pedido
 */

/**
 * Finaliza o pedido e envia para WhatsApp
 */
async function finalizarPedido(event) {
    event.preventDefault();

    // Valida o formulário
    if (!validarFormulario()) {
        return;
    }

    // Coleta dados do formulário
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

    // Gera o resumo do pedido
    const resumo = carrinhoGlobal.gerarResumo(dados);

    // Codifica a mensagem para URL
    const urlWhatsApp = `https://wa.me/${CONSTANTES.WHATSAPP_NUMERO}?text=${encodeURIComponent(resumo)}`;

    // Abre WhatsApp em nova aba
    window.open(urlWhatsApp, '_blank');

    // Salva pedido no histórico
    salvarPedidoNoHistorico(dados, resumo);

    // Limpa carrinho
    carrinhoGlobal.limpar();

    // Reseta formulário
    ELEMENTS.checkoutForm.reset();

    // Fecha modal
    fecharCheckout();

    // Mostra mensagem de sucesso
    mostrarToast('✅ Pedido enviado com sucesso! Aguarde contato no WhatsApp.');

    console.log('📤 Pedido enviado para WhatsApp:', resumo);
}

/**
 * Salva o pedido no histórico local
 */
function salvarPedidoNoHistorico(dados, resumo) {
    try {
        let historico = JSON.parse(localStorage.getItem('devburger_pedidos')) || [];

        const pedido = {
            id: Date.now(),
            data: new Date().toISOString(),
            cliente: dados.nome,
            telefone: dados.telefone,
            resumo: resumo,
            status: 'pendente',
        };

        historico.push(pedido);
        localStorage.setItem('devburger_pedidos', JSON.stringify(historico));

        console.log('💾 Pedido salvo no histórico');
    } catch (e) {
        console.error('Erro ao salvar pedido:', e);
    }
}

/**
 * Recupera histórico de pedidos
 */
function recuperarHistoricoPedidos() {
    try {
        const historico = JSON.parse(localStorage.getItem('devburger_pedidos')) || [];
        return historico;
    } catch (e) {
        console.error('Erro ao recuperar histórico:', e);
        return [];
    }
}

/**
 * Gera relatório de vendas (para admin)
 */
function gerarRelatorioPedidos() {
    const historico = recuperarHistoricoPedidos();

    if (historico.length === 0) {
        console.log('Nenhum pedido registrado');
        return null;
    }

    const total = historico.length;
    const dataAtual = new Date();
    const pedidosHoje = historico.filter(p => {
        const dataPedido = new Date(p.data);
        return dataPedido.toDateString() === dataAtual.toDateString();
    });

    return {
        totalPedidos: total,
        pedidosHoje: pedidosHoje.length,
        pedidosPendentes: historico.filter(p => p.status === 'pendente').length,
        ultimoPedido: historico[historico.length - 1],
        historico: historico,
    };
}

/**
 * Exporta pedidos como CSV
 */
function exportarPedidosCSV() {
    const historico = recuperarHistoricoPedidos();

    if (historico.length === 0) {
        alert('Nenhum pedido para exportar');
        return;
    }

    let csv = 'Data,Cliente,Telefone,Status\n';

    historico.forEach(pedido => {
        const data = new Date(pedido.data).toLocaleString('pt-BR');
        csv += `"${data}","${pedido.cliente}","${pedido.telefone}","${pedido.status}"\n`;
    });

    // Cria blob e download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_devburger_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log('📊 Pedidos exportados em CSV');
}

/**
 * Formata o número de telefone
 */
function formatarTelefone(tel) {
    // Remove caracteres não numéricos
    const apenasNumeros = tel.replace(/\D/g, '');

    // Formata como (XX) XXXXX-XXXX
    if (apenasNumeros.length === 11) {
        return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
    }

    return tel;
}

/**
 * Valida número de telefone
 */
function validarTelefone(tel) {
    const apenasNumeros = tel.replace(/\D/g, '');
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
}

/**
 * Debug: Mostra dados do checkout no console
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
