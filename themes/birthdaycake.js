// ==========================================================================
// Interactive Birthday Cake Theme Module
// Source: Zip/extracted/birthday-cake-tcw
// ==========================================================================
function initBirthdaycakeTheme(config) {
    startBirthdaycakeAnimation(config);
}

function startBirthdaycakeAnimation(config) {
    let canvas = document.getElementById('bcCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'bcCanvas';
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

    const sparkles = [];
    const NUM_SPARKLES = 60;

    for (let i = 0; i < NUM_SPARKLES; i++) {
        sparkles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            size: Math.random() * 4 + 1,
            alpha: Math.random(),
            speed: Math.random() * 0.05 + 0.02
        });
    }

    function animate(time) {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        ctx.fillStyle = 'rgba(6, 2, 14, 0.25)';
        ctx.fillRect(0, 0, W, H);

        const sec = time * 0.001;

        // Draw Ambient Sparkles
        for (let i = 0; i < sparkles.length; i++) {
            const s = sparkles[i];
            s.alpha += s.speed;
            if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;

            ctx.save();
            ctx.fillStyle = `rgba(255, 223, 0, ${Math.max(0, s.alpha)})`;
            ctx.shadowColor = '#ffdf00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    canvas.removeAttribute('data-stopped');
    requestAnimationFrame(animate);
}
