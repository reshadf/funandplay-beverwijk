// ============================================
// DOM References (cached once)
// ============================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');
const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');
const sections = document.querySelectorAll('section[id]');
const contactForm = document.getElementById('contactForm');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// ============================================
// Mobile Navigation
// ============================================
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// ============================================
// Smooth Scrolling
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================
// Single Consolidated Scroll Handler (rAF-throttled)
// ============================================
let ticking = false;

function onScroll() {
    const scrollY = window.pageYOffset;

    // Navbar scroll class
    navbar.classList.toggle('scrolled', scrollY > 100);

    // Parallax — only when hero is in view
    if (hero && heroContent && scrollY < window.innerHeight) {
        hero.style.transform = `translate3d(0, ${scrollY * 0.35}px, 0)`;
        heroContent.style.transform = `translate3d(0, ${scrollY * 0.2}px, 0)`;
        heroContent.style.opacity = Math.max(0, 1 - scrollY / 700);
    }

    // Active nav link highlighting
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 120;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (navLink) {
            navLink.classList.toggle('active',
                scrollY >= sectionTop && scrollY < sectionTop + sectionHeight
            );
        }
    });

    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });

// ============================================
// IntersectionObserver for Scroll Reveal
// ============================================
function initRevealObserver() {
    const revealElements = document.querySelectorAll('.feature, .gallery-item, .video-item, .info-item');

    // Add the reveal class to all elements
    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // stop observing once visible
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// ============================================
// Gallery Tabs
// ============================================
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// ============================================
// Contact Form
// ============================================
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const subject = formData.get('subject');
    const message = formData.get('message').trim();

    let isValid = true;
    let errorMessage = '';

    if (name.length < 2) {
        errorMessage = 'Vul een geldige naam in (minimaal 2 tekens).';
        isValid = false;
    } else if (!isValidEmail(email)) {
        errorMessage = 'Vul een geldig e-mailadres in.';
        isValid = false;
    } else if (phone && !isValidPhone(phone)) {
        errorMessage = 'Vul een geldig telefoonnummer in.';
        isValid = false;
    } else if (!subject) {
        errorMessage = 'Selecteer een onderwerp.';
        isValid = false;
    } else if (message.length < 10) {
        errorMessage = 'Vul een bericht in van minimaal 10 tekens.';
        isValid = false;
    }

    if (!isValid) {
        showNotification(errorMessage, 'error');
        return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verzenden...';
    submitBtn.disabled = true;

    const encodedData = new URLSearchParams(formData).toString();

    fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData
    })
    .then(response => {
        if (response.ok) {
            contactForm.reset();
            showNotification('Bedankt voor uw bericht! We nemen zo snel mogelijk contact met u op.', 'success');
        } else {
            console.error('Form submission failed:', response.status, response.statusText);
            showNotification('Er is iets misgegaan. Probeer het later opnieuw.', 'error');
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        showNotification('Er is iets misgegaan. Probeer het later opnieuw.', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ============================================
// Notification
// ============================================
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transform: translate3d(400px, 0, 0);
        transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            notification.style.transform = 'translate3d(0, 0, 0)';
        });
    });

    setTimeout(() => {
        notification.style.transform = 'translate3d(400px, 0, 0)';
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    }, 5000);
}

// ============================================
// Gallery Click Handler
// ============================================
document.querySelectorAll('.gallery-item, .video-placeholder').forEach(item => {
    item.addEventListener('click', function() {
        const title = this.querySelector('span')?.textContent || 'Galerij Item';
        showNotification(`${title} openen...`, 'info');
    });
});

// ============================================
// Floating Games — randomize via CSS custom props
// ============================================
document.querySelectorAll('.floating-game').forEach(game => {
    const duration = 5 + Math.random() * 4;
    const delay = Math.random() * 3;
    game.style.animationDuration = `${duration}s`;
    game.style.animationDelay = `${delay}s`;
});

// ============================================
// Page Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    initRevealObserver();
    onScroll(); // initial state
});
