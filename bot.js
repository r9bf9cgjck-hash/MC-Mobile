// ============================================================
//  MC MOBILE — bot.js (ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ БОТОВ)
// ============================================================

// ---------- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----------
const BOT_CONFIG = {
    easy: { speed: 0.7, aggression: 0.3, tackleChance: 0.15, shotChance: 0.02 },
    medium: { speed: 1.0, aggression: 0.5, tackleChance: 0.25, shotChance: 0.035 },
    hard: { speed: 1.4, aggression: 0.7, tackleChance: 0.35, shotChance: 0.05 },
    extreme: { speed: 1.9, aggression: 0.9, tackleChance: 0.45, shotChance: 0.08 }
};

// ---------- ОСНОВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ БОТОВ ----------
function updateBots() {
    const players = window.allPlayers || [];
    const difficulty = window.game?.selectedDifficulty || 'medium';
    const config = BOT_CONFIG[difficulty] || BOT_CONFIG.medium;
    const ball = window.ball || { x: 300, y: 400 };

    for (let p of players) {
        if (p.isPlayer) continue; // Пропускаем игрока

        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const distToBall = Math.sqrt(dx*dx + dy*dy);

        let targetX = p.targetX || ball.x;
        let targetY = p.targetY || ball.y;

        // ----- ВРАТАРЬ -----
        if (p.isGoalkeeper) {
            const goalX = p.team === 'A' ? 30 : 570;
            if (distToBall < 250 && ball.x > (p.team === 'A' ? 10 : 50) && ball.x < (p.team === 'A' ? 50 : 590)) {
                const offset = 40 + Math.random() * 30;
                targetX = p.team === 'A' ? 60 + offset : 540 - offset;
                targetY = Math.max(380, Math.min(420, ball.y));
            } else {
                targetX = goalX;
                targetY = 400 + (Math.random() - 0.5) * 30;
            }
        }
        // ----- ЗАЩИТНИКИ -----
        else if (p.role === 'defender') {
            const goalX = p.team === 'A' ? 90 : 510;
            if (distToBall < 250 && ball.x > (p.team === 'A' ? 30 : 150) && ball.x < (p.team === 'A' ? 150 : 570)) {
                targetX = Math.max(goalX - 30, Math.min(goalX + 30, ball.x));
                targetY = Math.max(380, Math.min(420, ball.y));
            } else {
                targetX = goalX;
                targetY = 400 + (Math.random() - 0.5) * 70;
            }
        }
        // ----- НАПАДАЮЩИЕ -----
        else {
            // Бежит к мячу
            if (distToBall < 380) {
                targetX = ball.x + (Math.random() - 0.5) * 70;
                targetY = ball.y + (Math.random() - 0.5) * 70;
            } else {
                targetX = ball.x;
                targetY = ball.y;
            }

            // ----- ОТБОР -----
            const ballController = window.ballController || null;
            if (ballController && distToBall < 45 && Math.random() < config.tackleChance) {
                // Отбираем мяч
                ballController.hasBall = false;
                window.ballController = p;
                p.hasBall = true;
                if (typeof window.ball !== 'undefined') {
                    window.ball.x = p.x + 20;
                    window.ball.y = p.y;
                    window.ball.vx = 0;
                    window.ball.vy = 0;
                }
                if (typeof showNotification === 'function') {
                    showNotification('🛡️ Отбор!', `${p.name} перехватил мяч`);
                }
                return; // Прерываем, чтобы бот не бежал дальше в этом кадре
            }

            // ----- УДАР (ТОЛЬКО ПО ЧУЖИМ ВОРОТАМ) -----
            if (p === ballController && distToBall < 35 && Math.random() < config.shotChance) {
                const targetGoalX = p.team === 'A' ? 570 : 30;
                const targetGoalY = 400 + (Math.random() - 0.5) * 70;
                const kx = targetGoalX - window.ball.x;
                const ky = targetGoalY - window.ball.y;
                const kd = Math.sqrt(kx*kx + ky*ky) || 1;
                const power = p.power * (window.game?.selectedDifficulty === 'extreme' ? 1.7 : 1.0);
                window.ball.vx = (kx / kd) * power * (0.85 + Math.random() * 0.3);
                window.ball.vy = (ky / kd) * power * (0.85 + Math.random() * 0.3);
                window.ballController = null;
                p.hasBall = false;
                if (typeof showNotification === 'function') {
                    showNotification('⚡ Удар!', `${p.name} бьёт по воротам!`);
                }
                return;
            }
        }

        // ----- ДВИЖЕНИЕ К ЦЕЛИ -----
        const dxT = targetX - p.x;
        const dyT = targetY - p.y;
        const distT = Math.sqrt(dxT*dxT + dyT*dyT);
        const spd = (p.speed || 1.6) * (0.85 + Math.random() * 0.3) * (0.9 + (p.aggression || 0.5) * 0.1) * config.speed;

        if (distT > 5) {
            const move = spd / distT;
            p.x += dxT * move;
            p.y += dyT * move;
        } else {
            p.targetX = p.x + (Math.random() - 0.5) * 80;
            p.targetY = p.y + (Math.random() - 0.5) * 80;
        }

        // ----- ГРАНИЦЫ -----
        const W = 600, H = 800;
        const goalA = window.goalA || { x: 15, y: 360, w: 16, h: 80 };
        const goalB = window.goalB || { x: 553, y: 360, w: 16, h: 80 };

        if (p.isGoalkeeper) {
            const goal = p.team === 'A' ? goalA : goalB;
            p.x = Math.max(goal.x - 50, Math.min(goal.x + goal.w + 50, p.x));
            p.y = Math.max(goal.y + 15, Math.min(goal.y + goal.h - 15, p.y));
        } else {
            p.x = Math.max(38, Math.min(W - 38, p.x));
            p.y = Math.max(38, Math.min(H - 38, p.y));
        }

        // Запрет забегания в ворота
        if (!p.isGoalkeeper) {
            if (p.x < goalA.x + goalA.w + 6 && p.y > goalA.y && p.y < goalA.y + goalA.h) {
                p.x = goalA.x + goalA.w + 6;
            }
            if (p.x > goalB.x - goalB.w - 6 && p.y > goalB.y && p.y < goalB.y + goalB.h) {
                p.x = goalB.x - goalB.w - 6;
            }
        }
    }
}
