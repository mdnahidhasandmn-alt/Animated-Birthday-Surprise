// ==========================================================================
// Fireworks Launcher Theme Module
// Source: Zip/extracted/Fireworks_launcher_tcw
// ==========================================================================
function initFireworksTheme(config) {
    startFireworksAnimation(config);
}

function startFireworksAnimation(config) {
    let canvas = document.getElementById('fwCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'fwCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'auto';
        canvas.style.zIndex = '2';
        document.getElementById('wishContainer').appendChild(canvas);
    }
    canvas.style.display = 'block';
    const c = canvas.getContext('2d');

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#ff2a75', '#ffc107', '#a855f7', '#06b6d4', '#ffffff', '#ff85c0'];

    function createFirework(x, y) {
        const count = 70;
        const baseHue = Math.random() * 360;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = Math.random() * 6 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.018 + 0.012,
                color: `hsl(${baseHue + Math.random() * 40}, 100%, 65%)`,
                size: Math.random() * 3 + 1.5
            });
        }
    }

    // Auto launch fireworks periodically
    let autoLaunchTimer = setInterval(() => {
        if (canvas.getAttribute('data-stopped') === 'true') {
            clearInterval(autoLaunchTimer);
            return;
        }
        createFirework(Math.random() * W, Math.random() * (H * 0.6) + 100);
    }, 800);

    // Click to launch firework
    canvas.addEventListener('pointerdown', (e) => {
        createFirework(e.clientX, e.clientY);
    });

    function animate() {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        c.fillStyle = 'rgba(6, 2, 14, 0.2)';
        c.fillRect(0, 0, W, H);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            c.save();
            c.globalAlpha = p.alpha;
            c.fillStyle = p.color;
            c.shadowColor = p.color;
            c.shadowBlur = 8;
            c.beginPath();
            c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            c.fill();
            c.restore();
        }
    }

    canvas.removeAttribute('data-stopped');
    requestAnimationFrame(animate);
}
