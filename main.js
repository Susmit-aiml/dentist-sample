/* DentEase Main Entry — Fusion v3 */
import { initHeader } from './components/header.js';
import { renderTrustBar } from './components/trust-bar.js';
import { renderDoctorProfile } from './components/doctor.js';
import { renderServicesGrid } from './components/services.js';
import { renderWhyChooseUs } from './components/why-choose.js';
import { renderBeforeAfterSlider } from './components/before-after.js';
import { renderReviewsCarousel } from './components/reviews.js';
import { renderFAQ } from './components/faq.js';
import { renderVisitUs } from './components/visit-us.js';
import { initBookingModal } from './components/booking.js';
import { initChatbot } from './components/chatbot.js';
import { initAdminPortal } from './components/admin-portal.js';

// Direct JSON imports so Vite bundles all clinic data with zero runtime fetch latency or 404 errors
import services from './data/services.json';
import reviews from './data/reviews.json';
import faq from './data/faq.json';
import cases from './data/cases.json';
import doctor from './data/doctor.json';
import clinic from './data/clinic.json';
import chatbot from './data/chatbot-responses.json';

function initApp() {
    try {

        initHeader();
        renderTrustBar(clinic.stats);
        renderDoctorProfile(doctor);
        renderServicesGrid(services);
        renderWhyChooseUs();
        renderBeforeAfterSlider(cases);
        renderReviewsCarousel(reviews);
        renderFAQ(faq);
        renderVisitUs(clinic);

        const admin = initAdminPortal(cases, reviews);
        const booking = initBookingModal(services, clinic);
        initChatbot(chatbot, booking.openModal, admin.openPortal);

        initScrollReveal();
        initMobileStickyBar();

    } catch (err) {
        console.error('[DentEase]', err);
    }
}

function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.svc-card, .usp-item, .rev-card, .faq-item, .stat-block,' +
        '.doctor-grid, .hero-content, .hero-visual, .ba-card, .ba-gallery-card,' +
        '.location-grid, .sec-header, .sec-header--split'
    );

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
    }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

    targets.forEach(el => {
        el.classList.add('fade-up');
        io.observe(el);
    });

    // Stagger delays
    document.querySelectorAll('.services-grid .svc-card').forEach((c, i) => c.classList.add(`d${(i % 8) + 1}`));
    document.querySelectorAll('.usp-grid .usp-item').forEach((c, i) => c.classList.add(`d${i + 1}`));
    document.querySelectorAll('.trust-bar-grid .stat-block').forEach((c, i) => c.classList.add(`d${i + 1}`));
}

function initMobileStickyBar() {
    const bar = document.getElementById('mobile-sticky-cta');
    const hero = document.getElementById('hero');
    if (!bar || !hero) return;

    const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting && window.innerWidth <= 900) {
            bar.classList.add('visible');
            bar.removeAttribute('aria-hidden');
        } else {
            bar.classList.remove('visible');
            bar.setAttribute('aria-hidden', 'true');
        }
    }, { threshold: 0.1 });

    io.observe(hero);
}

document.addEventListener('DOMContentLoaded', initApp);
