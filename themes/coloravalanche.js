// ==========================================================================
// Color Avalanche Theme Module
// Source: Zip/extracted/color_avalanche
// ==========================================================================
function initColoravalancheTheme(config) {
    startColoravalancheAnimation(config);
}

function startColoravalancheAnimation(config) {
    let canvas = document.getElementById('caCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'caCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '2';
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

    const particles = [];
    const NUM_PARTICLES = 250;

    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            radius: Math.random() * 5 + 2,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 1,
            hue: Math.random() * 360,
            pulse: Math.random() * Math.PI * 2
        });
    }

    function animate(time) {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        ctx.fillStyle = 'rgba(6, 2, 14, 0.2)';
        ctx.fillRect(0, 0, W, H);

        const sec = time * 0.001;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y += p.vy;
            p.x += Math.sin(sec + p.pulse) * 1.5;
            p.hue = (p.hue + 0.5) % 360;

            if (p.y > H + 10) {
                p.y = -10;
                p.x = Math.random() * W;
            }

            ctx.save();
            ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
            ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    canvas.removeAttribute('data-stopped');
    requestAnimationFrame(animate);
}
