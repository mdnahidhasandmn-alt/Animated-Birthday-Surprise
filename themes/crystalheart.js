// ==========================================================================
// Crystal Heart Theme Module — Pink & Gold Gift Box + Real Bangladeshi Taka (৳) Note Photos
// ==========================================================================
function initCrystalheartTheme(config) {
    window.SURPRISE_CONFIG = config;
    startCrystalheartAnimation(config);
    initCrystalHeartBoxExperience(config);
}

function toBanglaDigits(num) {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, d => banglaDigits[d]);
}

function parseTakaNotes(config) {
    const notes = [];
    const n1000 = Math.max(0, parseInt(config.tk1000 !== undefined ? config.tk1000 : 2, 10) || 0);
    const n500 = Math.max(0, parseInt(config.tk500 !== undefined ? config.tk500 : 2, 10) || 0);
    const n200 = Math.max(0, parseInt(config.tk200 !== undefined ? config.tk200 : 1, 10) || 0);
    const n100 = Math.max(0, parseInt(config.tk100 !== undefined ? config.tk100 : 1, 10) || 0);

    if (n1000 > 0) {
        notes.push({
            amount: 1000,
            count: n1000,
            bnVal: '১০০০',
            label: '১০০০ টাকা (1000 BDT)',
            img: '/assets/tk1000.jpg'
        });
    }
    if (n500 > 0) {
        notes.push({
            amount: 500,
            count: n500,
            bnVal: '৫০০',
            label: '৫০০ টাকা (500 BDT)',
            img: '/assets/tk500.jpg'
        });
    }
    if (n200 > 0) {
        notes.push({
            amount: 200,
            count: n200,
            bnVal: '২০০',
            label: '২০০ টাকা (200 BDT)',
            img: '/assets/tk200.png'
        });
    }
    if (n100 > 0) {
        notes.push({
            amount: 100,
            count: n100,
            bnVal: '১০০',
            label: '১০০ টাকা (100 BDT)',
            img: '/assets/tk100.jpg'
        });
    }

    if (notes.length === 0) {
        notes.push({
            amount: 1000,
            count: 1,
            bnVal: '১০০০',
            label: '১০০০ টাকা (1000 BDT)',
            img: '/assets/tk1000.jpg'
        });
    }

    return notes;
}

