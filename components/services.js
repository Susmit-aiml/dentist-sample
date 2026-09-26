/* Services Grid Component — v4 Image-Rich Cards */
export function renderServicesGrid(services) {
  const c = document.getElementById('services-grid');
  if (!c || !services) return;

  c.innerHTML = services.map(s => `
    <div class="svc-card fade-up" data-service-id="${s.id}">
      <div class="svc-img-wrap">
        <img src="${s.image}" alt="${s.name}" loading="lazy" class="svc-img">
        <div class="svc-img-overlay"></div>
        <span class="svc-price-badge">${s.price}</span>
      </div>
      <div class="svc-body">
        <h3 class="svc-name">${s.name}</h3>
        <p class="svc-desc">${s.shortDesc}</p>
        <div class="svc-footer">
          <span class="svc-duration">${s.duration}</span>
          <button class="svc-more book-service-btn" data-service="${s.id}">
            Book
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}
