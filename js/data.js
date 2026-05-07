/**
 * DATA.JS
 * Base de dados de produtos com imagens locais
 */

const PRODUTOS = [
    // ================= LANCHES TRADICIONAIS =================
    { id: 1, nome: 'xDEV-Bacon',     preco: 33.00, categoria: 'tradicionais', descricao: 'Hamburguer, Bacon, Mussarela, Presunto, Alface, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',                                       emoji: '🍔', destaque: true, imagem: 'img/xdev-bacon.jpeg' },
    { id: 2, nome: 'xDEV-Burguer',   preco: 20.00, categoria: 'tradicionais', descricao: 'Hamburguer, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',                                                                            emoji: '🍔',              imagem: 'img/xdev-burguer.jpeg' },
    { id: 3, nome: 'xDEV-Egg',       preco: 27.00, categoria: 'tradicionais', descricao: 'Hamburguer, Ovo, Alface, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',                                                               emoji: '🍳',              imagem: 'img/xdev-egg.jpeg' },
    { id: 4, nome: 'xDEV-Salada',    preco: 24.00, categoria: 'tradicionais', descricao: 'Hamburguer, Alface, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',                                                                    emoji: '🥗',              imagem: 'img/xdev-salada.jpeg' },
    { id: 5, nome: 'xDEV-Frango',    preco: 28.00, categoria: 'tradicionais', descricao: 'Frango desfiado, Catupiry, Alface, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',                                                     emoji: '🍗',              imagem: 'img/xdev-frango.jpeg' },
    { id: 6, nome: 'xDEV-Calabresa', preco: 30.00, categoria: 'tradicionais', descricao: 'Calabresa, Hamburguer, Alface, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',                                                        emoji: '🌭',              imagem: 'img/xdev-calabresa.jpeg' },
    { id: 7, nome: 'xDEV-Churrasco', preco: 35.00, categoria: 'tradicionais', descricao: 'Contra Filé, Mussarela, Alface, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',                                                       emoji: '🥩',              imagem: 'img/xdev-churrasco.jpeg' },
    { id: 8, nome: 'xDEV-Tudo',      preco: 43.00, categoria: 'tradicionais', descricao: 'Hamburguer, Calabresa, Bacon, Ovo, Frango Desfiado, Mussarela, Catupiry, Alface, Tomate, Milho, Ervilha, Maionese, Catchup e Mostarda.',      emoji: '🍔',              imagem: 'img/xdev-tudo.jpeg' },

    // ================= LANCHES GOURMET =================
    { id: 9,  nome: 'DevClassic',          preco: 32.90, categoria: 'gourmet', descricao: 'Blend 180g, cheddar, tomate e molho da casa.',                          emoji: '🥓', destaque: true, imagem: 'img/devclassic.jpeg' },
    { id: 10, nome: 'Bug Spicy',           preco: 36.90, categoria: 'gourmet', descricao: 'Blend 180g, Bacon, Cheddar, Alface, Tomate e molho da casa.',           emoji: '🌶️',              imagem: 'img/bug-spicy.jpeg' },
    { id: 11, nome: 'Byte Burger',         preco: 37.90, categoria: 'gourmet', descricao: 'Blend 180g, cheddar, bacon, onion rings, molho barbecue.',              emoji: '🧅',              imagem: 'img/byte-burger.jpeg' },
    { id: 12, nome: '404 Burger Not Found',preco: 39.90, categoria: 'gourmet', descricao: 'Costela desfiada, molho barbecue, cebola caramelizada e alface crocante.', emoji: '🍖',           imagem: 'img/404-burger.jpeg' },

    // ================= BEBIDAS =================
    { id: 13, nome: 'Coca-Cola Lata 350 ML',      preco: 7.00, categoria: 'bebidas',    descricao: 'Refrigerante gelado',           emoji: '🥤', imagem: 'img/coca-cola.jpeg' },
    { id: 14, nome: 'Coca-Cola Zero Lata 350 ML', preco: 7.00, categoria: 'bebidas',    descricao: 'Refrigerante zero açúcar',      emoji: '🥤', imagem: 'img/coca-zero.jpeg' },
    { id: 15, nome: 'Guaraná Lata 350 ML',        preco: 7.00, categoria: 'bebidas',    descricao: 'Refrigerante gelado',           emoji: '🥤', imagem: 'img/guarana.jpeg' },
    { id: 16, nome: 'Fanta Laranja Lata 350 ML',  preco: 7.00, categoria: 'bebidas',    descricao: 'Refrigerante gelado',           emoji: '🥤', imagem: 'img/fanta-laranja.jpeg' },
    { id: 17, nome: 'Fanta Uva Lata 350 ML',      preco: 7.00, categoria: 'bebidas',    descricao: 'Refrigerante gelado',           emoji: '🥤', imagem: 'img/fanta-uva.jpeg' },
    { id: 18, nome: 'Pepsi Lata 350 ML',          preco: 7.00, categoria: 'bebidas',    descricao: 'Refrigerante gelado',           emoji: '🥤', imagem: 'img/pepsi.jpeg' },
    { id: 19, nome: 'Água sem gás',               preco: 4.00, categoria: 'bebidas',    descricao: 'Água mineral',                  emoji: '💧', imagem: 'img/agua.jpeg' },
    { id: 20, nome: 'Água com gás',               preco: 5.00, categoria: 'bebidas',    descricao: 'Água mineral com gás',          emoji: '💧', imagem: 'img/agua-gas.jpeg' },

    // ================= SUCOS NATURAIS =================
    { id: 21, nome: 'Suco de Laranja',  preco: 12.00, categoria: 'sucos', descricao: 'Suco natural', emoji: '🍊', imagem: 'img/suco-laranja.jpeg' },
    { id: 22, nome: 'Suco de Limão',    preco: 12.00, categoria: 'sucos', descricao: 'Suco natural', emoji: '🍋', imagem: 'img/suco-limao.jpeg' },
    { id: 23, nome: 'Suco de Maracujá', preco: 12.00, categoria: 'sucos', descricao: 'Suco natural', emoji: '🧃', imagem: 'img/suco-maracuja.jpeg' },

    // ================= BEBIDAS ALCOÓLICAS =================
    { id: 24, nome: 'Skol Lata 350 ML',     preco:  7.00, categoria: 'alcoolicas', descricao: 'Cerveja gelada', emoji: '🍺',  imagem: 'img/skol.jpeg' },
    { id: 25, nome: 'Brahma Lata 350 ML',   preco:  7.00, categoria: 'alcoolicas', descricao: 'Cerveja gelada', emoji: '🍺',  imagem: 'img/brahma.jpeg' },
    { id: 26, nome: 'Heineken Lata 350 ML', preco: 10.00, categoria: 'alcoolicas', descricao: 'Cerveja gelada', emoji: '🍻', imagem: 'img/heineken.jpeg' },

    // ================= MILKSHAKES =================
    { id: 27, nome: 'Milkshake Chocolate',  preco: 15.00, categoria: 'milkshakes', descricao: 'Copo 400 ML', emoji: '🍫', imagem: 'img/shake-chocolate.jpeg' },
    { id: 28, nome: 'Milkshake Morango',    preco: 15.00, categoria: 'milkshakes', descricao: 'Copo 400 ML', emoji: '🍓', imagem: 'img/shake-morango.jpeg' },
    { id: 29, nome: 'Milkshake Ovomaltine', preco: 15.00, categoria: 'milkshakes', descricao: 'Copo 400 ML', emoji: '🥛', imagem: 'img/shake-ovomaltine.jpeg' },

    // ================= PROMOÇÕES E COMBOS =================
    { id: 30, nome: 'Combo DevClassic',    categoria: 'combos', descricao: 'DevClassic + Fritas c/ Cheddar e Bacon',         preco: 39.90, promo: true, emoji: '🍔🍟', tag: 'COMBO', imagem: 'img/combo-devclassic.jpeg' },
    { id: 31, nome: 'Combo Bug Spicy',     categoria: 'combos', descricao: 'Bug Spicy + Fritas c/ Cheddar e Bacon',          preco: 43.90, promo: true, emoji: '🌶️🍟', tag: 'COMBO',    imagem: 'img/combo-bug-spicy.jpeg' },
    { id: 32, nome: 'Combo Byte Burger',   categoria: 'combos', descricao: 'Byte Burger + Fritas c/ Cheddar e Bacon',        preco: 44.90, promo: true, emoji: '🧅🍟', tag: 'COMBO',   imagem: 'img/combo-byte-burger.jpeg' },
    { id: 33, nome: 'Combo 404 Not Found', categoria: 'combos', descricao: '404 Burger Not Found + Fritas c/ Cheddar e Bacon', preco: 46.90, promo: true, emoji: '🍖🍟', tag: 'COMBO', imagem: 'img/combo-404-burger.jpeg' },
];

// ================= FUNÇÕES AUXILIARES =================

/**
 * Retorna um produto pelo ID.
 * @param {number} id
 * @returns {Object|undefined}
 */
function getProdutoById(id) {
    return PRODUTOS.find(p => p.id === id);
}

/**
 * Retorna todos os produtos de uma categoria (ou todos se 'todos').
 * @param {string} categoria
 * @returns {Array}
 */
function getProdutosByCategoria(categoria) {
    if (categoria === 'todos') return PRODUTOS;
    return PRODUTOS.filter(p => p.categoria === categoria);
}

/**
 * Retorna um array de produtos a partir de uma lista de IDs.
 * @param {number[]} ids
 * @returns {Array}
 */
function getProdutosDestaque(ids) {
    return ids.map(id => getProdutoById(id)).filter(Boolean);
}

console.log('✅ Data.js carregado com sucesso');
console.log(`📦 Total de ${PRODUTOS.length} produtos carregados`);
