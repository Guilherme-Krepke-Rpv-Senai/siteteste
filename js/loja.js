// ==========================================
// LOJA.JS - Sistema de Filtros e Exibição
// ==========================================

let produtosFiltrados = [];
let visualizacaoAtual = 'grid';
let produtosPorPagina = 12;
let paginaAtual = 1;

function inicializarLoja() {
    console.log('🛍️ Inicializando sistema de loja...');
    loadProducts();
    filtrarProdutos();
    atualizarContador();
}

function filtrarProdutos() {
    const termoBusca = document.getElementById('searchInput').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    const faixaPreco = document.getElementById('filtroPreco').value;
    const ordenacao = document.getElementById('ordenacao').value;

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
            const [min, max] = faixaPreco.split('-').map(val => {
                if (val.endsWith('+')) return parseFloat(val) + 1;
                return parseFloat(val);
            });
            
            if (faixaPreco.endsWith('+')) {
                matchPreco = product.price >= min;
            } else {
                matchPreco = product.price >= min && product.price <= max;
            }
        }

        return matchBusca && matchCategoria && matchPreco;
    });

    // Aplicar ordenação
    ordenarProdutos(ordenacao);

    // Atualizar interface
    paginaAtual = 1;
    renderProdutosFiltrados();
    atualizarContador();
    atualizarFiltrosAtivos(termoBusca, categoria, faixaPreco);
    atualizarPaginacao();
}

function ordenarProdutos(ordenacao) {
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
        case 'nome-za':
            produtosFiltrados.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'novos':
            produtosFiltrados.sort((a, b) => new Date(b.dataCadastro || 0) - new Date(a.dataCadastro || 0));
            break;
        default: // mais relevantes
            produtosFiltrados.sort((a, b) => {
                // Ordem personalizada para relevância
                const scoreA = calcularRelevancia(a);
                const scoreB = calcularRelevancia(b);
                return scoreB - scoreA;
            });
    }
}

function calcularRelevancia(product) {
    let score = 0;
    
    // Produtos com imagem têm mais relevância
    if (product.isImage) score += 10;
    
    // Produtos mais recentes têm mais relevância
    if (product.dataCadastro) {
        const dias = (new Date() - new Date(product.dataCadastro)) / (1000 * 60 * 60 * 24);
        if (dias < 7) score += 20; // Produtos da última semana
        else if (dias < 30) score += 10; // Produtos do último mês
    }
    
    // Preços médios têm mais relevância (evita extremos)
    if (product.price > 50 && product.price < 200) score += 5;
    
    return score;
}

