// ==========================================================================
// 3D Rotating Cube Theme Module
// Source: Zip/extracted/the-cube-tcw
// ==========================================================================
function initCubeTheme(config) {
    startCubeAnimation(config);
}

function startCubeAnimation(config) {
    let canvas = document.getElementById('cbCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'cbCanvas';
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

    const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    function animate(time) {
        if (canvas.getAttribute('data-stopped') === 'true') return;
        requestAnimationFrame(animate);

        ctx.fillStyle = 'rgba(6, 2, 14, 0.25)';
        ctx.fillRect(0, 0, W, H);

        rotX += 0.01;
        rotY += 0.015;
        rotZ += 0.005;

        const size = Math.min(W, H) * 0.18;
        const projected = [];

        ctx.save();
        ctx.translate(W / 2, H / 2 - 30);

        for (let i = 0; i < vertices.length; i++) {
            let [x, y, z] = vertices[i];

            // Rotate X
            let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
            let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

            // Rotate Y
            let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
            let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

            // Rotate Z
            let x3 = x2 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
            let y3 = x2 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

            const fov = 400;
            const distance = 4;
            const scale = fov / (distance + z2);

            projected.push([x3 * scale * (size / 100), y3 * scale * (size / 100)]);
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff2a75';
        ctx.shadowColor = '#ff2a75';
        ctx.shadowBlur = 15;

        for (let i = 0; i < edges.length; i++) {
            const [p1, p2] = edges[i];
            ctx.beginPath();
            ctx.moveTo(projected[p1][0], projected[p1][1]);
            ctx.lineTo(projected[p2][0], projected[p2][1]);
            ctx.stroke();
        }

        ctx.restore();
    }

    canvas.removeAttribute('data-stopped');
    requestAnimationFrame(animate);
}
