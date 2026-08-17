// ==========================================================================
// Blooming Night Garden Theme Module
// Source: Zip/extracted/blooming_night_garden_animation
// ==========================================================================
function initNightgardenTheme(config) {
    startNightgardenAnimation(config);
}

function startNightgardenAnimation(config) {
    let container = document.getElementById('ngContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ngContainer';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '1';
        container.innerHTML = `
            <canvas id="ngCanvas"></canvas>
        `;
        document.getElementById('wishContainer').appendChild(container);
    }
    container.style.display = 'block';

    const canvas = document.getElementById('ngCanvas');
    const ctx = canvas.getContext('2d');

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    // Glowing fireflies and night sky animation
    const fireflies = [];
    const NUM_FIREFLIES = 70;

    for (let i = 0; i < NUM_FIREFLIES; i++) {
        fireflies.push({
            x: Math.random() * W,
            y: Math.random() * H,
            radius: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            alpha: Math.random(),
            speed: Math.random() * 0.04 + 0.01
        });
    }

    function animate() {
        if (container.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        ctx.fillStyle = 'rgba(6, 2, 14, 0.25)';
        ctx.fillRect(0, 0, W, H);

        for (let i = 0; i < fireflies.length; i++) {
            const f = fireflies[i];
            f.x += f.vx;
            f.y += f.vy;
            f.alpha += f.speed;

            if (f.alpha > 1 || f.alpha < 0) f.speed = -f.speed;

            if (f.x < 0) f.x = W;
            if (f.x > W) f.x = 0;
            if (f.y < 0) f.y = H;
            if (f.y > H) f.y = 0;

            ctx.save();
            ctx.fillStyle = `rgba(168, 255, 120, ${Math.max(0, f.alpha)})`;
            ctx.shadowColor = '#a8ff78';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    container.removeAttribute('data-stopped');
    requestAnimationFrame(animate);
}
