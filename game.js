const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const scoreText =
    document.getElementById("score");

const coinsText =
    document.getElementById("coins");

const finalScore =
    document.getElementById("finalScore");

const leftBtn =
    document.getElementById("leftBtn");

const rightBtn =
    document.getElementById("rightBtn");

const jumpBtn =
    document.getElementById("jumpBtn");

const slideBtn =
    document.getElementById("slideBtn");


/* ================= CANVAS ================= */

let W = 0;
let H = 0;

function resize() {

    W = canvas.width =
        window.innerWidth;

    H = canvas.height =
        window.innerHeight;

}

resize();

window.addEventListener(
    "resize",
    resize
);


/* ================= GAME STATE ================= */

let running = false;

let score = 0;
let coins = 0;

let speed = 7;

let lane = 1;

let objects = [];

let spawnTimer = 0;

let roadOffset = 0;

let jumpHeight = 0;

let jumping = false;

let sliding = false;

let lastTime = 0;


/* ================= PLAYER ================= */

const player = {

    x: 0,

    y: 0,

    width: 70,

    height: 105

};

function laneX(number) {

    const roadWidth =
        Math.min(W * 0.72, 720);

    const roadLeft =
        (W - roadWidth) / 2;

    const laneWidth =
        roadWidth / 3;

    return (
        roadLeft +
        laneWidth * number +
        laneWidth / 2
    );

}


/* ================= DRAW SKY ================= */

function drawSky() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#171044"
    );

    gradient.addColorStop(
        0.45,
        "#31205d"
    );

    gradient.addColorStop(
        1,
        "#080816"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

}


/* ================= CITY ================= */

function drawCity() {

    const horizon =
        H * 0.39;

    for (
        let x = -30;
        x < W + 30;
        x += 70
    ) {

        const height =
            80 +
            Math.abs(
                Math.sin(x * 0.13)
            ) * 170;

        ctx.fillStyle =
            "#12132d";

        ctx.fillRect(
            x,
            horizon - height,
            55,
            height
        );

        ctx.fillStyle =
            "rgba(167,139,250,0.25)";

        for (
            let y = horizon - height + 15;
            y < horizon - 10;
            y += 25
        ) {

            ctx.fillRect(
                x + 10,
                y,
                8,
                10
            );

            ctx.fillRect(
                x + 30,
                y,
                8,
                10
            );

        }

    }

}


/* ================= ROAD ================= */

function drawRoad() {

    const roadWidth =
        Math.min(W * 0.72, 720);

    const left =
        (W - roadWidth) / 2;

    const horizon =
        H * 0.38;

    ctx.fillStyle =
        "#101024";

    ctx.beginPath();

    ctx.moveTo(
        W / 2 - 100,
        horizon
    );

    ctx.lineTo(
        W / 2 + 100,
        horizon
    );

    ctx.lineTo(
        left + roadWidth,
        H
    );

    ctx.lineTo(
        left,
        H
    );

    ctx.closePath();

    ctx.fill();


    /* glowing road edges */

    ctx.strokeStyle =
        "rgba(139,92,246,0.65)";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        W / 2 - 100,
        horizon
    );

    ctx.lineTo(
        left,
        H
    );

    ctx.moveTo(
        W / 2 + 100,
        horizon
    );

    ctx.lineTo(
        left + roadWidth,
        H
    );

    ctx.stroke();


    /* lanes */

    for (
        let i = 1;
        i < 3;
        i++
    ) {

        const bottomX =
            left +
            roadWidth * i / 3;

        const topX =
            W / 2 -
            100 +
            200 * i / 3;

        ctx.strokeStyle =
            "rgba(167,139,250,0.28)";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            topX,
            horizon
        );

        ctx.lineTo(
            bottomX,
            H
        );

        ctx.stroke();

    }


    /* road markings */

    roadOffset += speed;

    if (roadOffset > 70) {
        roadOffset = 0;
    }

    for (
        let y = horizon + roadOffset;
        y < H;
        y += 90
    ) {

        const progress =
            (y - horizon) /
            (H - horizon);

        const width =
            5 +
            progress * 15;

        const center =
            W / 2;

        ctx.fillStyle =
            "rgba(255,255,255,0.16)";

        ctx.fillRect(
            center - width / 2,
            y,
            width,
            35
        );

    }

}


/* ================= ANIME CHARACTER ================= */

