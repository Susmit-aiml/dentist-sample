/* ==========================================================================
   Before / After Interactive Slider Component — v4 Gallery + All Blogs Directory
   ========================================================================== */

export function renderBeforeAfterSlider(initialCases) {
    const container = document.getElementById('before-after-wrapper');
    const viewAllBtn = document.getElementById('view-all-cases-btn');
    if (!container || !initialCases || initialCases.length === 0) return;

    // Support dynamic cases saved from admin portal
    function getCases() {
        try {
            const saved = localStorage.getItem('dentease_cases');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return initialCases;
    }

    const cases = getCases();

    // Render horizontal scrolling gallery of before/after cards
    container.innerHTML = `
      <div class="ba-gallery-track" id="ba-gallery-track">
        ${cases.map((item, i) => `
          <div class="ba-gallery-card fade-up" data-index="${i}">
            <div class="ba-slider-container" id="ba-slider-${i}">
              <img src="${item.afterImg}" alt="After clinical treatment" class="ba-img ba-after-img">
              <img src="${item.beforeImg}" alt="Before clinical treatment" class="ba-img ba-before-img" id="ba-before-${i}" style="clip-path:inset(0 50% 0 0)">
              <div class="ba-handle" id="ba-handle-${i}" style="left:50%">
                <div class="ba-handle-circle">↔</div>
              </div>
              <div class="ba-labels">
                <span class="ba-label ba-label-before">Before</span>
                <span class="ba-label ba-label-after">After</span>
              </div>
            </div>
            <div class="ba-card-info">
              <div class="ba-patient-tag">${item.patientName || 'Verified Patient'}</div>
              <h3 class="ba-card-title">${item.title}</h3>
              <p class="ba-card-problem">${item.problem || item.description}</p>
              <div class="ba-card-footer">
                <span class="ba-procedure-tag">${item.procedure}</span>
                <button class="ba-read-more" data-case="${i}">
                  Read Full Story
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="ba-gallery-nav">
        <button id="ba-gallery-prev" class="arrow-btn" aria-label="Previous">‹</button>
        <div class="ba-gallery-dots">
          ${cases.map((_, i) => `<span class="ba-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></span>`).join('')}
        </div>
        <button id="ba-gallery-next" class="arrow-btn" aria-label="Next">›</button>
      </div>
    `;

    // Init drag logic for each slider
    cases.forEach((_, i) => initDragLogic(i));

    // Gallery scroll navigation
    const track = document.getElementById('ba-gallery-track');
    const dots = container.querySelectorAll('.ba-dot');

    document.getElementById('ba-gallery-prev')?.addEventListener('click', () => {
        track.scrollBy({ left: -track.offsetWidth * 0.85, behavior: 'smooth' });
    });
    document.getElementById('ba-gallery-next')?.addEventListener('click', () => {
        track.scrollBy({ left: track.offsetWidth * 0.85, behavior: 'smooth' });
    });

    // Update active dot on scroll
    track?.addEventListener('scroll', () => {
        const cards = track.querySelectorAll('.ba-gallery-card');
        let activeIdx = 0;
        cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();
            if (rect.left >= trackRect.left - 50 && rect.left < trackRect.left + trackRect.width / 2) {
                activeIdx = i;
            }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    });

    // Dot click
    dots.forEach(d => d.addEventListener('click', () => {
        const cards = track.querySelectorAll('.ba-gallery-card');
        const idx = parseInt(d.dataset.dot);
        cards[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }));

    // Blog modal triggers from cards
    container.querySelectorAll('.ba-read-more').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.case);
            openBlogModal(cases[idx]);
        });
    });

    // "VIEW ALL" Cases & Blogs Directory Trigger
    viewAllBtn?.addEventListener('click', () => {
        openAllCasesModal(cases);
    });

    function initDragLogic(index) {
        const slider = document.getElementById(`ba-slider-${index}`);
        const beforeImg = document.getElementById(`ba-before-${index}`);
        const handle = document.getElementById(`ba-handle-${index}`);
        if (!slider || !beforeImg || !handle) return;

        let isDragging = false;

        function setPosition(x) {
            const rect = slider.getBoundingClientRect();
            let pos = (x - rect.left) / rect.width;
            if (pos < 0) pos = 0;
            if (pos > 1) pos = 1;
            const pct = pos * 100;
            beforeImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
            handle.style.left = `${pct}%`;
        }

        const onMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            setPosition(clientX);
        };

        slider.addEventListener('mousedown', (e) => { isDragging = true; setPosition(e.clientX); });
        slider.addEventListener('touchstart', (e) => { isDragging = true; setPosition(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('touchend', () => isDragging = false);
    }

    function openBlogModal(caseData) {
        const blog = caseData.blogContent;
        if (!blog) return;

        // Remove any open modal first
        document.querySelectorAll('.blog-modal-overlay').forEach(m => m.remove());

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay blog-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        const heroImageHTML = caseData.fullImg
            ? `<div class="blog-hero-full-wrap">
                 <img src="${caseData.fullImg}" alt="${caseData.title}" class="blog-full-comparison-img">
                 <div class="blog-hero-split-labels">
                   <span class="blog-ba-tag">BEFORE</span>
                   <span class="blog-ba-tag blog-ba-tag--after">AFTER</span>
                 </div>
               </div>`
            : `<div class="blog-hero-split">
                 <div class="blog-hero-img">
                   <img src="${caseData.beforeImg}" alt="Before" class="blog-ba-img">
                   <span class="blog-ba-tag">Before</span>
                 </div>
                 <div class="blog-hero-img">
                   <img src="${caseData.afterImg}" alt="After" class="blog-ba-img">
                   <span class="blog-ba-tag blog-ba-tag--after">After</span>
                 </div>
               </div>`;

        overlay.innerHTML = `
          <div class="modal-card blog-card">
            <button class="modal-x blog-close" aria-label="Close">✕</button>
            ${heroImageHTML}
            <div class="blog-body">
              <div class="blog-top-nav">
                <button class="blog-back-btn" id="blog-back-to-all">
                  ← All Case Studies &amp; Blogs
                </button>
                <div class="blog-patient-badge">${caseData.patientName || 'Verified Patient'} • ${caseData.procedure}</div>
              </div>
              <h2 class="blog-title">${blog.heading}</h2>

              <div class="blog-section">
                <h4>📋 Patient Complaint &amp; Background</h4>
                <p>${blog.background}</p>
              </div>
              <div class="blog-section">
                <h4>🔍 Clinical Diagnosis</h4>
                <p>${blog.diagnosis}</p>
              </div>
              <div class="blog-section">
                <h4>📝 Custom Treatment Plan</h4>
                <p>${blog.treatmentPlan}</p>
              </div>
              <div class="blog-section">
                <h4>🦷 Step-by-Step Procedure</h4>
                <p>${blog.procedure}</p>
              </div>
              <div class="blog-section">
                <h4>💚 Recovery &amp; Longevity</h4>
                <p>${blog.recovery}</p>
              </div>
              <div class="blog-doctor-note">
                <h4>👨‍⚕️ Clinical Insights from the Specialist</h4>
                <blockquote>"${blog.doctorNote}"</blockquote>
              </div>
              <div class="blog-cta-bar">
                <div>
                  <strong>Interested in a similar smile transformation?</strong>
                  <p style="font-size:var(--ts-xs);color:var(--ink-soft);margin-top:.15rem">Schedule a personalized 1-on-1 consultation with Dr. Siddharth Malhotra.</p>
                </div>
                <button class="btn-accent btn-sm blog-book-cta">Book Consultation</button>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => overlay.classList.add('visible'));

        const closeFn = () => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        overlay.querySelector('.blog-close')?.addEventListener('click', closeFn);
        overlay.addEventListener('click', e => { if (e.target === overlay) closeFn(); });
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeFn();
                window.removeEventListener('keydown', escHandler);
            }
        };
        window.addEventListener('keydown', escHandler);

        // "Back to All Cases" button in blog modal
        overlay.querySelector('#blog-back-to-all')?.addEventListener('click', () => {
            closeFn();
            setTimeout(() => openAllCasesModal(cases), 200);
        });

        // "Book Consultation" CTA in blog modal
        overlay.querySelector('.blog-book-cta')?.addEventListener('click', () => {
            closeFn();
            document.getElementById('header-book-btn')?.click();
        });
    }

    function openAllCasesModal(allCases) {
        document.querySelectorAll('.all-cases-modal-overlay').forEach(m => m.remove());

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay all-cases-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        let activeFilter = 'all';

        function renderModalContent() {
            const filtered = activeFilter === 'all'
                ? allCases
                : allCases.filter(c => c.category === activeFilter || c.procedure.toLowerCase().includes(activeFilter));

            overlay.innerHTML = `
              <div class="modal-card all-cases-card">
                <button class="modal-x all-cases-close" aria-label="Close">✕</button>
                <div class="all-cases-header">
                  <span class="eyebrow-tag-sm">Clinical Portfolio</span>
                  <h2 class="all-cases-title">All Smile Transformations &amp; Treatment Blogs</h2>
                  <p class="all-cases-desc">Explore verified before-and-after case studies and in-depth treatment writeups documented by Dr. Siddharth Malhotra.</p>
                  
                  <div class="all-cases-tabs">
                    <button class="all-cases-tab ${activeFilter === 'all' ? 'active' : ''}" data-cat="all">All Cases (${allCases.length})</button>
                    <button class="all-cases-tab ${activeFilter === 'veneers' ? 'active' : ''}" data-cat="veneers">Veneers</button>
                    <button class="all-cases-tab ${activeFilter === 'whitening' ? 'active' : ''}" data-cat="whitening">Laser Whitening</button>
                    <button class="all-cases-tab ${activeFilter === 'aligners' ? 'active' : ''}" data-cat="aligners">Clear Aligners</button>
                    <button class="all-cases-tab ${activeFilter === 'implants' ? 'active' : ''}" data-cat="implants">Dental Implants</button>
                  </div>
                </div>

                <div class="all-cases-grid">
                  ${filtered.map((item, idx) => `
                    <div class="case-grid-card" data-id="${item.id}">
                      <div class="case-grid-thumb-wrap">
                        <img src="${item.fullImg || item.afterImg}" alt="${item.title}" class="case-grid-thumb" loading="lazy">
                        <span class="case-grid-badge">${item.procedure}</span>
                      </div>
                      <div class="case-grid-body">
                        <div class="case-grid-patient">${item.patientName || 'Patient'} • ${item.duration}</div>
                        <h3 class="case-grid-title">${item.title}</h3>
                        <p class="case-grid-summary">${item.problem}</p>
                        <button class="case-grid-read-btn" data-case-id="${item.id}">
                          Read Full Clinical Blog →
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;

            bindModalEvents();
        }

        function bindModalEvents() {
            const closeFn = () => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    overlay.remove();
                    document.body.style.overflow = '';
                }, 300);
            };

            overlay.querySelector('.all-cases-close')?.addEventListener('click', closeFn);
            overlay.addEventListener('click', e => { if (e.target === overlay) closeFn(); });

            overlay.querySelectorAll('.all-cases-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    activeFilter = tab.dataset.cat;
                    renderModalContent();
                });
            });

            overlay.querySelectorAll('.case-grid-read-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cId = btn.dataset.caseId;
                    const targetCase = allCases.find(c => c.id === cId);
                    if (targetCase) {
                        closeFn();
                        setTimeout(() => openBlogModal(targetCase), 200);
                    }
                });
            });
        }

        renderModalContent();
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => overlay.classList.add('visible'));

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.classList.remove('visible');
                setTimeout(() => overlay.remove(), 300);
                document.body.style.overflow = '';
                window.removeEventListener('keydown', escHandler);
            }
        };
        window.addEventListener('keydown', escHandler);
    }
}
