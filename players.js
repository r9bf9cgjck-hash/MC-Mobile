const PLAYER_DB = {
    0: { id: 0, name: 'Хабиб', number: '7', color: '#e53935', rating: 72, role: 'attacker', team: 'A' },
    1: { id: 1, name: 'Азиз', number: '10', color: '#ff7043', rating: 70, role: 'attacker', team: 'A' },
    2: { id: 2, name: 'Шамиль Рб', number: '4', color: '#1e88e5', rating: 68, role: 'defender', team: 'B' },
    3: { id: 3, name: 'Шамиль Jr', number: '8', color: '#42a5f5', rating: 66, role: 'defender', team: 'B' },
    4: { id: 4, name: 'Салаудин', number: '11', color: '#66bb6a', rating: 67, role: 'attacker', team: 'B' },
    5: { id: 5, name: 'Абдул', number: '5', color: '#8d6e63', rating: 65, role: 'defender', team: 'A' }
};

function getPlayerRating(id) { return PLAYER_DB[id] ? PLAYER_DB[id].rating : 50; }
function getPlayerSpeed(rating) { return 1.0 + (rating - 50) * 0.0816; }
function getPlayerPower(rating) { return 2.8 + (rating - 50) * 0.057; }

function buildPlayerMenu() {
    const list = document.getElementById('player-list');
    if (!list) return;
    list.innerHTML = '';
    const ids = [0,1,2,3,4,5];
    ids.forEach(id => {
        const p = PLAYER_DB[id];
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.player = p.id;
        card.innerHTML = `<span class="number">#${p.number}</span><span class="name">${p.name}</span><span class="rating">${p.rating}</span>`;
        card.addEventListener('click', function() {
            document.querySelectorAll('.player-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            window.selectedPlayer = parseInt(this.dataset.player);
            document.getElementById('startBtn').disabled = false;
            document.querySelectorAll('.diff-btn').forEach(b => b.disabled = false);
        });
        list.appendChild(card);
    });
}

function initPlayers() {
    const mode = window.game?.selectedMode || '2v2';
    let teamA_ids, teamB_ids;
    if (mode === '2v2') { teamA_ids = [0,1]; teamB_ids = [2,4]; }
    else { teamA_ids = [0,1,5]; teamB_ids = [2,3,4]; }

    const selectedId = window.selectedPlayer || 0;
    let teamA_data = [], teamB_data = [];
    const allIds = [...teamA_ids, ...teamB_ids];
    allIds.forEach(id => {
        const p = PLAYER_DB[id];
        const isA = teamA_ids.includes(id);
        const rating = p.rating;
        const data = {
            ...p, rating, isPlayer: p.id === selectedId, team: isA ? 'A' : 'B',
            isGoalkeeper: false, speed: getPlayerSpeed(rating)*1.8, power: getPlayerPower(rating)*1.2,
            x: 0, y: 0, targetX: 0, targetY: 0, r: 18, stamina: 1.0, aggression: 0.5 + Math.random()*0.3,
            hasBall: false, direction: isA ? 1 : -1
        };
        if (isA) teamA_data.push(data);
        else teamB_data.push(data);
    });

    const spacingA = 280 / (teamA_data.length + 1);
    const spacingB = 280 / (teamB_data.length + 1);
    teamA_data.forEach((p,i) => {
        p.x = 140; p.y = 180 + spacingA*(i+1);
        p.targetX = p.x + (Math.random()-0.5)*100;
        p.targetY = p.y + (Math.random()-0.5)*100;
    });
    teamB_data.forEach((p,i) => {
        p.x = 460; p.y = 180 + spacingB*(i+1);
        p.targetX = p.x + (Math.random()-0.5)*100;
        p.targetY = p.y + (Math.random()-0.5)*100;
    });

    if (teamA_data.length > 0) { const gkA = teamA_data[0]; gkA.isGoalkeeper = true; gkA.x = 40; gkA.y = 400; }
    if (teamB_data.length > 0) { const gkB = teamB_data[0]; gkB.isGoalkeeper = true; gkB.x = 560; gkB.y = 400; }

    const my = [...teamA_data, ...teamB_data].find(p => p.isPlayer);
    if (my && my.isGoalkeeper) {
        my.isGoalkeeper = false;
        my.x = 180 + (my.team === 'A' ? 0 : 200);
        my.y = 400 + (Math.random()-0.5)*40;
    }

    window.allPlayers = [...teamA_data, ...teamB_data];
    window.allPlayers.forEach(p => { if (p.isPlayer) p.color = '#ffd700'; p.r = 18; });
    if (typeof resetBall === 'function') resetBall();
    return window.allPlayers;
}
