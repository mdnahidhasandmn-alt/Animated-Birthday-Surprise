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

// Shorten URL anonymously via TinyURL using a public CORS proxy (corsproxy.io)
function shortenUrl(longUrl, callback) {
    const targetUrl = `https://corsproxy.io/?https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
    
    fetch(targetUrl)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error("Shortener API failed");
        })
        .then(shortUrl => {
            if (shortUrl && shortUrl.startsWith('http')) {
                callback(shortUrl.trim());
            } else {
                callback(null);
            }
        })
        .catch(error => {
            console.warn("URL shortening failed:", error);
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

// Background particles shared between both modes
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
    // Check if configuration hash is present
    let hashData = "";
    if (window.location.hash.startsWith('#w=')) {
        hashData = window.location.hash.substring(3);
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        hashData = urlParams.get('w') || "";
    }

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
            startHeartbeatAnimation(SURPRISE_CONFIG);
        } else if (SURPRISE_CONFIG.theme === 'rose') {
            document.getElementById('wishContainer').classList.add('hidden');
            document.getElementById('heartbeatContainer').classList.add('hidden');
            document.getElementById('roseContainer').classList.remove('hidden');

            // Populate Rose Viewer DOM
            document.getElementById('roseLoaderTitle').innerText = SURPRISE_CONFIG.occasionText;
            document.getElementById('roseTagline').innerHTML = `${SURPRISE_CONFIG.message || 'i coded this for you'}`;

            initBackground();
            startRoseAnimation(SURPRISE_CONFIG);
        } else {
            document.getElementById('heartbeatContainer').classList.add('hidden');
            document.getElementById('roseContainer').classList.add('hidden');
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
            initAnimator();
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
// 1. CREATOR MODE LOGIC
// ==========================================
function initCreator() {
    let activeTheme = 'birthday';

    // Theme selector tabs
    const themeTabBtns = document.querySelectorAll('.theme-tab-btn');
    themeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTheme = btn.dataset.theme;
            
            // Show/hide form sections based on theme
            const lettersSection = document.querySelector('.form-section[data-section="letters"]');
            const cardSection = document.querySelector('.form-section[data-section="card"]');
            const previewTabLetters = document.querySelector('.preview-tab-btn[data-prev="letters"]');
            const previewTabCard = document.querySelector('.preview-tab-btn[data-prev="card"]');
            const photoGroup = cardSection.querySelector('.section-content').querySelectorAll('.input-group')[1];
            
            if (activeTheme === 'heartbeat') {
                lettersSection.style.display = 'none';
                if (photoGroup) photoGroup.style.display = 'none';
                cardSection.querySelector('label[for="inputMessage"]').innerText = 'Heartbeat Letter Text';
                
                previewTabLetters.style.display = 'none';
                previewTabCard.innerText = 'Heartbeat Preview';
                
                document.querySelectorAll('.mockup-view').forEach(v => v.classList.remove('active'));
                document.getElementById('view-prev-heartbeat').classList.add('active');
                previewTabCard.classList.add('active');
                previewTabLetters.classList.remove('active');
            } else if (activeTheme === 'rose') {
                lettersSection.style.display = 'none';
                if (photoGroup) photoGroup.style.display = 'none';
                cardSection.querySelector('label[for="inputMessage"]').innerText = 'Rose Tagline Text';
                
                previewTabLetters.style.display = 'none';
                previewTabCard.innerText = 'Rose Preview';
                
                document.querySelectorAll('.mockup-view').forEach(v => v.classList.remove('active'));
                document.getElementById('view-prev-rose').classList.add('active');
                previewTabCard.classList.add('active');
                previewTabLetters.classList.remove('active');
            } else {
                lettersSection.style.display = 'block';
                if (photoGroup) photoGroup.style.display = 'block';
                cardSection.querySelector('label[for="inputMessage"]').innerText = 'Typed Love Letter Message';
                
                previewTabLetters.style.display = 'inline-block';
                previewTabCard.innerText = 'Main Card';
                
                previewTabCard.click();
            }
            updatePreview();
        });
    });

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
                sec.querySelector(`#${targetId}`).classList.add('active');
                updatePreview();
            });
        });
    });

    // Mockup Screen Tabs
    const previewTabBtns = document.querySelectorAll('.preview-tab-btn');
    const mockupViews = document.querySelectorAll('.mockup-view');
    previewTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            previewTabBtns.forEach(b => b.classList.remove('active'));
            mockupViews.forEach(v => v.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = `view-prev-${btn.dataset.prev}`;
            document.getElementById(targetId).classList.add('active');
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

        // Apply to mockup preview elements
        document.getElementById('prevOccasion').innerText = occasionVal;
        document.getElementById('prevTo').innerText = toVal;
        document.getElementById('prevFrom').innerText = fromVal;
        document.getElementById('prevMessage').innerText = messageVal;
        document.getElementById('prevMainPhoto').src = mainPhoto;

        document.getElementById('prevL1').innerText = letter1Val;
        document.getElementById('prevL1Sig').innerText = fromVal;
        document.getElementById('prevL2').innerText = letter2Val;
        document.getElementById('prevL2Sig').innerText = fromVal;
        document.getElementById('prevEnvelopePhotoText').innerText = polaroidTextVal;
        document.getElementById('prevEnvelopePhoto').src = envelopePhoto;

        // Apply to heartbeat mockup preview
        document.getElementById('prevHbTitle').innerText = occasionVal;
        document.getElementById('prevHbStatus').innerText = `Compiling love coordinates for ${toVal}...`;

        // Apply to rose mockup preview
        document.getElementById('prevRoseTitle').innerText = occasionVal;
        document.getElementById('prevRoseStatus').innerText = `Ready to compile for ${toVal}...`;
    }

    // Set listeners for all text inputs to trigger real-time updates
    const previewInputs = [
        'inputOccasion', 'inputTo', 'inputFrom', 'inputMessage',
        'inputLetter1', 'inputLetter2', 'inputLetter3', 'inputPolaroidText',
        'inputMainPhotoUrl', 'inputEnvelopePhotoUrl'
    ];
    previewInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    // Initialize Preview once on start
    updatePreview();

    // Generate link modal triggers
    const generateBtn = document.getElementById('generateBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const shareableLinkInput = document.getElementById('shareableLink');
    const copyBtn = document.getElementById('copyBtn');
    const previewLinkBtn = document.getElementById('previewLinkBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    generateBtn.addEventListener('click', () => {
        // Build config structure
        const config = {
            theme: activeTheme,
            o: document.getElementById('inputOccasion').value || DEFAULT_CONFIG.o,
            t: document.getElementById('inputTo').value || DEFAULT_CONFIG.t,
            f: document.getElementById('inputFrom').value || DEFAULT_CONFIG.f,
            m: document.getElementById('inputMessage').value || DEFAULT_CONFIG.m
        };

        if (activeTheme === 'birthday') {
            // Collect photo selections based on active tabs
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
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}#w=${encoded}`;

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

        // Attempt to shorten the link if it is within server length limitations
        const isLocal = shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1') || shareUrl.startsWith('file:');

        if (isLocal) {
            linkInfoMsg.innerText = "ℹ️ Localhost link detected. Shortener only works on live websites. Once hosted online, it will shorten automatically!";
            linkInfoMsg.style.color = "var(--text-muted)";
        } else if (shareUrl.length < 4000) {
            linkInfoMsg.innerText = "⚡ Shortening your link for mobile sharing...";
            shortenUrl(shareUrl, (shortUrl) => {
                if (shortUrl) {
                    shareableLinkInput.value = shortUrl;
                    previewLinkBtn.href = shortUrl;
                    linkInfoMsg.innerText = "✓ Shortened successfully! Perfect for mobile sharing.";
                    linkInfoMsg.style.color = "#2ec4b6";
                } else {
                    linkInfoMsg.innerText = "ℹ️ Using full link (shortener rate-limited or offline, link still works!).";
                    linkInfoMsg.style.color = "var(--text-muted)";
                }
            });
        } else {
            // Uploaded images make it too long for anonymous GET shortening APIs
            linkInfoMsg.innerText = "ℹ️ Using full link. Custom image uploads make the link longer but fully self-contained.";
            linkInfoMsg.style.color = "var(--text-muted)";
        }
    });

    // Close Modal
    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        setTimeout(() => modalOverlay.classList.add('hidden'), 350);
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        shareableLinkInput.select();
        shareableLinkInput.setSelectionRange(0, 99999); // for mobile
        
        try {
            navigator.clipboard.writeText(shareableLinkInput.value).then(() => {
                showCopiedState();
            }).catch(() => {
                // Fallback copy execCommand
                document.execCommand('copy');
                showCopiedState();
            });
        } catch (err) {
            document.execCommand('copy');
            showCopiedState();
        }
    });

    function showCopiedState() {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Copied! ✓";
        copyBtn.style.background = "#2ec4b6";
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.background = "";
        }, 2000);
    }
}

