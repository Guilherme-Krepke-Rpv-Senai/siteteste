// ==========================================
// HOME.JS - Exibição de Produtos na Home
// ==========================================

function renderHomeProducts() {
    console.log('🏠 Renderizando produtos na home...');
    loadProducts();
    
    renderCategoriasDestaque();
    renderProdutosAlta();
}

function renderCategoriasDestaque() {
    const container = document.getElementById('categoriasDestaque');
    if (!container) return;

    // Estatísticas das categorias
    const categoriasStats = {
        'camisetas': { count: 0, icon: '👕', name: 'Camisetas', cor: '#8b5cf6' },
        'calças': { count: 0, icon: '👖', name: 'Calças', cor: '#06b6d4' },
        'jaquetas': { count: 0, icon: '🧥', name: 'Jaquetas', cor: '#10b981' },
        'vestidos': { count: 0, icon: '👗', name: 'Vestidos', cor: '#f59e0b' },
        'acessorios': { count: 0, icon: '🕶️', name: 'Acessórios', cor: '#ef4444' },
        'calcados': { count: 0, icon: '👟', name: 'Calçados', cor: '#8b5cf6' }
    };

    // Contar produtos por categoria
    products.forEach(product => {
        if (categoriasStats[product.category]) {
            categoriasStats[product.category].count++;
        }
    });

    // Ordenar por quantidade (mais populares primeiro) e pegar top 4
    const categoriasOrdenadas = Object.entries(categoriasStats)
        .filter(([_, stats]) => stats.count > 0)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 4);

    if (categoriasOrdenadas.length === 0) {
        container.innerHTML = `
            <div class="empty-state full-width">
                <p>📂 Nenhuma categoria disponível</p>
                <button class="btn-primary" onclick="goToCadastroProduto()">
                    Seja o primeiro a cadastrar!
                </button>
            </div>
        `;
        return;
    }

    const html = categoriasOrdenadas.map(([key, stats]) => `
        <div class="categoria-card" onclick="filterProducts('${key}'); goToLoja();">
            <div class="categoria-icon" style="background: ${stats.cor}20; color: ${stats.cor};">
                ${stats.icon}
            </div>
            <h4>${stats.name}</h4>
            <p class="categoria-count">${stats.count} produto${stats.count !== 1 ? 's' : ''} disponível${stats.count !== 1 ? 's' : ''}</p>
            <button class="btn-categoria">
                Explorar ›
            </button>
        </div>
    `).join('');

    container.innerHTML = html;
}

function renderProdutosAlta() {
    const container = document.getElementById('produtosAlta');
    if (!container) return;

    // Produtos em alta (baseado em relevância)
    const produtosAlta = products
        .map(product => ({
            ...product,
            relevancia: calcularRelevanciaHome(product)
        }))
        .sort((a, b) => b.relevancia - a.relevancia)
        .slice(0, 8); // Top 8 produtos mais relevantes

    if (produtosAlta.length === 0) {
        container.innerHTML = `
            <div class="empty-state full-width">
                <p>📦 Nenhum produto disponível no momento</p>
                <p style="color: var(--gray-600); margin: 1rem 0;">
                    Seja o primeiro a cadastrar um produto!
                </p>
                <button class="btn-primary" onclick="goToCadastroProduto()">
                    🚀 Cadastrar Primeiro Produto
                </button>
            </div>
        `;
        return;
    }

    const html = produtosAlta.map(product => `
        <div class="product-card home-product" data-product-id="${product.id}">
            ${product.isImage ? 
                `<div class="product-image" onclick="goToDetalhes(${product.id})">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-badge">🔥 Em Alta</div>
                </div>` :
                `<div class="product-image" onclick="goToDetalhes(${product.id})">
                    ${product.image}
                    <div class="product-badge">🔥 Em Alta</div>
                </div>`
            }
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-desc">${product.description}</p>
                <div class="product-meta">
                    <span class="product-category">${getCategoryName(product.category)}</span>
                </div>
                <div class="product-footer">
                    <p class="price">R$ ${product.price.toFixed(2)}</p>
                    <div class="product-actions">
                        <button class="btn-details" onclick="goToDetalhes(${product.id})">
                            Ver
                        </button>
                        <button class="btn-add" onclick="addToCart(${product.id})">
                            🛒
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function calcularRelevanciaHome(product) {
    let score = 0;
    
    // Produtos com imagem têm mais relevância
    if (product.isImage) score += 20;
    
    // Produtos mais recentes têm mais relevância
    if (product.dataCadastro) {
        const dias = (new Date() - new Date(product.dataCadastro)) / (1000 * 60 * 60 * 24);
        if (dias < 3) score += 30; // Produtos dos últimos 3 dias
        else if (dias < 7) score += 20; // Produtos da última semana
        else if (dias < 30) score += 10; // Produtos do último mês
    }
    
    // Preços médios têm mais relevância
    if (product.price > 30 && product.price < 150) score += 15;
    
    // Categorias populares
    const categoriasPopulares = ['camisetas', 'calças', 'vestidos'];
    if (categoriasPopulares.includes(product.category)) score += 10;
    
    return score;
}

function getCategoryName(category) {
    const categorias = {
        'camisetas': '👕 Camisetas',
        'calças': '👖 Calças',
        'jaquetas': '🧥 Jaquetas',
        'vestidos': '👗 Vestidos',
        'acessorios': '🕶️ Acessórios',
        'calcados': '👟 Calçados'
    };
    return categorias[category] || category;
}

// Inicializar quando documento carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        renderHomeProducts();
    }, 500);
});

console.log('✅ home.js carregado');