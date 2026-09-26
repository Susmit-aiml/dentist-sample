/* Doctor Profile Component */
export function renderDoctorProfile(doctor) {
  const c = document.querySelector('#doctor .doctor-grid');
  if (!c || !doctor) return;

  c.innerHTML = `
    <div class="doc-img-wrap">
      <img src="${doctor.photo}" alt="Portrait of ${doctor.name}" width="400" height="530" loading="lazy">
    </div>
    <div class="doc-info">
      <span class="eyebrow-tag-sm">Meet Your Dentist</span>
      <h2 class="doc-name">${doctor.name}</h2>
      <p class="doc-title">${doctor.title}</p>
      <p class="doc-bio">${doctor.bio}</p>
      <div class="doc-badges">
        ${doctor.badges.map(b => `<span class="doc-badge">${b}</span>`).join('')}
      </div>
    </div>
  `;
}
