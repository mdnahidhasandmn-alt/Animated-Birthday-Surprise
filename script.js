'use strict';

// Helper functions for UTF-8 Base64 encoding/decoding
function encodeConfig(config) {
    const json = JSON.stringify(config);
    const bytes = new TextEncoder().encode(json);
    let binString = "";
    for (let i = 0; i < bytes.length; i++) {
        binString += String.fromCharCode(bytes[i]);
    }
    return btoa(binString)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function decodeConfig(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    const binString = atob(base64);
    const bytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
}

// Shorten URL via our own server-side proxy at /api/shorten (no CORS issues)
function shortenUrl(longUrl, callback) {
    const apiUrl = `/api/shorten?url=${encodeURIComponent(longUrl)}`;
    fetch(apiUrl, { signal: AbortSignal.timeout(8000) })
        .then(res => {
            if (!res.ok) throw new Error('server error');
            return res.json();
        })
        .then(data => {
            if (data && data.shortUrl && data.shortUrl.startsWith('http')) {
                callback(data.shortUrl);
            } else {
                callback(null);
            }
        })
        .catch(err => {
            console.warn('URL shortening failed:', err);
            callback(null);
        });
}

// Preset images from Unsplash (curated high-res love/birthday theme)
const IMAGE_PRESETS_MAIN = [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=350&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513272795190-0b7c527757ed?w=350&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494972308805-463bc619b34e?w=350&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=350&auto=format&fit=crop&q=80"
];

const IMAGE_PRESETS_ENVELOPE = [
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=350&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=350&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=350&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507504038482-7621c3c786d7?w=350&auto=format&fit=crop&q=80"
];

// Default configurations
const DEFAULT_CONFIG = {
    theme: "birthday",
    o: "Happy Birthday, my love! 🎂",
    t: "Sophia 💖",
    f: "Alex ✍️",
    m: "On your special day, I just want you to know how much you mean to me. ❤️ You are my happiness, my comfort, and my favorite person in the world. Thank you for filling my life with love, laughter, and beautiful memories. Happy Birthday, my love. 🎂",
    p: IMAGE_PRESETS_MAIN[0],
    l1: "From the moment our paths intertwined, you filled my days with laughter and my nights with sweet dreams. Your love is a constant melody that plays softly in my heart.",
    l2: "Every shared glance and whispered secret adds another verse to our endless love song. You make even the simplest moments sparkle with joy and wonder.",
    l3: "In your arms, I find both comfort and adventure. You are the calm in my storm and the spark that ignites my passion, turning every day into a delightful escapade.",
    lp: "For You 💖",
    li: IMAGE_PRESETS_ENVELOPE[0]
};

// Global surprise configuration
let SURPRISE_CONFIG = {};

// Background particles shared between modes
function initBackground() {
    const bgParticles = document.getElementById('bgParticles');
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        createParticle(bgParticles, true);
    }
    setInterval(() => createParticle(bgParticles, false), 1500);
}

function createParticle(bgParticles, initial = false) {
    if (!bgParticles) return;
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 8 + 4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    if (initial) {
        p.style.bottom = `${Math.random() * 100}%`;
    } else {
        p.style.bottom = `-20px`;
    }
    const duration = Math.random() * 6 + 8;
    const delay = Math.random() * 4;
    p.style.animationDuration = `${duration}s`;
    p.style.animationDelay = `${delay}s`;
    const isPink = Math.random() > 0.5;
    p.style.background = isPink ? 'rgba(255, 51, 119, 0.25)' : 'rgba(255, 183, 3, 0.25)';
    p.style.boxShadow = isPink ? '0 0 10px rgba(255, 51, 119, 0.4)' : '0 0 10px rgba(255, 183, 3, 0.4)';
    bgParticles.appendChild(p);
    setTimeout(() => p.remove(), (duration + delay) * 1000);
}

