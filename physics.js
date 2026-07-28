// ============================================================
//  MC MOBILE — physics.js (ФИЗИКА МЯЧА И ИГРОКОВ)
// ============================================================

// ---------- ГЛОБАЛЬНЫЕ ОБЪЕКТЫ ----------
let ball = { x: 300, y: 400, r: 8, vx: 0, vy: 0 };
let ballController = null;

// ---------- СБРОС МЯЧА ----------
function resetBall() {
    ball.x = 300 + (Math.random() * 80 - 40);
    ball.y = 400 + (Math.random() * 80 - 40);
    ball.vx = 0;
    ball.vy = 0;
    ballController = null;
    if (window.allPlayers) {
        window.allPlayers.forEach(p => p.hasBall = false);
    }
}

// ---------- ОБНОВЛЕНИЕ ФИЗИКИ ----------
function updatePhysics() {
    const players = window.allPlayers || [];
    if (!players.length) return;

    // 1. Автоматический контроль мяча
    let closest = null;
    let minDist = 38;
    for (let p of players) {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) {
            minDist = dist;
            closest = p;
        }
    }
    ballController = closest;
    if (ballController) ballController.hasBall = true;

    // 2. Ведение мяча (плавное следование)
    if (ballController) {
        const targetX = ballController.x + 22;
        const targetY = ballController.y;
        ball.x += (targetX - ball.x) * 0.18;
        ball.y += (targetY - ball.y) * 0.18;
        ball.vx = 0;
        ball.vy = 0;
    }

    // 3. Удар (обрабатывается в UI, но здесь сбрасываем флаг)
    //    Сама физика удара задаётся из ui.js через ball.vx/vy

    // 4. Свободная физика мяча
    if (!ballController) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.99;
        ball.vy *= 0.99;
        if (Math.abs(ball.vx) < 0.05) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.05) ball.vy = 0;
    }

    // 5. Столкновения с игроками
    for (let p of players) {
        if (ballController === p) continue;
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < ball.r + (p.r || 18)) {
            const angle = Math.atan2(dy, dx);
            const overlap = (ball.r + (p.r || 18) - dist) * 0.5;
            ball.x += Math.cos(angle) * overlap;
            ball.y += Math.sin(angle) * overlap;
            const force = (p.isPlayer ? 4.2 : 3.8) + Math.random() * 1.8;
            ball.vx += Math.cos(angle) * force;
            ball.vy += Math.sin(angle) * force;
            if (ballController === p) {
                ballController = null;
                p.hasBall = false;
            }
        }
    }

    // 6. Отскоки от стен (скруглённые углы)
    const cr = 35;
    const W = 600, H = 800;
    if (ball.x < cr && ball.y < cr) {
        const dx = ball.x - cr, dy = ball.y - cr;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = cr + Math.cos(angle) * (cr - ball.r);
            ball.y = cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle);
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
                ball.vx -= 2 * dot * nx;
                ball.vy -= 2 * dot * ny;
                ball.vx *= 0.6;
                ball.vy *= 0.6;
            }
        }
    } else if (ball.x > W-cr && ball.y < cr) {
        const dx = ball.x - (W-cr), dy = ball.y - cr;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = W-cr + Math.cos(angle) * (cr - ball.r);
            ball.y = cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle);
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
                ball.vx -= 2 * dot * nx;
                ball.vy -= 2 * dot * ny;
                ball.vx *= 0.6;
                ball.vy *= 0.6;
            }
        }
    } else if (ball.x < cr && ball.y > H-cr) {
        const dx = ball.x - cr, dy = ball.y - (H-cr);
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = cr + Math.cos(angle) * (cr - ball.r);
            ball.y = H-cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle);
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
                ball.vx -= 2 * dot * nx;
                ball.vy -= 2 * dot * ny;
                ball.vx *= 0.6;
                ball.vy *= 0.6;
            }
        }
    } else if (ball.x > W-cr && ball.y > H-cr) {
        const dx = ball.x - (W-cr), dy = ball.y - (H-cr);
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < cr - ball.r) {
            const angle = Math.atan2(dy, dx);
            ball.x = W-cr + Math.cos(angle) * (cr - ball.r);
            ball.y = H-cr + Math.sin(angle) * (cr - ball.r);
            const nx = Math.cos(angle), ny = Math.sin(angle);
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
                ball.vx -= 2 * dot * nx;
                ball.vy -= 2 * dot * ny;
                ball.vx *= 0.6;
                ball.vy *= 0.6;
            }
        }
    }

    // 7. Отскоки от прямых стен
    if (ball.y < ball.r + 5) {
        ball.y = ball.r + 5;
        ball.vy *= -0.5;
    }
    if (ball.y > H - ball.r - 5) {
        ball.y = H - ball.r - 5;
        ball.vy *= -0.5;
    }
    // Проверка на вратаря (ворота)
    const goalA = window.goalA || { x: 15, y: 360, w: 16, h: 80 };
    const goalB = window.goalB || { x: 553, y: 360, w: 16, h: 80 };
    if (ball.x < ball.r + 5 && !(ball.y > goalA.y && ball.y < goalA.y + goalA.h)) {
        ball.x = ball.r + 5;
        ball.vx *= -0.5;
    }
    if (ball.x > W - ball.r - 5 && !(ball.y > goalB.y && ball.y < goalB.y + goalB.h)) {
        ball.x = W - ball.r - 5;
        ball.vx *= -0.5;
    }

    // 8. Проверка голов
    const game = window.game || {};
    const DOM = window.DOM || {};
    if (ball.x < goalA.x + goalA.w && ball.y > goalA.y + 5 && ball.y < goalA.y + goalA.h - 5) {
        if (!ballController || ballController.team !== 'A') {
            game.scoreB = (game.scoreB || 0) + 1;
            if (typeof updateScoreDisplay === 'function') updateScoreDisplay();
            if (game.scoreB >= (game.GOAL_LIMIT || 10)) {
                if (typeof endMatch === 'function') endMatch('B');
                return;
            }
            resetBall();
            if (typeof showNotification === 'function') {
                showNotification('⚽ ГОЛ!', 'Команда Б забила!');
            }
        } else {
            ball.x = goalA.x + goalA.w + 12;
            ball.vx *= -0.5;
        }
    }
    if (ball.x > goalB.x - goalB.w && ball.y > goalB.y + 5 && ball.y < goalB.y + goalB.h - 5) {
        if (!ballController || ballController.team !== 'B') {
            game.scoreA = (game.scoreA || 0) + 1;
            if (typeof updateScoreDisplay === 'function') updateScoreDisplay();
            if (game.scoreA >= (game.GOAL_LIMIT || 10)) {
                if (typeof endMatch === 'function') endMatch('A');
                return;
            }
            resetBall();
            if (typeof showNotification === 'function') {
                showNotification('⚽ ГОЛ!', 'Команда А забила!');
            }
        } else {
            ball.x = goalB.x - goalB.w - 12;
            ball.vx *= -0.5;
        }
    }

    // 9. Ограничения мяча
    ball.x = Math.max(ball.r, Math.min(W - ball.r, ball.x));
    ball.y = Math.max(ball.r, Math.min(H - ball.r, ball.y));

    // 10. Синхронизация с глобальными переменными
    window.ball = ball;
    window.ballController = ballController;
}