// ==========================================
// 2. SURPRISE WISH ANIMATION LOGIC (VIEWER)
// ==========================================
function initAnimator() {
    const partnerNameEl = document.getElementById('partnerName');
    const senderNameEl = document.getElementById('senderName');
    const occasionTextEl = document.getElementById('occasionText');
    const customMessageEl = document.getElementById('customMessage');
    const giftBox = document.getElementById('giftBox');
    const giftBoxContainer = document.getElementById('giftBoxContainer');
    const memoryCard = document.getElementById('memoryCard');
    const skipTypingBtn = document.getElementById('skipTypingBtn');
    const canvas = document.getElementById('balloonCanvas');
    const ctx = canvas.getContext('2d');

    // Populate images into balloon elements
    const imageSources = [
        SURPRISE_CONFIG.photoUrl,
        SURPRISE_CONFIG.envelopePhotoUrl,
        "https://images.unsplash.com/photo-1513272795190-0b7c527757ed?w=150&auto=format&fit=crop&q=80"
    ];
    const loadedImages = [];
    imageSources.forEach(src => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        loadedImages.push(img);
    });

    let audioCtx = null;
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }
    function playChime() {
        initAudio();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const delay = i * 0.08;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + delay);
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.15, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.6);
        });
    }
    function playPop() {
        initAudio();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    let balloons = [];
    let popParticles = [];
    let trailParticles = [];
    let heartSparks = [];
    let isDrawingBalloons = false;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Balloon {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.type = Math.random() > 0.7 ? 'polaroid' : 'balloon';
            this.vy = -(Math.random() * 1.5 + 1.2);
            this.swaySpeed = Math.random() * 0.02 + 0.01;
            this.swayAmount = Math.random() * 15 + 10;
            this.swayOffset = Math.random() * Math.PI * 2;
            this.time = 0;
            if (this.type === 'balloon') {
                this.radiusX = Math.random() * 10 + 22;
                this.radiusY = this.radiusX * 1.25;
                const hues = [340, 350, 20, 200, 275, 45];
                this.hue = hues[Math.floor(Math.random() * hues.length)];
                this.color = `hsla(${this.hue}, 95%, 60%, 0.85)`;
                this.glow = `hsla(${this.hue}, 95%, 60%, 0.45)`;
                this.stringLength = Math.random() * 40 + 60;
            } else {
                this.width = 66;
                this.height = 78;
                this.rotation = (Math.random() - 0.5) * 0.3;
                this.rotSpeed = (Math.random() - 0.5) * 0.025;
                this.img = loadedImages[Math.floor(Math.random() * loadedImages.length)];
            }
        }
        update() {
            this.time += this.swaySpeed;
            this.y += this.vy;
            this.currentX = this.x + Math.sin(this.time + this.swayOffset) * this.swayAmount;
            if (this.type === 'polaroid') {
                this.rotation += this.rotSpeed;
            }
        }
        draw() {
            if (this.type === 'balloon') {
                ctx.beginPath();
                ctx.moveTo(this.currentX, this.y + this.radiusY);
                ctx.bezierCurveTo(
                    this.currentX - 5, this.y + this.radiusY + this.stringLength / 3,
                    this.currentX + 5, this.y + this.radiusY + (this.stringLength / 3) * 2,
                    this.currentX, this.y + this.radiusY + this.stringLength
                );
                ctx.strokeStyle = 'rgba(163, 149, 190, 0.4)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.save();
                ctx.shadowColor = this.glow;
                ctx.shadowBlur = 15;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.ellipse(this.currentX, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(this.currentX - this.radiusX / 3, this.y - this.radiusY / 3, this.radiusX / 4, this.radiusY / 4, -Math.PI / 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(this.currentX, this.y + this.radiusY);
                ctx.lineTo(this.currentX - 6, this.y + this.radiusY + 6);
                ctx.lineTo(this.currentX + 6, this.y + this.radiusY + 6);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            } else {
                ctx.save();
                ctx.translate(this.currentX, this.y);
                ctx.rotate(this.rotation);
                ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetY = 4;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
                if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
                    ctx.drawImage(this.img, -this.width / 2 + 4, -this.height / 2 + 4, this.width - 8, this.width - 16);
                } else {
                    ctx.fillStyle = '#1b0a2a';
                    ctx.fillRect(-this.width / 2 + 4, -this.height / 2 + 4, this.width - 8, this.width - 16);
                }
                ctx.fillStyle = '#ff3377';
                const hx = 0;
                const hy = this.height / 2 - 6;
                const hs = 3.5;
                ctx.beginPath();
                ctx.moveTo(hx, hy - hs / 4);
                ctx.quadraticCurveTo(hx - hs / 2, hy - hs * 0.8, hx - hs, hy - hs / 4);
                ctx.quadraticCurveTo(hx - hs, hy + hs / 3, hx, hy + hs * 0.95);
                ctx.quadraticCurveTo(hx + hs, hy + hs / 3, hx + hs, hy - hs / 4);
                ctx.quadraticCurveTo(hx + hs / 2, hy - hs * 0.8, hx, hy - hs / 4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
        isClicked(mx, my) {
            if (this.type === 'balloon') {
                const dx = mx - this.currentX;
                const dy = my - this.y;
                return (dx * dx) / (this.radiusX * this.radiusX) + (dy * dy) / (this.radiusY * this.radiusY) <= 1;
            } else {
                const dx = mx - this.currentX;
                const dy = my - this.y;
                return Math.abs(dx) <= this.width / 2 && Math.abs(dy) <= this.height / 2;
            }
        }
    }

    class PopParticle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 3 + 2;
            this.hue = hue;
            this.opacity = 1;
            this.gravity = 0.08;
            this.fadeSpeed = Math.random() * 0.02 + 0.02;
        }
        update() {
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= this.fadeSpeed;
        }
        draw() {
            ctx.fillStyle = `hsla(${this.hue}, 95%, 60%, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class TrailParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = -(Math.random() * 1.2 + 0.6);
            this.size = Math.random() * 3 + 2;
            this.opacity = 1;
            this.fade = Math.random() * 0.015 + 0.015;
            this.hue = Math.random() > 0.5 ? 340 : 45;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= this.fade;
        }
        draw() {
            ctx.save();
            ctx.fillStyle = `hsla(${this.hue}, 95%, 65%, ${this.opacity})`;
            ctx.shadowColor = `hsla(${this.hue}, 95%, 65%, 0.45)`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function spawnBalloons() {
        for (let i = 0; i < 24; i++) {
            setTimeout(() => {
                if (giftBox.classList.contains('open')) {
                    const spawnX = Math.random() * (window.innerWidth - 100) + 50;
                    const spawnY = window.innerHeight + 80;
                    balloons.push(new Balloon(spawnX, spawnY));
                }
            }, i * 135);
        }
        if (!isDrawingBalloons) {
            isDrawingBalloons = true;
            animateBalloons();
        }
    }

    function animateBalloons() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = heartSparks.length - 1; i >= 0; i--) {
            const p = heartSparks[i];
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.vy += 0.05;
            p.x += p.vx;
            p.y += p.vy;
            p.opacity -= p.fade;
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${p.opacity})`;
            ctx.shadowColor = `hsla(${p.hue}, 95%, 65%, 0.45)`;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.size / 4);
            ctx.quadraticCurveTo(p.x - p.size / 2, p.y - p.size * 0.8, p.x - p.size, p.y - p.size / 4);
            ctx.quadraticCurveTo(p.x - p.size, p.y + p.size / 3, p.x, p.y + p.size * 0.95);
            ctx.quadraticCurveTo(p.x + p.size, p.y + p.size / 3, p.x + p.size, p.y - p.size / 4);
            ctx.quadraticCurveTo(p.x + p.size / 2, p.y - p.size * 0.8, p.x, p.y - p.size / 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            if (p.opacity <= 0) heartSparks.splice(i, 1);
        }
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i];
            p.update();
            p.draw();
            if (p.opacity <= 0) trailParticles.splice(i, 1);
        }
        for (let i = popParticles.length - 1; i >= 0; i--) {
            const p = popParticles[i];
            p.update();
            p.draw();
            if (p.opacity <= 0) popParticles.splice(i, 1);
        }
        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            b.update();
            b.draw();
            if (b.y < -b.radiusY * 2) {
                balloons.splice(i, 1);
            }
        }
        if (balloons.length > 0 || popParticles.length > 0 || trailParticles.length > 0 || heartSparks.length > 0) {
            requestAnimationFrame(animateBalloons);
        } else {
            isDrawingBalloons = false;
            canvas.style.pointerEvents = 'none';
        }
    }

    canvas.addEventListener('click', (e) => {
        const mx = e.clientX;
        const my = e.clientY;
        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            if (b.isClicked(mx, my)) {
                playPop();
                for (let k = 0; k < 12; k++) {
                    popParticles.push(new PopParticle(b.currentX, b.y, b.hue));
                }
                balloons.splice(i, 1);
                break;
            }
        }
    });

    function addTrail(x, y) {
        for (let i = 0; i < 2; i++) {
            trailParticles.push(new TrailParticle(x, y));
        }
        if (!isDrawingBalloons) {
            isDrawingBalloons = true;
            animateBalloons();
        }
    }

    document.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('wish-mode')) {
            addTrail(e.clientX, e.clientY);
        }
    });
    document.addEventListener('touchmove', (e) => {
        if (document.body.classList.contains('wish-mode') && e.touches.length > 0) {
            addTrail(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    document.addEventListener('dblclick', (e) => {
        if (!document.body.classList.contains('wish-mode') || memoryCard.classList.contains('hidden')) return;
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1.5;
            heartSparks.push({
                x: e.clientX,
                y: e.clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: Math.random() * 6 + 5,
                opacity: 1,
                fade: Math.random() * 0.012 + 0.01,
                hue: Math.random() > 0.5 ? 340 : 355
            });
        }
        playPop();
        if (!isDrawingBalloons) {
            isDrawingBalloons = true;
            animateBalloons();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!document.body.classList.contains('wish-mode') || memoryCard.classList.contains('hidden')) return;
        const halfWidth = window.innerWidth / 2;
        const halfHeight = window.innerHeight / 2;
        const rotateX = -(e.clientY - halfHeight) / halfHeight * 6;
        const rotateY = (e.clientX - halfWidth) / halfWidth * 6;
        memoryCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    document.addEventListener('mouseleave', () => {
        if (document.body.classList.contains('wish-mode') && !memoryCard.classList.contains('hidden')) {
            memoryCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        }
    });

    function typeMessage() {
        const text = SURPRISE_CONFIG.message;
        customMessageEl.innerText = "";
        customMessageEl.style.opacity = "1";
        customMessageEl.classList.add('fade-in');
        const cursor = document.createElement('span');
        cursor.classList.add('typing-cursor');
        cursor.innerText = "|";
        customMessageEl.appendChild(cursor);
        let i = 0;
        let typingActive = true;
        skipTypingBtn.classList.add('show');
        function type() {
            if (!typingActive) return;
            if (i < text.length) {
                cursor.before(text.charAt(i));
                i++;
                const char = text.charAt(i - 1);
                const delay = (char === '.' || char === '!' || char === '?') ? 800 : (char === ',') ? 350 : 65;
                setTimeout(type, delay);
            } else {
                cursor.remove();
            }
        }
        skipTypingBtn.onclick = () => {
            if (typingActive) {
                typingActive = false;
                cursor.before(text.substring(i));
                cursor.remove();
            }
            const rect = skipTypingBtn.getBoundingClientRect();
            for (let k = 0; k < 12; k++) {
                heartSparks.push({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8 - 2,
                    size: Math.random() * 6 + 4,
                    opacity: 1,
                    fade: Math.random() * 0.02 + 0.02,
                    hue: 340
                });
            }
            playPop();
            openEnvelopeOverlay();
        };
        type();
    }

    function spawnHeartFireworks(x, y) {
        const particleCount = 80;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 3;
            heartSparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: Math.random() * 8 + 5,
                opacity: 1,
                fade: Math.random() * 0.015 + 0.01,
                hue: Math.random() > 0.5 ? 340 : 355
            });
        }
    }

    giftBoxContainer.addEventListener('click', () => {
        if (giftBox.classList.contains('open')) return;
        playChime();
        giftBox.classList.add('open');
        const boxGlow = document.getElementById('boxGlow');
        boxGlow.classList.add('active');
        canvas.style.pointerEvents = 'auto';
        spawnHeartFireworks(window.innerWidth / 2, window.innerHeight / 2);
        spawnBalloons();
        setTimeout(() => {
            giftBoxContainer.classList.add('fade-out');
        }, 900);
        setTimeout(() => {
            giftBoxContainer.style.display = 'none';
            memoryCard.style.display = 'block';
            memoryCard.offsetHeight;
            memoryCard.classList.remove('hidden');
            memoryCard.classList.add('entering');
            typeMessage();
        }, 1400);
    });

    const envelopeOverlay = document.getElementById('envelopeOverlay');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const openEnvelopeBtn = document.getElementById('openEnvelopeBtn');
    const popupEnvelope = document.getElementById('popupEnvelope');
    let zIndexCounter = 300;

    function openEnvelopeOverlay() {
        envelopeOverlay.classList.remove('hidden');
        envelopeOverlay.offsetHeight;
        envelopeOverlay.classList.add('show');
        popupEnvelope.classList.remove('active');
        openEnvelopeBtn.style.opacity = '1';
        openEnvelopeBtn.style.pointerEvents = 'auto';
        const draggableLetters = document.querySelectorAll('.draggable-item');
        draggableLetters.forEach((item) => {
            item.style.display = 'flex';
            item.style.opacity = '0';
            item.style.transform = 'translate(-50%, -50%) scale(0.1) translateY(120px)';
            item.style.left = '50%';
            item.style.top = '35%';
            item.style.zIndex = '1';
        });
    }

    openEnvelopeBtn.addEventListener('click', () => {
        popupEnvelope.classList.add('active');
        playChime();
        const draggableLetters = document.querySelectorAll('.draggable-item');
        const fanOffsets = [
            { dx: -80, dy: -130, rot: -8 },
            { dx: 80, dy: -150, rot: 8 },
            { dx: -20, dy: -200, rot: -4 },
            { dx: 50, dy: -70, rot: 10 }
        ];
        draggableLetters.forEach((item, index) => {
            const offset = fanOffsets[index] || { dx: 0, dy: -100, rot: 0 };
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = `translate(calc(-50% + ${offset.dx}px), calc(-50% + ${offset.dy}px)) scale(1) rotate(${offset.rot}deg)`;
            }, 300 + (index * 250));
        });
    });

    closeOverlayBtn.addEventListener('click', () => {
        envelopeOverlay.classList.remove('show');
        setTimeout(() => {
            envelopeOverlay.classList.add('hidden');
        }, 400);
    });

    const closeButtons = document.querySelectorAll('.closeLetter');
    closeButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const letter = e.target.closest('.draggable-item');
            if (letter) {
                letter.style.opacity = '0';
                letter.style.transform = 'translate(-50%, -50%) scale(0.1) translateY(100px)';
                playPop();
                setTimeout(() => {
                    letter.style.display = 'none';
                }, 400);
            }
        });
    });

    const draggableLetters = document.querySelectorAll('.draggable-item');
    draggableLetters.forEach((item) => {
        let startX = 0, startY = 0;
        let initialX = 0, initialY = 0;
        let isDragging = false;
        const getTransformValues = (el) => {
            const style = window.getComputedStyle(el);
            const matrix = style.transform || style.webkitTransform;
            if (!matrix || matrix === 'none') {
                return { x: 0, y: 0, scale: 1, rotate: 0 };
            }
            const values = matrix.split('(')[1].split(')')[0].split(',');
            const a = parseFloat(values[0]);
            const b = parseFloat(values[1]);
            const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            const tx = parseFloat(values[4]) || 0;
            const ty = parseFloat(values[5]) || 0;
            return { x: tx, y: ty, rotate: angle };
        };
        const dragStart = (e) => {
            if (e.target.closest('.closeLetter')) return;
            if (e.type === 'mousedown') {
                e.preventDefault();
            }
            isDragging = true;
            item.classList.add('dragging');
            item.style.cursor = 'grabbing';
            item.style.zIndex = zIndexCounter++;
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            startX = clientX;
            startY = clientY;
            const transform = getTransformValues(item);
            initialX = transform.x;
            initialY = transform.y;
            item.dataset.rotate = transform.rotate;
            if (e.type === 'mousedown') {
                document.addEventListener('mousemove', dragMove);
                document.addEventListener('mouseup', dragEnd);
            } else if (e.type === 'touchstart') {
                document.addEventListener('touchmove', dragMove, { passive: false });
                document.addEventListener('touchend', dragEnd);
            }
        };
        const dragMove = (e) => {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            const dx = clientX - startX;
            const dy = clientY - startY;
            const rot = item.dataset.rotate || 0;
            item.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px) scale(1.03) rotate(${rot}deg)`;
        };
        const dragEnd = () => {
            isDragging = false;
            item.classList.remove('dragging');
            item.style.cursor = 'grab';
            const transform = getTransformValues(item);
            const rot = item.dataset.rotate || 0;
            item.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(1) rotate(${rot}deg)`;
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('touchend', dragEnd);
        };
        item.addEventListener('mousedown', dragStart);
        item.addEventListener('touchstart', dragStart, { passive: true });
        item.addEventListener('dragstart', (e) => e.preventDefault());
    });
}

