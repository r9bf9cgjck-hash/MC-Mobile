// ============================================================
//  MC MOBILE — ui.js (ГАРАНТИРОВАННО РАБОТАЕТ)
// ============================================================

let joystickX = 0, joystickY = 0;
let joystickActive = false;
let joystickTouchId = null;

function initUI() {
    const joystickArea = document.getElementById('joystick-area');
    const joystickKnob = document.getElementById('joystick-knob');
    const kickBtn = document.getElementById('kick-btn');
    const passBtn = document.getElementById('pass-btn');
    const tackleBtn = document.getElementById('tackle-btn');

    // ---------- ДЖОЙСТИК ----------
    if (joystickArea && joystickKnob) {
        joystickArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            joystickTouchId = touch.identifier;
            joystickActive = true;
            updateJoystick(touch);
        }, { passive: false });

        joystickArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let touch of e.touches) {
                if (touch.identifier === joystickTouchId) {
                    updateJoystick(touch);
                }
            }
        }, { passive: false });

        joystickArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            joystickActive = false;
            joystickX = 0;
            joystickY = 0;
            joystickKnob.style.transform = 'translate(-50%, -50%)';
            joystickTouchId = null;
            // 👇 ОБЯЗАТЕЛЬНО СБРАСЫВАЕМ В WINDOW
            window.joystickX = 0;
            window.joystickY = 0;
            window.joystickActive = false;
        }, { passive: false });

        joystickArea.addEventListener('touchcancel', () => {
            joystickActive = false;
            joystickX = 0;
            joystickY = 0;
            joystickKnob.style.transform = 'translate(-50%, -50%)';
            joystickTouchId = null;
            window.joystickX = 0;
            window.joystickY = 0;
            window.joystickActive = false;
        });
    }

    function updateJoystick(touch) {
        const rect = joystickArea.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = touch.clientX - cx;
        const dy = touch.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = rect.width / 2 - 22;
        const deadZone = 0.2;

        let normX = dx / maxDist;
        let normY = dy / maxDist;

        if (dist > maxDist) {
            normX = dx / dist;
            normY = dy / dist;
        }

        const d = Math.hypot(normX, normY);
        if (d < deadZone) {
            joystickX = 0;
            joystickY = 0;
        } else {
            joystickX = normX;
            joystickY = normY;
        }

        const px = joystickX * maxDist;
        const py = joystickY * maxDist;
        joystickKnob.style.transform = `translate(${px - 22}px, ${py - 22}px)`;

        // 👇 ЗАПИСЫВАЕМ В ГЛОБАЛЬНУЮ ПЕРЕМЕННУЮ
        window.joystickX = joystickX;
        window.joystickY = joystickY;
        window.joystickActive = joystickActive;
    }

    // ---------- КНОПКИ ----------
    if (kickBtn) {
        kickBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleKick();
        }, { passive: false });
    }

    if (passBtn) {
        passBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePass();
        }, { passive: false });
    }

    if (tackleBtn) {
        tackleBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTackle();
        }, { passive: false });
    }

    // ---------- КНОПКИ МЕНЮ ----------
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const menuBtn = document.getElementById('menuBtn');

    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (window.selectedPlayer === undefined || window.selectedPlayer === -1) return;
            document.getElementById('menu').classList.remove('active');
            document.getElementById('joystick-area').style.display = 'block';
            kickBtn.style.display = 'flex';
            passBtn.style.display = 'flex';
            tackleBtn.style.display = 'flex';

            if (typeof initPlayers === 'function') {
                window.allPlayers = initPlayers();
            }
            if (typeof resetBall === 'function') {
                resetBall();
            }
            if (typeof startMatchTimer === 'function') {
                startMatchTimer();
            }

            window.game.matchActive = true;
            window.game.state = 'playing';
            window.game.scoreA = 0;
            window.game.scoreB = 0;
            if (typeof updateScoreDisplay === 'function') {
                updateScoreDisplay();
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            document.getElementById('winner').style.display = 'none';
            restartBtn.style.display = 'none';
            menuBtn.style.display = 'none';
            if (typeof initPlayers === 'function') {
                window.allPlayers = initPlayers();
            }
            if (typeof resetBall === 'function') {
                resetBall();
            }
            if (typeof startMatchTimer === 'function') {
                startMatchTimer();
            }
            window.game.matchActive = true;
            window.game.state = 'playing';
            window.game.scoreA = 0;
            window.game.scoreB = 0;
            if (typeof updateScoreDisplay === 'function') {
                updateScoreDisplay();
            }
        });
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            document.getElementById('winner').style.display = 'none';
            restartBtn.style.display = 'none';
            menuBtn.style.display = 'none';
            document.getElementById('joystick-area').style.display = 'none';
            kickBtn.style.display = 'none';
            passBtn.style.display = 'none';
            tackleBtn.style.display = 'none';
            document.getElementById('menu').classList.add('active');
            window.game.matchActive = false;
            window.game.state = 'menu';
            if (window.game.timerInterval) {
                clearInterval(window.game.timerInterval);
                window.game.timerInterval = null;
            }
        });
    }

    // ---------- ВЫБОР РЕЖИМА ----------
    document.querySelectorAll('.mode-btn').forEach(el => {
        el.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            window.game.selectedMode = this.dataset.mode;
        });
    });

    // ---------- ВЫБОР СЛОЖНОСТИ ----------
    document.querySelectorAll('.diff-btn').forEach(el => {
        el.addEventListener('click', function() {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            window.game.selectedDifficulty = this.dataset.diff;
        });
    });

    console.log('✅ UI инициализирован');
}

