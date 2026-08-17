// ==========================================================================
// 3D Heart Tunnel Theme Module
// Source: Zip/extracted/Cinematic_3D_Heart_Tunnel
// ==========================================================================
function initHearttunnelTheme(config) {
    startHearttunnelAnimation(config);
}

function startHearttunnelAnimation(config) {
    let canvas = document.getElementById('htCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'htCanvas';
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
    const ctx = canvas.getContext('2d', { alpha: false });

    let W = window.innerWidth;
    let H = window.innerHeight;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const NUM_RINGS = 60;
    const Z_NEAR = 0.15;
    const Z_FAR = 12.0;
    const Z_SPAN = Z_FAR - Z_NEAR;
    const FOCAL = 450;

    const rings = [];
    for (let i = 0; i < NUM_RINGS; i++) {
        rings.push({
            z: Z_NEAR + (i / NUM_RINGS) * Z_SPAN,
            hueOff: (i / NUM_RINGS) * 360,
        });
    }

    const NUM_PARTS = 320;
    const parts = [];
    for (let i = 0; i < NUM_PARTS; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 650 + 40;
        parts.push({
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            z: Z_NEAR + Math.random() * Z_SPAN,
            sz: Math.random() * 3.0 + 1.0,
            hue: Math.random() * 360,
        });
    }

    const clamp01 = t => Math.max(0, Math.min(1, t));

    function heartPath(scale, rot, beat) {
        const s = scale * beat * 0.95;
        ctx.save();
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.35);
        ctx.bezierCurveTo(-s * 0.55, -s * 0.85, -s * 1.1, -s * 0.15, 0, s * 0.75);
        ctx.bezierCurveTo(s * 1.1, -s * 0.15, s * 0.55, -s * 0.85, 0, -s * 0.35);
        ctx.closePath();
        ctx.restore();
    }

    let t0 = null;
    let animId = null;

    function render(now) {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        animId = requestAnimationFrame(render);

        if (t0 === null) t0 = now;
        const sec = (now - t0) / 1000;

        const speed = 2.8;
        const trail = 0.22;
        const colorSpeed = 45;

        ctx.fillStyle = `rgba(6, 2, 14, ${trail.toFixed(2)})`;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.globalCompositeOperation = 'lighter';

        const dt = 0.028;

        for (let i = 0; i < NUM_PARTS; i++) {
            const p = parts[i];
            p.z -= speed * dt;
            if (p.z <= Z_NEAR) p.z += Z_SPAN;

            const sc = FOCAL / p.z;
            const px = p.x * sc / FOCAL;
            const py = p.y * sc / FOCAL;
            let a = clamp01((Z_FAR - p.z) / 3) * clamp01((p.z - Z_NEAR) * 4);

            ctx.fillStyle = `hsla(${((sec * colorSpeed + p.hue) % 360).toFixed(1)}, 100%, 70%, ${a.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(px, py, p.sz * sc * 0.015, 0, Math.PI * 2);
            ctx.fill();
        }

        const beat = 1.0 + Math.sin(sec * 6) * 0.08;

        for (let i = 0; i < NUM_RINGS; i++) {
            const r = rings[i];
            r.z -= speed * dt;
            if (r.z <= Z_NEAR) r.z += Z_SPAN;

            const sc = FOCAL / r.z;
            const scale = sc * 1.35;
            const rot = (sec * 0.2 + (r.z * 0.15)) % (Math.PI * 2);
            const hue = (sec * colorSpeed + r.hueOff) % 360;
            const alpha = clamp01((Z_FAR - r.z) / 2) * clamp01((r.z - Z_NEAR) * 3) * 0.85;

            ctx.strokeStyle = `hsla(${hue.toFixed(1)}, 100%, 65%, ${alpha.toFixed(2)})`;
            ctx.lineWidth = Math.max(1, 2.5 * sc * 0.012);

            heartPath(scale, rot, beat);
            ctx.stroke();
        }

        ctx.restore();
    }

    canvas.removeAttribute('data-stopped');
    requestAnimationFrame(render);
}
