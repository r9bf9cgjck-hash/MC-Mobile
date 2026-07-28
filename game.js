const GameState = { MENU: 'menu', PLAYING: 'playing', ENDED: 'ended' };
let game = {
    state: GameState.MENU, matchActive: false, timer: 60, timerInterval: null,
    scoreA: 0, scoreB: 0, GOAL_LIMIT: 10, selectedPlayer: -1,
    selectedDifficulty: 'easy', selectedMode: '2v2'
};
const DOM = {};

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
    DOM.canvas.width = 600; DOM.canvas.height = 800;
    loadProgress();
    if (typeof buildPlayerMenu === 'function') buildPlayerMenu();
    gameLoop();
    console.log('✅ MC Mobile инициализирована!');
}

function gameLoop() { update(); render(); requestAnimationFrame(gameLoop); }

function update() {
    if (game.state === GameState.PLAYING && game.matchActive) {
        if (typeof updatePlayer === 'function') updatePlayer();
        if (typeof updateBots === 'function') updateBots();
        if (typeof updatePhysics === 'function') updatePhysics();
    }
}

function render() {
    const ctx = DOM.ctx, W=600, H=800;
    ctx.clearRect(0,0,W,H);
    drawField(ctx, W, H);
    const players = window.allPlayers || [];
    for (let p of players) drawPlayer(ctx, p);
    if (window.ball) drawBall(ctx, window.ball);
    if (!game.matchActive && game.state === GameState.MENU) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('⚽ Начните матч!', W/2, H/2);
    }
}

function drawField(ctx,W,H) {
    const grad = ctx.createRadialGradient(W/2,H/2,40,W/2,H/2,450);
    grad.addColorStop(0,'#2a2a4a'); grad.addColorStop(1,'#16162a');
    ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth=2; ctx.setLineDash([6,12]);
    ctx.beginPath(); ctx.moveTo(W/2,12); ctx.lineTo(W/2,H-12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(W/2,H/2,55,0,Math.PI*2); ctx.stroke();
    const GOAL_H=80;
    const goalA={x:15,y:H/2-GOAL_H/2,w:16,h:GOAL_H};
    const goalB={x:W-31,y:H/2-GOAL_H/2,w:16,h:GOAL_H};
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=3;
    ctx.strokeRect(goalA.x,goalA.y,goalA.w,goalA.h);
    ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(goalA.x,goalA.y,goalA.w,goalA.h);
    ctx.strokeRect(goalB.x,goalB.y,goalB.w,goalB.h);
    ctx.fillRect(goalB.x,goalB.y,goalB.w,goalB.h);
    window.goalA=goalA; window.goalB=goalB;
}

function drawPlayer(ctx,p) {
    if (!p) return;
    const isMy=p.isPlayer||false, x=p.x||0, y=p.y||0, r=p.r||18, color=p.color||'#888';
    ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=15;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=color; ctx.fill(); ctx.shadowBlur=0;
    ctx.strokeStyle=isMy?'rgba(255,215,0,0.9)':'rgba(0,0,0,0.3)';
    ctx.lineWidth=isMy?3.5:1.5; ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 13px system-ui, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=6;
    ctx.fillText(p.number||'?', x, y+1); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='7px system-ui, sans-serif';
    ctx.textBaseline='bottom'; ctx.fillText(p.name||'', x, y-r-2);
    const rating=p.rating||50; let color2='#ff6b6b';
    if(rating>=80) color2='#4caf50'; else if(rating>=70) color2='#ffd700';
    else if(rating>=60) color2='#ff9800';
    ctx.fillStyle=color2; ctx.font='bold 8px system-ui, sans-serif';
    ctx.textBaseline='bottom'; ctx.fillText(rating, x, y-r-12);
    if(p.isGoalkeeper){ ctx.fillStyle='rgba(255,215,0,0.7)'; ctx.font='16px sans-serif';
        ctx.textBaseline='middle'; ctx.fillText('🧤', x+r+10, y); }
    if(p.hasBall){ ctx.strokeStyle='rgba(255,255,0,0.3)'; ctx.lineWidth=2;
        ctx.setLineDash([4,6]); ctx.beginPath(); ctx.arc(x,y,r+7,0,Math.PI*2);
        ctx.stroke(); ctx.setLineDash([]); }
}

function drawBall(ctx,ball) {
    if(!ball) return;
    ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=20;
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r||8,0,Math.PI*2);
    ctx.fillStyle='#ffffff'; ctx.fill(); ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(0,0,0,0.15)'; ctx.lineWidth=1.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(ball.x-2.5,ball.y-2.5,2.8,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fill();
}

function startMatchTimer() {
    if(game.timerInterval) clearInterval(game.timerInterval);
    game.timer=60; DOM.timer.innerText='⏱️ 1:00';
    game.timerInterval=setInterval(()=>{
        game.timer--;
        const mins=Math.floor(game.timer/60), secs=game.timer%60;
        DOM.timer.innerText=`⏱️ ${mins}:${secs<10?'0':''}${secs}`;
        if(game.timer<=0){ clearInterval(game.timerInterval); game.timerInterval=null; endMatch(); }
    },1000);
}

function endMatch(winner) {
    game.matchActive=false; game.state=GameState.ENDED;
    let result='draw';
    if(winner==='A') result='win'; else if(winner==='B') result='lose';
    else { if(game.scoreA>game.scoreB) result='win'; else if(game.scoreB>game.scoreA) result='lose'; else result='draw'; }
    DOM.winnerDiv.innerHTML=`<span class="cup">🏆</span> ${result==='win'?'ПОБЕДА!':result==='draw'?'НИЧЬЯ!':'ПОРАЖЕНИЕ!'}`;
    DOM.winnerDiv.style.display='block'; DOM.restartBtn.style.display='block'; DOM.menuBtn.style.display='block';
    console.log(`🏁 Матч завершён: ${result}`);
}

function updateScoreDisplay() {
    DOM.scoreA.innerText=game.scoreA; DOM.scoreB.innerText=game.scoreB;
    DOM.matchScore.innerText=`⚽ Счёт матча: ${game.scoreA} : ${game.scoreB}`;
}

function loadProgress() { try { const data=JSON.parse(localStorage.getItem('mc_mobile_save')); if(data) console.log('💾 Загружены сохранения:',data); } catch(e){} }

function updatePlayer() {
    const players=window.allPlayers||[];
    const myPlayer=players.find(p=>p.isPlayer);
    if(!myPlayer) return;
    const jx=window.joystickX||0, jy=window.joystickY||0, active=window.joystickActive||false;
    if(active){
        const dist=Math.sqrt(jx*jx+jy*jy);
        if(dist>0.1){
            const speed=5.2*(1+(myPlayer.rating-50)*0.08)*Math.min(1,dist*2.2);
            myPlayer.x+=(jx/dist)*speed; myPlayer.y+=(jy/dist)*speed;
        }
    }
    myPlayer.x=Math.max(38,Math.min(562,myPlayer.x));
    myPlayer.y=Math.max(38,Math.min(762,myPlayer.y));
}

document.addEventListener('DOMContentLoaded', function() {
    const splash=document.getElementById('splash-screen'), btn=document.getElementById('splash-btn'), menu=document.getElementById('menu');
    if(splash && btn){
        btn.addEventListener('click', function(){
            splash.classList.add('hidden');
            setTimeout(()=>{ if(menu) menu.classList.add('active'); initGame(); if(typeof initUI==='function') initUI(); }, 800);
        });
    } else { initGame(); if(typeof initUI==='function') initUI(); }
});
