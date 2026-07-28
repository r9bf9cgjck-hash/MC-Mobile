// ============================================================
//  MC MOBILE — game.js (ГЛАВНЫЙ МОДУЛЬ)
// ============================================================

// ---------- СОСТОЯНИЕ ----------
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    ENDED: 'ended'
};

let game = {
    state: GameState.MENU,
    matchActive: false,
    timer: 60,
    timerInterval: null,
    scoreA: 0,
    scoreB: 0,
    GOAL_LIMIT: 10,
    selectedPlayer: -1,
    selectedDifficulty: 'easy',
    selectedMode: '2v2'
};

// ---------- ЭЛЕМЕНТЫ ----------
const DOM = {};

// ---------- ИНИЦИАЛИЗАЦИЯ ----------
function initGame() {
    DOM.canvas = document.getElementById('gameCanvas');
    DOM.ctx = DOM.canvas.getContext('2d');
    DOM.menu = document.getElementById('menu');
    DOM.startBtn = document.getElementById('startBtn');
    DOM.restartBtn = document.getElementById('restartBtn');
    DOM.menuBtn = document.getElementById('menuBtn');
    DOM.winnerDiv = document.getElementById('winner');
    DOM.scoreA = document.getElementById('scoreA');
    DOM.scoreB = document.getElementById('scoreB');
    DOM.timer = document.getElementById('timer');
    DOM.matchScore = document.getElementById('matchScore');
    DOM.notif = document.getElementById('notification');
    DOM.notifText = document.getElementById('notifText');
    DOM.notifSub = document.getElementById('notifSub');

    DOM.canvas.width = 600;
    DOM.canvas.height = 800;

    loadProgress();

    // Строим меню
    if (typeof buildPlayerMenu === 'function') {
        buildPlayerMenu();
    }

    // Запускаем игровой цикл
    gameLoop();

    console.log('✅ MC Mobile инициализирована!');
}

// ---------- ИГРОВОЙ ЦИКЛ ----------
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ---------- ОБНОВЛЕНИЕ ----------
function update() {
    // Если игра активна
    if (game.state === GameState.PLAYING && game.matchActive) {
        // Обновляем игроков (джойстик)
        if (typeof updatePlayer === 'function') {
            updatePlayer();
        }
        // Обновляем ботов
        if (typeof updateBots === 'function') {
            updateBots();
        }
        // Обновляем физику мяча
        if (typeof updatePhysics === 'function') {
            updatePhysics();
        }
    }
}

// ---------- ОТРИСОВКА ----------
function render() {
    const ctx = DOM.ctx;
    const W = 600;
    const H = 800;

    ctx.clearRect(0, 0, W, H);

    // Рисуем поле
    drawField(ctx, W, H);

    // Рисуем игроков
    const players = window.allPlayers || [];
    for (let p of players) {
        drawPlayer(ctx, p);
    }

    // Рисуем мяч
    if (window.ball) {
        drawBall(ctx, window.ball);
    }

    // Если игра не началась
    if (!game.matchActive && game.state === GameState.MENU) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚽ Начните матч!', W/2, H/2);
    }
}

