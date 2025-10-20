// ==========================================
// USUARIO.JS - Sistema de Login/Cadastro
// ==========================================

// Inicializar usuários padrão
function initializeUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Adicionar usuários padrão se não existirem
    if (!users.find(u => u.email === 'admin@styleco.com')) {
        users.push({
            id: 1,
            nome: 'Administrador',
            email: 'admin@styleco.com',
            senha: '123456',
            tipo: 'vendedor',
            dataCadastro: new Date().toISOString(),
            ativo: true
        });
    }
    
    if (!users.find(u => u.email === 'cliente@styleco.com')) {
        users.push({
            id: 2,
            nome: 'Cliente Teste',
            email: 'cliente@styleco.com',
            senha: '123456',
            tipo: 'cliente',
            dataCadastro: new Date().toISOString(),
            ativo: true
        });
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

// Alternar entre abas
function switchTab(tabId) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(tabId).classList.add('active');
    
    // Ativar botão correspondente
    event.target.classList.add('active');
    
    // Limpar formulários
    clearForms();
    
    trackEvent('auth', 'switch_tab', tabId);
}

// Fazer login
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // Validações
    if (!email || !password) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Email inválido!', 'error');
        return;
    }
    
    // Mostrar loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.innerHTML = '⏳ Entrando...';
    btn.disabled = true;
    
    setTimeout(() => {
        // Buscar usuários
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.senha === password && u.ativo !== false);
        
        if (!user) {
            showToast('Email ou senha incorretos!', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
            trackEvent('auth', 'login_failed', email);
            return;
        }
        
        // Salvar usuário logado
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo: user.tipo
        }));
        
        showToast(`Bem-vindo, ${user.nome}!`, 'success');
        trackEvent('auth', 'login_success', user.tipo);
        
        // Redirecionar baseado no tipo de usuário
        setTimeout(() => {
            if (user.tipo === 'vendedor') {
                window.location.href = 'vendedor-painel.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
        
    }, 1000);
}

// Fazer cadastro
function handleCadastro() {
    const nome = document.getElementById('cadastroNome').value.trim();
    const email = document.getElementById('cadastroEmail').value.trim();
    const password = document.getElementById('cadastroPassword').value.trim();
    const passwordConfirm = document.getElementById('cadastroPasswordConfirm').value.trim();
    const tipoConta = document.getElementById('tipoConta').value;
    
    // Validações
    if (!nome || !email || !password || !passwordConfirm) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }
    
    if (nome.length < 2) {
        showToast('Nome deve ter pelo menos 2 caracteres!', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Email inválido!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showToast('As senhas não coincidem!', 'error');
        return;
    }
    
    // Mostrar loading
    const btn = event.target;
    const originalText = btn.textContent;
    btn.innerHTML = '⏳ Criando conta...';
    btn.disabled = true;
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verificar se email já existe
        if (users.find(u => u.email === email)) {
            showToast('Email já cadastrado!', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }
        
        // Criar novo usuário
        const newUser = {
            id: Date.now(),
            nome: nome,
            email: email,
            senha: password,
            tipo: tipoConta,
            dataCadastro: new Date().toISOString(),
            ativo: true
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Logar automaticamente
        localStorage.setItem('currentUser', JSON.stringify({
            id: newUser.id,
            nome: newUser.nome,
            email: newUser.email,
            tipo: newUser.tipo
        }));
        
        showToast(`Cadastro realizado! Bem-vindo, ${nome}!`, 'success');
        trackEvent('auth', 'signup_success', tipoConta);
        
        // Redirecionar
        setTimeout(() => {
            if (tipoConta === 'vendedor') {
                window.location.href = 'vendedor-painel.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);
        
    }, 1000);
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mostrar/ocultar senha
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
        icon.setAttribute('aria-label', 'Ocultar senha');
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
        icon.setAttribute('aria-label', 'Mostrar senha');
    }
}

// Limpar formulários
function clearForms() {
    // Limpar login
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    // Limpar cadastro
    document.getElementById('cadastroNome').value = '';
    document.getElementById('cadastroEmail').value = '';
    document.getElementById('cadastroPassword').value = '';
    document.getElementById('cadastroPasswordConfirm').value = '';
    document.getElementById('tipoConta').value = 'cliente';
    
    // Resetar toggles de senha
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.textContent = '👁️';
        toggle.setAttribute('aria-label', 'Mostrar senha');
    });
}