function renderProdutosFiltrados() {
    const container = document.getElementById('lojaProducts');
    const estadoVazio = document.getElementById('estadoVazio');
    
    if (!container) return;

    // Calcular produtos da página atual
    const inicio = (paginaAtual - 1) * produtosPorPagina;
    const fim = inicio + produtosPorPagina;
    const produtosPagina = produtosFiltrados.slice(inicio, fim);

    // Mostrar/ocultar estado vazio
    if (produtosFiltrados.length === 0) {
        container.style.display = 'none';
        estadoVazio.classList.remove('hidden');
        return;
    } else {
        container.style.display = 'grid';
        estadoVazio.classList.add('hidden');
    }

    // Renderizar produtos
    const html = produtosPagina.map(product => `
        <div class="product-card ${visualizacaoAtual === 'lista' ? 'product-list-view' : ''}" 
             data-product-id="${product.id}">
            ${product.isImage ? 
                `<div class="product-image" onclick="goToDetalhes(${product.id})">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>` :
                `<div class="product-image" onclick="goToDetalhes(${product.id})">
                    ${product.image}
                </div>`
            }
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-desc">${product.description}</p>
                <div class="product-meta">
                    <span class="product-category">${getCategoryName(product.category)}</span>
                    <span class="product-seller">por ${product.vendedorNome || product.vendedor}</span>
                    ${product.dataCadastro ? `
                        <span class="product-date">
                            📅 ${new Date(product.dataCadastro).toLocaleDateString('pt-BR')}
                        </span>
                    ` : ''}
                </div>
                <p class="price">R$ ${product.price.toFixed(2)}</p>
            </div>
            <div class="product-actions">
                <button class="btn-details" onclick="goToDetalhes(${product.id})">
                    👀 Detalhes
                </button>
                <button class="btn-add" onclick="addToCart(${product.id})">
                    🛒 Adicionar
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
    container.className = `products-grid ${visualizacaoAtual === 'lista' ? 'list-view' : ''}`;
}

function atualizarContador() {
    const contador = document.getElementById('contadorProdutos');
    if (!contador) return;

    if (produtosFiltrados.length === 0) {
        contador.innerHTML = '😔 Nenhum produto encontrado';
    } else if (produtosFiltrados.length === 1) {
        contador.innerHTML = '🎯 1 produto encontrado';
    } else {
        const inicio = (paginaAtual - 1) * produtosPorPagina + 1;
        const fim = Math.min(paginaAtual * produtosPorPagina, produtosFiltrados.length);
        contador.innerHTML = `🎯 Mostrando ${inicio}-${fim} de ${produtosFiltrados.length} produtos`;
    }
}

function atualizarFiltrosAtivos(termoBusca, categoria, faixaPreco) {
    const container = document.getElementById('filtrosAtivos');
    if (!container) return;

    const filtros = [];

    if (termoBusca) {
        filtros.push({
            texto: `Busca: "${termoBusca}"`,
            remover: () => {
                document.getElementById('searchInput').value = '';
                filtrarProdutos();
            }
        });
    }

    if (categoria) {
        const categoriaNome = document.getElementById('filtroCategoria').options[document.getElementById('filtroCategoria').selectedIndex].text;
        filtros.push({
            texto: `Categoria: ${categoriaNome}`,
            remover: () => {
                document.getElementById('filtroCategoria').value = '';
                filtrarProdutos();
            }
        });
    }

    if (faixaPreco) {
        const precoTexto = document.getElementById('filtroPreco').options[document.getElementById('filtroPreco').selectedIndex].text;
        filtros.push({
            texto: `Preço: ${precoTexto}`,
            remover: () => {
                document.getElementById('filtroPreco').value = '';
                filtrarProdutos();
            }
        });
    }

    if (filtros.length === 0) {
        container.innerHTML = '';
        return;
    }

    const html = `
        <strong>Filtros ativos:</strong>
        ${filtros.map(filtro => `
            <span class="filtro-ativo">
                ${filtro.texto}
                <button onclick="${filtro.remover}" class="btn-remover-filtro">×</button>
            </span>
        `).join('')}
    `;

    container.innerHTML = html;
}

function limparFiltros() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroPreco').value = '';
    document.getElementById('ordenacao').value = 'relevantes';
    
    filtrarProdutos();
    showToast('Filtros limpos!', 'success');
}

function mudarVisualizacao(tipo) {
    visualizacaoAtual = tipo;
    
    // Atualizar botões
    document.querySelectorAll('.btn-visualizacao').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderProdutosFiltrados();
}

function atualizarPaginacao() {
    const container = document.getElementById('paginacao');
    if (!container) return;

    const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
    
    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="paginacao-container">';
    
    // Botão anterior
    if (paginaAtual > 1) {
        html += `<button class="btn-pagina" onclick="mudarPagina(${paginaAtual - 1})">← Anterior</button>`;
    }
    
    // Páginas
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === paginaAtual) {
            html += `<button class="btn-pagina active">${i}</button>`;
        } else {
            html += `<button class="btn-pagina" onclick="mudarPagina(${i})">${i}</button>`;
        }
    }
    
    // Botão próximo
    if (paginaAtual < totalPaginas) {
        html += `<button class="btn-pagina" onclick="mudarPagina(${paginaAtual + 1})">Próximo →</button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function mudarPagina(pagina) {
    paginaAtual = pagina;
    renderProdutosFiltrados();
    atualizarContador();
    atualizarPaginacao();
    
    // Scroll para topo dos produtos
    const produtosContainer = document.querySelector('.products-container');
    if (produtosContainer) {
        produtosContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Inicializar quando documento carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        inicializarLoja();
    }, 500);
});

console.log('✅ loja.js carregado');