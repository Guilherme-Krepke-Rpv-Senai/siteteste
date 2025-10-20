// ==========================================
// CARRINHO.JS - Gerenciamento do Carrinho
// ==========================================

function renderCart() {
    const cartContainer = document.getElementById('cartContainer');
    if (!cartContainer) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="carrinho-vazio">
                <p>🛒 Seu carrinho está vazio</p>
                <button class="btn-voltar-loja" onclick="goToLoja()">Ir para a Loja</button>
            </div>
        `;
        return;
    }

    let subtotal = 0;
    const itemsHtml = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-image">
                    ${item.isImage ? 
                        `<img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='👕';">` : 
                        item.image
                    }
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-category">${item.category}</p>
                    <p class="item-price">R$ ${item.price.toFixed(2)}</p>
                </div>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <p class="item-total">Total: R$ ${itemTotal.toFixed(2)}</p>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">Remover</button>
                </div>
            </div>
        `;
    }).join('');

    const frete = subtotal > 200 ? 0 : 15.00;
    const total = subtotal + frete;

    const html = `
        <div class="cart-container">
            <div class="cart-items-list">
                ${itemsHtml}
            </div>
            <div class="cart-resumo">
                <h3 class="resumo-title">Resumo do Pedido</h3>
                <div class="resumo-item">
                    <span>Subtotal (${cart.reduce((sum, item) => sum + item.quantity, 0)} itens):</span>
                    <span>R$ ${subtotal.toFixed(2)}</span>
                </div>
                <div class="resumo-item">
                    <span>Frete:</span>
                    <span>${frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`}</span>
                </div>
                ${frete > 0 ? `
                    <div class="resumo-frete-info">
                        <small>🎁 Frete grátis para compras acima de R$ 200,00</small>
                    </div>
                ` : ''}
                <div class="resumo-total">
                    <span>Total:</span>
                    <span>R$ ${total.toFixed(2)}</span>
                </div>
                <button class="btn-checkout" onclick="checkout()">
                    Finalizar Compra
                </button>
                <button class="btn-continuar" onclick="goToLoja()">Continuar Comprando</button>
            </div>
        </div>
    `;

    cartContainer.innerHTML = html;
    trackEvent('cart', 'view', `Items: ${cart.length}`);
}

function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    
    showToast(`Quantidade de ${item.name} atualizada: ${item.quantity}`, 'success');
    trackEvent('cart', 'update_quantity', `${item.name} - ${item.quantity}`);
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
        showToast(`${item.name} removido do carrinho`, 'success');
        trackEvent('cart', 'remove_item', item.name);
    }
}

function checkout() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (!savedUser) {
        showToast('Você precisa estar logado para finalizar a compra!', 'error');
        setTimeout(() => {
            window.location.href = 'logincad.html';
        }, 1500);
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!', 'error');
        return;
    }

    // Simular finalização de compra
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const frete = subtotal > 200 ? 0 : 15.00;
    const totalFinal = subtotal + frete;

    // Salvar histórico do pedido
    const order = {
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        items: [...cart],
        subtotal: subtotal,
        frete: frete,
        total: totalFinal,
        status: 'completed'
    };

    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    showToast(`Compra finalizada com sucesso! Total: R$ ${totalFinal.toFixed(2)}`, 'success');
    trackEvent('purchase', 'complete', `Total: R$ ${totalFinal.toFixed(2)}`);
    
    // Limpar carrinho
    localStorage.setItem('cart', JSON.stringify([]));
    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function clearCart() {
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
        localStorage.setItem('cart', JSON.stringify([]));
        renderCart();
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
        showToast('Carrinho limpo!', 'success');
        trackEvent('cart', 'clear', 'all_items');
    }
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});