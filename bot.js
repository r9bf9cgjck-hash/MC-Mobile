// ===========================
// MC MOBILE
// bot.js
// ===========================

// Скорость ИИ
const BOT_SPEED = 2.8;

// ----------------------------

function distance(x1,y1,x2,y2){

    return Math.hypot(x2-x1,y2-y1);

}

// ----------------------------

function moveTo(player,x,y){

    let dx=x-player.x;
    let dy=y-player.y;

    let d=Math.hypot(dx,dy);

    if(d<1)return;

    player.x+=dx/d*BOT_SPEED;
    player.y+=dy/d*BOT_SPEED;

}

// ----------------------------

// Логика вратаря

function goalkeeperAI(player,leftSide){

    let targetX;

    if(leftSide){

        targetX=80;

    }else{

        targetX=1120;

    }

    let targetY=BALL.y;

    if(targetY<170) targetY=170;

    if(targetY>480) targetY=480;

    moveTo(player,targetX,targetY);

}

// ----------------------------

// Логика полевого

function fieldAI(player){

    let d=distance(

        player.x,
        player.y,

        BALL.x,
        BALL.y

    );

    if(d<250){

        moveTo(player,BALL.x,BALL.y);

    }

}

// ----------------------------

// Общий интеллект

function updateBots(players){

    for(let player of players){

        if(player.user) continue;

        if(player.position==="GK"){

            goalkeeperAI(

                player,

                player.team==="FC Masters"

            );

        }else{

            fieldAI(player);

        }

    }

}

// ----------------------------

// Попытка удара

function botKick(players){

    for(let player of players){

        if(player.user) continue;

        if(playerTouchesBall(player)){

            kickBall(player);

        }

    }

}

// ----------------------------

// Главная функция

function botUpdate(players){

    updateBots(players);

    botKick(players);

}
