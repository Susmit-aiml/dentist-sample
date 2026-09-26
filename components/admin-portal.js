/* Admin / Receptionist Dashboard — v4: PIN-Protected with Blogs & Reviews Management */
export function initAdminPortal(defaultCases = [], defaultReviews = []) {
  const overlay = document.getElementById('admin-modal-overlay');
  const closeBtn = document.getElementById('admin-modal-close');
  const content = document.getElementById('admin-modal-content');
  let currentSection = 'bookings'; // 'bookings' | 'blogs' | 'reviews'
  let filter = 'all';
  let authenticated = false;

  const DEFAULT_PIN = '1234';

  function getPin() {
    return localStorage.getItem('dentease_admin_pin') || DEFAULT_PIN;
  }

  function openPortal() {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (authenticated) {
      renderDashboard();
    } else {
      renderPinScreen();
    }
  }

  function closePortal() {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closePortal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closePortal(); });

  // Only keyboard shortcut and hash to access
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') { e.preventDefault(); openPortal(); }
  });

  // Hash-based access
  if (window.location.hash === '#admin') {
    setTimeout(openPortal, 500);
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') openPortal();
  });

  window.addEventListener('storage', () => { if (!overlay.classList.contains('hidden') && authenticated) renderDashboard(); });

  function renderPinScreen() {
    content.innerHTML = `
      <div class="pin-screen">
        <div class="pin-lock-icon">🔐</div>
        <h2 class="pin-title">Staff Portal</h2>
        <p class="pin-subtitle">Enter 4-digit PIN to access clinic dashboard</p>
        <div class="pin-dots" id="pin-dots">
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
        </div>
        <p id="pin-error" class="pin-error hidden">Incorrect PIN. Try again.</p>
        <div class="pin-grid" id="pin-grid">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => 
            k === '' ? '<div></div>' :
            `<button class="pin-key" data-key="${k}">${k}</button>`
          ).join('')}
        </div>
        <p class="pin-hint">Default PIN: 1234</p>
      </div>
    `;

    let entered = '';
    const dots = content.querySelectorAll('.pin-dot');
    const errorEl = content.querySelector('#pin-error');

    content.querySelectorAll('.pin-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (key === '⌫') {
          entered = entered.slice(0, -1);
        } else if (entered.length < 4) {
          entered += key;
        }

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('filled', i < entered.length));
        errorEl.classList.add('hidden');

        if (entered.length === 4) {
          if (entered === getPin()) {
            authenticated = true;
            renderDashboard();
          } else {
            entered = '';
            dots.forEach(d => d.classList.remove('filled'));
            errorEl.classList.remove('hidden');
            content.querySelector('.pin-dots')?.classList.add('shake');
            setTimeout(() => content.querySelector('.pin-dots')?.classList.remove('shake'), 500);
          }
        }
      });
    });
  }

  function getBookings() { try { return JSON.parse(localStorage.getItem('dentease_bookings') || '[]'); } catch { return []; } }
  function getStoredCases() { try { return JSON.parse(localStorage.getItem('dentease_cases')) || defaultCases; } catch { return defaultCases; } }
  function getStoredReviews() { try { return JSON.parse(localStorage.getItem('dentease_reviews')) || defaultReviews; } catch { return defaultReviews; } }

  function renderDashboard() {
    const all = getBookings();
    const today = new Date().toISOString().split('T')[0];
    const todayB = all.filter(b => b.date === today);
    const upB = all.filter(b => b.date > today);
    const cases = getStoredCases();
    const reviews = getStoredReviews();

    content.innerHTML = `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem">
          <div>
            <span class="eyebrow-tag-sm">Staff Management</span>
            <h2 style="font-family:var(--f-display);font-size:var(--ts-2xl);font-weight:700">DentEase Reception &amp; CMS</h2>
            <p style="font-size:var(--ts-xs);color:var(--ink-soft);margin-top:.2rem">Manage patient appointments, clinical case blogs, and patient testimonials.</p>
          </div>
          <div class="admin-actions">
            <button id="config-rzp" class="btn-outline btn-sm" style="font-size:var(--ts-xs)">💳 Razorpay Key</button>
            <button id="change-pin" class="btn-ghost" style="font-size:var(--ts-xs)">🔑 Change PIN</button>
            <button id="logout-admin" class="btn-ghost" style="color:var(--cta);font-size:var(--ts-xs)">🔒 Lock</button>
          </div>
        </div>

        <!-- Main Section Switcher -->
        <div class="admin-section-nav mt-3">
          <button class="admin-nav-btn ${currentSection === 'bookings' ? 'active' : ''}" data-sec="bookings">
            📅 Bookings (${all.length})
          </button>
          <button class="admin-nav-btn ${currentSection === 'blogs' ? 'active' : ''}" data-sec="blogs">
            📝 Case Studies &amp; Blogs (${cases.length})
          </button>
          <button class="admin-nav-btn ${currentSection === 'reviews' ? 'active' : ''}" data-sec="reviews">
            ⭐ Patient Reviews (${reviews.length})
          </button>
        </div>

        <div id="admin-sec-view" class="mt-4">
          ${currentSection === 'bookings' ? renderBookingsHTML(all, todayB, upB) : ''}
          ${currentSection === 'blogs' ? renderBlogsHTML(cases) : ''}
          ${currentSection === 'reviews' ? renderReviewsHTML(reviews) : ''}
        </div>
      </div>
    `;

    bindDashboardEvents();
  }

  function renderBookingsHTML(all, todayB, upB) {
    const today = new Date().toISOString().split('T')[0];
    const shown = filter === 'today' ? todayB : filter === 'upcoming' ? upB : all;

    return `
      <div class="admin-stats">
        <div class="admin-stat"><div class="stat-val" style="color:var(--accent-deep)">${all.length}</div><div class="stat-lbl">Total Bookings</div></div>
        <div class="admin-stat"><div class="stat-val" style="color:var(--cta)">${todayB.length}</div><div class="stat-lbl">Today's Visits</div></div>
        <div class="admin-stat"><div class="stat-val">${upB.length}</div><div class="stat-lbl">Upcoming</div></div>
      </div>

      <div class="admin-bar">
        <div class="admin-tabs">
          <button class="admin-tab ${filter === 'all' ? 'active' : ''}" data-f="all">All (${all.length})</button>
          <button class="admin-tab ${filter === 'today' ? 'active' : ''}" data-f="today">Today (${todayB.length})</button>
          <button class="admin-tab ${filter === 'upcoming' ? 'active' : ''}" data-f="upcoming">Upcoming (${upB.length})</button>
        </div>
        <div class="admin-actions">
          <button id="exp-csv" class="btn-outline btn-sm" ${all.length === 0 ? 'disabled' : ''}>📥 Export CSV</button>
          <button id="clr-demo" class="btn-ghost" style="color:var(--cta)" title="Clear all bookings">🗑️</button>
        </div>
      </div>

      <div class="admin-tbl-wrap">
        ${shown.length === 0 ? '<p style="text-align:center;padding:2.5rem 1rem;color:var(--ink-faint)">No appointments found in this view. Bookings made online appear here in real time!</p>' : `
        <table class="admin-tbl">
          <thead><tr><th>Patient</th><th>Service</th><th>Date &amp; Time</th><th>Phone</th><th>Deposit / Fee</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${shown.map(b => `
            <tr>
              <td style="font-weight:700">${b.name}</td>
              <td>${b.service}</td>
              <td style="color:var(--accent-deep);font-weight:600">${b.date} @ ${b.time}</td>
              <td><a href="tel:${b.phone}" style="color:inherit">${b.phone}</a></td>
              <td>
                <span style="font-weight:700;color:var(--ink)">${b.amountPaid || '₹500'}</span>
                <div style="font-family:monospace;font-size:10px;color:var(--ink-faint)">${b.paymentId ? b.paymentId.substring(0, 16) : 'Verified Deposit'}</div>
              </td>
              <td><span class="pill-status ${(b.status || 'Confirmed').toLowerCase()}">${b.status || 'Paid & Confirmed'}</span></td>
              <td><button class="cancel-btn btn-ghost" style="color:var(--cta)" data-id="${b.id}">Cancel</button></td>
            </tr>`).join('')}</tbody>
        </table>`}
      </div>
    `;
  }

  function renderBlogsHTML(cases) {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
        <div>
          <h3 style="font-size:var(--ts-lg);font-weight:700">Clinical Case Studies &amp; Blogs</h3>
          <p style="font-size:var(--ts-xs);color:var(--ink-soft)">Add, edit, or publish patient transformation stories.</p>
        </div>
        <button id="add-case-btn" class="btn-accent btn-sm">➕ Add New Case Study</button>
      </div>

      <div id="new-case-form-wrap" class="hidden" style="background:var(--bg);padding:1.5rem;border-radius:var(--r-lg);border:1.5px solid var(--accent-soft);margin-bottom:1.5rem">
        <h4 style="font-weight:700;margin-bottom:.75rem">Publish New Clinical Case / Blog</h4>
        <form id="new-case-form" style="display:grid;grid-template-columns:1fr 1fr;gap:.85rem">
          <div><label class="form-label">Case Title *</label><input type="text" id="nc-title" class="form-input" required placeholder="e.g. Diastema Closure &amp; Veneers"></div>
          <div><label class="form-label">Patient Name &amp; Age *</label><input type="text" id="nc-patient" class="form-input" required placeholder="e.g. Sunita, 29"></div>
          <div><label class="form-label">Procedure Category *</label>
            <select id="nc-category" class="form-input">
              <option value="veneers">Porcelain Veneers</option>
              <option value="whitening">Laser Whitening</option>
              <option value="aligners">Clear Aligners</option>
              <option value="implants">Dental Implants</option>
            </select>
          </div>
          <div><label class="form-label">Treatment Duration *</label><input type="text" id="nc-duration" class="form-input" required placeholder="e.g. 2 Sessions (10 days)"></div>
          <div style="grid-column:span 2"><label class="form-label">Patient Complaint / Problem *</label><input type="text" id="nc-problem" class="form-input" required placeholder="e.g. Gaps between front teeth affecting smile"></div>
          <div><label class="form-label">Before Image URL *</label><input type="text" id="nc-before" class="form-input" required placeholder="./cases/veneers-before.png or URL"></div>
          <div><label class="form-label">After Image URL *</label><input type="text" id="nc-after" class="form-input" required placeholder="./cases/veneers-after.png or URL"></div>
          <div style="grid-column:span 2"><label class="form-label">Full Clinical Story Background</label><textarea id="nc-bg" class="form-input" rows="2" placeholder="Patient history and complaints..."></textarea></div>
          <div style="grid-column:span 2"><label class="form-label">Clinical Diagnosis &amp; Procedure Details</label><textarea id="nc-proc" class="form-input" rows="3" placeholder="Diagnostic findings, 3D scans, and step-by-step procedure..."></textarea></div>
          <div style="grid-column:span 2"><label class="form-label">Doctor's Clinical Note</label><textarea id="nc-note" class="form-input" rows="2" placeholder="Insights from Dr. Siddharth Malhotra..."></textarea></div>
          <div style="grid-column:span 2;display:flex;justify-content:flex-end;gap:.5rem;margin-top:.5rem">
            <button type="button" id="cancel-case-btn" class="btn-outline btn-sm">Cancel</button>
            <button type="submit" class="btn-accent btn-sm">Save &amp; Publish Blog</button>
          </div>
        </form>
      </div>

      <div style="display:flex;flex-direction:column;gap:1rem">
        ${cases.map((c, i) => `
          <div style="display:flex;gap:1rem;background:var(--bg);padding:1rem;border-radius:var(--r-md);border:1px solid var(--border);align-items:center">
            <img src="${c.fullImg || c.afterImg}" alt="${c.title}" style="width:75px;height:55px;object-fit:cover;border-radius:var(--r-sm);background:#111">
            <div style="flex:1">
              <div style="font-weight:700;font-size:var(--ts-sm)">${c.title}</div>
              <div style="font-size:var(--ts-xs);color:var(--ink-soft)">${c.patientName} • ${c.procedure} (${c.duration})</div>
            </div>
            <button class="del-case-btn btn-ghost" data-id="${c.id}" style="color:var(--cta);font-size:var(--ts-xs)">Delete</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderReviewsHTML(reviews) {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">
        <div>
          <h3 style="font-size:var(--ts-lg);font-weight:700">Patient Testimonials &amp; Reviews</h3>
          <p style="font-size:var(--ts-xs);color:var(--ink-soft)">Manage verified Google reviews displayed on the website.</p>
        </div>
        <button id="add-rev-btn" class="btn-accent btn-sm">➕ Add New Review</button>
      </div>

      <div id="new-rev-form-wrap" class="hidden" style="background:var(--bg);padding:1.5rem;border-radius:var(--r-lg);border:1.5px solid var(--accent-soft);margin-bottom:1.5rem">
        <h4 style="font-weight:700;margin-bottom:.75rem">Add Verified Review</h4>
        <form id="new-rev-form" style="display:flex;flex-direction:column;gap:.75rem">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
            <div><label class="form-label">Patient Name *</label><input type="text" id="nr-name" class="form-input" required placeholder="e.g. Pooja Sharma"></div>
            <div><label class="form-label">Rating (Stars) *</label>
              <select id="nr-rating" class="form-input">
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              </select>
            </div>
          </div>
          <div><label class="form-label">Review Text *</label><textarea id="nr-text" class="form-input" rows="3" required placeholder="Write the patient feedback..."></textarea></div>
          <div style="display:flex;justify-content:flex-end;gap:.5rem">
            <button type="button" id="cancel-rev-btn" class="btn-outline btn-sm">Cancel</button>
            <button type="submit" class="btn-accent btn-sm">Save Review</button>
          </div>
        </form>
      </div>

      <div style="display:flex;flex-direction:column;gap:.85rem">
        ${reviews.map((r, i) => `
          <div style="background:var(--bg);padding:1rem;border-radius:var(--r-md);border:1px solid var(--border);display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
            <div>
              <div style="font-weight:700;font-size:var(--ts-sm)">${r.name} · ${'★'.repeat(r.rating || 5)}</div>
              <p style="font-size:var(--ts-xs);color:var(--ink-soft);margin-top:.25rem">"${r.text}"</p>
            </div>
            <button class="del-rev-btn btn-ghost" data-id="${r.id}" style="color:var(--cta);font-size:var(--ts-xs)">Delete</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  function bindDashboardEvents() {
    // Navigation switcher
    content.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSection = btn.dataset.sec;
        renderDashboard();
      });
    });

    // Bookings tab filter
    content.querySelectorAll('.admin-tab').forEach(t => t.addEventListener('click', () => { 
      filter = t.dataset.f; 
      renderDashboard(); 
    }));

    // Cancel booking
    content.querySelectorAll('.cancel-btn').forEach(b => b.addEventListener('click', () => {
      let arr = getBookings(); 
      arr = arr.map(x => x.id === b.dataset.id ? { ...x, status: 'Cancelled' } : x);
      localStorage.setItem('dentease_bookings', JSON.stringify(arr)); 
      renderDashboard();
    }));

    // Clear demo
    content.querySelector('#clr-demo')?.addEventListener('click', () => { 
      if (confirm('Clear all booking records?')) { 
        localStorage.removeItem('dentease_bookings'); 
        renderDashboard(); 
      } 
    });

    content.querySelector('#exp-csv')?.addEventListener('click', exportCSV);
    content.querySelector('#logout-admin')?.addEventListener('click', () => { 
      authenticated = false; 
      renderPinScreen(); 
    });

    content.querySelector('#change-pin')?.addEventListener('click', () => {
      const newPin = prompt('Enter new 4-digit PIN:');
      if (newPin && /^\d{4}$/.test(newPin)) {
        localStorage.setItem('dentease_admin_pin', newPin);
        alert('PIN changed successfully!');
      } else if (newPin) {
        alert('PIN must be exactly 4 digits.');
      }
    });

    content.querySelector('#config-rzp')?.addEventListener('click', () => {
      const currentKey = localStorage.getItem('dentease_razorpay_key') || 'rzp_test_1DP5mmOlF5G5ag';
      const newKey = prompt('Enter your Razorpay Key ID (rzp_test_... or rzp_live_...):', currentKey);
      if (newKey !== null && newKey.trim() !== '') {
        localStorage.setItem('dentease_razorpay_key', newKey.trim());
        alert('Razorpay Key ID saved! The booking modal will now use this key.');
      }
    });

    // Cases & Blogs Handlers
    const addCaseBtn = content.querySelector('#add-case-btn');
    const caseFormWrap = content.querySelector('#new-case-form-wrap');
    addCaseBtn?.addEventListener('click', () => caseFormWrap?.classList.toggle('hidden'));
    content.querySelector('#cancel-case-btn')?.addEventListener('click', () => caseFormWrap?.classList.add('hidden'));

    content.querySelector('#new-case-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentCases = getStoredCases();
      const newCase = {
        id: 'case-' + Date.now(),
        title: content.querySelector('#nc-title').value.trim(),
        patientName: content.querySelector('#nc-patient').value.trim(),
        category: content.querySelector('#nc-category').value,
        procedure: content.querySelector('#nc-category').options[content.querySelector('#nc-category').selectedIndex].text,
        duration: content.querySelector('#nc-duration').value.trim(),
        problem: content.querySelector('#nc-problem').value.trim(),
        description: content.querySelector('#nc-problem').value.trim(),
        beforeImg: content.querySelector('#nc-before').value.trim() || './cases/veneers-before.png',
        afterImg: content.querySelector('#nc-after').value.trim() || './cases/veneers-after.png',
        blogContent: {
          heading: content.querySelector('#nc-title').value.trim(),
          background: content.querySelector('#nc-bg').value.trim() || 'Patient presented with aesthetic and functional concerns.',
          diagnosis: 'Clinical examination and digital imaging confirmed aesthetic indications for restorative treatment.',
          treatmentPlan: 'Personalized treatment protocol formulated by Dr. Siddharth Malhotra.',
          procedure: content.querySelector('#nc-proc').value.trim() || 'Treatment was completed comfortably under local anaesthetic.',
          recovery: 'Patient experienced minimal downtime and complete restoration of dental function.',
          doctorNote: content.querySelector('#nc-note').value.trim() || 'A beautiful, stable result achieved with minimally invasive modern techniques. — Dr. Siddharth Malhotra'
        }
      };

      currentCases.unshift(newCase);
      localStorage.setItem('dentease_cases', JSON.stringify(currentCases));
      alert('New case study published! It is now live on the website.');
      window.location.reload();
    });

    content.querySelectorAll('.del-case-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this clinical case?')) {
          const currentCases = getStoredCases().filter(c => c.id !== btn.dataset.id);
          localStorage.setItem('dentease_cases', JSON.stringify(currentCases));
          renderDashboard();
          window.location.reload();
        }
      });
    });

    // Reviews Handlers
    const addRevBtn = content.querySelector('#add-rev-btn');
    const revFormWrap = content.querySelector('#new-rev-form-wrap');
    addRevBtn?.addEventListener('click', () => revFormWrap?.classList.toggle('hidden'));
    content.querySelector('#cancel-rev-btn')?.addEventListener('click', () => revFormWrap?.classList.add('hidden'));

    content.querySelector('#new-rev-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentReviews = getStoredReviews();
      const newRev = {
        id: Date.now(),
        name: content.querySelector('#nr-name').value.trim(),
        role: 'Verified Patient',
        rating: parseInt(content.querySelector('#nr-rating').value, 10),
        text: content.querySelector('#nr-text').value.trim(),
        verified: true,
        source: 'Google Review'
      };

      currentReviews.unshift(newRev);
      localStorage.setItem('dentease_reviews', JSON.stringify(currentReviews));
      alert('Review added and live on the website!');
      window.location.reload();
    });

    content.querySelectorAll('.del-rev-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this review?')) {
          const currentReviews = getStoredReviews().filter(r => String(r.id) !== btn.dataset.id);
          localStorage.setItem('dentease_reviews', JSON.stringify(currentReviews));
          renderDashboard();
          window.location.reload();
        }
      });
    });
  }

  function exportCSV() {
    const b = getBookings(); if (!b.length) return;
    const hdr = ["ID", "Name", "Service", "Date", "Time", "Phone", "Email", "Notes", "Status", "Created"];
    const rows = b.map(x => [x.id, `"${x.name}"`, `"${x.service}"`, x.date, x.time, `"${x.phone}"`, `"${x.email || ''}"`, `"${(x.notes || '').replace(/"/g, '""')}"`, x.status || 'Confirmed', x.createdAt]);
    const csv = "data:text/csv;charset=utf-8," + [hdr.join(","), ...rows.map(r => r.join(","))].join("\n");
    const a = document.createElement("a"); a.href = encodeURI(csv); a.download = `dentease_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  return { openPortal };
}
