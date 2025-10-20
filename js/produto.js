// ==========================================
// PRODUTO.JS - Gerenciamento de Produtos
// ==========================================

let products = [
    { id: 1, name: 'Camiseta Premium', price: 79.90, category: 'camisetas', image: '👕', description: 'Camiseta de algodão 100% confortável', vendedor: 'admin', isImage: false },
    { id: 2, name: 'Calça Jeans', price: 129.90, category: 'calças', image: '👖', description: 'Calça jeans clássica de qualidade', vendedor: 'admin', isImage: false },
    { id: 3, name: 'Jaqueta Bomber', price: 199.90, category: 'jaquetas', image: '🧥', description: 'Jaqueta bomber moderna e versátil', vendedor: 'admin', isImage: false },
    { id: 4, name: 'Vestido Casual', price: 159.90, category: 'vestidos', image: '👗', description: 'Vestido leve perfeito para o dia a dia', vendedor: 'admin', isImage: false },
];

let currentFilter = 'todos';

function loadProducts() {
    const saved = localStorage.getItem('products');
    if (saved) {
        try {
            products = JSON.parse(saved);
            console.log('✅ Produtos carregados do localStorage:', products.length);
            trackEvent('products', 'loaded', `Total: ${products.length}`);
        } catch (e) {
            console.error('❌ Erro ao carregar produtos:', e);
            saveProducts();
        }
    } else {
        console.log('📦 Salvando produtos padrão...');
        saveProducts();
    }
}

function saveProducts() {
    try {
        localStorage.setItem('products', JSON.stringify(products));
        console.log('💾 Produtos salvos:', products.length);
    } catch (e) {
        console.error('❌ Erro ao salvar produtos:', e);
        showToast('Erro ao salvar produtos!', 'error');
    }
}

function renderProducts(containerId, productsToRender) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('⚠️ Container não encontrado:', containerId);
        return;
    }

    if (productsToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>😔 Nenhum produto encontrado</p>
                <button class="btn-voltar-loja" onclick="filterProducts('todos')">Ver Todos os Produtos</button>
            </div>
        `;
        return;
    }

    const html = productsToRender.map(p => `
        <div class="product-card" data-product-id="${p.id}">
            <div class="product-image" onclick="goToDetalhes(${p.id})">
                ${p.isImage ? 
                    `<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='👕';">` : 
                    p.image
                }
            </div>
            <h4>${p.name}</h4>
            <p class="product-desc">${p.description}</p>
            <p class="price">R$ ${p.price.toFixed(2)}</p>
            <div class="product-actions">
                <button class="btn-details" onclick="goToDetalhes(${p.id})">Detalhes</button>
                <button class="btn-add" onclick="addToCart(${p.id})">Adicionar</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    console.log(`✅ ${productsToRender.length} produtos renderizados em #${containerId}`);
}

function renderAllProducts() {
    console.log('🔄 Renderizando todos os produtos...');
    loadProducts();
    
    // Renderizar produtos em destaque na home (últimos 4 produtos)
    const destaqueContainer = document.getElementById('destaqueProducts');
    if (destaqueContainer) {
        const produtosDestaque = products.slice().reverse().slice(0, 4);
        renderProducts('destaqueProducts', produtosDestaque);
    }
    
    // Renderizar todos os produtos na loja com filtro aplicado
    const lojaContainer = document.getElementById('lojaProducts');
    if (lojaContainer) {
        filterProducts(currentFilter);
    }
}

function filterProducts(category) {
    console.log('🔍 Filtrando por categoria:', category);
    currentFilter = category;
    loadProducts();
    
    const filtered = category === 'todos' 
        ? products 
        : products.filter(p => p.category === category);
    
    console.log(`📊 ${filtered.length} produtos filtrados`);
    trackEvent('products', 'filter', category);
    
    const lojaContainer = document.getElementById('lojaProducts');
    if (lojaContainer) {
        renderProducts('lojaProducts', filtered);
    }
    
    // Atualizar botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.toLowerCase().trim();
        const categoryLower = category.toLowerCase();
        if (btnText === categoryLower || (category === 'todos' && btnText === 'todos')) {
            btn.classList.add('active');
        }
    });
}

