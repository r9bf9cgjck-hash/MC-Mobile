let ball = { x: 300, y: 400, r: 8, vx: 0, vy: 0 };
let ballController = null;

function resetBall() {
    ball.x = 300 + (Math.random()*80 - 40);
    ball.y = 400 + (Math.random()*80 - 40);
    ball.vx = 0; ball.vy = 0;
    ballController = null;
    if (window.allPlayers) window.allPlayers.forEach(p => p.hasBall = false);
}

function updatePhysics() {
    const players = window.allPlayers || [];
    if (!players.length) return;

    let closest = null, minDist = 38;
    for (let p of players) {
        const dx = ball.x - p.x, dy = ball.y - p.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) { minDist = dist; closest = p; }
    }
    ballController = closest;
    if (ballController) ballController.hasBall = true;

    if (ballController) {
        ball.x += (ballController.x + 22 - ball.x) * 0.18;
        ball.y += (ballController.y - ball.y) * 0.18;
        ball.vx = 0; ball.vy = 0;
    }

    if (!ballController) {
        ball.x += ball.vx; ball.y += ball.vy;
        ball.vx *= 0.99; ball.vy *= 0.99;
        if (Math.abs(ball.vx) < 0.05) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.05) ball.vy = 0;
    }

    for (let p of players) {
        if (ballController === p) continue;
        const dx = ball.x - p.x, dy = ball.y - p.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < ball.r + (p.r || 18)) {
            const angle = Math.atan2(dy, dx);
            const overlap = (ball.r + (p.r||18) - dist) * 0.5;
            ball.x += Math.cos(angle) * overlap;
            ball.y += Math.sin(angle) * overlap;
            const force = (p.isPlayer ? 4.2 : 3.8) + Math.random()*1.8;
            ball.vx += Math.cos(angle) * force;
            ball.vy += Math.sin(angle) * force;
            if (ballController === p) { ballController = null; p.hasBall = false; }
        }
    }

    const cr = 35;
    if (ball.x < cr && ball.y < cr) {
        const dx = ball.x - cr, dy = ball.y - cr, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = cr + Math.cos(angle) * (cr - ball.r);
            ball.y = cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle), dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) { ball.vx -= 2*dot*nx; ball.vy -= 2*dot*ny; ball.vx *= 0.6; ball.vy *= 0.6; }
        }
    } else if (ball.x > W-cr && ball.y < cr) {
        const dx = ball.x - (W-cr), dy = ball.y - cr, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = W-cr + Math.cos(angle) * (cr - ball.r);
            ball.y = cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle), dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) { ball.vx -= 2*dot*nx; ball.vy -= 2*dot*ny; ball.vx *= 0.6; ball.vy *= 0.6; }
        }
    } else if (ball.x < cr && ball.y > H-cr) {
        const dx = ball.x - cr, dy = ball.y - (H-cr), dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = cr + Math.cos(angle) * (cr - ball.r);
            ball.y = H-cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle), dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) { ball.vx -= 2*dot*nx; ball.vy -= 2*dot*ny; ball.vx *= 0.6; ball.vy *= 0.6; }
        }
    } else if (ball.x > W-cr && ball.y > H-cr) {
        const dx = ball.x - (W-cr), dy = ball.y - (H-cr), dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = W-cr + Math.cos(angle) * (cr - ball.r);
            ball.y = H-cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle), dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) { ball.vx -= 2*dot*nx; ball.vy -= 2*dot*ny; ball.vx *= 0.6; ball.vy *= 0.6; }
        }
    }

    if (ball.y < ball.r + 5) { ball.y = ball.r + 5; ball.vy *= -0.5; }
    if (ball.y > H - ball.r - 5) { ball.y = H - ball.r - 5; ball.vy *= -0.5; }
    if (ball.x < ball.r + 5 && !(ball.y > goalA.y && ball.y < goalA.y + goalA.h)) {
        ball.x = ball.r + 5; ball.vx *= -0.5;
    }
    if (ball.x > W - ball.r - 5 && !(ball.y > goalB.y && ball.y < goalB.y + goalB.h)) {
        ball.x = W - ball.r - 5; ball.vx *= -0.5;
    }

    if (ball.x < goalA.x + goalA.w && ball.y > goalA.y + 5 && ball.y < goalA.y + goalA.h - 5) {
        if (!ballController || ballController.team !== 'A') {
            scoreB++;
            updateScoreDisplay();
            if (scoreB >= GOAL_LIMIT) { endMatch('B'); return; }
            resetBall();
            showNotification('⚽ ГОЛ!', 'Команда Б забила!');
        } else {
            ball.x = goalA.x + goalA.w + 12;
            ball.vx *= -0.5;
        }
    }
    if (ball.x > goalB.x - goalB.w && ball.y > goalB.y + 5 && ball.y < goalB.y + goalB.h - 5) {
        if (!ballController || ballController.team !== 'B') {
            scoreA++;
            updateScoreDisplay();
            if (scoreA >= GOAL_LIMIT) { endMatch('A'); return; }
            resetBall();
            showNotification('⚽ ГОЛ!', 'Команда А забила!');
        } else {
            ball.x = goalB.x - goalB.w - 12;
            ball.vx *= -0.5;
        }
    }

    ball.x = Math.max(ball.r, Math.min(W - ball.r, ball.x));
    ball.y = Math.max(ball.r, Math.min(H - ball.r, ball.y));
}
