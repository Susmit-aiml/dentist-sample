/* FAQ Accordion Component */
export function renderFAQ(faqs) {
  const c = document.getElementById('faq-accordion');
  if (!c || !faqs) return;

  c.innerHTML = faqs.map((f, i) => `
    <div class="faq-item fade-up ${i === 0 ? 'active' : ''}">
      <button class="faq-question">
        <span>${f.question}</span>
        <span class="faq-chevron">▾</span>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-inner">${f.answer}</div>
      </div>
    </div>
  `).join('');

  c.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      c.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}