// Client-side image compression using canvas
function processImageUpload(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Limit image dimensions to max 250px to keep URL size small
            const maxDim = 250;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress quality as JPEG (0.65 quality gives tiny base64 sizes)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
            callback(compressedBase64);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if configuration is in hash (#w=) or query (?w=) — support both
    let hashData = "";
    if (window.location.hash.startsWith('#w=')) {
        hashData = window.location.hash.substring(3);
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('w')) {
            hashData = urlParams.get('w');
        }
    }
    hashData = hashData.trim().replace(/\/+$/, '');

    if (hashData) {

        // --- VIEWER MODE ---
        try {
            const decoded = decodeConfig(hashData);
            SURPRISE_CONFIG = {
                theme: decoded.theme || 'birthday',
                occasionText: decoded.o || DEFAULT_CONFIG.o,
                partnerName: decoded.t || DEFAULT_CONFIG.t,
                senderName: decoded.f || DEFAULT_CONFIG.f,
                message: decoded.m || DEFAULT_CONFIG.m,
                photoUrl: decoded.p || DEFAULT_CONFIG.p,
                letter1: decoded.l1 || DEFAULT_CONFIG.l1,
                letter2: decoded.l2 || DEFAULT_CONFIG.l2,
                letter3: decoded.l3 || DEFAULT_CONFIG.l3,
                envelopePhotoText: decoded.lp || DEFAULT_CONFIG.lp,
                envelopePhotoUrl: decoded.li || DEFAULT_CONFIG.li
            };
        } catch (e) {
            console.error("Failed to decode configuration, falling back to defaults.", e);
            SURPRISE_CONFIG = {
                theme: 'birthday',
                occasionText: DEFAULT_CONFIG.o,
                partnerName: DEFAULT_CONFIG.t,
                senderName: DEFAULT_CONFIG.f,
                message: DEFAULT_CONFIG.m,
                photoUrl: DEFAULT_CONFIG.p,
                letter1: DEFAULT_CONFIG.l1,
                letter2: DEFAULT_CONFIG.l2,
                letter3: DEFAULT_CONFIG.l3,
                envelopePhotoText: DEFAULT_CONFIG.lp,
                envelopePhotoUrl: DEFAULT_CONFIG.li
            };
        }

        document.body.classList.add('wish-mode');
        document.getElementById('creatorContainer').classList.add('hidden');

        if (SURPRISE_CONFIG.theme === 'heartbeat') {
            document.getElementById('wishContainer').classList.add('hidden');
            document.getElementById('roseContainer').classList.add('hidden');
            document.getElementById('heartbeatContainer').classList.remove('hidden');

            // Populate Heartbeat Viewer DOM
            document.querySelector('#heartbeatContainer .card-title').innerText = SURPRISE_CONFIG.occasionText;
            document.getElementById('hbM1').innerText = SURPRISE_CONFIG.occasionText;
            document.getElementById('hbM2').innerHTML = `for <span id="hbM2Span">${SURPRISE_CONFIG.partnerName}</span> 💗`;
            document.getElementById('hbLetterSign').innerText = `— coded with love by ${SURPRISE_CONFIG.senderName}`;

            initBackground();
            initHeartbeatTheme(SURPRISE_CONFIG);
        } else if (SURPRISE_CONFIG.theme === 'rose') {
            document.getElementById('wishContainer').classList.add('hidden');
            document.getElementById('heartbeatContainer').classList.add('hidden');
            document.getElementById('elementumContainer').classList.add('hidden');
            document.getElementById('roseContainer').classList.remove('hidden');

            // Populate Rose Viewer DOM
            document.getElementById('roseLoaderTitle').innerText = SURPRISE_CONFIG.occasionText;
            document.getElementById('roseTagline').innerHTML = `${SURPRISE_CONFIG.message || 'i coded this for you'}`;

            initBackground();
            initRoseTheme(SURPRISE_CONFIG);
        } else if (SURPRISE_CONFIG.theme === 'elementum') {
            document.getElementById('wishContainer').classList.add('hidden');
            document.getElementById('heartbeatContainer').classList.add('hidden');
            document.getElementById('roseContainer').classList.add('hidden');
            document.getElementById('elementumContainer').classList.remove('hidden');

            initBackground();
            initElementumTheme(SURPRISE_CONFIG);
        } else {
            document.getElementById('heartbeatContainer').classList.add('hidden');
            document.getElementById('roseContainer').classList.add('hidden');
            document.getElementById('elementumContainer').classList.add('hidden');
            document.getElementById('wishContainer').classList.remove('hidden');

            // Populate Viewer DOM
            document.getElementById('occasionText').innerText = SURPRISE_CONFIG.occasionText;
            document.getElementById('partnerName').innerText = SURPRISE_CONFIG.partnerName;
            document.getElementById('senderName').innerText = SURPRISE_CONFIG.senderName;
            document.getElementById('customMessage').innerText = SURPRISE_CONFIG.message;
            document.getElementById('mainCardPhoto').src = SURPRISE_CONFIG.photoUrl;

            document.getElementById('letter1Text').innerText = SURPRISE_CONFIG.letter1;
            document.getElementById('letter1Sig').innerText = SURPRISE_CONFIG.senderName;
            
            document.getElementById('letter2Text').innerText = SURPRISE_CONFIG.letter2;
            document.getElementById('letter2Sig').innerText = SURPRISE_CONFIG.senderName;
            
            document.getElementById('letter3Text').innerText = SURPRISE_CONFIG.letter3;
            document.getElementById('letter3Sig').innerText = SURPRISE_CONFIG.senderName;
            
            document.getElementById('envelopePhotoText').innerText = SURPRISE_CONFIG.envelopePhotoText;
            document.getElementById('envelopePhoto').src = SURPRISE_CONFIG.envelopePhotoUrl;

            initBackground();
            initBirthdayTheme(SURPRISE_CONFIG);
        }
    } else {
        // --- CREATOR MODE ---
        document.body.classList.add('creator-mode');
        document.getElementById('wishContainer').classList.add('hidden');
        document.getElementById('heartbeatContainer').classList.add('hidden');
        document.getElementById('roseContainer').classList.add('hidden');
        document.getElementById('creatorContainer').classList.remove('hidden');

        initBackground();
        initCreator();
    }
});

