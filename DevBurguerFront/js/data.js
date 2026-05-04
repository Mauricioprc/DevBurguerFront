/**
 * DATA.JS
 * Base de dados de produtos
 */

const PRODUTOS = [
    // BURGERS
    {
        id: 1,
        nome: 'Classic Burger',
        preco: 14.90,
        categoria: 'burgers',
        descricao: 'Pão integral, carne, alface, tomate',
        emoji: '🍔',
        destaque: true,
    },
    {
        id: 2,
        nome: 'Burger Duplo',
        preco: 18.90,
        categoria: 'burgers',
        descricao: 'Duplo de carne, queijo, bacon',
        emoji: '🍔',
        destaque: true,
    },
    {
        id: 3,
        nome: 'Burger Premium',
        preco: 22.90,
        categoria: 'burgers',
        descricao: 'Carnes nobres com molho especial',
        emoji: '🍔',
        destaque: true,
    },
    {
        id: 4,
        nome: 'Burger Vegetariano',
        preco: 13.90,
        categoria: 'burgers',
        descricao: 'Burger com proteína vegana',
        emoji: '🍔',
    },

    // ACOMPANHAMENTOS
    {
        id: 5,
        nome: 'Batata Crocante',
        preco: 9.90,
        categoria: 'acompanhamentos',
        descricao: 'Batata frita crocante com sal',
        emoji: '🍟',
    },
    {
        id: 6,
        nome: 'Batata com Cheddar',
        preco: 12.90,
        categoria: 'acompanhamentos',
        descricao: 'Batata frita com queijo derretido',
        emoji: '🍟',
    },
    {
        id: 7,
        nome: 'Onion Rings',
        preco: 11.90,
        categoria: 'acompanhamentos',
        descricao: 'Anéis de cebola empanados e fritos',
        emoji: '🌭',
    },
    {
        id: 8,
        nome: 'Nuggets (6 peças)',
        preco: 10.90,
        categoria: 'acompanhamentos',
        descricao: 'Nuggets crocantes de frango',
        emoji: '🍗',
    },

    // BEBIDAS
    {
        id: 9,
        nome: 'Refrigerante 350ml',
        preco: 4.90,
        categoria: 'bebidas',
        descricao: 'Escolha: Coca, Fanta ou Guaraná',
        emoji: '🥤',
    },
    {
        id: 10,
        nome: 'Refrigerante 2L',
        preco: 7.90,
        categoria: 'bebidas',
        descricao: 'Escolha seu sabor favorito',
        emoji: '🥤',
    },
    {
        id: 11,
        nome: 'Suco Natural',
        preco: 6.90,
        categoria: 'bebidas',
        descricao: 'Laranja, maçã ou melancia',
        emoji: '🧃',
    },
    {
        id: 12,
        nome: 'Milkshake',
        preco: 8.90,
        categoria: 'bebidas',
        descricao: 'Chocolate, morango ou baunilha',
        emoji: '🥛',
    },

    // SOBREMESAS
    {
        id: 13,
        nome: 'Brownie',
        preco: 7.90,
        categoria: 'sobremesas',
        descricao: 'Brownie de chocolate com cobertura',
        emoji: '🍰',
    },
    {
        id: 14,
        nome: 'Pudim de Leite Condensado',
        preco: 6.90,
        categoria: 'sobremesas',
        descricao: 'Clássico pudim caseiro',
        emoji: '🍮',
    },
    {
        id: 15,
        nome: 'Torta de Chocolate',
        preco: 9.90,
        categoria: 'sobremesas',
        descricao: 'Fatia generosa de torta',
        emoji: '🎂',
    },
    {
        id: 16,
        nome: 'Sorvete',
        preco: 5.90,
        categoria: 'sobremesas',
        descricao: 'Vários sabores disponíveis',
        emoji: '🍦',
    },
];

// PROMOÇÕES
const PROMOCOES = [
    {
        id: 'combo1',
        nome: 'Combo Básico',
        descricao: 'Burger + Refrigerante + Batata',
        preco: 29.90,
        promo: true,
        emoji: '🍔',
        tag: 'COMBO',
    },
    {
        id: 'combo2',
        nome: 'Duplo Suculento',
        descricao: 'Duplo Burger + Queijo + Bacon',
        preco: 39.90,
        promo: true,
        emoji: '🍔',
        tag: 'HOT DEAL',
    },
    {
        id: 'combo3',
        nome: 'Refrigerante 2L',
        descricao: 'Escolha seu sabor favorito',
        preco: 7.90,
        promo: true,
        emoji: '🥤',
        tag: 'OFERTA',
    },
];

/**
 * Função auxiliar para obter produto por ID
 */
function getProdutoById(id) {
    return PRODUTOS.find(p => p.id === id);
}

/**
 * Função auxiliar para obter produtos por categoria
 */
function getProdutosByCategoria(categoria) {
    if (categoria === 'todos') {
        return PRODUTOS;
    }
    return PRODUTOS.filter(p => p.categoria === categoria);
}

/**
 * Função auxiliar para obter produtos em destaque
 */
function getProdutosDestaque(ids) {
    return ids.map(id => getProdutoById(id)).filter(p => p);
}

console.log('✅ Data.js carregado com sucesso');
console.log(`📦 Total de ${PRODUTOS.length} produtos carregados`);
