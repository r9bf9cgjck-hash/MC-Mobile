// ===========================
// MC MOBILE
// physics.js
// ===========================

// Размер поля
const FIELD = {
    width: 1200,
    height: 650
};

// Ворота
const GOALS = {
    left: {
        x: 0,
        y: 240,
        width: 12,
        height: 170
    },

    right: {
        x: 1188,
        y: 240,
        width: 12,
        height: 170
    }
};

// Мяч
const BALL = {

    x: FIELD.width / 2,

    y: FIELD.height / 2,

    radius: 10,

    speedX: 0,

    speedY: 0,

    friction: 0.985,

    bounce: 0.82

};

// -------------------------

function resetBall(){

    BALL.x = FIELD.width / 2;

    BALL.y = FIELD.height / 2;

    BALL.speedX = 0;

    BALL.speedY = 0;

}

// -------------------------

function updateBall(){

    BALL.x += BALL.speedX;

    BALL.y += BALL.speedY;

    BALL.speedX *= BALL.friction;

    BALL.speedY *= BALL.friction;

    // Верх

    if(BALL.y < BALL.radius){

        BALL.y = BALL.radius;

        BALL.speedY *= -BALL.bounce;

    }

    // Низ

    if(BALL.y > FIELD.height - BALL.radius){

        BALL.y = FIELD.height - BALL.radius;

        BALL.speedY *= -BALL.bounce;

    }

    // Левая стенка

    if(BALL.x < BALL.radius){

        BALL.x = BALL.radius;

        BALL.speedX *= -BALL.bounce;

    }

    // Правая стенка

    if(BALL.x > FIELD.width - BALL.radius){

        BALL.x = FIELD.width - BALL.radius;

        BALL.speedX *= -BALL.bounce;

    }

}

// -------------------------

function kickBall(player){

    let dx = BALL.x - player.x;

    let dy = BALL.y - player.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if(distance > 0){

        BALL.speedX = (dx / distance) * 10;

        BALL.speedY = (dy / distance) * 10;

    }

}

// -------------------------

function playerTouchesBall(player){

    let dx = BALL.x - player.x;

    let dy = BALL.y - player.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    return distance < player.radius + BALL.radius;

}

// -------------------------

function goalLeft(){

    return (

        BALL.x <= GOALS.left.width &&

        BALL.y >= GOALS.left.y &&

        BALL.y <= GOALS.left.y + GOALS.left.height

    );

}

// -------------------------

function goalRight(){

    return (

        BALL.x >= GOALS.right.x &&

        BALL.y >= GOALS.right.y &&

        BALL.y <= GOALS.right.y + GOALS.right.height

    );

}

// -------------------------

function physicsUpdate(players){

    updateBall();

    for(let player of players){

        if(playerTouchesBall(player)){

            kickBall(player);

        }

    }

}
