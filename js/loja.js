// ==========================================
// LOJA.JS - Sistema de Filtros para Loja
// ==========================================

let produtosFiltrados = [];

function filtrarProdutos() {
    const termoBusca = document.getElementById('searchInput').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    const faixaPreco = document.getElementById('filtroPreco').value;
    const ordenacao = document.getElementById('ordenacao').value;

    // Carregar produtos
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // Aplicar filtros
    produtosFiltrados = products.filter(product => {
        // Filtro por busca
        const matchBusca = !termoBusca || 
            product.name.toLowerCase().includes(termoBusca) ||
            product.description.toLowerCase().includes(termoBusca);

        // Filtro por categoria
        const matchCategoria = !categoria || product.category === categoria;

        // Filtro por preço
        let matchPreco = true;
        if (faixaPreco) {
            if (faixaPreco === '0-50') matchPreco = product.price <= 50;
            else if (faixaPreco === '50-100') matchPreco = product.price > 50 && product.price <= 100;
            else if (faixaPreco === '100-200') matchPreco = product.price > 100 && product.price <= 200;
            else if (faixaPreco === '200+') matchPreco = product.price > 200;
        }

        return matchBusca && matchCategoria && matchPreco;
    });

    // Aplicar ordenação
    switch (ordenacao) {
        case 'menor-preco':
            produtosFiltrados.sort((a, b) => a.price - b.price);
            break;
        case 'maior-preco':
            produtosFiltrados.sort((a, b) => b.price - a.price);
            break;
        case 'nome-az':
            produtosFiltrados.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // mais relevantes (mais novos primeiro)
            produtosFiltrados.sort((a, b) => new Date(b.dataCadastro || 0) - new Date(a.dataCadastro || 0));
    }

    // Atualizar interface
    renderProdutosFiltrados();
    atualizarEstadoVazio();
}

function renderProdutosFiltrados() {
    const container = document.getElementById('lojaProducts');
    const estadoVazio = document.getElementById('estadoVazio');
    
    if (!container) return;

    if (produtosFiltrados.length === 0) {
        container.innerHTML = '';
        if (estadoVazio) estadoVazio.classList.remove('hidden');
        atualizarContador(0);
        return;
    }

    if (estadoVazio) estadoVazio.classList.add('hidden');

    const html = produtosFiltrados.map(product => `
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
                <p class="product-category">${getCategoryName(product.category)}</p>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
            </div>
            <div class="product-actions">
                <button class="btn-details" onclick="goToDetalhes(${product.id})">Ver Detalhes</button>
                <button class="btn-add" onclick="addToCart(${product.id})">Adicionar</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    atualizarContador(produtosFiltrados.length);
}

function atualizarContador(total) {
    const contador = document.getElementById('contadorProdutos');
    if (contador) {
        contador.textContent = `🎯 ${total} produto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
    }
}

function atualizarEstadoVazio() {
    const estadoVazio = document.getElementById('estadoVazio');
    const container = document.getElementById('lojaProducts');
    
    if (produtosFiltrados.length === 0) {
        if (estadoVazio) estadoVazio.classList.remove('hidden');
        if (container) container.innerHTML = '';
    } else {
        if (estadoVazio) estadoVazio.classList.add('hidden');
    }
}

function limparFiltros() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroPreco').value = '';
    document.getElementById('ordenacao').value = 'relevantes';
    
    filtrarProdutos();
}

function getCategoryName(category) {
    const categorias = {
        'camisetas': '👕 Camisetas',
        'calças': '👖 Calças',
        'jaquetas': '🧥 Jaquetas',
        'vestidos': '👗 Vestidos'
    };
    return categorias[category] || category;
}

// Inicializar loja quando carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Inicializando loja...');
    
    // Carregar produtos e exibir inicialmente
    const products = JSON.parse(localStorage.getItem('products')) || [];
    produtosFiltrados = products;
    
    renderProdutosFiltrados();
    atualizarContador(products.length);
    
    console.log('✅ loja.js carregado - Filtros prontos!');
});