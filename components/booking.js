/* Booking Modal Component with Mandatory Doctor Visiting / Consultation Fee */
export function initBookingModal(services, clinic) {
  const overlay = document.getElementById('booking-modal-overlay');
  const closeBtn = document.getElementById('booking-modal-close');
  const content = document.getElementById('booking-modal-content');

  const CONSULTATION_FEE = 500; // ₹500 standard doctor consultation / slot reservation fee

  let s = { 
    step: 1, svc: null, date: null, time: null, 
    name: '', phone: '', email: '', notes: '',
    paymentId: null, paymentStatus: 'Pending', fee: CONSULTATION_FEE
  };

  function openModal(preselectId) {
    s = {
      step: 1, 
      svc: preselectId ? services.find(x => x.id === preselectId) : services[0],
      date: tmrw(), time: null, name: '', phone: '', email: '', notes: '',
      paymentId: null, paymentStatus: 'Pending', fee: CONSULTATION_FEE
    };
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
  }

  function closeModal() {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  function tmrw() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; }
  function getBookings() { try { return JSON.parse(localStorage.getItem('dentease_bookings') || '[]'); } catch { return []; } }
  function saveBooking(b) { const arr = getBookings(); arr.push(b); localStorage.setItem('dentease_bookings', JSON.stringify(arr)); window.dispatchEvent(new Event('storage')); }

  function getRazorpayKey() {
    return localStorage.getItem('dentease_razorpay_key') || 'rzp_test_1DP5mmOlF5G5ag';
  }

  function render() {
    content.innerHTML = `
      <div class="wiz-header">
        <span class="eyebrow-tag-sm">Instant Appointment</span>
        <h2 style="font-family:var(--f-display);font-size:var(--ts-2xl);font-weight:700">Book Your Visit</h2>
        <div class="step-bar">
          <div class="step-pip ${s.step >= 1 ? 'active' : ''}">1. Service</div>
          <div class="step-pip ${s.step >= 2 ? 'active' : ''}">2. Date & Time</div>
          <div class="step-pip ${s.step >= 3 ? 'active' : ''}">3. Details</div>
          <div class="step-pip ${s.step >= 4 ? 'active' : ''}">4. Fee & Pay</div>
        </div>
      </div>
      <div class="wiz-body mt-4">${stepHTML()}</div>
    `;
    bindStepEvents();
  }

  function stepHTML() {
    if (s.step === 1) return `
      <h3 style="font-weight:700;margin-bottom:.85rem">Select Dental Service</h3>
      <div class="svc-sel-grid">${services.map(x => `
        <div class="svc-sel ${s.svc?.id === x.id ? 'selected' : ''}" data-id="${x.id}">
          <strong>${x.name}</strong><span>${x.duration} · ${x.price}</span>
        </div>`).join('')}</div>
      <div style="text-align:right" class="mt-4"><button id="s1-next" class="btn-accent">Continue to Date & Slot →</button></div>`;

    if (s.step === 2) {
      const dates = next7(); const slots = ["09:30 AM", "11:00 AM", "12:30 PM", "02:30 PM", "04:00 PM", "05:30 PM"];
      const existing = getBookings();
      return `
        <h3 style="font-weight:700;margin-bottom:.5rem">Select Date & Time</h3>
        <p style="font-size:var(--ts-xs);color:var(--ink-soft);margin-bottom:1rem">Selected: <strong>${s.svc?.name}</strong> with Dr. Siddharth Malhotra</p>
        <label class="form-label">Choose Appointment Date</label>
        <div class="date-chips mt-2 mb-4">${dates.map(d => `
          <button class="date-chip ${s.date === d.iso ? 'sel' : ''}" data-d="${d.iso}">
            <span>${d.dayName}</span><strong>${d.dayNum} ${d.month}</strong>
          </button>`).join('')}</div>
        <label class="form-label">Available Time Slots</label>
        <div class="slot-chips mt-2">${slots.map(slot => {
        const booked = existing.some(b => b.date === s.date && b.time === slot && b.status !== 'Cancelled');
        return `<button class="slot-chip ${s.time === slot ? 'sel' : ''} ${booked ? 'off' : ''}" data-t="${slot}" ${booked ? 'disabled' : ''}>${slot}${booked ? ' ✕ Booked' : ''}</button>`;
      }).join('')}</div>
        <div style="display:flex;justify-content:space-between;gap:1rem" class="mt-4">
          <button id="s-back" class="btn-outline">← Back</button>
          <button id="s2-next" class="btn-accent" ${!s.time ? 'disabled' : ''}>Next: Patient Details →</button>
        </div>`;
    }

    if (s.step === 3) return `
      <h3 style="font-weight:700;margin-bottom:1rem">Patient Contact Information</h3>
      <form id="details-form" style="display:flex;flex-direction:column;gap:.85rem">
        <div><label class="form-label">Full Name *</label><input type="text" id="f-name" class="form-input" required placeholder="e.g. Priya Kapoor" value="${s.name}"></div>
        <div><label class="form-label">WhatsApp / Phone Number *</label><input type="tel" id="f-phone" class="form-input" required placeholder="+91 98765 43210" value="${s.phone}"></div>
        <div><label class="form-label">Email Address (Optional)</label><input type="email" id="f-email" class="form-input" placeholder="priya@example.com" value="${s.email}"></div>
        <div><label class="form-label">Chief Dental Concern / Notes</label><textarea id="f-notes" class="form-input" rows="2" placeholder="e.g. tooth sensitivity, interested in laser whitening">${s.notes}</textarea></div>
        <div style="display:flex;justify-content:space-between;gap:1rem" class="mt-2">
          <button type="button" id="s-back" class="btn-outline">← Back</button>
          <button type="submit" class="btn-accent">Proceed to Fee & Payment →</button>
        </div>
      </form>`;

    if (s.step === 4) return `
      <div>
        <h3 style="font-weight:700;margin-bottom:.35rem">Consultation Fee &amp; Slot Confirmation</h3>
        <p style="font-size:var(--ts-xs);color:var(--ink-soft);margin-bottom:1.25rem">To prevent no-shows and hold your exclusive slot with Dr. Siddharth, a nominal doctor visiting fee is required.</p>
        
        <!-- Summary Box -->
        <div class="summary-box" style="text-align:left;margin-bottom:1rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:.35rem">
            <span><strong>Service:</strong> ${s.svc.name}</span>
            <span style="color:var(--accent-deep);font-weight:600">${s.svc.price}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:.35rem">
            <span><strong>Date &amp; Time:</strong> ${s.date} at ${s.time}</span>
            <span>Dr. Siddharth Malhotra</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:.35rem">
            <span><strong>Patient:</strong> ${s.name}</span>
            <span>${s.phone}</span>
          </div>
        </div>

        <!-- Bill Breakdown Box -->
        <div style="background:linear-gradient(135deg, rgba(74, 191, 180, .1), rgba(232, 107, 74, .08));border:1.5px solid var(--accent-soft);border-radius:var(--r-md);padding:1rem 1.25rem;margin-bottom:1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:var(--ts-sm);margin-bottom:.5rem">
            <span>Doctor Visiting / Consultation Fee:</span>
            <strong style="font-size:var(--ts-base);color:var(--ink)">₹${s.fee}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:var(--ts-xs);color:var(--accent-deep);font-weight:600;padding-top:.4rem;border-top:1px dashed var(--border)">
            <span>✓ 100% Adjustable Against Treatment Bill:</span>
            <span>- ₹${s.fee}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:var(--ts-base);font-weight:700;margin-top:.75rem;padding-top:.5rem;border-top:1.5px solid var(--border)">
            <span>Total Payable Now:</span>
            <span style="color:var(--cta);font-size:var(--ts-xl)">₹${s.fee}</span>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:.75rem">
          <button id="pay-razorpay-btn" class="btn-accent w-full" style="justify-content:center;font-weight:700;font-size:var(--ts-sm);padding:.75rem 1rem">
            🔒 Pay ₹${s.fee} via Razorpay (UPI, GPay, Cards, Netbanking)
          </button>
          <button id="pay-demo-btn" class="btn-outline w-full" style="justify-content:center;font-size:var(--ts-xs);color:var(--ink-soft)">
            🧪 Test / Instant Simulation (Confirm without actual payment)
          </button>
        </div>

        <div style="margin-top:1rem;display:flex;justify-content:space-between">
          <button id="s-back" class="btn-ghost" style="font-size:var(--ts-xs)">← Back to Details</button>
          <span style="font-size:var(--ts-xs);color:var(--ink-faint);display:inline-flex;align-items:center;gap:.25rem">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            256-Bit SSL Encrypted
          </span>
        </div>
      </div>`;

    if (s.step === 5) {
      const gcal = gcalLink();
      return `
        <div style="text-align:center;padding:1.5rem 0">
          <div class="success-emoji">🎉</div>
          <h3 style="font-family:var(--f-display);font-size:var(--ts-2xl);font-weight:700;color:var(--accent-deep)">Appointment Confirmed &amp; Paid!</h3>
          <p style="font-size:var(--ts-sm);color:var(--ink-soft);margin:.5rem 0 1rem">Booked with Dr. Siddharth Malhotra for <strong>${s.date} at ${s.time}</strong>.</p>
          
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);padding:.85rem 1.25rem;max-width:380px;margin:0 auto 1.5rem;text-align:left;font-size:var(--ts-xs)">
            <div style="display:flex;justify-content:space-between;margin-bottom:.35rem">
              <span style="color:var(--ink-soft)">Payment Status:</span>
              <span class="pill-status confirmed">Paid ₹${s.fee}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:.35rem">
              <span style="color:var(--ink-soft)">Payment Transaction ID:</span>
              <strong style="font-family:monospace">${s.paymentId || 'pay_demo_success'}</strong>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:var(--ink-soft)">Clinic Note:</span>
              <span style="color:var(--accent-deep)">₹${s.fee} adjusted in clinic bill</span>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:.75rem;max-width:360px;margin:0 auto">
            <a href="${gcal}" target="_blank" rel="noopener" class="btn-outline w-full" style="justify-content:center">📅 Add to Google Calendar</a>
            <button id="done-btn" class="btn-accent w-full">Done</button>
          </div>
        </div>`;
    }
  }

  function handleRazorpayPayment() {
    const rzpKey = getRazorpayKey();

    // Check if Razorpay script is loaded
    if (typeof window.Razorpay === 'undefined') {
      alert('Razorpay SDK is loading. If you are offline, you can use the Test / Instant Simulation button!');
      return;
    }

    const options = {
      key: rzpKey,
      amount: s.fee * 100, // Amount in paise (50000 = ₹500)
      currency: "INR",
      name: "DentEase Dental Clinic",
      description: `Doctor Visiting Deposit — ${s.svc.name}`,
      image: "https://cdn-icons-png.flaticon.com/512/2785/2785482.png",
      prefill: {
        name: s.name,
        contact: s.phone,
        email: s.email || "patient@denteaseclinic.in"
      },
      notes: {
        service: s.svc.name,
        appointment_date: s.date,
        appointment_time: s.time,
        doctor: "Dr. Siddharth Malhotra"
      },
      theme: {
        color: "#4ABFB4"
      },
      handler: function (response) {
        // Payment successful callback
        completeBooking(response.razorpay_payment_id || ('pay_' + Date.now()));
      },
      modal: {
        ondismiss: function () {
          console.log('[DentEase] Razorpay modal dismissed');
        }
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        alert('Payment failed: ' + (response.error.description || 'Unknown error') + '. Please try again or use the test simulation.');
      });
      rzpInstance.open();
    } catch (err) {
      console.warn('[DentEase] Razorpay init error:', err);
      // Fallback: prompt or simulate
      if (confirm('Razorpay test key needs setup. Would you like to complete this test booking with Instant Simulation?')) {
        completeBooking('pay_sim_' + Math.random().toString(36).substring(2, 9));
      }
    }
  }

  function completeBooking(paymentId) {
    s.paymentId = paymentId;
    s.paymentStatus = 'Paid';
    saveBooking({
      id: 'bk-' + Date.now(),
      service: s.svc.name,
      serviceId: s.svc.id,
      date: s.date,
      time: s.time,
      name: s.name,
      phone: s.phone,
      email: s.email,
      notes: s.notes,
      amountPaid: '₹' + s.fee,
      paymentId: s.paymentId,
      status: 'Paid & Confirmed',
      createdAt: new Date().toISOString()
    });
    s.step = 5;
    render();
  }

  function bindStepEvents() {
    if (s.step === 1) {
      content.querySelectorAll('.svc-sel').forEach(el => el.addEventListener('click', () => { s.svc = services.find(x => x.id === el.dataset.id); render(); }));
      content.querySelector('#s1-next')?.addEventListener('click', () => { s.step = 2; render(); });
    }
    if (s.step === 2) {
      content.querySelectorAll('.date-chip').forEach(el => el.addEventListener('click', () => { s.date = el.dataset.d; s.time = null; render(); }));
      content.querySelectorAll('.slot-chip:not(.off)').forEach(el => el.addEventListener('click', () => { s.time = el.dataset.t; render(); }));
      content.querySelector('#s-back')?.addEventListener('click', () => { s.step = 1; render(); });
      content.querySelector('#s2-next')?.addEventListener('click', () => { if (s.time) { s.step = 3; render(); } });
    }
    if (s.step === 3) {
      content.querySelector('#s-back')?.addEventListener('click', () => { s.step = 2; render(); });
      content.querySelector('#details-form')?.addEventListener('submit', e => {
        e.preventDefault();
        s.name = document.getElementById('f-name').value.trim();
        s.phone = document.getElementById('f-phone').value.trim();
        s.email = document.getElementById('f-email').value.trim();
        s.notes = document.getElementById('f-notes').value.trim();
        s.step = 4; render();
      });
    }
    if (s.step === 4) {
      content.querySelector('#s-back')?.addEventListener('click', () => { s.step = 3; render(); });
      content.querySelector('#pay-razorpay-btn')?.addEventListener('click', handleRazorpayPayment);
      content.querySelector('#pay-demo-btn')?.addEventListener('click', () => {
        completeBooking('pay_test_' + Math.random().toString(36).substring(2, 9));
      });
    }
    if (s.step === 5) {
      content.querySelector('#done-btn')?.addEventListener('click', closeModal);
    }
  }

  function next7() {
    const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: 7 }, (_, i) => { const dt = new Date(); dt.setDate(dt.getDate() + i + 1); return { iso: dt.toISOString().split('T')[0], dayName: d[dt.getDay()], dayNum: dt.getDate(), month: m[dt.getMonth()] }; });
  }

  function gcalLink() {
    const t = encodeURIComponent(`DentEase — ${s.svc.name}`);
    const det = encodeURIComponent(`Patient: ${s.name}\nPhone: ${s.phone}\nDeposit Paid: ₹${s.fee}\nRef: ${s.paymentId}`);
    const loc = encodeURIComponent('M-45, GK-II, New Delhi 110048');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${t}&details=${det}&location=${loc}`;
  }

  document.querySelectorAll('#header-book-btn, #hero-book-btn, #mobile-bar-book-btn, #mobile-drawer-book-btn').forEach(btn => btn.addEventListener('click', () => openModal()));
  document.addEventListener('click', e => { const b = e.target.closest('.book-service-btn'); if (b) openModal(b.dataset.service); });

  return { openModal };
}