function initCrystalHeartBoxExperience(config) {
    const wishContainer = document.getElementById('wishContainer');
    const mainContainer = wishContainer ? wishContainer.querySelector('.container') : null;
    const defaultGiftBox = document.getElementById('giftBoxContainer');
    const memoryCard = document.getElementById('memoryCard');

    if (!mainContainer) return;

    if (defaultGiftBox) defaultGiftBox.style.display = 'none';
    if (memoryCard) memoryCard.classList.add('hidden');

    const oldStage = document.getElementById('chSurpriseStage');
    if (oldStage) oldStage.remove();

    const notes = parseTakaNotes(config);
    const totalTaka = notes.reduce((sum, n) => sum + (n.amount * n.count), 0);
    const totalTakaBn = toBanglaDigits(totalTaka.toLocaleString('en-IN'));
    const tkTitle = config.chTkTitle || 'স্পেশাল গিফট বক্স 💸';

    // Flying Taka notes burst out of the gift box when tapped
    const flyItemsHtml = [];
    notes.forEach((n, idx) => {
        const copies = Math.min(n.count, 4);
        for (let c = 0; c < copies; c++) {
            const i = flyItemsHtml.length;
            const angle = -65 + ((i * 34) % 135);
            const tx = (i % 2 === 0 ? -1 : 1) * (60 + (i * 28) % 130);
            const ty = -110 - ((i * 25) % 95);
            flyItemsHtml.push(`
                <div class="ch-fly-item ch-fly-taka-img" style="--tx: ${tx}px; --ty: ${ty}px; --rot: ${angle * 0.35}deg; --delay: ${(idx * 0.08 + c * 0.07).toFixed(2)}s;">
                    <img src="${n.img}" alt="৳${n.bnVal}">
                </div>
            `);
        }
    });

    // Build Real Banknote Photo Cards HTML
    const notesCardsHtml = notes.map((n, i) => `
        <div class="bdt-photo-note-card" data-amount="${n.amount}" style="animation-delay: ${(0.12 + i * 0.12).toFixed(2)}s" title="Tap for Salami Sparkle!">
            <div class="bdt-photo-img-wrap">
                <img src="${n.img}" alt="${n.label}" class="bdt-real-note-img">
                <span class="bdt-photo-qty-badge">×${n.count} Note${n.count > 1 ? 's' : ''}</span>
            </div>
            <div class="bdt-photo-note-footer">
                <span class="bdt-photo-note-title">💵 ${n.label}</span>
                <span class="bdt-photo-note-subtotal">৳${toBanglaDigits((n.amount * n.count).toLocaleString('en-IN'))} টাকা</span>
            </div>
        </div>
    `).join('');

    const stage = document.createElement('div');
    stage.id = 'chSurpriseStage';
    stage.className = 'ch-surprise-stage';

    stage.innerHTML = `
        <!-- Pink & Gold Gift Box Scene -->
        <div class="ch-box-scene" id="chBoxScene">
            <div class="ch-warm-halo" id="chWarmHalo"></div>

            <!-- Flying Taka Notes Burst Layer when box opens -->
            <div class="ch-fly-burst-layer" id="chFlyBurstLayer">
                ${flyItemsHtml.join('')}
            </div>

            <div class="ch-pink-gift-box-wrap" id="chLuxuryCube" role="button" tabindex="0" aria-label="Tap to open Gift Box">
                <img src="/assets/gift-box.png" alt="Surprise Gift Box" class="ch-pink-gift-box-img">
            </div>

            <p class="ch-tap-instruction" id="chTapInstruction">
                Tap to open your surprise... 🎁
            </p>
        </div>

        <!-- Revealed Interactive Bangladeshi Taka (৳) Showcase -->
        <div class="ch-reveal-showcase hidden" id="chRevealShowcase">
            <div class="ch-showcase-header">
                <div class="ch-salami-pill">✨ আপনার গিফট বক্সের স্পেশাল সালামি ✨</div>
                <h2 class="ch-salami-headline">${tkTitle}</h2>
                <div class="ch-total-salami-banner">
                    <span class="total-lbl">মোট বাংলাদেশি টাকা সালামি:</span>
                    <span class="total-val">৳${totalTakaBn} টাকা (BDT ${totalTaka.toLocaleString('en-IN')})</span>
                </div>
            </div>

            <!-- Bangladeshi Taka Real Note Photos Grid -->
            <div class="ch-gift-section">
                <div class="ch-section-heading">
                    <span>💵 বাংলাদেশি টাকা (Bangladeshi Taka Notes)</span>
                    <span class="ch-tap-hint">নোটের ওপর ট্যাপ করুন ✨</span>
                </div>
                <div class="bdt-notes-grid" id="bdtNotesGrid">
                    ${notesCardsHtml}
                </div>
            </div>

            <!-- Action Row to Re-pop Box -->
            <div class="ch-showcase-actions">
                <button type="button" class="ch-action-btn secondary" id="chReplayPopBtn">
                    🔄 Open Gift Box Again
                </button>
            </div>
        </div>
    `;

    mainContainer.insertBefore(stage, mainContainer.firstChild);

    let audioCtx = null;
    function getAudio() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playRoyalChime() {
        const ctx = getAudio();
        if (!ctx) return;
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + i * 0.075);
            gain.gain.setValueAtTime(0.001, now + i * 0.075);
            gain.gain.linearRampToValueAtTime(0.16, now + i * 0.075 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.075 + 0.55);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.075);
            osc.stop(now + i * 0.075 + 0.6);
        });
    }

    function playCashSparkle() {
        const ctx = getAudio();
        if (!ctx) return;
        const now = ctx.currentTime;
        [880, 1174.66, 1760].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.05);
            gain.gain.setValueAtTime(0.12, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.28);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.3);
        });
    }

    function spawnFloatingDomParticles(originEl, symbols) {
        const rect = originEl ? originEl.getBoundingClientRect() : {
            left: window.innerWidth / 2,
            top: window.innerHeight / 2,
            width: 0,
            height: 0
        };
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            const el = document.createElement('div');
            el.className = 'ch-floating-burst-particle';
            el.innerText = symbols[i % symbols.length];
            const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.4;
            const dist = 60 + Math.random() * 110;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 40;
            el.style.left = `${cx}px`;
            el.style.top = `${cy}px`;
            el.style.setProperty('--dx', `${dx}px`);
            el.style.setProperty('--dy', `${dy}px`);
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1200);
        }
    }

    const chLuxuryCube = document.getElementById('chLuxuryCube');
    const chBoxScene = document.getElementById('chBoxScene');
    const chRevealShowcase = document.getElementById('chRevealShowcase');
    const chTapInstruction = document.getElementById('chTapInstruction');
    const chWarmHalo = document.getElementById('chWarmHalo');

    let isBoxOpened = false;

    function triggerBoxOpen() {
        playRoyalChime();
        chLuxuryCube.classList.remove('ch-open-active');
        void chLuxuryCube.offsetWidth;
        chLuxuryCube.classList.add('ch-open-active');
        if (chWarmHalo) chWarmHalo.classList.add('active');

        spawnFloatingDomParticles(chLuxuryCube, ['৳১০০০', '৳৫০০', '৳২০০', '৳১০০', '💸', '✨']);

        if (!isBoxOpened) {
            isBoxOpened = true;
            if (chTapInstruction) {
                chTapInstruction.innerHTML = '🎉 গিফট বক্স থেকে আপনার বাংলাদেশি টাকা সালামি বের হয়েছে! নিচে দেখুন 👇';
            }
            setTimeout(() => {
                chBoxScene.classList.add('ch-scene-compact');
                chRevealShowcase.classList.remove('hidden');
                chRevealShowcase.classList.add('entering');
            }, 850);
        }
    }

    chLuxuryCube.addEventListener('click', triggerBoxOpen);
    chLuxuryCube.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerBoxOpen();
        }
    });

    stage.querySelectorAll('.bdt-photo-note-card').forEach(card => {
        card.addEventListener('click', () => {
            playCashSparkle();
            card.classList.remove('note-pulse');
            void card.offsetWidth;
            card.classList.add('note-pulse');
            const amt = card.getAttribute('data-amount') || '1000';
            spawnFloatingDomParticles(card, [`৳${toBanglaDigits(amt)}`, '💸', '✨']);
        });
    });

    const chReplayPopBtn = document.getElementById('chReplayPopBtn');
    if (chReplayPopBtn) {
        chReplayPopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            triggerBoxOpen();
        });
    }
}

