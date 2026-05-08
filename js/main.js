/**
 * MAIN.JS
 * Inicialização da aplicação e event listeners
 */

/** Inicializa todos os módulos da aplicação */
function inicializarApp() {
    console.log('🚀 Inicializando DevBurguer...');

    renderizarCategorias();
    renderizarTopProdutos();
    renderizarProdutos();
    iniciarAnimacoesScroll();
    configurarHeaderScroll();
    configurarEventListeners(); // chamado apenas uma vez

    carrinhoGlobal.atualizar();

    console.log('✅ DevBurguer pronto!');
}

/** Adiciona/remove a classe 'scrolled' do header conforme a rolagem da página */
function configurarHeaderScroll() {
    const header = ELEMENTS.header;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

/** Configura todos os event listeners da página */
function configurarEventListeners() {
    // --- Carrinho ---
    ELEMENTS.cartButton.addEventListener('click', abrirCarrinho);
    ELEMENTS.closeCartBtn.addEventListener('click', fecharCarrinho);
    ELEMENTS.cartOverlay.addEventListener('click', fecharCarrinho);
    ELEMENTS.checkoutBtn.addEventListener('click', abrirCheckout);

    // Event delegation para os botões gerados dinamicamente no carrinho
    ELEMENTS.cartItems.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const indice = parseInt(btn.dataset.index, 10);
        const action = btn.dataset.action;

        if (action === 'increment') {
            const item = carrinhoGlobal.itens[indice];
            if (item) carrinhoGlobal.alterarQuantidade(indice, item.quantidade + 1);
        } else if (action === 'decrement') {
            const item = carrinhoGlobal.itens[indice];
            if (item) carrinhoGlobal.alterarQuantidade(indice, item.quantidade - 1);
        } else if (action === 'remove') {
            carrinhoGlobal.remover(indice);
        }
    });

    // Event delegation para botões "Add" e "Eu Quero!" nos grids de produtos
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="add"]');
        if (btn) {
            adicionarAoCarrinho(parseInt(btn.dataset.id, 10));
        }
    });

    // Event delegation para botões de categoria
    ELEMENTS.categoriesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (btn) {
            filtrarPorCategoria(btn.dataset.categoria, btn);
        }
    });

    // --- Modal de checkout ---
    ELEMENTS.closeModalBtn.addEventListener('click', fecharCheckout);
    ELEMENTS.checkoutModal.addEventListener('click', (e) => {
        if (e.target === ELEMENTS.checkoutModal) fecharCheckout();
    });

    // --- Formulário ---
    ELEMENTS.checkoutForm.addEventListener('submit', finalizarPedido);

    ELEMENTS.deliveryType.addEventListener('change', updateDeliveryType);
    ELEMENTS.pickupType.addEventListener('change', updateDeliveryType);

    const paymentSelect = document.getElementById('paymentMethod');
    if (paymentSelect) {
        paymentSelect.addEventListener('change', updatePaymentMethod);
    };

   

    // Formata o telefone enquanto o usuário digita
    ELEMENTS.clientPhone.addEventListener('input', (e) => {
        e.target.value = formatarTelefone(e.target.value);
    });

    // --- Menu mobile ---
    if (ELEMENTS.mobileMenuBtn) {
        ELEMENTS.mobileMenuBtn.addEventListener('click', abrirMenuMobile);
    }
    if (ELEMENTS.closeMenuBtn) {
        ELEMENTS.closeMenuBtn.addEventListener('click', fecharMenuMobile);
    }
    if (ELEMENTS.menuOverlay) {
        ELEMENTS.menuOverlay.addEventListener('click', fecharMenuMobile);
    }
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', fecharMenuMobile);
    });

    // --- Teclado ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharCarrinho();
            fecharCheckout();
        }
    });

    // --- Smooth scroll para âncoras ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const destino = document.querySelector(href);
            if (destino) {
                destino.scrollIntoView({ behavior: 'smooth' });
                fecharCarrinho();
            }
        });
    });

    console.log('✅ Event listeners configurados');
}

function abrirMenuMobile() {
    ELEMENTS.navMenu.classList.add('active');
    ELEMENTS.menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharMenuMobile() {
    ELEMENTS.navMenu.classList.remove('active');
    if (ELEMENTS.menuOverlay) ELEMENTS.menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

/** Ativa animações de fade-in para as seções ao entrarem no viewport */
function iniciarAnimacoesScroll() {
    const elementos = document.querySelectorAll('.fade-in-section');

    const observer = new IntersectionObserver(
        (entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('is-visible');
                    observer.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    elementos.forEach(el => observer.observe(el));
}

/** Exibe informações de desenvolvimento no console */
function setupDesenvolvimento() {
    console.log('%c🍔 DevBurguer 2026', 'color: #FF3A44; font-size: 20px; font-weight: bold;');
    console.log('%cVersão: 1.0.0', 'color: #00BCD4; font-size: 12px;');
    console.log('%cDesenvolvido com ❤️ para DevBurguer', 'color: #FFD700; font-size: 12px;');
    console.log('');
    console.log('📦 Objetos globais: CONFIG, CONSTANTES, APP_STATE, carrinhoGlobal, PRODUTOS, PROMOCOES');
    console.log('🔧 Funções úteis: abrirCarrinho(), fecharCarrinho(), abrirCheckout(), debugCheckout(), gerarRelatorioPedidos(), exportarPedidosCSV()');
}

/* ============================================================
   EVENTOS GLOBAIS
   ============================================================ */

window.addEventListener('error', (e) => {
    console.error('❌ Erro global:', e.error);
    mostrarToast('Ocorreu um erro. Tente novamente.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promise rejeitada:', e.reason);
    mostrarToast('Ocorreu um erro. Tente novamente.', 'error');
});

/** Sincroniza o carrinho entre abas do navegador */
window.addEventListener('storage', (e) => {
    if (e.key === 'devburger_carrinho') {
        carrinhoGlobal.carregarDoLocal();
        carrinhoGlobal.atualizar();
        console.log('🔄 Carrinho sincronizado entre abas');
    }
});

/** Garante a persistência do carrinho ao sair da página */
window.addEventListener('beforeunload', () => {
    carrinhoGlobal.salvarNoLocal();
});

/* ============================================================
   BOOTSTRAP — garante que inicializarApp() é chamada uma única vez
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    setupDesenvolvimento();
});

console.log('✅ Main.js carregado com sucesso');
