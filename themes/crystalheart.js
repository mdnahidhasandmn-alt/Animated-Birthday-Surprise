// ==========================================================================
// Crystal Heart Theme Module — Luxury Rose Heart Acrylic Box + Bangladeshi Taka (৳) & Chocolates
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

function buildSvgRoseCluster() {
    // 16 rich layered velvet red roses arranged in a heart formation inside the crimson heart tray
    const rosePositions = [
        // Top lobes
        { cx: 68, cy: 48, r: 19 }, { cx: 95, cy: 42, r: 18 },
        { cx: 145, cy: 42, r: 18 }, { cx: 172, cy: 48, r: 19 },
        // Second row
        { cx: 52, cy: 74, r: 19 }, { cx: 82, cy: 68, r: 20 },
        { cx: 120, cy: 60, r: 20 }, { cx: 158, cy: 68, r: 20 },
        { cx: 188, cy: 74, r: 19 },
        // Third row
        { cx: 68, cy: 100, r: 19 }, { cx: 102, cy: 96, r: 21 },
        { cx: 138, cy: 96, r: 21 }, { cx: 172, cy: 100, r: 19 },
        // Lower convergence
        { cx: 90, cy: 126, r: 19 }, { cx: 120, cy: 124, r: 20 },
        { cx: 150, cy: 126, r: 19 },
        // Bottom tip
        { cx: 120, cy: 152, r: 19 }
    ];

    const rosesSvg = rosePositions.map((pos, idx) => {
        const rot = (idx * 37) % 360;
        const r = pos.r;
        return `
        <g transform="translate(${pos.cx}, ${pos.cy}) rotate(${rot})">
            <!-- Outer shadow & base petals -->
            <circle cx="0" cy="2" r="${r}" fill="rgba(25, 0, 5, 0.65)" />
            <circle cx="0" cy="0" r="${r * 0.96}" fill="url(#roseOuterGrad)" />
            <!-- Layered spiral petals -->
            <path d="M 0 -${r * 0.88} C ${r * 0.7} -${r * 0.85}, ${r * 0.95} -${r * 0.2}, ${r * 0.55} ${r * 0.55} C 0 ${r * 0.9}, -${r * 0.75} ${r * 0.6}, -${r * 0.85} -${r * 0.15} C -${r * 0.85} -${r * 0.7}, -${r * 0.3} -${r * 0.9}, 0 -${r * 0.88} Z" fill="url(#roseMidGrad)" stroke="#ff4d6d" stroke-width="0.45" stroke-opacity="0.4" />
            <path d="M -${r * 0.6} -${r * 0.35} C -${r * 0.2} -${r * 0.75}, ${r * 0.6} -${r * 0.6}, ${r * 0.65} 0 C ${r * 0.65} ${r * 0.55}, -${r * 0.1} ${r * 0.72}, -${r * 0.55} ${r * 0.35} C -${r * 0.75} 0, -${r * 0.7} -${r * 0.2}, -${r * 0.6} -${r * 0.35} Z" fill="url(#roseInnerGrad)" stroke="#ff758f" stroke-width="0.4" stroke-opacity="0.45" />
            <path d="M 0 -${r * 0.45} C ${r * 0.42} -${r * 0.42}, ${r * 0.48} ${r * 0.22}, 0 ${r * 0.42} C -${r * 0.45} ${r * 0.38}, -${r * 0.45} -${r * 0.35}, 0 -${r * 0.45} Z" fill="#9e001c" stroke="#ff4d6d" stroke-width="0.4" stroke-opacity="0.5" />
            <!-- Tightly coiled rose bud center -->
            <path d="M -${r * 0.2} -${r * 0.08} C -${r * 0.05} -${r * 0.28}, ${r * 0.25} -${r * 0.2}, ${r * 0.22} ${r * 0.08} C ${r * 0.15} ${r * 0.25}, -${r * 0.18} ${r * 0.22}, -${r * 0.2} -${r * 0.08} Z" fill="#59000f" stroke="#ff3355" stroke-width="0.5" stroke-opacity="0.6" />
        </g>`;
    }).join('');

    return `
    <svg viewBox="0 0 240 215" class="ch-rose-heart-svg" aria-hidden="true">
        <defs>
            <radialGradient id="roseOuterGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#e01134" />
                <stop offset="55%" stop-color="#9e001a" />
                <stop offset="100%" stop-color="#47000b" />
            </radialGradient>
            <radialGradient id="roseMidGrad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#ff1e42" />
                <stop offset="60%" stop-color="#b80021" />
                <stop offset="100%" stop-color="#5c000f" />
            </radialGradient>
            <radialGradient id="roseInnerGrad" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#ff3355" />
                <stop offset="65%" stop-color="#a8001d" />
                <stop offset="100%" stop-color="#4a000b" />
            </radialGradient>
            <linearGradient id="heartBoxWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#800816" />
                <stop offset="45%" stop-color="#c9142b" />
                <stop offset="75%" stop-color="#7a0614" />
                <stop offset="100%" stop-color="#3d0209" />
            </linearGradient>
            <linearGradient id="heartBoxRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#59040e" />
                <stop offset="50%" stop-color="#ff4d6d" />
                <stop offset="100%" stop-color="#4a020b" />
            </linearGradient>
        </defs>

        <!-- Drop shadow under heart box inside chamber -->
        <path d="M 120 198 C 120 198, 26 142, 26 74 C 26 36, 68 20, 120 56 C 172 20, 214 36, 214 74 C 214 142, 120 198, 120 198 Z" fill="rgba(0,0,0,0.65)" transform="translate(4, 10)" filter="blur(6px)" />

        <!-- 3D Extruded Crimson Heart Box Lower Wall (matches reference photo's red heart container) -->
        <path d="M 28 76 L 28 104 C 28 158, 120 206, 120 206 C 120 206, 212 158, 212 104 L 212 76 Z" fill="url(#heartBoxWallGrad)" />
        <!-- Center vertical crease on heart point -->
        <line x1="120" y1="172" x2="120" y2="206" stroke="rgba(255, 160, 175, 0.3)" stroke-width="1.5" />

        <!-- Dark velvet interior of heart tray -->
        <path d="M 120 176 C 120 176, 26 126, 26 68 C 26 30, 70 14, 120 50 C 170 14, 214 30, 214 68 C 214 126, 120 176, 120 176 Z" fill="#240005" stroke="url(#heartBoxRimGrad)" stroke-width="3.5" />

        <!-- Lush Red Roses Cluster -->
        ${rosesSvg}
    </svg>`;
}

