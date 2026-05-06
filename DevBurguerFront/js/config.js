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

    // Produtos Top (mais pedidos)
    topProducts: [1, 2, 3], // IDs dos produtos top

    // Categorias
    categorias: [
        { id: 'todos', label: 'Todos', icon: '📋' },
        { id: 'tradicionais', label: 'Tradicionais', icon: '🍔' },
        { id: 'gourmet', label: 'Gourmet', icon: '🥓' },
        { id: 'bebidas', label: 'Bebidas', icon: '🥤' },
        { id: 'sucos', label: 'Sucos', icon: '🧃' },
        { id: 'alcoolicas', label: 'Cervejas', icon: '🍺' },
        { id: 'milkshakes', label: 'Milkshakes', icon: '🥛' },
    ],

    // Formas de Pagamento
    pagamentos: [
        { id: 'pix', label: 'Pix', icon: '📱' },
        { id: 'cartao', label: 'Cartão', icon: '💳' },
        { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
    ],
};

// Estado da aplicação
const APP_STATE = {
    carrinho: [],
    categoriaAtiva: 'todos',
    carrinhoAberto: false,
    checkoutAberto: false,
};

// Constantes
const CONSTANTES = {
    TAXA_ENTREGA: CONFIG.entrega.taxa,
    WHATSAPP_NUMERO: CONFIG.lanchonete.whatsapp,
    TEMPO_TOAST: 3000,
};

// Seletores DOM (cache)
const ELEMENTS = {
    header: document.getElementById('header'),
    navMenu: document.getElementById('navMenu'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    closeMenuBtn: document.getElementById('closeMenuBtn'),
    menuOverlay: document.getElementById('menuOverlay'),
    cartButton: document.getElementById('cartButton'),
    cartCount: document.getElementById('cartCount'),
    cartIcon: document.getElementById('cartIcon'),
    
    // Seções
    home: document.getElementById('home'),
    promotions: document.getElementById('promotions'),
    cardapio: document.getElementById('cardapio'),
    
    // Carrinho
    cartPanel: document.getElementById('cartPanel'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartItems: document.getElementById('cartItems'),
    closeCartBtn: document.getElementById('closeCartBtn'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    
    // Checkout Modal
    checkoutModal: document.getElementById('checkoutModal'),
    checkoutForm: document.getElementById('checkoutForm'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    
    // Formulário
    clientName: document.getElementById('clientName'),
    clientPhone: document.getElementById('clientPhone'),
    deliveryType: document.getElementById('deliveryType'),
    pickupType: document.getElementById('pickupType'),
    address: document.getElementById('address'),
    neighborhood: document.getElementById('neighborhood'),
    complement: document.getElementById('complement'),
    pixPayment: document.getElementById('pixPayment'),
    cardPayment: document.getElementById('cardPayment'),
    cashPayment: document.getElementById('cashPayment'),
    changeAmount: document.getElementById('changeAmount'),
    changeFieldset: document.getElementById('changeFieldset'),
    addressFieldset: document.getElementById('addressFieldset'),
    
    // Resumo
    subtotal: document.getElementById('subtotal'),
    deliveryFee: document.getElementById('deliveryFee'),
    total: document.getElementById('total'),
    modalSubtotal: document.getElementById('modalSubtotal'),
    modalDeliveryFee: document.getElementById('modalDeliveryFee'),
    modalTotal: document.getElementById('modalTotal'),
    
    // Grids
    promotionsGrid: document.getElementById('promotionsGrid'),
    topProductsGrid: document.getElementById('topProductsGrid'),
    productsGrid: document.getElementById('productsGrid'),
    categoriesContainer: document.getElementById('categoriesContainer'),
};

console.log('✅ Config.js carregado com sucesso');
