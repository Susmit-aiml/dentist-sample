/* Visit Us / Location Component */
export function renderVisitUs(clinic) {
  const c = document.querySelector('#location .location-grid');
  if (!c || !clinic) return;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = dayNames[new Date().getDay()];

  c.innerHTML = `
    <div class="map-wrap">
      <iframe src="${clinic.mapEmbedUrl}" title="Clinic Location" loading="lazy" allowfullscreen></iframe>
    </div>
    <div class="loc-info">
      <span class="eyebrow-tag-sm">Visit Our Practice</span>
      <h2 class="sec-title">Location & Opening Hours</h2>

      <div class="loc-row mt-3">
        <svg><use href="#icon-map-pin"></use></svg>
        <span>${clinic.address}</span>
      </div>
      <div class="loc-row">
        <svg><use href="#icon-phone"></use></svg>
        <a href="tel:${clinic.phone}" style="font-weight:700;color:var(--accent-deep)">${clinic.phone}</a>
      </div>

      <table class="hours-table">
        <tbody>
          ${clinic.hours.map(h => `
            <tr class="${h.day === today ? 'today' : ''}">
              <td>${h.day}</td>
              <td>${h.isOpen ? h.open + ' – ' + h.close : '<span style="color:var(--ink-faint)">Closed</span>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <a href="https://maps.google.com/?q=${encodeURIComponent(clinic.address)}" target="_blank" rel="noopener" class="btn-accent w-full" style="text-align:center;justify-content:center">
        <svg><use href="#icon-map-pin"></use></svg> Get Directions
      </a>
    </div>
  `;
}