function parseTakaNotes(config) {
    const notes = [];
    const n1000 = Math.max(0, parseInt(config.tk1000 !== undefined ? config.tk1000 : 2, 10) || 0);
    const n500 = Math.max(0, parseInt(config.tk500 !== undefined ? config.tk500 : 2, 10) || 0);
    const n200 = Math.max(0, parseInt(config.tk200 !== undefined ? config.tk200 : 1, 10) || 0);
    const n100 = Math.max(0, parseInt(config.tk100 !== undefined ? config.tk100 : 0, 10) || 0);

    if (n1000 > 0) {
        notes.push({
            amount: 1000,
            count: n1000,
            bnVal: '১০০০',
            bnWords: 'এক হাজার টাকা',
            enWords: 'ONE THOUSAND TAKA',
            styleClass: 'bdt-note-1000',
            serial: 'কখ ৭৮২৯৪১০'
        });
    }
    if (n500 > 0) {
        notes.push({
            amount: 500,
            count: n500,
            bnVal: '৫০০',
            bnWords: 'পাঁচশত টাকা',
            enWords: 'FIVE HUNDRED TAKA',
            styleClass: 'bdt-note-500',
            serial: 'গঘ ৪৫১৯২০৩'
        });
    }
    if (n200 > 0) {
        notes.push({
            amount: 200,
            count: n200,
            bnVal: '২০০',
            bnWords: 'দুইশত টাকা',
            enWords: 'TWO HUNDRED TAKA',
            styleClass: 'bdt-note-200',
            serial: 'চছ ২০২০০২১'
        });
    }
    if (n100 > 0) {
        notes.push({
            amount: 100,
            count: n100,
            bnVal: '১০০',
            bnWords: 'একশত টাকা',
            enWords: 'ONE HUNDRED TAKA',
            styleClass: 'bdt-note-100',
            serial: 'জঝ ১০৮৪৫২৯'
        });
    }

    const customStr = (config.tkCustom || '').trim();
    if (customStr) {
        const customParts = customStr.split(',').map(s => s.trim()).filter(Boolean);
        customParts.forEach((part, idx) => {
            const num = parseInt(part.replace(/[^\d]/g, ''), 10);
            if (!isNaN(num) && num > 0) {
                notes.push({
                    amount: num,
                    count: 1,
                    bnVal: toBanglaDigits(num),
                    bnWords: `${toBanglaDigits(num)} টাকা মাত্র`,
                    enWords: `${num} BDT SPECIAL NOTE`,
                    styleClass: 'bdt-note-custom',
                    serial: `সশ ৯৯০২১${toBanglaDigits(idx + 1)}`
                });
            }
        });
    }

    // Fallback if user set everything to 0
    if (notes.length === 0) {
        notes.push({
            amount: 1000,
            count: 1,
            bnVal: '১০০০',
            bnWords: 'এক হাজার টাকা',
            enWords: 'ONE THOUSAND TAKA',
            styleClass: 'bdt-note-1000',
            serial: 'কখ ৭৮২৯৪১০'
        });
    }

    return notes;
}

