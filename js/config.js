/**
 * CONFIG.JS
 * Configurações globais da aplicação
 */

const CONFIG = {
    // Informações da Lanchonete
    lanchonete: {
        nome: 'DevBurguer',
        telefone: '(15) 3333-3333',
        endereco: 'Rua Principal, 123 - Centro',
        whatsapp: '5511977097728',
    },

    // Entrega
    entrega: {
        taxa: 6.00,
        tagline: 'Uma lanchonete que se destaca com a taxa de entrega que cabe no seu bolso.',
    },

    // IDs dos produtos mais pedidos (Top 3)
    topProducts: [1, 2, 3],

    // Categorias do cardápio
    categorias: [
        { id: 'todos',       label: 'Todos',         icon: '📋' },
        { id: 'tradicionais',label: 'Tradicionais',   icon: '🍔' },
        { id: 'gourmet',     label: 'Gourmet',        icon: '🥓' },
        { id: 'combos',      label: 'Combos Épicos',  icon: '🔥' },
        { id: 'bebidas',     label: 'Bebidas',        icon: '🥤' },
        { id: 'sucos',       label: 'Sucos',          icon: '🧃' },
        { id: 'alcoolicas',  label: 'Cervejas',       icon: '🍺' },
        { id: 'milkshakes',  label: 'Milkshakes',     icon: '🥛' },
    ],
};

// ─── Estado da aplicação ──────────────────────────────────────────────────────
const APP_STATE = {
    carrinho: [],
    categoriaAtiva: 'todos',
    carrinhoAberto: false,
    checkoutAberto: false,
};

// ─── Constantes ───────────────────────────────────────────────────────────────
// FIX: TAXA_ENTREGA não era mais duplicada — antes existia tanto em CONFIG quanto em CONSTANTES
const CONSTANTES = {
    TAXA_ENTREGA:     CONFIG.entrega.taxa,
    WHATSAPP_NUMERO:  CONFIG.lanchonete.whatsapp,
    TEMPO_TOAST:      3000,
};

// ─── Cache de elementos DOM ───────────────────────────────────────────────────
// FIX: removidos cartIcon, promotions e promotionsGrid — esses IDs não existem no HTML
const ELEMENTS = {
    // Header / Nav
    header:         document.getElementById('header'),
    navMenu:        document.getElementById('navMenu'),
    mobileMenuBtn:  document.getElementById('mobileMenuBtn'),
    closeMenuBtn:   document.getElementById('closeMenuBtn'),
    menuOverlay:    document.getElementById('menuOverlay'),

    // Botão do carrinho
    cartButton:     document.getElementById('cartButton'),
    cartCount:      document.getElementById('cartCount'),

    // Carrinho lateral
    cartPanel:      document.getElementById('cartPanel'),
    cartOverlay:    document.getElementById('cartOverlay'),
    cartItems:      document.getElementById('cartItems'),
    closeCartBtn:   document.getElementById('closeCartBtn'),
    checkoutBtn:    document.getElementById('checkoutBtn'),

    // Modal de checkout
    checkoutModal:  document.getElementById('checkoutModal'),
    checkoutForm:   document.getElementById('checkoutForm'),
    closeModalBtn:  document.getElementById('closeModalBtn'),

    // Campos do formulário
    clientName:     document.getElementById('clientName'),
    clientPhone:    document.getElementById('clientPhone'),
    deliveryType:   document.getElementById('deliveryType'),
    pickupType:     document.getElementById('pickupType'),
    address:        document.getElementById('address'),
    neighborhood:   document.getElementById('neighborhood'),
    complement:     document.getElementById('complement'),
    changeAmount:   document.getElementById('changeAmount'),
    addressFieldset:document.getElementById('addressFieldset'),

    // Resumo de valores
    subtotal:       document.getElementById('subtotal'),
    deliveryFee:    document.getElementById('deliveryFee'),
    total:          document.getElementById('total'),
    modalSubtotal:  document.getElementById('modalSubtotal'),
    modalDeliveryFee:document.getElementById('modalDeliveryFee'),
    modalTotal:     document.getElementById('modalTotal'),

    // Grids de produtos
    topProductsGrid:     document.getElementById('topProductsGrid'),
    productsGrid:        document.getElementById('productsGrid'),
    categoriesContainer: document.getElementById('categoriesContainer'),
};
