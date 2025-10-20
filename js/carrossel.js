// ==========================================
// CARROSSEL.JS - Carrossel de Imagens Hero
// ==========================================

let currentSlideIndex = 0;
let autoSlideInterval;

// Imagens do carrossel (localizadas em imagenscarrossel/)
const carouselImages = [
    'imagenscarrossel/img1.jpg',
    'imagenscarrossel/img2.jpg',
    'imagenscarrossel/img3.jpg',
    'imagenscarrossel/img4.jpg'
];

function initCarousel() {
    const carouselContainer = document.getElementById('heroCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!carouselContainer || !dotsContainer) return;

    // Criar slides
    carouselImages.forEach((imgSrc, index) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        if (index === 0) slide.classList.add('active');
        slide.style.backgroundImage = `url('${imgSrc}')`;
        carouselContainer.appendChild(slide);
    });

    // Criar dots
    carouselImages.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });

    // Iniciar autoplay
    startAutoSlide();
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length) return;

    // Garantir que o índice está dentro dos limites
    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }

    // Remover classe active de todos
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Adicionar classe active ao slide e dot atual
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlideIndex + 1);
    resetAutoSlide();
}

function prevSlide() {
    showSlide(currentSlideIndex - 1);
    resetAutoSlide();
}

function goToSlide(index) {
    showSlide(index);
    resetAutoSlide();
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Muda a cada 5 segundos
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});

// Pausar autoplay quando o mouse estiver sobre o carrossel
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        heroSection.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
});