function getChocolateMeta(chocText, index) {
    const lower = chocText.toLowerCase();
    let theme = 'choc-style-silk';
    let icon = '🍫';
    let tag = 'Luxury Chocolate';

    if (lower.includes('ferrero') || lower.includes('rocher') || lower.includes('gold')) {
        theme = 'choc-style-ferrero';
        icon = '✨';
        tag = 'Golden Hazelnut Praline';
    } else if (lower.includes('kitkat') || lower.includes('kit kat')) {
        theme = 'choc-style-kitkat';
        icon = '❤️';
        tag = 'Crispy Wafer Bar';
    } else if (lower.includes('kinder')) {
        theme = 'choc-style-kinder';
        icon = '🥚';
        tag = 'Sweet Cream Surprise';
    } else if (lower.includes('toblerone') || lower.includes('swiss')) {
        theme = 'choc-style-toblerone';
        icon = '🍯';
        tag = 'Swiss Honey & Almond Nougat';
    } else if (lower.includes('dark') || lower.includes('truffle')) {
        theme = 'choc-style-truffle';
        icon = '🍬';
        tag = 'Belgian Rich Dark Truffle';
    } else if (index % 4 === 1) {
        theme = 'choc-style-ferrero';
    } else if (index % 4 === 2) {
        theme = 'choc-style-kitkat';
    } else if (index % 4 === 3) {
        theme = 'choc-style-truffle';
    }

    // Extract quantity if written like "x2" or "×3"
    let qtyMatch = chocText.match(/[x×]\s*(\d+)/i);
    let qty = qtyMatch ? `×${qtyMatch[1]}` : '×1';
    let cleanName = chocText.replace(/\s*[x×]\s*\d+/i, '').trim();

    return {
        name: cleanName || chocText,
        qty,
        theme,
        icon,
        tag
    };
}

