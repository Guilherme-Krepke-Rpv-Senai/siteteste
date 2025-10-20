// ==========================================
// PRODUTO.JS - Gerenciamento de Produtos
// ==========================================

let products = [
    { 
        id: 1, 
        name: 'Camiseta Premium', 
        price: 79.90, 
        category: 'camisetas', 
        image: '👕', 
        description: 'Camiseta de algodão 100% confortável', 
        vendedor: 'admin@styleco.com',
        vendedorNome: 'Admin',
        isImage: false,
        dataCadastro: new Date().toISOString()
    },
    { 
        id: 2, 
        name: 'Calça Jeans Slim', 
        price: 129.90, 
        category: 'calças', 
        image: '👖', 
        description: 'Calça jeans clássica de qualidade premium', 
        vendedor: 'admin@styleco.com',
        vendedorNome: 'Admin',
        isImage: false,
        dataCadastro: new Date().toISOString()
    },
    { 
        id: 3, 
        name: 'Jaqueta Bomber', 
        price: 199.90, 
        category: 'jaquetas', 
        image: '🧥', 
        description: 'Jaqueta bomber moderna e versátil', 
        vendedor: 'admin@styleco.com',
        vendedorNome: 'Admin',
        isImage: false,
        dataCadastro: new Date().toISOString()
    },
    { 
        id: 4, 
        name: 'Vestido Casual', 
        price: 159.90, 
        category: 'vestidos', 
        image: '👗', 
        description: 'Vestido leve perfeito para o dia a dia', 
        vendedor: 'admin@styleco.com',
        vendedorNome: 'Admin',
        isImage: false,
        dataCadastro: new Date().toISOString()
    },
    { 
        id: 5, 
        name: 'Camiseta Básica', 
        price: 49.90, 
        category: 'camisetas', 
        image: '👕', 
        description: 'Camiseta básica de algodão', 
        vendedor: 'admin@styleco.com',
        vendedorNome: 'Admin',
        isImage: false,
        dataCadastro: new Date().toISOString()
    },
    { 
        id: 6, 
        name: 'Calça Social', 
        price: 189.90, 
        category: 'calças', 
        image: '👖', 
        description: 'Calça social para ocasiões especiais', 
        vendedor: 'admin@styleco.com',
        vendedorNome: 'Admin',
        isImage: false,
        dataCadastro: new Date().toISOString()
    }
];

let currentFilter = 'todos';

function loadProducts() {
    const saved = localStorage.getItem('products');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
                products = parsed;
            }
            console.log('✅ Produtos carregados:', products.length);
        } catch (e) {
            console.error('❌ Erro ao carregar produtos:', e);
            saveProducts();
        }
    } else {
        saveProducts();
    }
}

function saveProducts() {
    try {
        localStorage.setItem('products', JSON.stringify(products));
        console.log('💾 Produtos salvos:', products.length);
    } catch (e) {
        console.error('❌ Erro ao salvar produtos:', e);
    }
}

function renderProducts(containerId, productsToRender) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('⚠️ Container não encontrado:', containerId);
        return;
    }

    if (!productsToRender || productsToRender.length === 0) {
        container.innerHTML = `
            <div class="carrinho-vazio">
                <p>😔 Nenhum produto encontrado</p>
                <button class="btn-voltar-loja" onclick="goToLoja()">Ver Todos os Produtos</button>
            </div>
        `;
        return;
    }

    const html = productsToRender.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image" onclick="goToDetalhes(${product.id})">
                ${product.isImage ? 
                    `<img src="${product.image}" alt="${product.name}" loading="lazy">` : 
                    `<div style="font-size: 4rem;">${product.image}</div>`
                }
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-desc">${product.description}</p>
                <p class="product-category">Categoria: ${getCategoryName(product.category)}</p>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
            </div>
            <div class="product-actions">
                <button class="btn-details" onclick="goToDetalhes(${product.id})">Ver Detalhes</button>
                <button class="btn-add" onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    console.log(`✅ ${productsToRender.length} produtos renderizados em #${containerId}`);
}

// RENDERIZAR HOME
function renderHome() {
    console.log('🏠 Renderizando home...');
    loadProducts();
    
    renderCategoriaDestaque();
    renderProdutosHome();
}