// ==========================================
// 1. SURPRISE LAB CREATOR LOGIC
// ==========================================

const THEME_REGISTRY = {
    birthday: {
        name: "🎉 Birthday Surprise",
        desc: "Classical gift box opening surprise with popping balloons, custom main card photo, and love letters.",
        visibleFields: [
            'group-occasion',
            'group-to',
            'group-from',
            'group-message',
            'group-card-photo',
            'letters' // Section 3 letters form-section
        ],
        labels: {
            'inputMessage': 'Typed Love Letter Message'
        },
        preview: 'view-prev-card',
        showMockupTabs: true
    },
    heartbeat: {
        name: "💓 3D Heartbeat",
        desc: "High-performance interactive 3D particle heartbeat that blooms and types a custom letter.",
        visibleFields: [
            'group-occasion',
            'group-to',
            'group-from',
            'group-message'
        ],
        labels: {
            'inputMessage': 'Heartbeat Letter Text'
        },
        preview: 'view-prev-heartbeat',
        showMockupTabs: false
    },
    rose: {
        name: "🌹 3D Blooming Rose",
        desc: "A beautiful 3D CSS rose that grows and blooms in real-time, showing your custom romantic tagline.",
        visibleFields: [
            'group-occasion',
            'group-to',
            'group-message'
        ],
        labels: {
            'inputMessage': 'Rose Tagline Text'
        },
        preview: 'view-prev-rose',
        showMockupTabs: false
    },
    elementum: {
        name: "⚛️ Elementum Table",
        desc: "Interactive 3D Periodic Table using Anime.js v4. Switch between Table, Sphere, Helix, Grid, and Orbit layouts.",
        visibleFields: [],
        preview: 'view-prev-elementum',
        showMockupTabs: false
    }
};

