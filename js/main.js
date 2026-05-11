/**
 * MAIN.JS
 * Bootstrap da aplicação — inicialização e event listeners centralizados.
 */

/** Inicializa todos os módulos da aplicação */
function inicializarApp() {
    renderizarCategorias();
    renderizarTopProdutos();
    renderizarProdutos();
    iniciarAnimacoesScroll();
    configurarHeaderScroll();
    configurarEventListeners();
    carrinhoGlobal.atualizar();
}

/** Adiciona/remove a classe 'scrolled' do header conforme a rolagem */
function configurarHeaderScroll() {
    window.addEventListener('scroll', () => {
        ELEMENTS.header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

/** Configura todos os event listeners em um único lugar */
function configurarEventListeners() {
    // ── Carrinho ──────────────────────────────────────────────────────────────
    ELEMENTS.cartButton.addEventListener('click',   abrirCarrinho);
    ELEMENTS.closeCartBtn.addEventListener('click', fecharCarrinho);
    ELEMENTS.cartOverlay.addEventListener('click',  fecharCarrinho);
    ELEMENTS.checkoutBtn.addEventListener('click',  abrirCheckout);

    // Event delegation — botões de quantidade e remoção gerados dinamicamente
    ELEMENTS.cartItems.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const indice = parseInt(btn.dataset.index, 10);
        const action = btn.dataset.action;
        const item   = carrinhoGlobal.itens[indice];

        if (action === 'increment' && item) carrinhoGlobal.alterarQuantidade(indice, item.quantidade + 1);
        if (action === 'decrement' && item) carrinhoGlobal.alterarQuantidade(indice, item.quantidade - 1);
        if (action === 'remove')            carrinhoGlobal.remover(indice);
    });

    // Event delegation — botões "Add" e "Eu Quero!" nos grids de produtos e banner
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-action="add"]');
        if (btn) adicionarAoCarrinho(parseInt(btn.dataset.id, 10));
    });

    // Event delegation — filtros de categoria
    ELEMENTS.categoriesContainer.addEventListener('click', e => {
        const btn = e.target.closest('.category-btn');
        if (btn) filtrarPorCategoria(btn.dataset.categoria, btn);
    });

    // ── Modal de checkout ─────────────────────────────────────────────────────
    ELEMENTS.closeModalBtn.addEventListener('click', fecharCheckout);
    ELEMENTS.checkoutModal.addEventListener('click', e => {
        if (e.target === ELEMENTS.checkoutModal) fecharCheckout();
    });

    // ── Formulário ────────────────────────────────────────────────────────────
    ELEMENTS.checkoutForm.addEventListener('submit', finalizarPedido);
    ELEMENTS.deliveryType.addEventListener('change', updateDeliveryType);
    ELEMENTS.pickupType.addEventListener('change',   updateDeliveryType);

    // FIX: listener de pagamento existia duplicado (main.js + ui.js DOMContentLoaded anônimo).
    // Mantido apenas aqui, chamando updatePaymentMethod de ui.js.
    const paymentSelect = document.getElementById('paymentMethod');
    if (paymentSelect) paymentSelect.addEventListener('change', updatePaymentMethod);

    // Formata o telefone enquanto o usuário digita
    ELEMENTS.clientPhone.addEventListener('input', e => {
        e.target.value = formatarTelefone(e.target.value);
    });

    // ── Menu mobile ───────────────────────────────────────────────────────────
    if (ELEMENTS.mobileMenuBtn) ELEMENTS.mobileMenuBtn.addEventListener('click', abrirMenuMobile);
    if (ELEMENTS.closeMenuBtn)  ELEMENTS.closeMenuBtn.addEventListener('click',  fecharMenuMobile);
    if (ELEMENTS.menuOverlay)   ELEMENTS.menuOverlay.addEventListener('click',   fecharMenuMobile);

    document.querySelectorAll('.nav-link').forEach(link =>
        link.addEventListener('click', fecharMenuMobile)
    );

    // ── Teclado ───────────────────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { fecharCarrinho(); fecharCheckout(); }
    });

    // ── Smooth scroll para âncoras ────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
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
}

// ─── Menu Mobile ──────────────────────────────────────────────────────────────

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

// ─── Animações de scroll ──────────────────────────────────────────────────────

function iniciarAnimacoesScroll() {
    const observer = new IntersectionObserver(
        entradas => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('is-visible');
                    observer.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
}

// ─── Eventos globais ──────────────────────────────────────────────────────────

window.addEventListener('error', e => {
    console.error('❌ Erro global:', e.error);
    mostrarToast('Ocorreu um erro. Tente novamente.', 'error');
});

window.addEventListener('unhandledrejection', e => {
    console.error('❌ Promise rejeitada:', e.reason);
    mostrarToast('Ocorreu um erro. Tente novamente.', 'error');
});

/** Sincroniza o carrinho entre abas do navegador */
window.addEventListener('storage', e => {
    if (e.key === 'devburger_carrinho') {
        carrinhoGlobal.carregarDoLocal();
        carrinhoGlobal.atualizar();
    }
});

/** Persiste o carrinho ao sair da página */
window.addEventListener('beforeunload', () => {
    carrinhoGlobal.salvarNoLocal();
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
// FIX: havia 3 DOMContentLoaded separados em ui.js (feedback de telefone,
// feedback de troco e listener de pagamento) + 1 aqui = 4 no total.
// Todos consolidados neste único listener.
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    iniciarFeedbackTelefone();  // definida em ui.js
    iniciarFeedbackTroco();     // definida em ui.js

    console.log('%c🍔 DevBurguer 2026', 'color: #FF3A44; font-size: 20px; font-weight: bold;');
    console.log('%cVersão: 2.0.0 — Refatorado', 'color: #00BCD4; font-size: 12px;');
});