function showProductDetails() {
    const productId = parseInt(localStorage.getItem('selectedProductId'));
    if (!productId) {
        console.warn('⚠️ Nenhum produto selecionado');
        showToast('Produto não encontrado!', 'error');
        return;
    }
    
    console.log('📄 Mostrando detalhes do produto:', productId);
    loadProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        const detImage = document.getElementById('detImage');
        if (detImage) detImage.innerHTML = '<p>Produto não encontrado</p>';
        console.error('❌ Produto não encontrado:', productId);
        showToast('Produto não encontrado!', 'error');
        return;
    }

    const detImage = document.getElementById('detImage');
    const detName = document.getElementById('detName');
    const detDesc = document.getElementById('detDesc');
    const detPrice = document.getElementById('detPrice');

    if (detImage) {
        if (product.isImage) {
            detImage.innerHTML = `<img src="${product.image}" alt="${product.name}" loading="lazy">`;
        } else {
            detImage.innerHTML = product.image;
        }
    }
    
    if (detName) detName.textContent = product.name;
    if (detDesc) detDesc.textContent = product.description;
    if (detPrice) detPrice.textContent = `R$ ${product.price.toFixed(2)}`;
    
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    trackEvent('products', 'view_details', product.name);
    console.log('✅ Detalhes do produto carregados');
}

function addToCart(id) {
    loadProducts();
    const product = products.find(p => p.id === id);
    if (!product) {
        console.error('❌ Produto não encontrado:', id);
        showToast('Produto não encontrado!', 'error');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity += 1;
        console.log('➕ Quantidade aumentada:', product.name);
    } else {
        cart.push({ ...product, quantity: 1 });
        console.log('🆕 Produto adicionado ao carrinho:', product.name);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    showToast(`${product.name} adicionado ao carrinho!`, 'success');
    trackEvent('cart', 'add_product', product.name);
}

function addToCartFromDetail() {
    const product = JSON.parse(localStorage.getItem('selectedProduct'));
    if (product) {
        addToCart(product.id);
    }
}

function renderVendedorProducts() {
    const vendedorProducts = document.getElementById('vendedorProducts');
    if (!vendedorProducts) return;

    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        vendedorProducts.innerHTML = '<p style="text-align: center; padding: 2rem;">Você precisa estar logado como vendedor.</p>';
        return;
    }

    const currentUser = JSON.parse(savedUser);
    if (currentUser.tipo !== 'vendedor') {
        vendedorProducts.innerHTML = '<p style="text-align: center; padding: 2rem;">Você precisa estar logado como vendedor.</p>';
        return;
    }

    loadProducts();
    const meusProducts = products.filter(p => p.vendedor === currentUser.email);
    
    console.log(`📦 Produtos do vendedor ${currentUser.email}:`, meusProducts.length);
    
    if (meusProducts.length === 0) {
        vendedorProducts.innerHTML = `
            <div class="empty-state">
                <p>📝 Você não tem produtos cadastrados ainda.</p>
                <button class="btn-primary" onclick="goToCadastroProduto()">+ Novo Produto</button>
            </div>
        `;
        return;
    }

    const html = meusProducts.map(p => `
        <div class="vendedor-product-item">
            <div class="vendedor-product-image">
                ${p.isImage ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : p.image}
            </div>
            <div class="vendedor-product-info">
                <h4>${p.name}</h4>
                <p style="color: var(--primary); font-weight: 700;">R$ ${p.price.toFixed(2)}</p>
                <p class="product-desc">${p.description}</p>
                <p style="font-size: 0.85rem; color: var(--gray-600); margin-top: 0.5rem;">Categoria: ${p.category}</p>
            </div>
            <div class="vendedor-product-actions">
                <button class="btn-edit" onclick="editProduct(${p.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Deletar</button>
            </div>
        </div>
    `).join('');
    
    vendedorProducts.innerHTML = html;
}

