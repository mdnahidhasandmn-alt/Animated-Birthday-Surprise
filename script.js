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
    const targetUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
    
    fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error("Shortener API failed");
        })
        .then(shortUrl => {
            if (shortUrl && shortUrl.startsWith('http')) {
                callback(shortUrl);
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
    } else {
        // --- CREATOR MODE ---
        document.body.classList.add('creator-mode');
        document.getElementById('wishContainer').classList.add('hidden');
        document.getElementById('creatorContainer').classList.remove('hidden');

        initBackground();
        initCreator();
    }
});

// ==========================================
// 1. CREATOR MODE LOGIC
// ==========================================
function initCreator() {
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

        // Build config structure
        const config = {
            o: document.getElementById('inputOccasion').value || DEFAULT_CONFIG.o,
            t: document.getElementById('inputTo').value || DEFAULT_CONFIG.t,
            f: document.getElementById('inputFrom').value || DEFAULT_CONFIG.f,
            m: document.getElementById('inputMessage').value || DEFAULT_CONFIG.m,
            p: mainPhoto,
            l1: document.getElementById('inputLetter1').value || DEFAULT_CONFIG.l1,
            l2: document.getElementById('inputLetter2').value || DEFAULT_CONFIG.l2,
            l3: document.getElementById('inputLetter3').value || DEFAULT_CONFIG.l3,
            lp: document.getElementById('inputPolaroidText').value || DEFAULT_CONFIG.lp,
            li: envelopePhoto
        };

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