function initCreator() {
    let activeTheme = 'birthday';

    // Theme selector tabs
    const themeTabBtns = document.querySelectorAll('.theme-tab-btn');
    themeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTheme = btn.dataset.theme;
            applyThemeFields(activeTheme);
        });
    });

    function applyThemeFields(themeKey) {
        const themeDef = THEME_REGISTRY[themeKey];
        if (!themeDef) return;

        // Hide all customization input groups first
        const allWrappers = [
            'group-occasion',
            'group-to',
            'group-from',
            'group-message',
            'group-card-photo',
            'letters'
        ];
        
        allWrappers.forEach(id => {
            let el = document.getElementById(id);
            if (!el) {
                el = document.querySelector(`.form-section[data-section="${id}"]`);
            }
            if (el) el.style.display = 'none';
        });

        // Show only the fields registered for the active theme
        themeDef.visibleFields.forEach(id => {
            let el = document.getElementById(id);
            if (!el) {
                el = document.querySelector(`.form-section[data-section="${id}"]`);
            }
            if (el) el.style.display = 'block';
        });

        // Customize field labels dynamically
        if (themeDef.labels) {
            Object.keys(themeDef.labels).forEach(inputId => {
                const labelEl = document.querySelector(`label[for="${inputId}"]`);
                if (labelEl) {
                    labelEl.innerText = themeDef.labels[inputId];
                }
            });
        }

        // Toggle visibility of preview switcher tabs
        const mockupTabsEl = document.getElementById('mockup-tabs');
        if (mockupTabsEl) {
            mockupTabsEl.style.display = themeDef.showMockupTabs ? 'flex' : 'none';
        }

        // Switch to the theme's specific phone mockup preview card
        document.querySelectorAll('.mockup-view').forEach(v => v.classList.remove('active'));
        const targetPreview = document.getElementById(themeDef.preview);
        if (targetPreview) targetPreview.classList.add('active');

        if (themeDef.showMockupTabs) {
            const previewTabCard = document.querySelector('.preview-tab-btn[data-prev="card"]');
            if (previewTabCard) previewTabCard.click();
        }

        updatePreview();
    }

    // Image Source Tabs
    const tabSections = document.querySelectorAll('.form-section');
    tabSections.forEach(sec => {
        const tabBtns = sec.querySelectorAll('.img-tab-btn');
        const tabContents = sec.querySelectorAll('.img-tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const targetId = `tab-${btn.dataset.tab}`;
                const targetEl = sec.querySelector(`#${targetId}`);
                if (targetEl) targetEl.classList.add('active');
                updatePreview();
            });
        });
    });

    // Mockup Screen Tabs switcher (for Birthday preview tabs)
    const previewTabBtns = document.querySelectorAll('.preview-tab-btn');
    const mockupViews = document.querySelectorAll('.mockup-view');
    previewTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            previewTabBtns.forEach(b => b.classList.remove('active'));
            mockupViews.forEach(v => v.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = `view-prev-${btn.dataset.prev}`;
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add('active');
        });
    });

    // Pre-populate Form with defaults
    document.getElementById('inputOccasion').value = DEFAULT_CONFIG.o;
    document.getElementById('inputTo').value = DEFAULT_CONFIG.t;
    document.getElementById('inputFrom').value = DEFAULT_CONFIG.f;
    document.getElementById('inputMessage').value = DEFAULT_CONFIG.m;
    document.getElementById('inputLetter1').value = DEFAULT_CONFIG.l1;
    document.getElementById('inputLetter2').value = DEFAULT_CONFIG.l2;
    document.getElementById('inputLetter3').value = DEFAULT_CONFIG.l3;
    document.getElementById('inputPolaroidText').value = DEFAULT_CONFIG.lp;

    // Preset Selectors State
    let selectedMainPhoto = DEFAULT_CONFIG.p;
    let selectedEnvelopePhoto = DEFAULT_CONFIG.li;
    let uploadedMainPhoto = "";
    let uploadedEnvelopePhoto = "";

    // Render presets Main photo
    const presetsMainContainer = document.getElementById('presetsMain');
    IMAGE_PRESETS_MAIN.forEach((url, i) => {
        const img = document.createElement('img');
        img.src = url;
        img.classList.add('preset-img');
        if (i === 0) img.classList.add('selected');
        img.addEventListener('click', () => {
            presetsMainContainer.querySelectorAll('.preset-img').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
            selectedMainPhoto = url;
            updatePreview();
        });
        presetsMainContainer.appendChild(img);
    });

    // Render presets Envelope photo
    const presetsEnvelopeContainer = document.getElementById('presetsEnvelope');
    IMAGE_PRESETS_ENVELOPE.forEach((url, i) => {
        const img = document.createElement('img');
        img.src = url;
        img.classList.add('preset-img');
        if (i === 0) img.classList.add('selected');
        img.addEventListener('click', () => {
            presetsEnvelopeContainer.querySelectorAll('.preset-img').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
            selectedEnvelopePhoto = url;
            updatePreview();
        });
        presetsEnvelopeContainer.appendChild(img);
    });

    // Handle Upload File Changes
    const uploadMain = document.getElementById('uploadMain');
    const previewMain = document.getElementById('previewMain');
    uploadMain.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            processImageUpload(file, (base64) => {
                uploadedMainPhoto = base64;
                previewMain.innerHTML = `<img src="${base64}" alt="Upload Preview">`;
                updatePreview();
            });
        }
    });

    const uploadEnvelope = document.getElementById('uploadEnvelope');
    const previewEnvelope = document.getElementById('previewEnvelope');
    uploadEnvelope.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            processImageUpload(file, (base64) => {
                uploadedEnvelopePhoto = base64;
                previewEnvelope.innerHTML = `<img src="${base64}" alt="Upload Preview">`;
                updatePreview();
            });
        }
    });

    // Update Preview Function
    function updatePreview() {
        const occasionVal = document.getElementById('inputOccasion').value || DEFAULT_CONFIG.o;
        const toVal = document.getElementById('inputTo').value || DEFAULT_CONFIG.t;
        const fromVal = document.getElementById('inputFrom').value || DEFAULT_CONFIG.f;
        const messageVal = document.getElementById('inputMessage').value || DEFAULT_CONFIG.m;
        const letter1Val = document.getElementById('inputLetter1').value || DEFAULT_CONFIG.l1;
        const letter2Val = document.getElementById('inputLetter2').value || DEFAULT_CONFIG.l2;
        const letter3Val = document.getElementById('inputLetter3').value || DEFAULT_CONFIG.l3;
        const polaroidTextVal = document.getElementById('inputPolaroidText').value || DEFAULT_CONFIG.lp;

        // Main photo source
        const mainImgTab = document.querySelector('[data-section="card"] .img-tab-btn.active').dataset.tab;
        let mainPhoto = DEFAULT_CONFIG.p;
        if (mainImgTab === 'preset-main') {
            mainPhoto = selectedMainPhoto;
        } else if (mainImgTab === 'upload-main') {
            mainPhoto = uploadedMainPhoto || DEFAULT_CONFIG.p;
        } else if (mainImgTab === 'url-main') {
            mainPhoto = document.getElementById('inputMainPhotoUrl').value || DEFAULT_CONFIG.p;
        }

        // Envelope photo source
        const envelopeImgTab = document.querySelector('[data-section="letters"] .img-tab-btn.active').dataset.tab;
        let envelopePhoto = DEFAULT_CONFIG.li;
        if (envelopeImgTab === 'preset-envelope') {
            envelopePhoto = selectedEnvelopePhoto;
        } else if (envelopeImgTab === 'upload-envelope') {
            envelopePhoto = uploadedEnvelopePhoto || DEFAULT_CONFIG.li;
        } else if (envelopeImgTab === 'url-envelope') {
            envelopePhoto = document.getElementById('inputEnvelopePhotoUrl').value || DEFAULT_CONFIG.li;
        }

        // Apply to birthday mockup preview elements
        document.getElementById('prevOccasion').innerText = occasionVal;
        document.getElementById('prevTo').innerText = toVal;
        document.getElementById('prevFrom').innerText = fromVal;
        document.getElementById('prevMessage').innerText = messageVal;
        const prevMainPhotoEl = document.getElementById('prevMainPhoto');
        if (prevMainPhotoEl) prevMainPhotoEl.src = mainPhoto;

        const prevL1El = document.getElementById('prevL1');
        if (prevL1El) prevL1El.innerText = letter1Val;
        const prevL1SigEl = document.getElementById('prevL1Sig');
        if (prevL1SigEl) prevL1SigEl.innerText = fromVal;
        const prevL2El = document.getElementById('prevL2');
        if (prevL2El) prevL2El.innerText = letter2Val;
        const prevL2SigEl = document.getElementById('prevL2Sig');
        if (prevL2SigEl) prevL2SigEl.innerText = fromVal;
        const prevEnvelopePhotoTextEl = document.getElementById('prevEnvelopePhotoText');
        if (prevEnvelopePhotoTextEl) prevEnvelopePhotoTextEl.innerText = polaroidTextVal;
        const prevEnvelopePhotoEl = document.getElementById('prevEnvelopePhoto');
        if (prevEnvelopePhotoEl) prevEnvelopePhotoEl.src = envelopePhoto;

        // Apply to heartbeat mockup preview
        const prevHbTitleEl = document.getElementById('prevHbTitle');
        if (prevHbTitleEl) prevHbTitleEl.innerText = occasionVal;
        const prevHbStatusEl = document.getElementById('prevHbStatus');
        if (prevHbStatusEl) prevHbStatusEl.innerText = `Compiling love coordinates for ${toVal}...`;

        // Apply to rose mockup preview
        const prevRoseTitleEl = document.getElementById('prevRoseTitle');
        if (prevRoseTitleEl) prevRoseTitleEl.innerText = occasionVal;
        const prevRoseStatusEl = document.getElementById('prevRoseStatus');
        if (prevRoseStatusEl) prevRoseStatusEl.innerText = `Ready to compile for ${toVal}...`;
    }

    // Set listeners for all text inputs to trigger real-time updates
    const previewInputs = [
        'inputOccasion', 'inputTo', 'inputFrom', 'inputMessage',
        'inputLetter1', 'inputLetter2', 'inputLetter3', 'inputPolaroidText',
        'inputMainPhotoUrl', 'inputEnvelopePhotoUrl'
    ];
    previewInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });

    // Generate Shareable Link modal connections
    const generateBtn = document.getElementById('generateBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const shareableLinkInput = document.getElementById('shareableLink');
    const copyBtn = document.getElementById('copyBtn');
    const previewLinkBtn = document.getElementById('previewLinkBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    generateBtn.addEventListener('click', () => {
        // Build config structure with central fields
        const config = {
            theme: activeTheme,
            o: document.getElementById('inputOccasion').value || DEFAULT_CONFIG.o,
            t: document.getElementById('inputTo').value || DEFAULT_CONFIG.t,
            f: document.getElementById('inputFrom').value || DEFAULT_CONFIG.f,
            m: document.getElementById('inputMessage').value || DEFAULT_CONFIG.m
        };

        // Add birthday theme custom fields specifically
        if (activeTheme === 'birthday') {
            const mainImgTab = document.querySelector('[data-section="card"] .img-tab-btn.active').dataset.tab;
            let mainPhoto = DEFAULT_CONFIG.p;
            if (mainImgTab === 'preset-main') {
                mainPhoto = selectedMainPhoto;
            } else if (mainImgTab === 'upload-main') {
                mainPhoto = uploadedMainPhoto || DEFAULT_CONFIG.p;
            } else if (mainImgTab === 'url-main') {
                mainPhoto = document.getElementById('inputMainPhotoUrl').value || DEFAULT_CONFIG.p;
            }

            const envelopeImgTab = document.querySelector('[data-section="letters"] .img-tab-btn.active').dataset.tab;
            let envelopePhoto = DEFAULT_CONFIG.li;
            if (envelopeImgTab === 'preset-envelope') {
                envelopePhoto = selectedEnvelopePhoto;
            } else if (envelopeImgTab === 'upload-envelope') {
                envelopePhoto = uploadedEnvelopePhoto || DEFAULT_CONFIG.li;
            } else if (envelopeImgTab === 'url-envelope') {
                envelopePhoto = document.getElementById('inputEnvelopePhotoUrl').value || DEFAULT_CONFIG.li;
            }

            config.p = mainPhoto;
            config.l1 = document.getElementById('inputLetter1').value || DEFAULT_CONFIG.l1;
            config.l2 = document.getElementById('inputLetter2').value || DEFAULT_CONFIG.l2;
            config.l3 = document.getElementById('inputLetter3').value || DEFAULT_CONFIG.l3;
            config.lp = document.getElementById('inputPolaroidText').value || DEFAULT_CONFIG.lp;
            config.li = envelopePhoto;
        }

        const encoded = encodeConfig(config);
        const baseUrl = window.location.href.split('#')[0].split('?')[0];
        const shareUrl = `${baseUrl}?w=${encoded}`;

        // Set baseline values in the modal
        shareableLinkInput.value = shareUrl;
        previewLinkBtn.href = shareUrl;

        // Reset info message
        const linkInfoMsg = document.getElementById('linkInfoMsg');
        linkInfoMsg.innerText = "";
        linkInfoMsg.style.color = "var(--accent-gold)";

        // Show Modal
        modalOverlay.classList.remove('hidden');
        setTimeout(() => modalOverlay.classList.add('show'), 50);

        // Attempt to shorten the link
        const isLocal = shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1') || shareUrl.startsWith('file:');

        if (isLocal) {
            linkInfoMsg.innerText = "ℹ️ Localhost link detected. Shortener only works on live websites. Once hosted online, it will shorten automatically!";
            linkInfoMsg.style.color = "var(--text-muted)";
        } else if (shareUrl.length < 4000) {
            linkInfoMsg.innerText = "⚡ Shortening your link for mobile sharing...";
            shortenUrl(shareUrl, (shortUrl) => {
                if (shortUrl) {
                    shareableLinkInput.value = shortUrl;
                    linkInfoMsg.innerText = "✅ Link successfully shortened! Ready to share.";
                    linkInfoMsg.style.color = "var(--accent-gold)";
                } else {
                    linkInfoMsg.innerText = "⚠️ Shortener API failed. You can copy the full URL below; it works perfectly!";
                    linkInfoMsg.style.color = "var(--text-muted)";
                }
            });
        } else {
            linkInfoMsg.innerText = "⚠️ Custom image size is large. Full URL copied below will work, but you can also shorten it manually on freeurlshortener.net";
            linkInfoMsg.style.color = "var(--text-muted)";
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        setTimeout(() => modalOverlay.classList.add('hidden'), 400);
    });

    copyBtn.addEventListener('click', () => {
        shareableLinkInput.select();
        shareableLinkInput.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(shareableLinkInput.value)
            .then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "Copied! ✓";
                copyBtn.style.background = "#2a944e";
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                    copyBtn.style.background = "";
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });

    // Initialize display with default theme
    applyThemeFields(activeTheme);
}