function addProduct() {
    console.log('📝 Cadastrando novo produto...');
    
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        showToast('Você precisa estar logado!', 'error');
        setTimeout(() => {
            window.location.href = 'logincad.html';
        }, 1500);
        return;
    }

    const currentUser = JSON.parse(savedUser);
    if (currentUser.tipo !== 'vendedor') {
        showToast('Apenas vendedores podem cadastrar produtos!', 'error');
        return;
    }

    const name = document.getElementById('prodName')?.value.trim();
    const price = parseFloat(document.getElementById('prodPrice')?.value);
    const category = document.getElementById('prodCategory')?.value;
    const description = document.getElementById('prodDesc')?.value.trim();
    const imageInput = document.getElementById('prodImage');
    
    if (!name || !price || !description) {
        showToast('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    if (price <= 0) {
        showToast('Preço deve ser maior que zero!', 'error');
        return;
    }

    const newProduct = {
        id: Date.now(),
        name,
        price,
        category,
        description,
        image: '👕',
        isImage: false,
        vendedor: currentUser.email
    };

    console.log('🆕 Novo produto:', newProduct);

    if (imageInput?.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newProduct.image = e.target.result;
            newProduct.isImage = true;
            loadProducts();
            products.push(newProduct);
            saveProducts();
            clearProductForm();
            console.log('✅ Produto com imagem cadastrado!');
            showToast('Produto cadastrado com sucesso!', 'success');
            trackEvent('products', 'add', name);
            setTimeout(() => {
                window.location.href = 'vendedor-painel.html';
            }, 1000);
        };
        reader.onerror = function() {
            showToast('Erro ao carregar imagem!', 'error');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        loadProducts();
        products.push(newProduct);
        saveProducts();
        clearProductForm();
        console.log('✅ Produto sem imagem cadastrado!');
        showToast('Produto cadastrado com sucesso!', 'success');
        trackEvent('products', 'add', name);
        setTimeout(() => {
            window.location.href = 'vendedor-painel.html';
        }, 1000);
    }
}

function deleteProduct(id) {
    if (!confirm('⚠️ Tem certeza que deseja deletar este produto?')) return;
    
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        showToast('Você precisa estar logado!', 'error');
        return;
    }

    const currentUser = JSON.parse(savedUser);
    
    loadProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
        showToast('Produto não encontrado!', 'error');
        return;
    }

    if (product.vendedor !== currentUser.email) {
        showToast('Você não tem permissão para deletar este produto!', 'error');
        return;
    }

    products = products.filter(p => p.id !== id);
    saveProducts();
    renderVendedorProducts();
    console.log('🗑️ Produto deletado:', product.name);
    showToast('Produto deletado com sucesso!', 'success');
    trackEvent('products', 'delete', product.name);
}

function editProduct(id) {
    showToast('Função de edição em desenvolvimento!', 'warning');
    // TODO: Implementar edição de produto
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        // Verificar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Imagem muito grande! Tamanho máximo: 5MB', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                console.log('🖼️ Preview da imagem carregado');
            }
        };
        reader.onerror = function() {
            showToast('Erro ao carregar imagem!', 'error');
        };
        reader.readAsDataURL(file);
    }
}

function clearProductForm() {
    const prodName = document.getElementById('prodName');
    const prodPrice = document.getElementById('prodPrice');
    const prodDesc = document.getElementById('prodDesc');
    const prodImage = document.getElementById('prodImage');
    const preview = document.getElementById('imagePreview');

    if (prodName) prodName.value = '';
    if (prodPrice) prodPrice.value = '';
    if (prodDesc) prodDesc.value = '';
    if (prodImage) prodImage.value = '';
    if (preview) preview.classList.add('hidden');
}

