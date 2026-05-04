/**
 * MAIN.JS
 * Inicialização da aplicação e event listeners
 */

/**
 * Inicializa a aplicação
 */
function inicializarApp() {
    console.log('🚀 Inicializando DevBurguer...');

    // Renderiza componentes
    renderizarCategorias();
    renderizarPromocoes();
    renderizarTopProdutos();
    renderizarProdutos();

    // Atualiza UI do carrinho
    carrinhoGlobal.atualizar();

    // Configura event listeners
    configurarEventListeners();

    // Log
    console.log('✅ DevBurguer pronto!');
}

/**
 * Configura todos os event listeners
 */
function configurarEventListeners() {
    // Carrinho
    ELEMENTS.cartButton.addEventListener('click', abrirCarrinho);
    ELEMENTS.closeCartBtn.addEventListener('click', fecharCarrinho);
    ELEMENTS.cartOverlay.addEventListener('click', fecharCarrinho);
    ELEMENTS.checkoutBtn.addEventListener('click', abrirCheckout);

    // Modal
    ELEMENTS.closeModalBtn.addEventListener('click', fecharCheckout);
    ELEMENTS.checkoutModal.addEventListener('click', (e) => {
        if (e.target.id === 'checkoutModal') {
            fecharCheckout();
        }
    });

    // Formulário
    ELEMENTS.checkoutForm.addEventListener('submit', finalizarPedido);

    // Tipo de entrega
    ELEMENTS.deliveryType.addEventListener('change', updateDeliveryType);
    ELEMENTS.pickupType.addEventListener('change', updateDeliveryType);

    // Pagamento
    document.querySelectorAll('input[name="payment"]').forEach(input => {
        input.addEventListener('change', updatePaymentMethod);
    });

    // Validação de telefone
    ELEMENTS.clientPhone.addEventListener('input', (e) => {
        e.target.value = formatarTelefone(e.target.value);
    });

    // Fecha carrinho ao clicar em um produto (mobile)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-primary') && !e.target.closest('.cart-footer')) {
            setTimeout(fecharCarrinho, 300);
        }
    });

    // Suporte para tecla Escape fechar modal/carrinho
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharCarrinho();
            fecharCheckout();
        }
    });

    // Smooth scroll para navegação
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const elemento = document.querySelector(href);
                if (elemento) {
                    elemento.scrollIntoView({ behavior: 'smooth' });
                    fecharCarrinho();
                }
            }
        });
    });
    // 1. Abrir o menu ao clicar nos três risquinhos
    if (ELEMENTS.mobileMenuBtn) {
        ELEMENTS.mobileMenuBtn.addEventListener('click', () => {
            ELEMENTS.navMenu.classList.add('active');
            ELEMENTS.menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Trava o fundo de rolar
        });
    }

    // 2. Função para fechar o menu
    const fecharMenuMobile = () => {
        ELEMENTS.navMenu.classList.remove('active');
        if(ELEMENTS.menuOverlay) ELEMENTS.menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Destrava a rolagem do fundo
    };

    // 3. Fechar menu ao clicar no X
    if (ELEMENTS.closeMenuBtn) {
        ELEMENTS.closeMenuBtn.addEventListener('click', fecharMenuMobile);
    }

    // 4. Fechar menu ao clicar no fundo escuro
    if (ELEMENTS.menuOverlay) {
        ELEMENTS.menuOverlay.addEventListener('click', fecharMenuMobile);
    }

    // 5. Fechar menu ao clicar em qualquer link (ex: Início, Cardápio)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', fecharMenuMobile);
    });

    console.log('✅ Event listeners configurados');
}

/**
 * Setup para produção
 */
function setupProducao() {
    // Desabilita console no production
    if (window.location.protocol === 'https:') {
        console.log = () => {};
        console.error = () => {};
        console.warn = () => {};
    }
}

/**
 * Setup para desenvolvimento
 */
function setupDesenvolvimento() {
    // Mostra informações úteis no console
    console.log('%c🍔 DevBurguer 2026', 'color: #FF3A44; font-size: 20px; font-weight: bold;');
    console.log('%cVersão: 1.0.0', 'color: #00BCD4; font-size: 12px;');
    console.log('%cDesenvolvido com ❤️ para DevBurguer', 'color: #FFD700; font-size: 12px;');
    console.log('');
    console.log('📦 Objetos globais disponíveis:');
    console.log('  - CONFIG: Configurações');
    console.log('  - CONSTANTES: Constantes');
    console.log('  - APP_STATE: Estado da aplicação');
    console.log('  - carrinhoGlobal: Instância do carrinho');
    console.log('  - PRODUTOS: Array de produtos');
    console.log('  - PROMOCOES: Array de promoções');
    console.log('');
    console.log('🔧 Funções úteis:');
    console.log('  - abrirCarrinho()');
    console.log('  - fecharCarrinho()');
    console.log('  - abrirCheckout()');
    console.log('  - debugCheckout()');
    console.log('  - gerarRelatorioPedidos()');
    console.log('  - exportarPedidosCSV()');
    console.log('');
}

/**
 * Trata erros globais
 */
window.addEventListener('error', (e) => {
    console.error('❌ Erro global:', e.error);
    mostrarToast('Ocorreu um erro. Tente novamente.', 'error');
});

/**
 * Trata rejeições de promise
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promise rejeitada:', e.reason);
    mostrarToast('Ocorreu um erro. Tente novamente.', 'error');
});

/**
 * Listeners para sincronização entre abas
 */
window.addEventListener('storage', (e) => {
    if (e.key === 'devburger_carrinho') {
        carrinhoGlobal.carregarDoLocal();
        carrinhoGlobal.atualizar();
        console.log('🔄 Carrinho sincronizado entre abas');
    }
});

/**
 * Salva carrinho antes de sair
 */
window.addEventListener('beforeunload', () => {
    carrinhoGlobal.salvarNoLocal();
});

/**
 * Inicializa quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    setupDesenvolvimento();
});

/**
 * Inicializa se o documento já estiver carregado
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}

console.log('✅ Main.js carregado com sucesso');
