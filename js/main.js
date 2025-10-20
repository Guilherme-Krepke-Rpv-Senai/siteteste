// ==========================================
// MAIN.JS - Funções compartilhadas
// ==========================================

let currentUser = null;

function loadHeader() {
    const header = `
        <div class="header-content">
            <h1 class="logo" onclick="goToHome()">STYLE CO.</h1>
            <nav class="nav-desktop">
                <button onclick="goToHome()">Home</button>
                <button onclick="goToLoja()">Loja</button>
                <button id="navCadastro" onclick="goToCadastroProduto()" class="hidden">Cadastrar</button>
                <button id="navVendedor" onclick="goToVendedorPainel()" class="hidden">Painel</button>
                <button onclick="goToSobre()">Sobre</button>
            </nav>
            <div class="header-right">
                <button class="theme-btn" onclick="toggleDarkMode()">🌙</button>
                <button class="cart-btn" onclick="goToCarrinho()">
                    🛒
                    <span class="cart-badge" id="cartBadge" class="hidden">0</span>
                </button>
                <div id="userInfo" class="user-info hidden">
                    <span id="userName"></span>
                    <button onclick="logout()" class="btn-logout">Sair</button>
                </div>
                <button id="btnLogin" class="btn-login" onclick="window.location.href='logincad.html'">Login</button>
                <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
            </div>
        </div>
        <nav class="nav-mobile" id="mobileMenu">
            <button onclick="goToHome(); toggleMobileMenu()">Home</button>
            <button onclick="goToLoja(); toggleMobileMenu()">Loja</button>
            <button id="navCadastroMobile" onclick="goToCadastroProduto(); toggleMobileMenu()" class="hidden">Cadastrar</button>
            <button id="navVendedorMobile" onclick="goToVendedorPainel(); toggleMobileMenu()" class="hidden">Painel</button>
            <button onclick="goToSobre(); toggleMobileMenu()">Sobre</button>
        </nav>
    `;
    document.getElementById('header').innerHTML = header;
    updateUI();
}

function loadFooter() {
    const footer = `
        <p>&copy; 2024 STYLE CO. - Todos os direitos reservados.</p>
        <p>Desenvolvido com ❤️ | Moda, qualidade e estilo</p>
    `;
    document.getElementById('footer').innerHTML = footer;
}

function updateUI() {
    const btnLogin = document.getElementById('btnLogin');
    const userInfo = document.getElementById('userInfo');
    const navCadastro = document.getElementById('navCadastro');
    const navVendedor = document.getElementById('navVendedor');
    const btnCadastrarProduto = document.getElementById('btnCadastrarProduto');
    const navCadastroMobile = document.getElementById('navCadastroMobile');
    const navVendedorMobile = document.getElementById('navVendedorMobile');

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }

    if (currentUser) {
        if (btnLogin) btnLogin.classList.add('hidden');
        if (userInfo) userInfo.classList.remove('hidden');
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = `Olá, ${currentUser.nome}`;

        if (currentUser.tipo === 'vendedor') {
            if (navCadastro) navCadastro.classList.remove('hidden');
            if (navVendedor) navVendedor.classList.remove('hidden');
            if (btnCadastrarProduto) btnCadastrarProduto.classList.remove('hidden');
            if (navCadastroMobile) navCadastroMobile.classList.remove('hidden');
            if (navVendedorMobile) navVendedorMobile.classList.remove('hidden');
        }
    } else {
        if (btnLogin) btnLogin.classList.remove('hidden');
        if (userInfo) userInfo.classList.add('hidden');
        if (navCadastro) navCadastro.classList.add('hidden');
        if (navVendedor) navVendedor.classList.add('hidden');
        if (btnCadastrarProduto) btnCadastrarProduto.classList.add('hidden');
        if (navCadastroMobile) navCadastroMobile.classList.add('hidden');
        if (navVendedorMobile) navVendedorMobile.classList.add('hidden');
    }

    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('cartBadge');
    if (badge) {
        if (cart.length > 0) {
            badge.textContent = cart.reduce((total, item) => total + item.quantity, 0);
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUI();
    showToast('Logout realizado com sucesso!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// NAVEGAÇÃO
function goToHome() { 
    window.location.href = 'index.html'; 
}

function goToLoja() { 
    window.location.href = 'loja.html'; 
}

function goToCarrinho() { 
    window.location.href = 'carrinho.html'; 
}

function goToSobre() { 
    window.location.href = 'sobre.html'; 
}

function goToCadastroProduto() {
    if (!currentUser || currentUser.tipo !== 'vendedor') {
        showToast('Apenas vendedores podem cadastrar produtos!', 'error');
        setTimeout(() => {
            window.location.href = 'logincad.html';
        }, 1500);
        return;
    }
    window.location.href = 'vendedor-cadastro.html';
}

function goToVendedorPainel() {
    if (!currentUser || currentUser.tipo !== 'vendedor') {
        showToast('Apenas vendedores podem acessar o painel!', 'error');
        setTimeout(() => {
            window.location.href = 'logincad.html';
        }, 1500);
        return;
    }
    window.location.href = 'vendedor-painel.html';
}

function goToDetalhes(id) {
    localStorage.setItem('selectedProductId', id);
    window.location.href = 'produtos-detalhes.html';
}

// DARK MODE
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    showToast(`Modo ${document.body.classList.contains('dark') ? 'escuro' : 'claro'} ativado!`, 'success');
}

function loadDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
}

// MOBILE MENU
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// NOTIFICAÇÕES TOAST
function showToast(message, type = 'success') {
    // Remover toasts existentes
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="toast-close">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar animação
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto-remover após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// BUSCA DE PRODUTOS
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            searchProducts(e.target.value);
        }, 300));
    }
}

function searchProducts(term) {
    const searchTerm = term.toLowerCase().trim();
    if (!searchTerm) {
        filterProducts(currentFilter);
        return;
    }
    
    loadProducts();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    );
    
    renderProducts('lojaProducts', filtered);
    showToast(`${filtered.length} produtos encontrados para "${term}"`, 'success');
}

// DEBOUNCE PARA PERFORMANCE
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
    loadDarkMode();
    updateUI();
    setupSearch();
    setupLazyLoading();
});

// LAZY LOADING PARA IMAGENS
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ANALYTICS
function trackEvent(category, action, label) {
    console.log(`📊 Analytics: ${category} - ${action} - ${label}`);
    // Integrar com Google Analytics ou outro serviço aqui
}

// ==========================================
// MAIN.JS - Atualização da parte de autenticação
// ==========================================

// NAVEGAÇÃO COM VERIFICAÇÃO DE AUTENTICAÇÃO
function goToCadastroProduto() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!user.email) {
        showToast('Você precisa estar logado!', 'error');
        setTimeout(() => {
            window.location.href = 'logincad.html';
        }, 1500);
        return;
    }
    
    if (user.tipo !== 'vendedor') {
        showToast('Apenas vendedores podem cadastrar produtos!', 'error');
        return;
    }
    
    window.location.href = 'vendedor-cadastro.html';
}

function goToVendedorPainel() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!user.email) {
        showToast('Você precisa estar logado!', 'error');
        setTimeout(() => {
            window.location.href = 'logincad.html';
        }, 1500);
        return;
    }
    
    if (user.tipo !== 'vendedor') {
        showToast('Apenas vendedores podem acessar o painel!', 'error');
        return;
    }
    
    window.location.href = 'vendedor-painel.html';
}