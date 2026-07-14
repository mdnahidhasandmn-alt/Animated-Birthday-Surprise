// ==========================================================================
// Rose Surprise Theme Module
// ==========================================================================
function initRoseTheme(config) {
    startRoseAnimation(config);
}

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