// FUNÇÃO DE NAVEGAÇÃO ADICIONADA
function goToLoja() {
    window.location.href = 'loja.html';
}

// ==========================================
// INICIALIZAÇÃO E EVENTOS
// ==========================================

// Função para garantir renderização
function forceRenderProducts() {
    setTimeout(() => {
        loadProducts();
        renderAllProducts();
        renderVendedorProducts();
        showProductDetails();
        console.log('🎯 Produtos renderizados na inicialização');
    }, 100);
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', forceRenderProducts);

// Atualizar quando a página ganhar foco
window.addEventListener('focus', () => {
    loadProducts();
    renderAllProducts();
    console.log('🔄 Produtos atualizados (foco na página)');
});

// Listener para mudanças no localStorage
window.addEventListener('storage', (e) => {
    if (e.key === 'products') {
        loadProducts();
        renderAllProducts();
        renderVendedorProducts();
        console.log('🔄 Produtos atualizados (storage event)');
    }
});

console.log('✅ produto.js carregado');

// ==========================================
// PRODUTO.JS - Sistema Completo de Produtos para Vendedores
// ==========================================

// ... (mantenha todo o código anterior até a função addProduct) ...

function addProduct() {
    console.log('📝 Iniciando cadastro de produto...');
    
    // Verificar autenticação
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        showToast('Você precisa estar logado!', 'error');
        setTimeout(() => {
            window.location.href = 'logincad.html';
        }, 2000);
        return;
    }

    const currentUser = JSON.parse(savedUser);
    if (currentUser.tipo !== 'vendedor') {
        showToast('Apenas vendedores podem cadastrar produtos!', 'error');
        return;
    }

    // Coletar dados do formulário
    const name = document.getElementById('prodName')?.value.trim();
    const price = parseFloat(document.getElementById('prodPrice')?.value);
    const category = document.getElementById('prodCategory')?.value;
    const description = document.getElementById('prodDesc')?.value.trim();
    const imageInput = document.getElementById('prodImage');
    
    // Validações
    if (!name || !price || !category || !description) {
        showToast('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    if (name.length < 2) {
        showToast('Nome do produto deve ter pelo menos 2 caracteres!', 'error');
        return;
    }

    if (price <= 0 || isNaN(price)) {
        showToast('Preço deve ser maior que zero!', 'error');
        return;
    }

    if (description.length < 10) {
        showToast('Descrição deve ter pelo menos 10 caracteres!', 'error');
        return;
    }

    // Mostrar loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.innerHTML = '⏳ Cadastrando...';
    btn.disabled = true;

    // Criar objeto do produto
    const newProduct = {
        id: Date.now(),
        name,
        price: parseFloat(price.toFixed(2)),
        category,
        description,
        image: '👕', // placeholder
        isImage: false,
        vendedor: currentUser.email,
        vendedorNome: currentUser.nome,
        dataCadastro: new Date().toISOString(),
        ativo: true,
        estoque: 99 // estoque padrão
    };

    console.log('🆕 Novo produto:', newProduct);

    // Processar imagem se existir
    if (imageInput?.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        
        // Validar imagem
        if (!file.type.startsWith('image/')) {
            showToast('Selecione um arquivo de imagem válido!', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Imagem muito grande! Máximo 5MB.', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            newProduct.image = e.target.result;
            newProduct.isImage = true;
            finalizarCadastro(newProduct);
        };
        reader.onerror = function() {
            showToast('Erro ao carregar imagem!', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        };
        reader.readAsDataURL(file);
    } else {
        finalizarCadastro(newProduct);
    }

    function finalizarCadastro(product) {
        setTimeout(() => {
            try {
                loadProducts();
                products.push(product);
                saveProducts();
                clearProductForm();
                
                console.log('✅ Produto cadastrado com sucesso!');
                showToast('Produto cadastrado com sucesso! 🎉', 'success');
                trackEvent('products', 'add_success', product.name);
                
                // Redirecionar para o painel
                setTimeout(() => {
                    window.location.href = 'vendedor-painel.html';
                }, 1500);
                
            } catch (error) {
                console.error('❌ Erro ao cadastrar produto:', error);
                showToast('Erro ao cadastrar produto!', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }, 1000);
    }
}

// Editar produto (AGORA FUNCIONAL)
function editProduct(id) {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        showToast('Você precisa estar logado!', 'error');
        return;
    }

    const currentUser = JSON.parse(savedUser);
    loadProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
        showToast('Produto não encontrado!', 'error');
        return;
    }

    if (product.vendedor !== currentUser.email) {
        showToast('Você não tem permissão para editar este produto!', 'error');
        return;
    }

    // Salvar produto para edição
    localStorage.setItem('editingProduct', JSON.stringify(product));
    
    // Redirecionar para página de edição
    window.location.href = 'vendedor-editar.html';
}

// Deletar produto com confirmação
function deleteProduct(id) {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        showToast('Você precisa estar logado!', 'error');
        return;
    }

    const currentUser = JSON.parse(savedUser);
    loadProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
        showToast('Produto não encontrado!', 'error');
        return;
    }

    if (product.vendedor !== currentUser.email) {
        showToast('Você não tem permissão para deletar este produto!', 'error');
        return;
    }

    // Confirmação personalizada
    if (confirm(`🗑️ Tem certeza que deseja deletar "${product.name}"?\n\nEsta ação não pode ser desfeita!`)) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderVendedorProducts();
        
        console.log('🗑️ Produto deletado:', product.name);
        showToast('Produto deletado com sucesso!', 'success');
        trackEvent('products', 'delete', product.name);
    }
}

