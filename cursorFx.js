// ==========================================================================
// Interactive Cursor FX Module
// Source: Dragon_Cursor_Animation, spider_cursor_animation, Reptile Interactive Cursor
// ==========================================================================
(function () {
    let activeEffect = null;
    let canvas = null;
    let ctx = null;
    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener('pointermove', (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    });

    window.setCursorEffect = function (effectName) {
        activeEffect = effectName;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'cursorFxCanvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '999';
            document.body.appendChild(canvas);
        }

        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (effectName === 'none') {
            canvas.style.display = 'none';
            return;
        }
        canvas.style.display = 'block';
        initEffect(effectName);
    };

    let particles = [];

    function initEffect(name) {
        particles = [];
        if (name === 'dragon' || name === 'spine') {
            const N = 35;
            for (let i = 0; i < N; i++) {
                particles.push({
                    x: pointer.x,
                    y: pointer.y,
                    size: Math.max(3, 16 - i * 0.4)
                });
            }
        } else if (name === 'hearts') {
            // Heart trail
        }
    }

    function renderLoop() {
        requestAnimationFrame(renderLoop);
        if (!activeEffect || activeEffect === 'none' || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (activeEffect === 'dragon' || activeEffect === 'spine') {
            let leader = pointer;
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += (leader.x - p.x) * 0.35;
                p.y += (leader.y - p.y) * 0.35;

                ctx.save();
                ctx.fillStyle = `hsl(${(i * 10 + Date.now() * 0.1) % 360}, 100%, 65%)`;
                ctx.shadowColor = '#ff2a75';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                leader = p;
            }
        }
    }

    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });

    renderLoop();
})();
