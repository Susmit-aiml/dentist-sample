/* Trust Bar Component */
export function renderTrustBar(stats) {
  const c = document.querySelector('#trust-bar .trust-bar-grid');
  if (!c || !stats) return;

  c.innerHTML = stats.map(s => `
    <div class="stat-block fade-up">
      <div class="stat-number">${s.number}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
}