// ==========================================
// 3D HEARTBEAT THEME ANIMATION LOGIC
// ==========================================
function startHeartbeatAnimation(config) {
    const canvas = document.getElementById('hbCanvas');
    const ctx = canvas.getContext('2d');

    let W = window.innerWidth;
    let H = window.innerHeight;
    let CX = W / 2;
    let CY = H / 2;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let scale = Math.min(W, H) * 0.22;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        CX = W / 2;
        CY = H / 2;
        scale = Math.min(W, H) * 0.22;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    const NUM_POINTS = 180;
    const ROTATION_SPEED_Y = 0.012;

    const WORDS = [
        'I love you', 'i love you', '❤', 'love', 'te amo', 'je t\'aime',
        'forever', 'always', 'you', 'me & you', 'love you', 'sweetheart'
    ];

    let startTimestamp = null;
    let isIntroFinished = false;

    function playClickSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const audioCtx = new AudioCtx();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) { }
    }

    function startCardLoader() {
        const loadingBar = document.getElementById('hbLoadingBar');
        const statusText = document.getElementById('hbStatusText');
        const startBtn = document.getElementById('hbStartBtn');

        const duration = 2400;
        const steps = [
            { threshold: 20, text: 'Loading heartbeat.js...' },
            { threshold: 50, text: 'Compiling 3D coordinates...' },
            { threshold: 80, text: `Generating love particles for ${config.partnerName}...` },
            { threshold: 95, text: 'Syncing heartbeat rhythm...' },
            { threshold: 100, text: 'Ready.' }
        ];

        let loaderStart = null;

        function animateLoader(timestamp) {
            if (!loaderStart) loaderStart = timestamp;
            const progress = Math.min((timestamp - loaderStart) / duration, 1);
            const percent = Math.floor(progress * 100);

            loadingBar.style.width = `${percent}%`;
            const activeStep = steps.find(s => percent <= s.threshold) || steps[steps.length - 1];
            statusText.textContent = activeStep.text;

            if (progress < 1) {
                requestAnimationFrame(animateLoader);
            } else {
                startBtn.removeAttribute('disabled');
            }
        }

        requestAnimationFrame(animateLoader);
    }

    setTimeout(startCardLoader, 400);

    const hbStartBtn = document.getElementById('hbStartBtn');
    hbStartBtn.addEventListener('click', () => {
        playClickSound();
        document.getElementById('hbStartOverlay').classList.add('fade-out');
        setTimeout(() => {
            startTimestamp = performance.now();
            isIntroFinished = true;
        }, 800);
    });

    let isLetterOpen = false;
    let isLetterTyping = false;
    
    // Custom letter text from configuration
    const letterText = config.message || `Dear ${config.partnerName},\n\nI coded this heartbeat for you...\n\nEvery line of code, every pixel, and every beat is a reminder of how much you mean to me.\n\nNo matter where life takes us, my heart will always run in an infinite loop for you, beating forever 💗.`;

    function openLetter() {
        if (isLetterOpen) return;
        isLetterOpen = true;
        playClickSound();
        const overlay = document.getElementById('hbLetterOverlay');
        overlay.classList.add('active');

        const body = document.getElementById('hbLetterBody');
        body.innerHTML = '';

        if (isLetterTyping) return;
        isLetterTyping = true;

        let charIdx = 0;
        function typeChar() {
            if (!isLetterOpen) {
                isLetterTyping = false;
                return;
            }
            if (charIdx < letterText.length) {
                const char = letterText[charIdx];
                if (char === '\n') {
                    body.innerHTML += '<br>';
                } else {
                    body.innerHTML += char;
                }
                charIdx++;
                setTimeout(typeChar, 35);
            } else {
                isLetterTyping = false;
            }
        }
        setTimeout(typeChar, 400);
    }

    function closeLetter() {
        isLetterOpen = false;
        playClickSound();
        document.getElementById('hbLetterOverlay').classList.remove('active');
    }

    document.getElementById('hbLetterClose').addEventListener('click', (e) => {
        e.stopPropagation();
        closeLetter();
    });

    document.getElementById('hbLetterOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('hbLetterOverlay')) {
            closeLetter();
        }
    });

    function getHeartPoint(t, layer) {
        const x = Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;

        const r = Math.sqrt(1 - layer * layer);
        const depthScale = 0.45 + 0.55 * r;

        return {
            x: x * depthScale * 1.5,
            y: (y * depthScale - 0.08) * 1.5,
            z: layer * 0.7
        };
    }

    function project3D(point, rotY, rotX) {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = point.y * cosX - z1 * sinX;
        const z2 = point.y * sinX + z1 * cosX;

        const dist = 3.5;
        const perspective = dist / (dist + z2);

        point.projX = CX + x1 * scale * perspective;
        point.projY = CY + y2 * scale * perspective;
        point.projZ = z2;
        point.projScale = perspective;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    // Helper functions for math
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    class Particle3D {
        constructor(index) {
            this.index = index;
            this.text = WORDS[index % WORDS.length];

            const spanX = W / scale;
            const spanY = H / scale;

            this.rainX = (Math.random() - 0.5) * spanX * 1.1;
            this.rainY = -spanY * 0.65 - Math.random() * spanY * 0.5;
            this.rainZ = (Math.random() - 0.5) * 0.4;

            this.speedY = Math.random() * 0.03 + 0.03;
            this.speedX = (Math.random() - 0.5) * 0.001;

            const theta = (index / NUM_POINTS) * Math.PI * 2 * 7;
            const layer = (index / NUM_POINTS) * 2 - 1;
            const hp = getHeartPoint(theta, layer);

            this.targetX = hp.x;
            this.targetY = hp.y;
            this.targetZ = hp.z;

            this.x = this.rainX;
            this.y = this.rainY;
            this.z = this.rainZ;

            this.trail = [];
            this.maxTrail = 5;

            this.assembleDelay = Math.random() * 0.4;
            this.fontSize = Math.random() < 0.25 ? 14 : (Math.random() < 0.7 ? 11.5 : 10);
            this.weight = '600';
            this.opacity = Math.random() * 0.3 + 0.7;
            this.noiseOffset = Math.random() * 100;
        }

        update(phase, progress, rotY, rotX, beatFactor, time) {
            const spanY = H / scale;

            if (phase === 'rain') {
                this.rainY += this.speedY;
                this.rainX += this.speedX;

                if (this.rainY > spanY * 0.6) {
                    this.rainY = -spanY * 0.65;
                    this.rainX = (Math.random() - 0.5) * (W / scale) * 1.1;
                    this.trail = [];
                }
                this.x = this.rainX;
                this.y = this.rainY;
                this.z = this.rainZ;

            } else if (phase === 'assemble') {
                const adjProgress = Math.max(0, Math.min(1, (progress - this.assembleDelay) / (1 - this.assembleDelay)));
                const t = easeInOutCubic(adjProgress);

                this.x = lerp(this.rainX, this.targetX * beatFactor, t);
                this.y = lerp(this.rainY, this.targetY * beatFactor, t);
                this.z = lerp(this.rainZ, this.targetZ * beatFactor, t);

            } else if (phase === 'beating') {
                const wave = Math.sin(time * 2.5 + this.noiseOffset) * 0.02;
                this.x = (this.targetX + wave) * beatFactor;
                this.y = (this.targetY + wave) * beatFactor;
                this.z = (this.targetZ + wave) * beatFactor;
            }

            const currentRotY = phase === 'rain' ? 0 : rotY;
            const currentRotX = phase === 'rain' ? 0.05 : rotX;

            project3D(this, currentRotY, currentRotX);

            if (phase !== 'beating') {
                this.trail.push({ x: this.projX, y: this.projY });
                if (this.trail.length > this.maxTrail) {
                    this.trail.shift();
                }
            } else {
                this.trail = [];
            }
        }
    }

    class Sparkle {
        constructor() {
            this.x = CX + (Math.random() - 0.5) * 30;
            this.y = CY + (Math.random() - 0.5) * 30 - 10;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - Math.random() * 1.2;
            this.size = Math.random() * 2.5 + 1;
            this.alpha = 1;
            this.decay = Math.random() * 0.025 + 0.02;
            this.isHeart = Math.random() < 0.4;

            const colors = [
                { r: 255, g: 45, b: 85 },
                { r: 196, g: 71, b: 245 },
                { r: 255, g: 107, b: 157 }
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.vy += 0.04;
            this.alpha -= this.decay;
        }

        draw() {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;

            if (this.isHeart) {
                const s = this.size * 2.5;
                ctx.translate(this.x, this.y);
                ctx.beginPath();
                ctx.moveTo(0, s * 0.3);
                ctx.bezierCurveTo(-s * 0.5, -s * 0.2, -s, s * 0.1, 0, s);
                ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.2, 0, s * 0.3);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class BackgroundStar {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 1.2 + 0.3;
            this.baseAlpha = Math.random() * 0.25 + 0.05;
            this.speed = Math.random() * 0.02 + 0.005;
            this.offset = Math.random() * Math.PI * 2;
        }

        draw(time) {
            const alpha = this.baseAlpha + Math.sin(time * this.speed + this.offset) * 0.08;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.02, alpha)})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const heartParticles = [];
    for (let i = 0; i < NUM_POINTS; i++) {
        heartParticles.push(new Particle3D(i));
    }

    const bgStars = [];
    for (let i = 0; i < 70; i++) {
        bgStars.push(new BackgroundStar());
    }

    let sparkles = [];
    let rotY = 0;
    let rotX = 0.2;

    const RAIN_DURATION = 2800;
    const ASSEMBLE_DURATION = 2200;

    let beatIntensity = 0;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let baseRotY = 0;
    let baseRotX = 0.2;

    function handleStart(e) {
        if (!isIntroFinished) return;
        isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        baseRotY = rotY;
        baseRotX = rotX;
    }

    function handleMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;

        rotY = baseRotY + dx * 0.007;
        rotX = Math.max(-0.6, Math.min(0.8, baseRotX + dy * 0.007));
    }

    function handleEnd(e) {
        isDragging = false;

        let clientX = startX;
        let clientY = startY;

        if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else if (e.clientX !== undefined) {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const dist = Math.hypot(clientX - startX, clientY - startY);

        if (dist < 6 && isIntroFinished) {
            const elapsed = performance.now() - startTimestamp;
            if (elapsed > RAIN_DURATION + ASSEMBLE_DURATION) {
                const overlay = document.getElementById('hbLetterOverlay');
                if (!overlay.classList.contains('active')) {
                    openLetter();
                }
            }
        }
    }

    window.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    window.addEventListener('touchstart', handleStart);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    function triggerBeatExplosion() {
        const count = Math.floor(Math.random() * 5) + 8;
        for (let i = 0; i < count; i++) {
            sparkles.push(new Sparkle());
        }
    }

    function loop(now) {
        if (!isIntroFinished) {
            requestAnimationFrame(loop);
            return;
        }

        const elapsed = now - startTimestamp;
        const time = now * 0.001;
        ctx.clearRect(0, 0, W, H);

        bgStars.forEach(star => star.draw(time));

        let phase = 'rain';
        let progress = 0;

        if (elapsed < RAIN_DURATION) {
            phase = 'rain';
            progress = elapsed / RAIN_DURATION;
        } else if (elapsed < RAIN_DURATION + ASSEMBLE_DURATION) {
            phase = 'assemble';
            progress = (elapsed - RAIN_DURATION) / ASSEMBLE_DURATION;
        } else {
            phase = 'beating';
            progress = 1.0;
        }

        let beatFactor = 1.0;
        if (phase === 'beating') {
            const beatCycle = 1500;
            const cycleProgress = (elapsed - (RAIN_DURATION + ASSEMBLE_DURATION)) % beatCycle;

            if (cycleProgress < 140) {
                const t = cycleProgress / 140;
                beatFactor = 1.0 + Math.sin(t * Math.PI) * 0.15;
                beatIntensity = Math.sin(t * Math.PI);
            } else if (cycleProgress >= 260 && cycleProgress < 410) {
                const t = (cycleProgress - 260) / 150;
                beatFactor = 1.0 + Math.sin(t * Math.PI) * 0.11;
                beatIntensity = Math.sin(t * Math.PI) * 0.7;
            } else {
                beatFactor = 1.0;
                beatIntensity = Math.max(0, beatIntensity - 0.04);
            }

            const triggerTolerance = 16;
            if (Math.abs(cycleProgress - 70) < triggerTolerance && sparkles.length < 25) {
                triggerBeatExplosion();
            }
            if (Math.abs(cycleProgress - 335) < triggerTolerance && sparkles.length < 25) {
                triggerBeatExplosion();
            }
        }

        const glowOpacity = phase === 'beating' ? 0.03 + beatIntensity * 0.08 : 0.02;
        const radialGlow = ctx.createRadialGradient(CX, CY, 10, CX, CY, Math.max(W, H) * 0.4);
        radialGlow.addColorStop(0, `rgba(255, 45, 85, ${glowOpacity})`);
        radialGlow.addColorStop(0.5, `rgba(196, 71, 245, ${glowOpacity * 0.3})`);
        radialGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, W, H);

        if (phase !== 'rain' && !isDragging) {
            rotY += ROTATION_SPEED_Y;
            rotX = 0.25 + Math.sin(time * 0.8) * 0.1;
        }

        for (let i = 0; i < NUM_POINTS; i++) {
            heartParticles[i].update(phase, progress, rotY, rotX, beatFactor, time);
        }

        heartParticles.sort((a, b) => a.projZ - b.projZ);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let lastFont = '';
        let lastColor = '';

        for (let i = 0; i < NUM_POINTS; i++) {
            const p = heartParticles[i];
            const zNorm = (p.projZ + 0.8) / 1.6;

            if (phase === 'beating' && zNorm > 0.55) {
                continue;
            }

            if (phase !== 'beating' && p.trail.length > 1) {
                const trailLen = p.trail.length;
                for (let j = 0; j < trailLen - 1; j++) {
                    const trailPos = p.trail[j];
                    const trailAlpha = (p.opacity * (j / trailLen) * 0.2).toFixed(2);

                    ctx.font = `${p.weight} ${Math.max(5, Math.round(p.fontSize * 0.7 * p.projScale))}px 'Plus Jakarta Sans', sans-serif`;
                    ctx.fillStyle = `rgba(255, 45, 85, ${trailAlpha})`;
                    ctx.fillText(p.text, trailPos.x, trailPos.y);
                }
                lastFont = '';
                lastColor = '';
            }

            const fSize = Math.max(7, Math.round(p.fontSize * p.projScale));
            const fontStr = `${p.weight} ${fSize}px 'Plus Jakarta Sans', sans-serif`;
            if (fontStr !== lastFont) {
                ctx.font = fontStr;
                lastFont = fontStr;
            }

            let r, g, b;
            if (phase === 'rain') {
                r = 255; g = 45; b = 85;
            } else {
                if (zNorm < 0.5) {
                    const t = zNorm * 2;
                    r = 255; g = Math.round(45 + t * 45); b = Math.round(85 + t * 45);
                } else {
                    const t = (zNorm - 0.5) * 2;
                    r = Math.round(255 - t * 80); g = Math.round(90 - t * 40); b = Math.round(130 + t * 100);
                }
            }

            let alpha = p.opacity * Math.max(0.15, (1.2 - zNorm));
            if (phase === 'beating') {
                if (zNorm > 0.45) {
                    alpha *= (0.55 - zNorm) / 0.1;
                }
            }

            const colorStr = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
            if (colorStr !== lastColor) {
                ctx.fillStyle = colorStr;
                lastColor = colorStr;
            }

            ctx.fillText(p.text, p.projX, p.projY);
        }

        sparkles = sparkles.filter(s => {
            s.update();
            s.draw();
            return s.alpha > 0;
        });

        const vignetteGlow = ctx.createRadialGradient(CX, CY, Math.min(W, H) * 0.3, CX, CY, Math.max(W, H) * 0.8);
        vignetteGlow.addColorStop(0, 'rgba(2, 0, 5, 0)');
        vignetteGlow.addColorStop(1, 'rgba(2, 0, 5, 0.7)');
        ctx.fillStyle = vignetteGlow;
        ctx.fillRect(0, 0, W, H);

        if (elapsed > RAIN_DURATION + 1000) {
            document.getElementById('hbMsg').classList.add('active');
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

// ==========================================
// 3. 3D BLOOMING ROSE THEME ANIMATION LOGIC
// ==========================================
function startRoseAnimation(config) {
    const triggerOverlay = document.getElementById('roseTriggerOverlay');
    const startButton = document.getElementById('roseStartButton');
    const loadingBar = document.getElementById('roseLoadingBar');
    const statusText = document.getElementById('roseStatusText');
    const ambientLight = document.getElementById('roseAmbientLight');
    const roseWrapper = document.getElementById('roseWrapper');
    const roseHead = document.getElementById('roseHead');
    const calyx = document.getElementById('roseCalyx');
    const stem = document.getElementById('roseStem');
    const leafLeft = document.getElementById('roseLeafLeft');
    const leafRight = document.getElementById('roseLeafRight');
    const endText = document.getElementById('roseEndText');
    const fallingPetalsEl = document.getElementById('roseFallingPetals');
    const scene = document.getElementById('roseScene');
    const starfield = document.getElementById('roseStarfield');
    const sparkleField = document.getElementById('roseSparkleField');
    const replayButton = document.getElementById('roseReplayButton');

    const PETAL_LAYERS = [
        { count: 4, w: 24, h: 46, curl: 78, delayBase: 0, tz: 2, cls: 'petal-bud' },
        { count: 5, w: 34, h: 58, curl: 65, delayBase: 0.25, tz: 9, cls: 'petal-core' },
        { count: 6, w: 46, h: 72, curl: 48, delayBase: 0.55, tz: 18, cls: 'petal-inner' },
        { count: 7, w: 58, h: 88, curl: 22, delayBase: 0.90, tz: 30, cls: 'petal-mid-inner' },
        { count: 8, w: 72, h: 104, curl: -5, delayBase: 1.30, tz: 44, cls: 'petal-mid' },
        { count: 9, w: 86, h: 118, curl: -25, delayBase: 1.75, tz: 60, cls: 'petal-outer' },
        { count: 10, w: 98, h: 130, curl: -48, delayBase: 2.25, tz: 76, cls: 'petal-blush' },
    ];

    const SEPALS_COUNT = 5;

    const FALLING_PETAL_COLORS = [
        ['#9a001d', '#3d0008'],
        ['#850018', '#2b0005'],
        ['#ad0022', '#480008'],
        ['#bf0028', '#52000c'],
    ];

    let fallingPetalInterval = null;

    function playClickSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const audioCtx = new AudioCtx();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
        } catch (e) { }
    }

    function createStarfield() {
        starfield.innerHTML = '';
        const count = window.innerWidth < 480 ? 35 : 60;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = 1 + Math.random() * 2;
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.setProperty('--s-size', `${size}px`);
            star.style.setProperty('--s-op', (0.2 + Math.random() * 0.5).toFixed(2));
            star.style.setProperty('--s-dur', `${3 + Math.random() * 4}s`);
            star.style.setProperty('--s-delay', `${Math.random() * 4}s`);
            frag.appendChild(star);
        }
        starfield.appendChild(frag);
    }

    function enableParallax() {
        const isTouch = matchMedia('(hover: none)').matches;
        if (isTouch) return;

        window.addEventListener('mousemove', (e) => {
            const px = ((e.clientX / window.innerWidth) - 0.5) * 24;
            const py = ((e.clientY / window.innerHeight) - 0.5) * 16;
            scene.style.setProperty('--px', `${px}px`);
            scene.style.setProperty('--py', `${py}px`);
        });
    }

    function spawnSparkleBurst() {
        const originX = window.innerWidth / 2;
        const originY = window.innerHeight * 0.35;
        const burstCount = 22;

        for (let i = 0; i < burstCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 160;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist - 30;
            const size = 3 + Math.random() * 5;
            const dur = 1 + Math.random() * 0.9;
            const delay = Math.random() * 1.4;

            sparkle.style.left = `${originX}px`;
            sparkle.style.top = `${originY}px`;
            sparkle.style.setProperty('--sp-size', `${size}px`);
            sparkle.style.setProperty('--sp-x', `${x}px`);
            sparkle.style.setProperty('--sp-y', `${y}px`);
            sparkle.style.setProperty('--sp-dur', `${dur}s`);
            sparkle.style.setProperty('--sp-delay', `${delay}s`);

            sparkleField.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), (dur + delay) * 1000 + 200);
        }
    }

    function startCardLoader() {
        const duration = 2400;
        const steps = [
            { threshold: 20, text: 'Loading Love.css...' },
            { threshold: 50, text: `Growing digital petals for ${config.partnerName}...` },
            { threshold: 80, text: 'Adding velvet textures...' },
            { threshold: 95, text: 'Optimizing 3D rendering...' },
            { threshold: 100, text: 'Ready to bloom!' }
        ];

        let startTimestamp = null;

        function animateLoader(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const percent = Math.floor(progress * 100);

            loadingBar.style.width = `${percent}%`;
            const activeStep = steps.find(s => percent <= s.threshold) || steps[steps.length - 1];
            statusText.textContent = activeStep.text;

            if (progress < 1) {
                requestAnimationFrame(animateLoader);
            } else {
                startButton.removeAttribute('disabled');
            }
        }

        requestAnimationFrame(animateLoader);
    }

    function createSepals() {
        calyx.innerHTML = '';
        const step = 360 / SEPALS_COUNT;
        for (let i = 0; i < SEPALS_COUNT; i++) {
            const sepal = document.createElement('div');
            sepal.className = 'sepal';
            const angle = i * step + (Math.random() - 0.5) * 5;
            const delay = 0.3 + i * 0.06;
            const curl = 18 + Math.random() * 8;

            sepal.style.setProperty('--sepal-angle', `${angle}deg`);
            sepal.style.setProperty('--sepal-curl', `${curl}deg`);
            sepal.style.setProperty('--sepal-delay', `${delay}s`);
            calyx.appendChild(sepal);
        }
    }

    function createPetals() {
        // Clear previous petals, leaving glow elements
        const glowElements = roseHead.querySelectorAll('.rose-glow, .rose-glow-inner');
        roseHead.innerHTML = '';
        glowElements.forEach(el => roseHead.appendChild(el));

        PETAL_LAYERS.forEach((layer, li) => {
            const angleStep = 360 / layer.count;
            const layerOffset = li * 24 + (Math.random() - 0.5) * 8;

            for (let i = 0; i < layer.count; i++) {
                const petal = document.createElement('div');
                petal.className = `petal ${layer.cls}`;

                const angle = layerOffset + i * angleStep + (Math.random() - 0.5) * 5;
                const delay = layer.delayBase + i * 0.05;
                const curlJitter = (Math.random() - 0.5) * 6;
                const scaleJitter = 0.94 + Math.random() * 0.12;
                const bloomDur = 2.1 + Math.random() * 0.4;

                petal.style.width = `${layer.w}px`;
                petal.style.height = `${layer.h}px`;
                petal.style.setProperty('--angle', `${angle}deg`);
                petal.style.setProperty('--curl', `${layer.curl + curlJitter}deg`);
                petal.style.setProperty('--scale', scaleJitter);
                petal.style.setProperty('--delay', `${delay}s`);
                petal.style.setProperty('--tz', `${layer.tz}px`);
                petal.style.setProperty('--bloom-dur', `${bloomDur}s`);

                roseHead.appendChild(petal);
            }
        });
    }

    function growStem() {
        return new Promise(resolve => {
            stem.classList.add('grow');

            setTimeout(() => {
                leafLeft.classList.add('visible');
            }, 800);

            setTimeout(() => {
                leafRight.classList.add('visible');
            }, 1100);

            setTimeout(resolve, 2200);
        });
    }

    function bloom() {
        calyx.classList.add('visible');
        ambientLight.classList.add('visible');
        roseHead.classList.add('blooming');
        spawnSparkleBurst();
    }

    function spawnFallingPetal() {
        if (fallingPetalsEl.childElementCount > 10) return;

        const petal = document.createElement('div');
        petal.className = 'falling-petal';

        const w = 10 + Math.random() * 12;
        const h = w * (1.25 + Math.random() * 0.15);
        const x = 20 + Math.random() * 60;
        const y = 3 + Math.random() * 10;
        const dur = 5.5 + Math.random() * 3.5;
        const delay = Math.random() * 0.6;

        const colors = FALLING_PETAL_COLORS[Math.floor(Math.random() * FALLING_PETAL_COLORS.length)];

        const sign = () => (Math.random() > 0.5 ? 1 : -1);
        const s1 = sign() * (15 + Math.random() * 25);
        const s2 = sign() * (10 + Math.random() * 20);
        const s3 = sign() * (20 + Math.random() * 30);
        const s4 = sign() * (10 + Math.random() * 15);

        petal.style.left = `${x}vw`;
        petal.style.top = `${y}vh`;
        petal.style.setProperty('--fp-w', `${w}px`);
        petal.style.setProperty('--fp-h', `${h}px`);
        petal.style.setProperty('--fp-c1', colors[0]);
        petal.style.setProperty('--fp-c2', colors[1]);
        petal.style.setProperty('--f-dur', `${dur}s`);
        petal.style.setProperty('--f-delay', `${delay}s`);
        petal.style.setProperty('--s1', `${s1}px`);
        petal.style.setProperty('--s2', `${s2}px`);
        petal.style.setProperty('--s3', `${s3}px`);
        petal.style.setProperty('--s4', `${s4}px`);

        fallingPetalsEl.appendChild(petal);

        setTimeout(() => {
            if (petal.parentNode) petal.remove();
        }, (dur + delay) * 1000 + 300);
    }

    function startFallingPetals() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => spawnFallingPetal(), i * 300);
        }

        fallingPetalInterval = setInterval(() => {
            spawnFallingPetal();
        }, 2200);
    }

    async function startAnimationSequence() {
        await growStem();
        await delay(100);
        bloom();

        setTimeout(() => {
            roseWrapper.classList.add('rotating');
        }, 2600);

        setTimeout(() => startFallingPetals(), 3400);

        setTimeout(() => {
            endText.classList.add('visible');
        }, 4600);
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function resetScene() {
        clearInterval(fallingPetalInterval);
        fallingPetalsEl.innerHTML = '';
        sparkleField.innerHTML = '';

        endText.classList.remove('visible');
        roseWrapper.classList.remove('rotating');
        roseHead.classList.remove('blooming');
        calyx.classList.remove('visible');
        ambientLight.classList.remove('visible');
        stem.classList.remove('grow');
        leafLeft.classList.remove('visible');
        leafRight.classList.remove('visible');
    }

    startButton.addEventListener('click', () => {
        playClickSound();
        triggerOverlay.classList.add('fade-out');

        setTimeout(() => {
            startAnimationSequence();
        }, 800);
    });

    replayButton.addEventListener('click', () => {
        playClickSound();
        resetScene();
        createSepals();
        createPetals();
        setTimeout(() => {
            startAnimationSequence();
        }, 500);
    });

    createSepals();
    createPetals();
    createStarfield();
    enableParallax();

    setTimeout(() => {
        startCardLoader();
    }, 400);
}