// Carregar formulário de edição
function loadEditForm() {
    const product = JSON.parse(localStorage.getItem('editingProduct'));
    if (!product) {
        showToast('Nenhum produto selecionado para edição!', 'error');
        setTimeout(() => {
            window.location.href = 'vendedor-painel.html';
        }, 2000);
        return;
    }

    // Preencher formulário com dados do produto
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodDesc').value = product.description;
    
    // Mostrar preview da imagem se existir
    if (product.isImage) {
        const preview = document.getElementById('imagePreview');
        preview.src = product.image;
        preview.classList.remove('hidden');
    }

    // Atualizar título
    document.querySelector('h2').textContent = `Editar: ${product.name}`;
}

// Atualizar produto
function updateProduct() {
    const savedProduct = JSON.parse(localStorage.getItem('editingProduct'));
    if (!savedProduct) {
        showToast('Produto não encontrado!', 'error');
        return;
    }

    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        showToast('Você precisa estar logado!', 'error');
        return;
    }

    const currentUser = JSON.parse(savedUser);
    
    // Coletar dados do formulário
    const name = document.getElementById('prodName')?.value.trim();
    const price = parseFloat(document.getElementById('prodPrice')?.value);
    const category = document.getElementById('prodCategory')?.value;
    const description = document.getElementById('prodDesc')?.value.trim();
    const imageInput = document.getElementById('prodImage');
    
    // Validações
    if (!name || !price || !category || !description) {
        showToast('Preencha todos os campos obrigatórios!', 'error');
        return;
    }

    if (price <= 0) {
        showToast('Preço deve ser maior que zero!', 'error');
        return;
    }

    // Mostrar loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.innerHTML = '⏳ Atualizando...';
    btn.disabled = true;

    loadProducts();
    const productIndex = products.findIndex(p => p.id === savedProduct.id);
    
    if (productIndex === -1) {
        showToast('Produto não encontrado!', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }

    // Atualizar produto
    products[productIndex] = {
        ...products[productIndex],
        name,
        price: parseFloat(price.toFixed(2)),
        category,
        description,
        dataAtualizacao: new Date().toISOString()
    };

    // Processar nova imagem se fornecida
    if (imageInput?.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            products[productIndex].image = e.target.result;
            products[productIndex].isImage = true;
            finalizarAtualizacao();
        };
        reader.readAsDataURL(file);
    } else {
        finalizarAtualizacao();
    }

    function finalizarAtualizacao() {
        saveProducts();
        localStorage.removeItem('editingProduct');
        
        showToast('Produto atualizado com sucesso! ✅', 'success');
        trackEvent('products', 'update', name);
        
        setTimeout(() => {
            window.location.href = 'vendedor-painel.html';
        }, 1500);
    }
}

