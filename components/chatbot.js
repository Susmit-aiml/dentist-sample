/* AI Chatbot Component — v4: Bigger branding, smarter matching, typing indicator */
export function initChatbot(kb, openBookingFn, openAdminFn) {
    const toggle = document.getElementById('ai-chat-toggle-btn');
    const panel = document.getElementById('ai-chat-panel');
    const fabContent = toggle?.querySelector('.chat-fab-content');
    const closeIco = toggle?.querySelector('.chat-ico-close');
    const tooltip = document.getElementById('chat-tooltip');
    const tooltipClose = document.getElementById('chat-tooltip-close');
    if (!toggle || !panel || !kb) return;

    let isOpen = false;
    let history = [
        { sender: 'bot', text: getRandomResponse(kb.intents[0]), qr: kb.intents[0].quickReplies }
    ];

    // Auto-show tooltip after 3 seconds
    setTimeout(() => {
        if (tooltip && !isOpen) tooltip.classList.add('visible');
    }, 3000);

    // Dismiss tooltip
    tooltipClose?.addEventListener('click', (e) => {
        e.stopPropagation();
        tooltip?.classList.remove('visible');
    });

    function getRandomResponse(intent) {
        const responses = intent.responses || [intent.response];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    function render() {
        panel.innerHTML = `
      <div class="chat-hdr">
        <div class="chat-hdr-avatar">🦷</div>
        <div class="chat-hdr-info">
          <div class="t-name">DentEase AI Assistant</div>
          <div class="t-status">● Online · Instant Help</div>
        </div>
      </div>
      <div class="chat-body" id="chat-body">
        ${history.map(m => `
          <div class="chat-msg ${m.sender}">
            ${m.sender === 'bot' ? '<div class="msg-avatar">🦷</div>' : ''}
            <div class="msg-content">
              <div class="msg-bubble">${formatMessage(m.text)}</div>
              ${m.qr && m.qr.length > 0 ? `<div class="qr-group">${m.qr.map(q => `<button class="qr-btn" data-action="${q.action}">${q.text}</button>`).join('')}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <form id="chat-form" class="chat-input-row">
        <input type="text" id="chat-inp" class="chat-input" placeholder="Ask about services, pricing, booking..." autocomplete="off">
        <button type="submit" class="chat-send">➔</button>
      </form>
    `;
        const body = document.getElementById('chat-body');
        if (body) body.scrollTop = body.scrollHeight;
        bindEvents();
    }

    function formatMessage(text) {
        // Convert markdown-like formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function showTypingIndicator() {
        const body = document.getElementById('chat-body');
        if (!body) return;
        const typing = document.createElement('div');
        typing.className = 'chat-msg bot typing-msg';
        typing.innerHTML = `
          <div class="msg-avatar">🦷</div>
          <div class="msg-content">
            <div class="msg-bubble typing-bubble">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        `;
        body.appendChild(typing);
        body.scrollTop = body.scrollHeight;
    }

    function removeTypingIndicator() {
        document.querySelector('.typing-msg')?.remove();
    }

    function bindEvents() {
        document.getElementById('chat-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const inp = document.getElementById('chat-inp');
            const val = inp.value.trim();
            if (!val) return;
            history.push({ sender: 'user', text: val });
            inp.value = '';
            render();
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                const reply = match(val);
                history.push({ sender: 'bot', text: getRandomResponse(reply), qr: reply.quickReplies });
                render();
            }, 600 + Math.random() * 500);
        });

        panel.querySelectorAll('.qr-btn').forEach(btn => {
            btn.addEventListener('click', () => doAction(btn.dataset.action, btn.textContent));
        });
    }

    function doAction(a, label) {
        // Add user message for quick reply
        if (label) {
            history.push({ sender: 'user', text: label });
        }

        if (a === 'open_booking') {
            openBookingFn?.();
        } else if (a === 'open_admin') {
            openAdminFn?.();
        } else if (a === 'show_services' || a === 'scroll_services') {
            document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
        } else if (a === 'show_hours' || a === 'scroll_location') {
            document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' });
        } else if (a === 'scroll_results') {
            document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        } else if (a === 'scroll_reviews') {
            document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
        } else if (a === 'scroll_doctor') {
            document.getElementById('doctor')?.scrollIntoView({ behavior: 'smooth' });
        } else if (a === 'call_clinic') {
            window.location.href = 'tel:+919876543210';
        } else if (a === 'show_pricing') {
            // Trigger pricing intent response
            const pricingIntent = kb.intents.find(i => i.intent === 'pricing_insurance');
            if (pricingIntent) {
                history.push({ sender: 'bot', text: getRandomResponse(pricingIntent), qr: pricingIntent.quickReplies });
                render();
                return;
            }
        }
        render();
    }

    function match(text) {
        const lower = text.toLowerCase();
        // Score-based matching — intent with most keyword matches wins
        let bestMatch = null;
        let bestScore = 0;

        for (const item of kb.intents) {
            let score = 0;
            for (const k of item.keywords) {
                if (lower.includes(k)) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }

        if (bestMatch && bestScore > 0) return bestMatch;

        // Fallback
        return kb.fallback;
    }

    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        panel.classList.toggle('hidden', !isOpen);
        panel.setAttribute('aria-hidden', String(!isOpen));
        if (fabContent) fabContent.classList.toggle('hidden', isOpen);
        if (closeIco) closeIco.classList.toggle('hidden', !isOpen);
        tooltip?.classList.remove('visible');
        if (isOpen) render();
    });
}