function drawPlayer() {

    const x =
        laneX(lane);

    const baseY =
        H - 145 - jumpHeight;

    player.x = x;

    player.y = baseY;


    ctx.save();

    ctx.translate(
        x,
        baseY
    );


    /* glowing shadow */

    ctx.fillStyle =
        "rgba(139,92,246,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        62,
        45,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* glow */

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "#8b5cf6";


    /* legs */

    ctx.shadowBlur = 0;

    ctx.strokeStyle =
        "#17152d";

    ctx.lineWidth = 16;

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(
        -12,
        35
    );

    ctx.lineTo(
        -20,
        68
    );

    ctx.moveTo(
        12,
        35
    );

    ctx.lineTo(
        22,
        68
    );

    ctx.stroke();


    /* glowing shoes */

    ctx.fillStyle =
        "#7c3aed";

    ctx.fillRect(
        -33,
        63,
        25,
        9
    );

    ctx.fillRect(
        8,
        63,
        25,
        9
    );


    /* body */

    const bodyGradient =
        ctx.createLinearGradient(
            -30,
            -5,
            30,
            50
        );

    bodyGradient.addColorStop(
        0,
        "#a78bfa"
    );

    bodyGradient.addColorStop(
        1,
        "#4f46e5"
    );

    ctx.fillStyle =
        bodyGradient;

    ctx.beginPath();

    ctx.roundRect(
        -28,
        -10,
        56,
        58,
        15
    );

    ctx.fill();


    /* NoviAI star */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 20px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "✦",
        0,
        25
    );


    /* arms */

    ctx.strokeStyle =
        "#7c3aed";

    ctx.lineWidth = 13;

    ctx.beginPath();

    ctx.moveTo(
        -24,
        0
    );

    ctx.lineTo(
        -43,
        28
    );

    ctx.moveTo(
        24,
        0
    );

    ctx.lineTo(
        43,
        25
    );

    ctx.stroke();


    /* hands */

    ctx.fillStyle =
        "#7a4b3a";

    ctx.beginPath();

    ctx.arc(
        -44,
        30,
        7,
        0,
        Math.PI * 2
    );

    ctx.arc(
        44,
        27,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* neck */

    ctx.fillStyle =
        "#8b5a45";

    ctx.fillRect(
        -8,
        -23,
        16,
        15
    );


    /* hair behind head */

    ctx.fillStyle =
        "#21133e";

    ctx.beginPath();

    ctx.arc(
        0,
        -48,
        34,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* ponytail */

    ctx.fillStyle =
        "#30155d";

    ctx.beginPath();

    ctx.ellipse(
        -31,
        -38,
        22,
        38,
        -0.4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* face */

    ctx.fillStyle =
        "#a96850";

    ctx.beginPath();

    ctx.arc(
        0,
        -50,
        25,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* hair top */

    ctx.fillStyle =
        "#291445";

    ctx.beginPath();

    ctx.arc(
        0,
        -60,
        29,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /* hair fringe */

    ctx.beginPath();

    ctx.moveTo(
        -25,
        -57
    );

    ctx.quadraticCurveTo(
        -10,
        -40,
        0,
        -56
    );

    ctx.quadraticCurveTo(
        12,
        -38,
        25,
        -57
    );

    ctx.fill();


    /* headphones */

    ctx.strokeStyle =
        "#60a5fa";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.arc(
        0,
        -55,
        30,
        Math.PI,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.fillStyle =
        "#8b5cf6";

    ctx.fillRect(
        -31,
        -55,
        8,
        20
    );

    ctx.fillRect(
        23,
        -55,
        8,
        20
    );


    /* eyes */

    ctx.fillStyle =
        "#20122d";

    ctx.beginPath();

    ctx.ellipse(
        -9,
        -51,
        5,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.ellipse(
        9,
        -51,
        5,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* eye shine */

    ctx.fillStyle =
        "white";

    ctx.beginPath();

    ctx.arc(
        -8,
        -54,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        10,
        -54,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


/* ================= OBJECTS ================= */

function spawnObject() {

    const type =
        Math.random();

    objects.push({

        lane:
            Math.floor(
                Math.random() * 3
            ),

        y:
            H * 0.37,

        type:
            type < 0.55
                ? "coin"
                : type < 0.8
                    ? "barrier"
                    : "train"

    });

}


function drawCoin(object) {

    const x =
        laneX(object.lane);

    const y =
        object.y;

    ctx.save();

    ctx.shadowBlur = 20;

    ctx.shadowColor =
        "#facc15";

    ctx.fillStyle =
        "#facc15";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#fff7a8";

    ctx.font =
        "bold 16px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "✦",
        x,
        y + 6
    );

    ctx.restore();

}


function drawBarrier(object) {

    const x =
        laneX(object.lane);

    const y =
        object.y;

    ctx.fillStyle =
        "#ef4444";

    ctx.fillRect(
        x - 35,
        y - 25,
        70,
        50
    );

    ctx.fillStyle =
        "#ffffff";

    ctx.fillRect(
        x - 30,
        y - 18,
        60,
        8
    );

    ctx.fillRect(
        x - 30,
        y + 5,
        60,
        8
    );

}


function drawTrain(object) {

    const x =
        laneX(object.lane);

    const y =
        object.y;

    const size =
        Math.max(
            50,
            (object.y / H) * 120
        );

    ctx.fillStyle =
        "#4f46e5";

    ctx.beginPath();

    ctx.roundRect(
        x - size / 2,
        y - size,
        size,
        size * 1.7,
        12
    );

    ctx.fill();

    ctx.fillStyle =
        "#17172e";

    ctx.fillRect(
        x - size * 0.3,
        y - size * 0.75,
        size * 0.6,
        size * 0.4
    );

    ctx.fillStyle =
        "#a78bfa";

    ctx.font =
        "bold 12px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "NoviAI",
        x,
        y + size * 0.2
    );

}


/* ================= COLLISION ================= */

function collision(object) {

    if (
        object.lane !== lane
    ) {

        return false;

    }

    const distance =
        Math.abs(
            object.y -
            player.y
        );

    if (
        distance > 85
    ) {

        return false;

    }

    if (
        object.type === "coin"
    ) {

        return true;

    }

    if (
        jumping
    ) {

        return false;

    }

    return true;

}


/* ================= UPDATE ================= */

function updateObjects(delta) {

    spawnTimer += delta;

    if (
        spawnTimer > 700
    ) {

        spawnObject();

        spawnTimer = 0;

    }


    for (
        let i = objects.length - 1;
        i >= 0;
        i--
    ) {

        const object =
            objects[i];

        object.y +=
            speed *
            delta /
            16;


        if (
            collision(object)
        ) {

            if (
                object.type === "coin"
            ) {

                coins++;

                score += 50;

                objects.splice(
                    i,
                    1
                );

                continue;

            } else {

                endGame();

                return;

            }

        }


        if (
            object.y >
            H + 150
        ) {

            objects.splice(
                i,
                1
            );

        }

    }

}


/* ================= DRAW OBJECTS ================= */

function drawObjects() {

    objects.forEach(
        object => {

            if (
                object.type === "coin"
            ) {

                drawCoin(
                    object
                );

            }

            if (
                object.type === "barrier"
            ) {

                drawBarrier(
                    object
                );

            }

            if (
                object.type === "train"
            ) {

                drawTrain(
                    object
                );

            }

        }
    );

}


/* ================= GAME LOOP ================= */

function loop(timestamp) {

    if (!running) {

        return;

    }

    const delta =
        timestamp -
        lastTime;

    lastTime =
        timestamp;


    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    drawSky();

    drawCity();

    drawRoad();

    updateObjects(
        delta
    );

    drawObjects();

    drawPlayer();


    score +=
        delta * 0.01;

    speed +=
        delta * 0.00002;


    scoreText.textContent =
        Math.floor(score);

    coinsText.textContent =
        coins;


    requestAnimationFrame(
        loop
    );

}


/* ================= MOVEMENT ================= */

function moveLeft() {

    if (!running) return;

    if (
        lane > 0
    ) {

        lane--;

    }

}


function moveRight() {

    if (!running) return;

    if (
        lane < 2
    ) {

        lane++;

    }

}


function jump() {

    if (
        !running ||
        jumping
    ) {

        return;

    }

    jumping = true;

    const start =
        performance.now();

    function animateJump(time) {

        const progress =
            Math.min(
                (time - start) / 600,
                1
            );

        jumpHeight =
            Math.sin(
                progress * Math.PI
            ) * 130;

        if (
            progress < 1 &&
            running
        ) {

            requestAnimationFrame(
                animateJump
            );

        } else {

            jumpHeight = 0;

            jumping = false;

        }

    }

    requestAnimationFrame(
        animateJump
    );

}


function slide() {

    if (!running) return;

    sliding = true;

    setTimeout(
        () => {
            sliding = false;
        },
        500
    );

}


/* ================= START ================= */

function startGame() {

    running = true;

    score = 0;

    coins = 0;

    speed = 7;

    lane = 1;

    objects = [];

    spawnTimer = 0;

    jumping = false;

    jumpHeight = 0;

    startScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );

    scoreText.textContent =
        "0";

    coinsText.textContent =
        "0";

    lastTime =
        performance.now();

    requestAnimationFrame(
        loop
    );

}


/* ================= GAME OVER ================= */

function endGame() {

    if (!running) return;

    running = false;

    finalScore.textContent =
        Math.floor(score);

    gameOverScreen.classList.remove(
        "hidden"
    );

}


/* ================= KEYBOARD ================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "ArrowLeft"
        ) {

            moveLeft();

        }

        if (
            event.key === "ArrowRight"
        ) {

            moveRight();

        }

        if (
            event.key === "ArrowUp" ||
            event.key === " "
        ) {

            jump();

        }

        if (
            event.key === "ArrowDown"
        ) {

            slide();

        }

    }
);


/* ================= BUTTONS ================= */

leftBtn.addEventListener(
    "click",
    moveLeft
);

rightBtn.addEventListener(
    "click",
    moveRight
);

jumpBtn.addEventListener(
    "click",
    jump
);

slideBtn.addEventListener(
    "click",
    slide
);

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);


/* ================= SWIPE ================= */

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.touches[0];

        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    event => {

        const touch =
            event.changedTouches[0];

        const dx =
            touch.clientX -
            touchStartX;

        const dy =
            touch.clientY -
            touchStartY;


        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            if (
                dx > 40
            ) {

                moveRight();

            }

            if (
                dx < -40
            ) {

                moveLeft();

            }

        } else {

            if (
                dy < -40
            ) {

                jump();

            }

            if (
                dy > 40
            ) {

                slide();

            }

        }

    },
    {
        passive: true
    }
);