// Renderizar produtos do vendedor com estatísticas
function renderVendedorProducts() {
    const vendedorProducts = document.getElementById('vendedorProducts');
    if (!vendedorProducts) return;

    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        vendedorProducts.innerHTML = `
            <div class="empty-state">
                <p>🔒 Você precisa estar logado como vendedor</p>
                <button class="btn-primary" onclick="window.location.href='logincad.html'">Fazer Login</button>
            </div>
        `;
        return;
    }

    const currentUser = JSON.parse(savedUser);
    if (currentUser.tipo !== 'vendedor') {
        vendedorProducts.innerHTML = `
            <div class="empty-state">
                <p>🏪 Apenas vendedores podem acessar esta área</p>
                <button class="btn-primary" onclick="window.location.href='index.html'">Voltar à Loja</button>
            </div>
        `;
        return;
    }

    loadProducts();
    const meusProducts = products.filter(p => p.vendedor === currentUser.email);
    
    console.log(`📦 Produtos do vendedor ${currentUser.email}:`, meusProducts.length);
    
    // Estatísticas
    const totalProdutos = meusProducts.length;
    const valorTotal = meusProducts.reduce((sum, p) => sum + p.price, 0);
    const produtosComImagem = meusProducts.filter(p => p.isImage).length;

    if (meusProducts.length === 0) {
        vendedorProducts.innerHTML = `
            <div class="empty-state">
                <p>📝 Você ainda não tem produtos cadastrados</p>
                <p style="color: var(--gray-600); margin: 1rem 0;">Comece cadastrando seu primeiro produto!</p>
                <button class="btn-primary" onclick="goToCadastroProduto()">
                    🚀 Cadastrar Primeiro Produto
                </button>
            </div>
        `;
        return;
    }

    const html = `
        <div class="vendedor-stats">
            <div class="stat-card">
                <h4>${totalProdutos}</h4>
                <p>Produtos Cadastrados</p>
            </div>
            <div class="stat-card">
                <h4>R$ ${valorTotal.toFixed(2)}</h4>
                <p>Valor em Estoque</p>
            </div>
            <div class="stat-card">
                <h4>${produtosComImagem}</h4>
                <p>Com Imagens</p>
            </div>
        </div>
        
        <div class="products-list">
            ${meusProducts.map(p => `
                <div class="vendedor-product-item">
                    <div class="vendedor-product-image">
                        ${p.isImage ? 
                            `<img src="${p.image}" alt="${p.name}" loading="lazy">` : 
                            `<div style="font-size: 2.5rem;">${p.image}</div>`
                        }
                    </div>
                    <div class="vendedor-product-info">
                        <h4>${p.name}</h4>
                        <p class="product-price">R$ ${p.price.toFixed(2)}</p>
                        <p class="product-desc">${p.description}</p>
                        <div class="product-meta">
                            <span class="product-category">${p.category}</span>
                            <span class="product-date">Cadastrado em ${new Date(p.dataCadastro).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                    <div class="vendedor-product-actions">
                        <button class="btn-edit" onclick="editProduct(${p.id})" title="Editar produto">
                            ✏️ Editar
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${p.id})" title="Deletar produto">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    vendedorProducts.innerHTML = html;
}

// ... (mantenha as outras funções como previewImage, clearProductForm, etc.) ...