function renderCategoriaDestaque() {
    const container = document.getElementById('categoriaDestaque');
    if (!container) return;

    // Contar produtos por categoria
    const categoriasCount = {};
    products.forEach(product => {
        categoriasCount[product.category] = (categoriasCount[product.category] || 0) + 1;
    });

    // Encontrar categoria com mais produtos
    let categoriaMaisVendida = '';
    let maxProdutos = 0;
    
    for (const [categoria, quantidade] of Object.entries(categoriasCount)) {
        if (quantidade > maxProdutos) {
            maxProdutos = quantidade;
            categoriaMaisVendida = categoria;
        }
    }

    if (categoriaMaisVendida && maxProdutos > 0) {
        const categoriaNome = getCategoryName(categoriaMaisVendida);
        const categoriaIcon = getCategoryIcon(categoriaMaisVendida);
        
        container.innerHTML = `
            <div class="categoria-destaque" onclick="filterProducts('${categoriaMaisVendida}'); goToLoja();">
                <div class="categoria-info">
                    <h3>${categoriaNome}</h3>
                    <p>${maxProdutos} produto${maxProdutos !== 1 ? 's' : ''} disponível${maxProdutos !== 1 ? 's' : ''}</p>
                    <button class="btn-primary">Ver Todos</button>
                </div>
                <div class="categoria-imagem">
                    ${categoriaIcon}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Nenhuma categoria disponível</p>';
    }
}

function renderProdutosHome() {
    const container = document.getElementById('produtosHome');
    if (!container) return;

    // Pegar últimos 4 produtos
    const produtosHome = products.slice().reverse().slice(0, 4);
    
    if (produtosHome.length === 0) {
        container.innerHTML = `
            <div class="carrinho-vazio">
                <p>📦 Nenhum produto disponível</p>
                <button class="btn-voltar-loja" onclick="goToCadastroProduto()">Cadastrar Produto</button>
            </div>
        `;
        return;
    }

    renderProducts('produtosHome', produtosHome);
}

// RENDERIZAR LOJA
function renderLoja() {
    console.log('🛍️ Renderizando loja...');
    loadProducts();
    
    // Renderizar todos os produtos inicialmente
    const produtosFiltrados = products;
    renderProducts('lojaProducts', produtosFiltrados);
    atualizarContador(produtosFiltrados.length);
}

function filterProducts(category) {
    currentFilter = category;
    const filtered = category === 'todos' ? products : products.filter(p => p.category === category);
    
    const lojaContainer = document.getElementById('lojaProducts');
    if (lojaContainer) {
        renderProducts('lojaProducts', filtered);
        atualizarContador(filtered.length);
    }
}

// FUNÇÕES AUXILIARES
function getCategoryName(category) {
    const categorias = {
        'camisetas': 'Camisetas',
        'calças': 'Calças',
        'jaquetas': 'Jaquetas',
        'vestidos': 'Vestidos'
    };
    return categorias[category] || category;
}

function getCategoryIcon(category) {
    const icons = {
        'camisetas': '👕',
        'calças': '👖',
        'jaquetas': '🧥',
        'vestidos': '👗'
    };
    return icons[category] || '📦';
}

function atualizarContador(total) {
    const contador = document.getElementById('contadorProdutos');
    if (contador) {
        contador.textContent = `🎯 ${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
    }
}

function goToLoja() {
    window.location.href = 'loja.html';
}

function goToDetalhes(id) {
    localStorage.setItem('selectedProductId', id);
    window.location.href = 'produtos-detalhes.html';
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        alert('❌ Produto não encontrado!');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    
    alert(`✅ ${product.name} adicionado ao carrinho!`);
}

// OUTRAS FUNÇÕES EXISTENTES (mantenha essas se já existirem)
function showProductDetails() {
    const productId = parseInt(localStorage.getItem('selectedProductId'));
    if (!productId) return;
    
    loadProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    const detImage = document.getElementById('detImage');
    const detName = document.getElementById('detName');
    const detDesc = document.getElementById('detDesc');
    const detPrice = document.getElementById('detPrice');

    if (detImage) {
        if (product.isImage) {
            detImage.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
        } else {
            detImage.innerHTML = product.image;
        }
    }
    
    if (detName) detName.textContent = product.name;
    if (detDesc) detDesc.textContent = product.description;
    if (detPrice) detPrice.textContent = `R$ ${product.price.toFixed(2)}`;
    
    localStorage.setItem('selectedProduct', JSON.stringify(product));
}

function addToCartFromDetail() {
    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    if (product) {
        addToCart(product.id);
    }
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    // Verificar em qual página estamos e renderizar o conteúdo apropriado
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path.includes('/index.html')) {
        // Página home
        setTimeout(() => {
            renderHome();
        }, 100);
    } else if (path.includes('loja.html')) {
        // Página loja
        setTimeout(() => {
            renderLoja();
        }, 100);
    } else if (path.includes('produtos-detalhes.html')) {
        // Página detalhes
        setTimeout(() => {
            showProductDetails();
        }, 100);
    }
    
    console.log('✅ produto.js carregado');
});

// Funções do vendedor (mantenha se precisar)
function renderVendedorProducts() {
    // Sua implementação existente
}

function addProduct() {
    // Sua implementação existente
}

function deleteProduct(id) {
    // Sua implementação existente
}

console.log('✅ produto.js carregado - Sistema completo de produtos!');