// ---------- РИСОВАНИЕ ПОЛЯ ----------
function drawField(ctx, W, H) {
    const grad = ctx.createRadialGradient(W/2, H/2, 40, W/2, H/2, 450);
    grad.addColorStop(0, '#2a2a4a');
    grad.addColorStop(1, '#16162a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 12]);
    ctx.beginPath();
    ctx.moveTo(W/2, 12);
    ctx.lineTo(W/2, H-12);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(W/2, H/2, 55, 0, Math.PI*2);
    ctx.stroke();

    const GOAL_H = 80;
    const goalA = { x: 15, y: H/2 - GOAL_H/2, w: 16, h: GOAL_H };
    const goalB = { x: W-31, y: H/2 - GOAL_H/2, w: 16, h: GOAL_H };

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(goalA.x, goalA.y, goalA.w, goalA.h);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(goalA.x, goalA.y, goalA.w, goalA.h);
    ctx.strokeRect(goalB.x, goalB.y, goalB.w, goalB.h);
    ctx.fillRect(goalB.x, goalB.y, goalB.w, goalB.h);

    window.goalA = goalA;
    window.goalB = goalB;
}

// ---------- РИСОВАНИЕ ИГРОКА ----------
function drawPlayer(ctx, p) {
    if (!p) return;
    const isMy = p.isPlayer || false;
    const x = p.x || 0;
    const y = p.y || 0;
    const r = p.r || 18;
    const color = p.color || '#888';

    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isMy ? 'rgba(255,215,0,0.9)' : 'rgba(0,0,0,0.3)';
    ctx.lineWidth = isMy ? 3.5 : 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(p.number || '?', x, y+1);
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px system-ui, sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText(p.name || '', x, y-r-2);

    const rating = p.rating || 50;
    let color2 = '#ff6b6b';
    if (rating >= 80) color2 = '#4caf50';
    else if (rating >= 70) color2 = '#ffd700';
    else if (rating >= 60) color2 = '#ff9800';
    ctx.fillStyle = color2;
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText(rating, x, y-r-12);

    if (p.isGoalkeeper) {
        ctx.fillStyle = 'rgba(255,215,0,0.7)';
        ctx.font = '16px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧤', x+r+10, y);
    }

    if (p.hasBall) {
        ctx.strokeStyle = 'rgba(255,255,0,0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4,6]);
        ctx.beginPath();
        ctx.arc(x, y, r+7, 0, Math.PI*2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// ---------- РИСОВАНИЕ МЯЧА ----------
function drawBall(ctx, ball) {
    if (!ball) return;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r || 8, 0, Math.PI*2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ball.x-2.5, ball.y-2.5, 2.8, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
}

// ---------- ТАЙМЕР ----------
function startMatchTimer() {
    if (game.timerInterval) clearInterval(game.timerInterval);
    game.timer = 60;
    DOM.timer.innerText = '⏱️ 1:00';

    game.timerInterval = setInterval(() => {
        game.timer--;
        const mins = Math.floor(game.timer / 60);
        const secs = game.timer % 60;
        DOM.timer.innerText = `⏱️ ${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (game.timer <= 0) {
            clearInterval(game.timerInterval);
            game.timerInterval = null;
            endMatch();
        }
    }, 1000);
}

// ---------- ЗАВЕРШЕНИЕ ----------
function endMatch(winner) {
    game.matchActive = false;
    game.state = GameState.ENDED;

    let result = 'draw';
    if (winner === 'A') result = 'win';
    else if (winner === 'B') result = 'lose';
    else {
        if (game.scoreA > game.scoreB) result = 'win';
        else if (game.scoreB > game.scoreA) result = 'lose';
        else result = 'draw';
    }

    DOM.winnerDiv.innerHTML = `<span class="cup">🏆</span> ${result === 'win' ? 'ПОБЕДА!' : result === 'draw' ? 'НИЧЬЯ!' : 'ПОРАЖЕНИЕ!'}`;
    DOM.winnerDiv.style.display = 'block';
    DOM.restartBtn.style.display = 'block';
    DOM.menuBtn.style.display = 'block';

    console.log(`🏁 Матч завершён: ${result}`);
}

// ---------- ОБНОВЛЕНИЕ СЧЁТА ----------
function updateScoreDisplay() {
    DOM.scoreA.innerText = game.scoreA;
    DOM.scoreB.innerText = game.scoreB;
    DOM.matchScore.innerText = `⚽ Счёт матча: ${game.scoreA} : ${game.scoreB}`;
}

// ---------- ЗАГРУЗКА ----------
function loadProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('mc_mobile_save'));
        if (data) {
            console.log('💾 Загружены сохранения:', data);
        }
    } catch(e) {}
}

// ---------- ОБНОВЛЕНИЕ ИГРОКА (ДЖОЙСТИК) ----------
function updatePlayer() {
    const players = window.allPlayers || [];
    const myPlayer = players.find(p => p.isPlayer);
    if (!myPlayer) return;

    const joystickX = window.joystickX || 0;
    const joystickY = window.joystickY || 0;
    const joystickActive = window.joystickActive || false;

    if (joystickActive) {
        const dist = Math.sqrt(joystickX*joystickX + joystickY*joystickY);
        if (dist > 0.1) {
            const speed = 5.2 * (1 + (myPlayer.rating - 50) * 0.08) * Math.min(1, dist * 2.2);
            myPlayer.x += (joystickX / dist) * speed;
            myPlayer.y += (joystickY / dist) * speed;
        }
    }

    // Границы
    myPlayer.x = Math.max(38, Math.min(562, myPlayer.x));
    myPlayer.y = Math.max(38, Math.min(762, myPlayer.y));
}

// ---------- ЗАПУСК ----------
document.addEventListener('DOMContentLoaded', function() {
    const splash = document.getElementById('splash-screen');
    const btn = document.getElementById('splash-btn');
    const menu = document.getElementById('menu');

    if (splash && btn) {
        btn.addEventListener('click', function() {
            splash.classList.add('hidden');
            setTimeout(() => {
                if (menu) menu.classList.add('active');
                initGame();
                // После инициализации запускаем UI
                if (typeof initUI === 'function') {
                    initUI();
                }
            }, 800);
        });
    } else {
        initGame();
        if (typeof initUI === 'function') {
            initUI();
        }
    }
});