function startCrystalheartAnimation(config) {
    let canvas = document.getElementById('chCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'chCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        document.getElementById('wishContainer').appendChild(canvas);
    }
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    const crystals = [];
    const NUM_CRYSTALS = 110;

    for (let i = 0; i < NUM_CRYSTALS; i++) {
        const t = (i / NUM_CRYSTALS) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        crystals.push({
            hx: x,
            hy: y,
            z: (Math.random() - 0.5) * 10,
            size: Math.random() * 3.8 + 1.8,
            hue: Math.random() * 45 + 325,
            sparkle: Math.random() * Math.PI * 2
        });
    }

    let angleY = 0;

    function animate(time) {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        ctx.fillStyle = 'rgba(10, 3, 18, 0.25)';
        ctx.fillRect(0, 0, W, H);

        angleY += 0.012;
        const sec = time * 0.001;
        const scale = Math.min(W, H) * 0.019;

        ctx.save();
        ctx.translate(W / 2, H / 2 - 20);

        for (let i = 0; i < crystals.length; i++) {
            const c = crystals[i];

            const cos = Math.cos(angleY);
            const sin = Math.sin(angleY);

            const rx = c.hx * cos - c.z * sin;
            const rz = c.hx * sin + c.z * cos;
            const ry = c.hy;

            const perspective = 400 / (400 + rz * 15);
            const px = rx * scale * perspective;
            const py = ry * scale * perspective;

            const alpha = 0.35 + 0.45 * Math.sin(sec * 3.5 + c.sparkle);

            ctx.save();
            ctx.translate(px, py);
            ctx.fillStyle = `hsla(${c.hue}, 95%, 70%, ${alpha})`;
            ctx.shadowColor = `hsl(${c.hue}, 100%, 60%)`;
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.moveTo(0, -c.size * perspective);
            ctx.lineTo(c.size * perspective, 0);
            ctx.lineTo(0, c.size * perspective);
            ctx.lineTo(-c.size * perspective, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    canvas.removeAttribute('data-stopped');
    requestAnimationFrame(animate);
}
