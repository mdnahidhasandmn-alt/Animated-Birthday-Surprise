// ==========================================================================
// Crystal Heart Theme Module
// Source: Zip/extracted/Crystal_Heart_Animation_tcw
// ==========================================================================
function initCrystalheartTheme(config) {
    startCrystalheartAnimation(config);
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

    const crystals = [];
    const NUM_CRYSTALS = 120;

    for (let i = 0; i < NUM_CRYSTALS; i++) {
        const t = (i / NUM_CRYSTALS) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        crystals.push({
            hx: x,
            hy: y,
            z: (Math.random() - 0.5) * 10,
            size: Math.random() * 4 + 2,
            hue: Math.random() * 60 + 320, // Pink to Cyan
            sparkle: Math.random() * Math.PI * 2
        });
    }

    let angleY = 0;

    function animate(time) {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        ctx.fillStyle = 'rgba(6, 2, 14, 0.25)';
        ctx.fillRect(0, 0, W, H);

        angleY += 0.015;
        const sec = time * 0.001;
        const scale = Math.min(W, H) * 0.018;

        ctx.save();
        ctx.translate(W / 2, H / 2 - 20);

        for (let i = 0; i < crystals.length; i++) {
            const c = crystals[i];
            
            // 3D rotation around Y axis
            const cos = Math.cos(angleY);
            const sin = Math.sin(angleY);

            const rx = c.hx * cos - c.z * sin;
            const rz = c.hx * sin + c.z * cos;
            const ry = c.hy;

            const perspective = 400 / (400 + rz * 15);
            const px = rx * scale * perspective;
            const py = ry * scale * perspective;

            const alpha = 0.5 + 0.5 * Math.sin(sec * 4 + c.sparkle);

            ctx.save();
            ctx.translate(px, py);
            ctx.fillStyle = `hsla(${c.hue}, 100%, 75%, ${alpha})`;
            ctx.shadowColor = `hsl(${c.hue}, 100%, 65%)`;
            ctx.shadowBlur = 12;

            // Diamond crystal shape
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