// Verificar acesso de vendedor
function checkVendedorAccess() {
    const path = window.location.pathname;
    const vendedorPages = ['vendedor-cadastro.html', 'vendedor-painel.html'];
    
    if (vendedorPages.some(page => path.includes(page))) {
        const savedUser = localStorage.getItem('currentUser');
        
        if (!savedUser) {
            showToast('Você precisa estar logado para acessar esta página!', 'error');
            setTimeout(() => {
                window.location.href = 'logincad.html';
            }, 2000);
            return false;
        }
        
        const user = JSON.parse(savedUser);
        if (user.tipo !== 'vendedor') {
            showToast('Apenas vendedores podem acessar esta área!', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        
        return true;
    }
    
    return true;
}

// Verificar se usuário está logado
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log('👤 Usuário logado:', user.nome, '- Tipo:', user.tipo);
        return user;
    }
    return null;
}

// Fazer logout
function logout() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    showToast(`Até logo, ${user.nome || 'Usuário'}!`, 'success');
    trackEvent('auth', 'logout', user.tipo || 'unknown');
    
    localStorage.removeItem('currentUser');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Inicializar sistema de autenticação
function initializeAuth() {
    // Inicializar usuários padrão
    initializeUsers();
    
    // Verificar acesso restrito
    checkVendedorAccess();
    
    // Configurar toggles de senha
    setupPasswordToggles();
    
    // Configurar auto-focus
    setTimeout(() => {
        const firstInput = document.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 500);
    
    console.log('🔐 Sistema de autenticação inicializado');
}

// Configurar toggles de senha
function setupPasswordToggles() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.className = 'password-wrapper';
        wrapper.style.position = 'relative';
        
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'password-toggle';
        toggle.textContent = '👁️';
        toggle.setAttribute('aria-label', 'Mostrar senha');
        toggle.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.1rem;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        `;
        
        toggle.onclick = () => togglePassword(input.id, toggle);
        toggle.onmouseenter = () => toggle.style.backgroundColor = 'rgba(0,0,0,0.1)';
        toggle.onmouseleave = () => toggle.style.backgroundColor = 'transparent';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(toggle);
    });
}

// Verificar e atualizar interface baseada no login
function updateAuthUI() {
    const user = checkAuth();
    const loginBtn = document.getElementById('btnLogin');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (user) {
        // Usuário logado
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userName) userName.textContent = `Olá, ${user.nome.split(' ')[0]}`;
        
        // Mostrar/ocultar elementos baseados no tipo
        const vendedorElements = document.querySelectorAll('[data-vendedor-only]');
        const clienteElements = document.querySelectorAll('[data-cliente-only]');
        
        if (user.tipo === 'vendedor') {
            vendedorElements.forEach(el => el.style.display = 'block');
            clienteElements.forEach(el => el.style.display = 'none');
        } else {
            vendedorElements.forEach(el => el.style.display = 'none');
            clienteElements.forEach(el => el.style.display = 'block');
        }
    } else {
        // Usuário não logado
        if (loginBtn) loginBtn.style.display = 'block';
        if (userInfo) userInfo.style.display = 'none';
        
        // Esconder elementos restritos
        document.querySelectorAll('[data-vendedor-only], [data-cliente-only]').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Inicializar quando documento carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    updateAuthUI();
    
    // Adicionar listeners para formulários
    const loginForm = document.querySelector('#tab-login form');
    const cadastroForm = document.querySelector('#tab-cadastro form');
    
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            handleLogin();
        };
    }
    
    if (cadastroForm) {
        cadastroForm.onsubmit = (e) => {
            e.preventDefault();
            handleCadastro();
        };
    }
});

console.log('✅ usuario.js carregado - Sistema de login/cadastro pronto!');