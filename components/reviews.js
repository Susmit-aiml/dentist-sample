/* Reviews Carousel Component */
export function renderReviewsCarousel(initialReviews) {
  const c = document.getElementById('reviews-carousel-track');
  if (!c || !initialReviews) return;

  function getReviews() {
    try {
      const saved = localStorage.getItem('dentease_reviews');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return initialReviews;
  }

  const reviews = getReviews();

  c.innerHTML = reviews.map(r => `
    <div class="rev-card fade-up">
      <div class="rev-stars">${'<svg><use href="#icon-star"></use></svg>'.repeat(r.rating || 5)}</div>
      <p class="rev-text">"${r.text}"</p>
      <div class="rev-author">
        <div class="rev-avatar">${r.name.charAt(0)}</div>
        <div>
          <div class="rev-name">${r.name}</div>
          <div class="rev-role">${r.role || 'Verified Patient'} · ${r.source || 'Google Review'}</div>
        </div>
      </div>
    </div>
  `).join('');

  const prev = document.getElementById('reviews-prev');
  const next = document.getElementById('reviews-next');
  prev?.addEventListener('click', () => c.scrollBy({ left: -340, behavior: 'smooth' }));
  next?.addEventListener('click', () => c.scrollBy({ left: 340, behavior: 'smooth' }));
}
