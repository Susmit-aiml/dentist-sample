/* Why Choose Us Component */
export function renderWhyChooseUs() {
  const c = document.getElementById('why-choose-grid');
  if (!c) return;

  const usps = [
    { icon: '#icon-sparkle', title: 'AI-Assisted Scheduling', desc: 'Our smart booking engine finds your ideal slot in seconds — powered by local AI intent matching.' },
    { icon: '#icon-shield-check', title: '100% Transparent Pricing', desc: 'Every cost upfront before you sit in the chair. No hidden fees, ever.' },
    { icon: '#icon-pulse', title: 'Painless Modern Technology', desc: 'Laser dentistry, digital X-rays, and sedation options for a truly gentle experience.' },
    { icon: '#icon-smile', title: 'Anxiety-Free Environment', desc: 'Noise-cancelling headphones, aromatherapy, and a calm studio ambiance designed to relax.' },
  ];

  c.innerHTML = usps.map(u => `
    <div class="usp-item fade-up">
      <div class="usp-ico">
        <svg><use href="${u.icon}"></use></svg>
      </div>
      <h3 class="usp-name">${u.title}</h3>
      <p class="usp-desc">${u.desc}</p>
    </div>
  `).join('');
}