function initCrystalHeartBoxExperience(config) {
    const wishContainer = document.getElementById('wishContainer');
    const mainContainer = wishContainer ? wishContainer.querySelector('.container') : null;
    const defaultGiftBox = document.getElementById('giftBoxContainer');
    const memoryCard = document.getElementById('memoryCard');

    if (!mainContainer) return;

    // Hide default purple gift box and default memory card initially
    if (defaultGiftBox) defaultGiftBox.style.display = 'none';
    if (memoryCard) memoryCard.classList.add('hidden');

    // Remove any existing Crystal Heart stage if re-initialized
    const oldStage = document.getElementById('chSurpriseStage');
    if (oldStage) oldStage.remove();

    const notes = parseTakaNotes(config);
    const totalTaka = notes.reduce((sum, n) => sum + (n.amount * n.count), 0);
    const totalTakaBn = toBanglaDigits(totalTaka.toLocaleString('en-IN'));
    const tkTitle = config.chTkTitle || 'স্পেশাল সালামি ও চকলেট গিফট 💸🍫';
    const chocsRaw = Array.isArray(config.chChocs) && config.chChocs.length > 0
        ? config.chChocs
        : [
            'Cadbury Dairy Milk Silk 🍫 x2',
            'Ferrero Rocher Gold Box ✨ x1',
            'KitKat Love Edition ❤️ x3',
            'Dark Chocolate Truffle 🍬 x2'
        ];
    const chocs = chocsRaw.map((c, i) => getChocolateMeta(c, i));

    // Create flying burst items (Taka bills + Chocolates) that pop out of the box when opened
    const flyItemsHtml = [];
    notes.forEach((n, idx) => {
        const copies = Math.min(n.count, 3);
        for (let c = 0; c < copies; c++) {
            const angle = -70 + ((flyItemsHtml.length * 32) % 145);
            const tx = (flyItemsHtml.length % 2 === 0 ? -1 : 1) * (65 + (flyItemsHtml.length * 26) % 130);
            const ty = -115 - ((flyItemsHtml.length * 25) % 95);
            flyItemsHtml.push(`
                <div class="ch-fly-item ch-fly-taka ${n.styleClass}" style="--tx: ${tx}px; --ty: ${ty}px; --rot: ${angle * 0.35}deg; --delay: ${(idx * 0.1 + c * 0.08).toFixed(2)}s;">
                    <span class="fly-tk-bank">বাংলাদেশ ব্যাংক</span>
                    <span class="fly-tk-amount">৳${n.bnVal}</span>
                </div>
            `);
        }
    });
    chocs.forEach((ch, idx) => {
        const tx = (idx % 2 === 0 ? 1 : -1) * (80 + idx * 28);
        const ty = -85 - (idx * 22);
        const rot = (idx % 2 === 0 ? 14 : -14);
        flyItemsHtml.push(`
            <div class="ch-fly-item ch-fly-choc ${ch.theme}" style="--tx: ${tx}px; --ty: ${ty}px; --rot: ${rot}deg; --delay: ${(0.18 + idx * 0.1).toFixed(2)}s;">
                <span>${ch.icon}</span>
                <span class="fly-choc-lbl">${ch.name.split(' ')[0]}</span>
            </div>
        `);
    });

    // Build Banknote Showcase Cards HTML
    const notesCardsHtml = notes.map((n, i) => `
        <div class="bdt-banknote-card ${n.styleClass}" data-amount="${n.amount}" style="animation-delay: ${(0.15 + i * 0.12).toFixed(2)}s" title="Tap for Salami Sparkle!">
            <div class="bdt-note-inner">
                <div class="bdt-note-Watermark">৳</div>
                <div class="bdt-security-thread"></div>
                <div class="bdt-note-top">
                    <div class="bdt-bank-title">
                        <span class="bdt-crest">🇧🇩</span>
                        <span>বাংলাদেশ ব্যাংক</span>
                    </div>
                    <div class="bdt-corner-val">৳${n.bnVal}</div>
                </div>
                <div class="bdt-note-center">
                    <div class="bdt-emblem-circle">
                        <span>৳${n.bnVal}</span>
                    </div>
                    <div class="bdt-center-text">
                        <div class="bdt-bn-words">${n.bnWords}</div>
                        <div class="bdt-en-words">${n.enWords}</div>
                        <div class="bdt-promise">চাহিবামাত্র ইহার বাহককে দিতে বাধ্য থাকিবে</div>
                    </div>
                </div>
                <div class="bdt-note-bottom">
                    <span class="bdt-serial">${n.serial}</span>
                    <span class="bdt-count-badge">×${n.count} Note${n.count > 1 ? 's' : ''} = ৳${toBanglaDigits((n.amount * n.count).toLocaleString('en-IN'))}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Build Chocolates Showcase Cards HTML
    const chocsCardsHtml = chocs.map((ch, i) => `
        <div class="ch-choc-card ${ch.theme}" style="animation-delay: ${(0.25 + i * 0.12).toFixed(2)}s" title="Tap to unwrap sweetness!">
            <div class="ch-choc-foil-shine"></div>
            <div class="ch-choc-icon-badge">${ch.icon}</div>
            <div class="ch-choc-info">
                <div class="ch-choc-tag">${ch.tag}</div>
                <h4 class="ch-choc-title">${ch.name}</h4>
            </div>
            <div class="ch-choc-qty">${ch.qty}</div>
        </div>
    `).join('');

    const stage = document.createElement('div');
    stage.id = 'chSurpriseStage';
    stage.className = 'ch-surprise-stage';

    stage.innerHTML = `
        <!-- Luxury Acrylic & Mahogany Red Rose Heart Gift Box (Matches Reference Image) -->
        <div class="ch-box-scene" id="chBoxScene">
            <div class="ch-warm-halo" id="chWarmHalo"></div>

            <!-- Flying Burst Layer when box opens -->
            <div class="ch-fly-burst-layer" id="chFlyBurstLayer">
                ${flyItemsHtml.join('')}
            </div>

            <div class="ch-luxury-cube" id="chLuxuryCube" role="button" tabindex="0" aria-label="Tap to open Rose Heart Gift Box">
                
                <!-- Top Glossy Red Satin Bow & Ribbons -->
                <div class="ch-satin-ribbon-assembly" id="chRibbonAssembly">
                    <!-- Top horizontal & depth ribbons crossing lid -->
                    <div class="ch-ribbon-top-cross"></div>
                    <div class="ch-ribbon-top-depth"></div>
                    <!-- Right side panel vertical red satin ribbon -->
                    <div class="ch-ribbon-side-right"></div>

                    <!-- Left & Right Draped Front Satin Ribbon Tails (over the acrylic glass) -->
                    <div class="ch-ribbon-drape left"></div>
                    <div class="ch-ribbon-drape right"></div>

                    <!-- Multi-loop Glossy Red Satin Bow at Top Center -->
                    <div class="ch-satin-bow">
                        <div class="ch-bow-loop back-left"></div>
                        <div class="ch-bow-loop back-right"></div>
                        <div class="ch-bow-loop front-left"></div>
                        <div class="ch-bow-loop front-right"></div>
                        <div class="ch-bow-knot"></div>
                    </div>
                </div>

                <!-- 3D Top Angled Mahogany & Clear Glass Roof -->
                <div class="ch-cube-top-lid" id="chCubeTopLid">
                    <div class="ch-top-glass-pane">
                        <div class="ch-glass-reflection"></div>
                    </div>
                </div>

                <!-- 3D Right-Side Angled Mahogany Wood Panel -->
                <div class="ch-cube-side-right">
                    <div class="ch-wood-grain-overlay"></div>
                </div>

                <!-- Front Main Face: Mahogany Pillars + Clear Acrylic Window + Bottom Drawer -->
                <div class="ch-cube-front">
                    <!-- Upper Clear Acrylic Display Chamber -->
                    <div class="ch-acrylic-chamber">
                        <!-- Inner Dark Velvet Back & Floor -->
                        <div class="ch-chamber-back-wall"></div>
                        <div class="ch-chamber-floor"></div>

                        <!-- 3D Crimson Heart Box Filled with Red Roses Inside Chamber -->
                        <div class="ch-inner-rose-heart" id="chInnerRoseHeart">
                            ${buildSvgRoseCluster()}
                        </div>

                        <!-- Clear Front Acrylic Glass Sheet & Reflections -->
                        <div class="ch-front-acrylic-glass">
                            <div class="ch-acrylic-shine-1"></div>
                            <div class="ch-acrylic-shine-2"></div>
                        </div>

                        <!-- Left & Right Mahogany Frame Pillars -->
                        <div class="ch-mahogany-pillar left"></div>
                        <div class="ch-mahogany-pillar right"></div>
                        <div class="ch-mahogany-beam top"></div>
                        <div class="ch-mahogany-beam mid"></div>
                    </div>

                    <!-- Bottom Pull-Out Drawer with Ornate Gold Ring Handle -->
                    <div class="ch-bottom-drawer-housing">
                        <div class="ch-drawer-sliding-box" id="chDrawerSlidingBox">
                            <!-- Inside Drawer Peek (Taka & Chocolates tucked inside!) -->
                            <div class="ch-drawer-interior-peek">
                                <span class="drawer-peek-note n1">৳১০০০</span>
                                <span class="drawer-peek-choc">🍫</span>
                                <span class="drawer-peek-note n2">৳৫০০</span>
                                <span class="drawer-peek-choc">✨</span>
                                <span class="drawer-peek-note n3">৳২০০</span>
                            </div>
                            <!-- Front Face of the Crimson-Mahogany Drawer -->
                            <div class="ch-drawer-front-plate">
                                <div class="ch-drawer-bevel"></div>
                                <!-- Gold Ornate Ring Pull Handle -->
                                <div class="ch-gold-pull-handle">
                                    <div class="ch-gold-rosette"></div>
                                    <div class="ch-gold-ring"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Warm Table Reflection Shadow Under Box -->
                <div class="ch-table-shadow"></div>
            </div>

            <p class="ch-tap-instruction" id="chTapInstruction">
                🌹 Tap the Rose Heart Box to open your Salami & Chocolate Surprise... 🎁
            </p>
        </div>

        <!-- Revealed Interactive Bangladeshi Taka (৳) & Chocolate Showcase -->
        <div class="ch-reveal-showcase hidden" id="chRevealShowcase">
            
            <!-- Header Pill & Salami Summary -->
            <div class="ch-showcase-header">
                <div class="ch-salami-pill">✨ Opened from your Crystal Rose Heart Box ✨</div>
                <h2 class="ch-salami-headline">${tkTitle}</h2>
                <div class="ch-total-salami-banner">
                    <span class="total-lbl">মোট বাংলাদেশি টাকা সালামি:</span>
                    <span class="total-val">৳${totalTakaBn} টাকা (BDT ${totalTaka.toLocaleString('en-IN')})</span>
                </div>
            </div>

            <!-- Section A: Bangladeshi Taka Banknotes -->
            <div class="ch-gift-section">
                <div class="ch-section-heading">
                    <span>💵 বাংলাদেশি টাকা (Bangladeshi Taka Notes)</span>
                    <span class="ch-tap-hint">Tap any note to sparkle ✨</span>
                </div>
                <div class="bdt-notes-grid" id="bdtNotesGrid">
                    ${notesCardsHtml}
                </div>
            </div>

            <!-- Section B: Luxury Chocolates -->
            <div class="ch-gift-section">
                <div class="ch-section-heading">
                    <span>🍫 স্পেশাল চকলেট গিফট (Chocolates Collection)</span>
                    <span class="ch-tap-hint">Tap any chocolate 💝</span>
                </div>
                <div class="ch-chocs-grid" id="chChocsGrid">
                    ${chocsCardsHtml}
                </div>
            </div>

            <!-- Action Row to view Love Letter Card or Re-pop Box -->
            <div class="ch-showcase-actions">
                <button type="button" class="ch-action-btn primary" id="chShowCardBtn">
                    💌 Read Special Birthday / Love Card
                </button>
                <button type="button" class="ch-action-btn secondary" id="chReplayPopBtn">
                    🔄 Pop Taka & Chocolates Again
                </button>
            </div>
        </div>
    `;

    mainContainer.insertBefore(stage, mainContainer.firstChild);

    // Sound effects generator (Web Audio API)
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

        for (let i = 0; i < 14; i++) {
            const el = document.createElement('div');
            el.className = 'ch-floating-burst-particle';
            el.innerText = symbols[i % symbols.length];
            const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
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
        void chLuxuryCube.offsetWidth; // Reflow to allow re-triggering animation
        chLuxuryCube.classList.add('ch-open-active');
        if (chWarmHalo) chWarmHalo.classList.add('active');

        spawnFloatingDomParticles(chLuxuryCube, ['৳১০০০', '🍫', '৳৫০০', '🌹', '✨', '৳২০০', '💝']);

        if (!isBoxOpened) {
            isBoxOpened = true;
            if (chTapInstruction) {
                chTapInstruction.innerHTML = '🎉 আপনার রোজ বক্স থেকে বাংলাদেশি টাকা ও চকলেট বের হয়েছে! নিচে দেখুন 👇';
            }
            setTimeout(() => {
                chBoxScene.classList.add('ch-scene-compact');
                chRevealShowcase.classList.remove('hidden');
                chRevealShowcase.classList.add('entering');
            }, 950);
        }
    }

    chLuxuryCube.addEventListener('click', triggerBoxOpen);
    chLuxuryCube.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerBoxOpen();
        }
    });

    // Interactive click on individual Bangladeshi Taka notes
    stage.querySelectorAll('.bdt-banknote-card').forEach(card => {
        card.addEventListener('click', () => {
            playCashSparkle();
            card.classList.remove('note-pulse');
            void card.offsetWidth;
            card.classList.add('note-pulse');
            const amt = card.getAttribute('data-amount') || '1000';
            spawnFloatingDomParticles(card, [`৳${toBanglaDigits(amt)}`, '💸', '✨', '🇧🇩']);
        });
    });

    // Interactive click on individual Chocolate cards
    stage.querySelectorAll('.ch-choc-card').forEach(card => {
        card.addEventListener('click', () => {
            playCashSparkle();
            card.classList.remove('note-pulse');
            void card.offsetWidth;
            card.classList.add('note-pulse');
            spawnFloatingDomParticles(card, ['🍫', '🍬', '❤️', '✨', '💝']);
        });
    });

    // Replay pop button
    const chReplayPopBtn = document.getElementById('chReplayPopBtn');
    if (chReplayPopBtn) {
        chReplayPopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            triggerBoxOpen();
        });
    }

    // Show personalized message card button
    const chShowCardBtn = document.getElementById('chShowCardBtn');
    if (chShowCardBtn && memoryCard) {
        chShowCardBtn.addEventListener('click', () => {
            playRoyalChime();
            memoryCard.style.display = 'block';
            memoryCard.classList.remove('hidden');
            memoryCard.classList.add('entering');
            const skipBtn = document.getElementById('skipTypingBtn');
            if (skipBtn) skipBtn.style.display = 'none';
            memoryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            hue: Math.random() * 35 + 340, // Warm Ruby Crimson to Rose Gold
            sparkle: Math.random() * Math.PI * 2
        });
    }

    let angleY = 0;

    function animate(time) {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        ctx.fillStyle = 'rgba(14, 4, 8, 0.25)';
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