// ---------- УДАР ----------
function handleKick() {
    const myPlayer = window.allPlayers?.find(p => p.isPlayer);
    if (!myPlayer || !window.ballController || window.ballController !== myPlayer) return;
    if (!window.game?.matchActive) return;

    const angle = Math.atan2(joystickY, joystickX);
    const power = 6.5 + (myPlayer.rating - 50) * 0.085;
    window.ball.vx = Math.cos(angle) * power * (0.9 + Math.random() * 0.2);
    window.ball.vy = Math.sin(angle) * power * (0.9 + Math.random() * 0.2);
    window.ballController = null;
    myPlayer.hasBall = false;

    if (typeof showNotification === 'function') {
        showNotification('⚡ Удар!', 'Сила: ' + (power * 0.8).toFixed(1));
    }
}

// ---------- ПАС ----------
function handlePass() {
    const myPlayer = window.allPlayers?.find(p => p.isPlayer);
    if (!myPlayer || !window.ballController || window.ballController !== myPlayer) return;
    if (!window.game?.matchActive) return;

    const teammates = window.allPlayers.filter(p => p.team === myPlayer.team && p !== myPlayer);
    let target = null;
    let minDist = 999;
    for (let t of teammates) {
        const dx = t.x - myPlayer.x;
        const dy = t.y - myPlayer.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDist && d > 35) {
            minDist = d;
            target = t;
        }
    }

    if (target) {
        const angle = Math.atan2(target.y - window.ball.y, target.x - window.ball.x);
        const power = 5.5 + (myPlayer.rating - 50) * 0.07;
        window.ball.vx = Math.cos(angle) * power;
        window.ball.vy = Math.sin(angle) * power;
        window.ballController = null;
        myPlayer.hasBall = false;
        if (typeof showNotification === 'function') {
            showNotification('🎯 Пас!', 'Передан ' + target.name);
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification('❌ Нет партнёра', 'Поблизости никого');
        }
    }
}

// ---------- ОТБОР ----------
function handleTackle() {
    const myPlayer = window.allPlayers?.find(p => p.isPlayer);
    if (!myPlayer || !window.game?.matchActive) return;

    let target = null;
    let minDist = 55;
    for (let p of window.allPlayers) {
        if (p === myPlayer || p.team === myPlayer.team) continue;
        if (p.hasBall) {
            const dx = myPlayer.x - p.x;
            const dy = myPlayer.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                target = p;
            }
        }
    }

    if (target) {
        const difficulty = window.game?.selectedDifficulty || 'medium';
        const tackleChance = 0.55 + (myPlayer.rating - 50) * 0.005 - (difficulty === 'extreme' ? 0.1 : 0);
        if (Math.random() < tackleChance) {
            window.ballController = myPlayer;
            myPlayer.hasBall = true;
            target.hasBall = false;
            window.ball.x = myPlayer.x + 20;
            window.ball.y = myPlayer.y;
            window.ball.vx = 0;
            window.ball.vy = 0;
            if (typeof showNotification === 'function') {
                showNotification('🛡️ Отбор!', 'Мяч перехвачен');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification('❌ Отбор не удался', 'Попробуй ещё');
            }
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification('❌ Нет цели', 'Никто не владеет мячом рядом');
        }
    }
}

// ---------- УВЕДОМЛЕНИЯ ----------
function showNotification(text, sub = '') {
    const notifDiv = document.getElementById('notification');
    const notifText = document.getElementById('notifText');
    const notifSub = document.getElementById('notifSub');
    if (!notifDiv || !notifText) return;

    notifText.innerText = text;
    if (notifSub) notifSub.innerText = sub;
    notifDiv.style.display = 'block';
    clearTimeout(window.notifTimer);
    window.notifTimer = setTimeout(() => {
        notifDiv.style.display = 'none';
    }, 2600);
}

// ---------- ЗАПУСК ----------
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof initUI === 'function') {
            initUI();
        }
    }, 200);
});
