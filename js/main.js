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

    // Event delegation — botões "Adicionar no carrinho" gerados dinamicamente
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

    if (ELEMENTS.cep) {
        ELEMENTS.cep.addEventListener('input', e => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Aplica a máscara de formato 00000-000
            if (value.length > 5) {
                value = value.replace(/^(\d{5})(\d)/, '$1-$2');
            }
            
            e.target.value = value;

            // Se completou o CEP (8 números + 1 hífen = 9 caracteres), dispara a busca
            if (value.length === 9) {
                buscarCEP(value);
            }
        });
    }

    const paymentSelect = document.getElementById('paymentMethod');
    if (paymentSelect) paymentSelect.addEventListener('change', updatePaymentMethod);

    // Formata o telefone enquanto o usuário digita
    ELEMENTS.clientPhone.addEventListener('input', e => {
        e.target.value = formatarTelefone(e.target.value);
    });

    // Bloqueia a digitação de números no campo de Nome em tempo real
    if (ELEMENTS.clientName) {
        ELEMENTS.clientName.addEventListener('input', e => {
            // A regex /\d/g procura por todos (g) os números e os substitui por nada ('')
            e.target.value = e.target.value.replace(/\d/g, '');
        });
    }
   


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
// ─── Gerenciamento de Tema (Dark/Light) ───────────────────────────────────────

function iniciarControleDeTema() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const logoImg = document.querySelector('.logo-img'); 
    
    if (!themeToggle || !themeIcon) return;

    // Caminhos das logos (Ajusta os nomes dos ficheiros aqui)
    const logoDark = 'img/logo-devburger.jpeg';
    const logoLight = 'img/logo-devburger-light.jpeg'; 
    // 1. Verifica preferência salva
    const temaSalvo = localStorage.getItem('devburger_theme');
    
    if (temaSalvo === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        if(logoImg) logoImg.src = logoLight;
    }

    // 2. Clique para alternar
    themeToggle.addEventListener('click', () => {
        const temaAtual = document.documentElement.getAttribute('data-theme');
        let novoTema = 'dark';
        
        if (temaAtual !== 'light') {
            novoTema = 'light';
        }

        document.documentElement.setAttribute('data-theme', novoTema);
        localStorage.setItem('devburger_theme', novoTema);
        
        // Troca ícone e LOGO
        if (novoTema === 'light') {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            if(logoImg) logoImg.src = logoLight;
            mostrarToast('Tema claro ativado! ☀️');
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            if(logoImg) logoImg.src = logoDark;
            mostrarToast('Tema escuro ativado! 🌙');
        }
    });
}
async function buscarCEP(cepValue) {
    const cleanCep = cepValue.replace(/\D/g, ''); 
    
    const addressInput = document.getElementById('address');
    const neighborhoodInput = document.getElementById('neighborhood');
    const errorMsg = document.getElementById('cepError');

    if (cleanCep.length !== 8) return;

    try {
        // Efeito de "Carregando"
        addressInput.placeholder = "A procurar rua...";
        neighborhoodInput.placeholder = "A procurar bairro...";
        addressInput.disabled = true;
        neighborhoodInput.disabled = true;
        if(errorMsg) errorMsg.hidden = true;

        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (data.erro) {
            // Erro 1: CEP não existe
            if(errorMsg) {
                errorMsg.textContent = "CEP não encontrado. Verifique os números.";
                errorMsg.hidden = false;
            }
            addressInput.value = "";
            neighborhoodInput.value = "";
            
        } else if (data.localidade !== "Sorocaba") {
            // 🔥 Erro 2: A TRAVA DE CIDADE AQUI 🔥
            if(errorMsg) {
                errorMsg.textContent = `Puxa, entregamos apenas em Sorocaba! (O CEP digitado é de ${data.localidade}).`;
                errorMsg.hidden = false;
            }
            addressInput.value = "";
            neighborhoodInput.value = "";
            
            // Opcional: Desfoca o campo de endereço para evitar que o utilizador tente forçar
            addressInput.blur();
            
        } else {
            // Se passou por tudo e é de Sorocaba, preenche os campos!
            addressInput.value = data.logradouro;
            neighborhoodInput.value = data.bairro;
            
            // Foca no endereço para o utilizador digitar o número
            addressInput.focus();
            if(data.logradouro) {
                addressInput.value += ", ";
            }
        }
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
    } finally {
        addressInput.disabled = false;
        neighborhoodInput.disabled = false;
        addressInput.placeholder = "Ex: Rua das Flores, 123";
        neighborhoodInput.placeholder = "Ex: Centro";
    }
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
    iniciarFeedbackTelefone();  
    iniciarFeedbackTroco();     
    iniciarControleDeTema();    
    console.log('%c🍔 DevBurguer 2026', 'color: #FF3A44; font-size: 20px; font-weight: bold;');
    console.log('%cVersão: 2.0.0 — Refatorado', 'color: #00BCD4; font-size: 12px;');
});


