// ========================================
// グローバル変数
// ========================================
let scrollPosition = 0;
let ticking = false;

// ========================================
// ナビゲーション
// ========================================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLogo = document.getElementById('navLogo');

// スクロール時のナビゲーション変更
function updateNavOnScroll() {
    scrollPosition = window.scrollY;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            if (scrollPosition > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            // ロゴの縮小アニメーション
            const scale = Math.max(0.85, 1 - scrollPosition / 1000);
            navLogo.style.transform = `scale(${scale})`;

            ticking = false;
        });

        ticking = true;
    }
}

// モバイルメニューのトグル
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// メニュー項目クリック時にメニューを閉じる
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

window.addEventListener('scroll', updateNavOnScroll, { passive: true });

// ========================================
// カルーセル
// ========================================
class Carousel {
    constructor(trackId, prevBtn, nextBtn) {
        this.track = document.getElementById(trackId);
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
        this.currentIndex = 0;
        this.cards = this.track.querySelectorAll('.carousel-card');
        this.cardWidth = 350; // カードの幅 + gap
        this.gap = 32; // 2rem = 32px
        this.visibleCards = this.getVisibleCards();

        this.init();
    }

    getVisibleCards() {
        const width = window.innerWidth;
        if (width < 480) return 1;
        if (width < 768) return 1.5;
        if (width < 1024) return 2;
        return 3;
    }

    init() {
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.addEventListener('click', () => this.slide(-1));
            this.nextBtn.addEventListener('click', () => this.slide(1));
        }

        // レスポンシブ対応
        window.addEventListener('resize', () => {
            this.visibleCards = this.getVisibleCards();
            this.updatePosition(false);
        });

        // タッチスワイプ対応
        this.addTouchSupport();
    }

    slide(direction) {
        const maxIndex = Math.max(0, this.cards.length - this.visibleCards);
        this.currentIndex = Math.max(0, Math.min(maxIndex, this.currentIndex + direction));
        this.updatePosition();
    }

    updatePosition(animated = true) {
        const offset = this.currentIndex * (this.cardWidth + this.gap);
        this.track.style.transition = animated ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
        this.track.style.transform = `translateX(-${offset}px)`;
    }

    addTouchSupport() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;

            const diff = startX - currentX;
            if (Math.abs(diff) > 50) {
                this.slide(diff > 0 ? 1 : -1);
            }

            isDragging = false;
        });
    }
}

// カルーセルの初期化
const carousels = [];

document.querySelectorAll('.carousel-btn-prev').forEach(btn => {
    const carouselType = btn.getAttribute('data-carousel');
    const trackId = `${carouselType}Track`;
    const nextBtn = btn.parentElement.querySelector('.carousel-btn-next');

    if (document.getElementById(trackId)) {
        carousels.push(new Carousel(trackId, btn, nextBtn));
    }
});

// ========================================
// スクロールアニメーション
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// アニメーション対象要素
const animatedElements = document.querySelectorAll(`
    .section-header,
    .carousel-card,
    .grid-card,
    .spot-item,
    .news-item
`);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    animateOnScroll.observe(el);
});

// ========================================
// パララックス効果
// ========================================
const heroShapes = document.querySelectorAll('.hero-shape');

function updateParallax() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.scrollY;

            heroShapes.forEach((shape, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrolled * speed);
                shape.style.transform = `translateY(${yPos}px)`;
            });

            ticking = false;
        });

        ticking = true;
    }
}

window.addEventListener('scroll', updateParallax, { passive: true });

// ========================================
// カードのホバーエフェクト（PC用）
// ========================================
if (window.innerWidth > 768) {
    const cards = document.querySelectorAll('.carousel-card, .grid-card, .spot-item');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ========================================
// テキストアニメーション（ヒーローセクション）
// ========================================
const heroTitle = document.querySelector('.hero-title-main');

if (heroTitle) {
    const text = heroTitle.getAttribute('data-text');
    heroTitle.innerHTML = '';

    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.animation = `fadeInChar 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s forwards`;
        heroTitle.appendChild(span);
    });
}

// 文字のフェードインアニメーション用CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInChar {
        from {
            opacity: 0;
            transform: translateY(20px) rotateX(-90deg);
        }
        to {
            opacity: 1;
            transform: translateY(0) rotateX(0);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// スムーズスクロール
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80; // ナビゲーションの高さ分オフセット

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// ページロード時のアニメーション
// ========================================
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
});

// ページロード前に透明に
document.body.style.opacity = '0';

// ========================================
// パフォーマンス最適化
// ========================================
// Reduce motion対応
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // アニメーションを無効化
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}

// ========================================
// デバッグ情報（開発用）
// ========================================
console.log('%c🏯 FUKUOKA BASE', 'font-size: 24px; font-weight: bold; color: #FF6B35;');
console.log('%cWebsite loaded successfully!', 'font-size: 14px; color: #1AA3A3;');
console.log(`%cCarousels initialized: ${carousels.length}`, 'color: #F7B801;');
console.log(`%cAnimated elements: ${animatedElements.length}`, 'color: #004E89;');
