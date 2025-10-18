import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Moon, Sun } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, name: 'Camiseta Premium', price: 79.90, category: 'camisetas', image: '👕', description: 'Camiseta de algodão 100% confortável' },
    { id: 2, name: 'Calça Jeans', price: 129.90, category: 'calças', image: '👖', description: 'Calça jeans clássica de qualidade' },
    { id: 3, name: 'Jaqueta Bomber', price: 199.90, category: 'jaquetas', image: '🧥', description: 'Jaqueta bomber moderna e versátil' },
    { id: 4, name: 'Vestido Casual', price: 159.90, category: 'vestidos', image: '👗', description: 'Vestido leve perfeito para o dia a dia' },
  ]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [formData, setFormData] = useState({ name: '', price: '', category: 'camisetas', description: '', image: '👕' });

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedCart = localStorage.getItem('cart');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [products, cart]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const addProduct = () => {
    if (!formData.name || !formData.price) {
      alert('Preencha todos os campos!');
      return;
    }
    const newProduct = { id: Date.now(), ...formData, price: parseFloat(formData.price) };
    setProducts([...products, newProduct]);
    setFormData({ name: '', price: '', category: 'camisetas', description: '', image: '👕' });
    alert('Produto cadastrado com sucesso!');
  };

  const filteredProducts = filter === 'todos' ? products : products.filter(p => p.category === filter);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ========== HEADER ==========
  const Header = () => (
    <header className={`header ${darkMode ? 'dark' : ''}`}>
      <div className="header-content">
        <h1 className="logo">STYLE CO.</h1>
        
        <nav className="nav-desktop">
          <button onClick={() => setCurrentPage('home')}>Home</button>
          <button onClick={() => setCurrentPage('loja')}>Loja</button>
          <button onClick={() => setCurrentPage('cadastro')}>Cadastrar</button>
          <button onClick={() => setCurrentPage('sobre')}>Sobre</button>
        </nav>

        <div className="header-right">
          <button onClick={() => setDarkMode(!darkMode)} className="theme-btn">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setCurrentPage('carrinho')} className="cart-btn">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="nav-mobile">
          <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}>Home</button>
          <button onClick={() => { setCurrentPage('loja'); setMobileMenuOpen(false); }}>Loja</button>
          <button onClick={() => { setCurrentPage('cadastro'); setMobileMenuOpen(false); }}>Cadastrar</button>
          <button onClick={() => { setCurrentPage('sobre'); setMobileMenuOpen(false); }}>Sobre</button>
        </nav>
      )}
    </header>
  );

  // ========== HOME PAGE ==========
  const HomePage = () => (
    <div>
      <section className="hero">
        <h2>Bem-vindo à STYLE CO.</h2>
        <p>Moda minimalista com qualidade e personalidade</p>
        <div className="hero-buttons">
          <button onClick={() => setCurrentPage('loja')} className="btn-primary">Ver Produtos</button>
          <button onClick={() => setCurrentPage('cadastro')} className="btn-secondary">Cadastrar Produto</button>
        </div>
      </section>

      <section className="destaque">
        <h3>Destaque de Produtos</h3>
        <div className="products-grid">
          {products.slice(0, 4).map(p => (
            <div key={p.id} className="product-card" onClick={() => { setSelectedProduct(p); setCurrentPage('detalhes'); }}>
              <div className="product-image">{p.image}</div>
              <h4>{p.name}</h4>
              <p className="price">R$ {p.price.toFixed(2)}</p>
              <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="btn-add">Adicionar</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // ========== LOJA PAGE ==========
  const LojaPage = () => (
    <div className="loja-page">
      <h2>Nossa Loja</h2>

      <div className="filtros">
        {['todos', 'camisetas', 'calças', 'jaquetas', 'vestidos'].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`filter-btn ${filter === cat ? 'active' : ''}`}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {(filter === 'todos' ? products : products.filter(p => p.category === filter)).map(p => (
          <div key={p.id} className="product-card">
            <div className="product-image" onClick={() => { setSelectedProduct(p); setCurrentPage('detalhes'); }}>{p.image}</div>
            <h3>{p.name}</h3>
            <p className="description">{p.description}</p>
            <p className="price">R$ {p.price.toFixed(2)}</p>
            <div className="product-actions">
              <button onClick={() => { setSelectedProduct(p); setCurrentPage('detalhes'); }} className="btn-details">Detalhes</button>
              <button onClick={() => addToCart(p)} className="btn-add">+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ========== CADASTRO PAGE ==========
  const CadastroPage = () => (
    <div className="cadastro-page">
      <h2>Cadastrar Produto</h2>
      <div className="form-container">
        <div className="form-group">
          <label>Nome do Produto</label>
          <input type="text" placeholder="Nome do produto" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Preço</label>
          <input type="number" placeholder="Preço" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Categoria</label>
          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
            <option value="camisetas">Camisetas</option>
            <option value="calças">Calças</option>
            <option value="jaquetas">Jaquetas</option>
            <option value="vestidos">Vestidos</option>
          </select>
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <textarea placeholder="Descrição" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Emoji (ex: 👕)</label>
          <input type="text" placeholder="Emoji" maxLength="2" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
        </div>
        <button onClick={addProduct} className="btn-submit">Cadastrar Produto</button>
      </div>
    </div>
  );

  // ========== DETALHES PAGE ==========
  const DetalhesPage = () => {
    if (!selectedProduct) return <div className="text-center">Produto não encontrado</div>;
    return (
      <div className="detalhes-page">
        <button onClick={() => setCurrentPage('loja')} className="btn-voltar">← Voltar</button>
        <div className="detalhes-container">
          <div className="detalhes-image">{selectedProduct.image}</div>
          <div className="detalhes-info">
            <h2>{selectedProduct.name}</h2>
            <p className="description">{selectedProduct.description}</p>
            <p className="price">R$ {selectedProduct.price.toFixed(2)}</p>
            <div className="detalhes-actions">
              <button onClick={() => { addToCart(selectedProduct); alert('Adicionado ao carrinho!'); }} className="btn-comprar">Comprar Agora</button>
              <button onClick={() => setCurrentPage('loja')} className="btn-continue">Continuar Shopping</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== CARRINHO PAGE ==========
  const CarrinhoPage = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (
      <div className="carrinho-page">
        <h2>Carrinho de Compras</h2>
        {cart.length === 0 ? (
          <div className="carrinho-vazio">
            <p>Seu carrinho está vazio</p>
            <button onClick={() => setCurrentPage('loja')} className="btn-primary">Ver Produtos</button>
          </div>
        ) : (
          <div>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">{item.image}</div>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p className="price">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <span>Qtd: {item.quantity}</span>
                    <button onClick={() => removeFromCart(item.id)} className="btn-remove">Remover</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <div className="total-text">Total: R$ {total.toFixed(2)}</div>
              <button className="btn-checkout">Finalizar Compra</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== SOBRE PAGE ==========
  const SobrePage = () => (
    <div className="sobre-page">
      <h2>Sobre a STYLE CO.</h2>
      <div className="sobre-container">
        <p>A STYLE CO. é uma loja minimalista dedicada a oferecer moda de qualidade com personalidade. Acreditamos que estilo é acessível e que cada peça deve contar uma história.</p>
        <p>Nossa missão é trazer peças sofisticadas que combinam conforto, qualidade e design moderno para o seu dia a dia.</p>
        
        <div className="social-section">
          <h3>Conecte-se Conosco</h3>
          <div className="social-links">
            <div className="social-btn facebook">Facebook</div>
            <div className="social-btn instagram">Instagram</div>
            <div className="social-btn twitter">Twitter</div>
          </div>
        </div>

        <div className="contact-section">
          <h3>Entre em Contato</h3>
          <div className="contact-form">
            <div className="form-group">
              <label>Seu nome</label>
              <input type="text" placeholder="Seu nome" />
            </div>
            <div className="form-group">
              <label>Seu email</label>
              <input type="email" placeholder="Seu email" />
            </div>
            <div className="form-group">
              <label>Mensagem</label>
              <textarea placeholder="Sua mensagem" rows="5" />
            </div>
            <button className="btn-submit">Enviar Mensagem</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== FOOTER ==========
  const Footer = () => (
    <footer className={`footer ${darkMode ? 'dark' : ''}`}>
      <p>&copy; 2024 STYLE CO. - Todos os direitos reservados.</p>
      <p>Desenvolvido com ❤️ | Moda, qualidade e estilo</p>
    </footer>
  );

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Header />
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'loja' && <LojaPage />}
        {currentPage === 'cadastro' && <CadastroPage />}
        {currentPage === 'detalhes' && <DetalhesPage />}
        {currentPage === 'carrinho' && <CarrinhoPage />}
        {currentPage === 'sobre' && <SobrePage />}
      </main>
      <Footer />
    </div>
  );
}