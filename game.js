/* =========================================
   NOVIAI CHASE
   ========================================= */

const game =
    document.getElementById("game");

const road =
    document.getElementById("road");

const player =
    document.getElementById("player");

const chaser =
    document.getElementById("chaser");

const objects =
    document.getElementById("objects");


let running = false;

let score = 0;

let lives = 3;

let level = 1;

let playerLane = 1;

let playerJumping = false;

let gameSpeed = 4;

let chaserDistance = 0;

let objectTimer;

let gameLoop;

let difficultyTimer;


/* =========================
   LANES
   ========================= */

function getLanePosition(lane) {

    const roadWidth =
        road.clientWidth;

    const laneWidth =
        roadWidth / 3;

    return (
        laneWidth * lane +
        laneWidth / 2
    );

}


/* =========================
   PLAYER POSITION
   ========================= */

function updatePlayerPosition() {

    player.style.left =
        `${getLanePosition(playerLane)}px`;

}


/* =========================
   START
   ========================= */

function startGame() {

    document.getElementById(
        "startScreen"
    ).style.display = "none";

    document.getElementById(
        "gameOver"
    ).style.display = "none";


    score = 0;

    lives = 3;

    level = 1;

    playerLane = 1;

    gameSpeed = 4;

    chaserDistance = 0;


    updateStats();

    updatePlayerPosition();


    running = true;


    objectTimer =
        setInterval(
            spawnObject,
            850
        );


    difficultyTimer =
        setInterval(
            increaseDifficulty,
            10000
        );


    gameLoop =
        requestAnimationFrame(
            updateGame
        );

}


/* =========================
   GAME LOOP
   ========================= */

function updateGame() {

    if (!running) return;


    const gameObjects =
        document.querySelectorAll(
            ".game-object"
        );


    gameObjects.forEach(
        moveObject
    );


    updateChaser();


    gameLoop =
        requestAnimationFrame(
            updateGame
        );

}


/* =========================
   SPAWN OBJECT
   ========================= */

function spawnObject() {

    if (!running) return;


    const object =
        document.createElement("div");


    object.classList.add(
        "game-object"
    );


    const lane =
        Math.floor(
            Math.random() * 3
        );


    object.dataset.lane =
        lane;


    const random =
        Math.random();


    if (random < 0.55) {

        object.classList.add(
            "crystal"
        );

        object.textContent =
            "🧠";

        object.dataset.type =
            "crystal";

    }

    else if (random < 0.85) {

        object.classList.add(
            "obstacle"
        );

        object.textContent =
            "🚧";

        object.dataset.type =
            "obstacle";

    }

    else {

        object.classList.add(
            "boost"
        );

        object.textContent =
            "⚡";

        object.dataset.type =
            "boost";

    }


    object.style.left =
        `${getLanePosition(lane)}px`;

    object.style.transform =
        "translateX(-50%)";


    object.style.top =
        "-70px";


    objects.appendChild(
        object
    );

}


/* =========================
   MOVE OBJECT
   ========================= */

function moveObject(object) {

    let top =
        parseFloat(
            object.style.top
        );


    top += gameSpeed;


    object.style.top =
        `${top}px`;


    if (
        top >
        road.clientHeight
    ) {

        object.remove();

        return;

    }


    checkCollision(object);

}


/* =========================
   COLLISION
   ========================= */

function checkCollision(object) {

    const objectTop =
        parseFloat(
            object.style.top
        );


    const playerBottom =
        road.clientHeight -
        80;


    const collisionZone =
        playerBottom - 55;


    if (
        objectTop >
        collisionZone - 20 &&
        objectTop <
        collisionZone + 50 &&
        Number(object.dataset.lane) ===
        playerLane
    ) {

        collectObject(object);

    }

}


/* =========================
   COLLECT
   ========================= */

function collectObject(object) {

    const type =
        object.dataset.type;


    object.remove();


    if (type === "crystal") {

        score += 10;

        showMessage(
            "+10 🧠"
        );

    }


    else if (type === "boost") {

        score += 25;

        gameSpeed += 1;

        showMessage(
            "⚡ SPEED BOOST!"
        );

        setTimeout(
            () => {

                gameSpeed =
                    Math.max(
                        4,
                        gameSpeed - 1
                    );

            },
            3000
        );

    }


    else if (type === "obstacle") {

        if (!playerJumping) {

            lives--;

            chaserDistance += 15;

            showMessage(
                "💥 Ouch!"
            );

            if (lives <= 0) {

                endGame();

            }

        }

    }


    updateStats();

}


/* =========================
   JUMP
   ========================= */

function jump() {

    if (
        !running ||
        playerJumping
    ) {

        return;

    }


    playerJumping = true;


    player.style.bottom =
        "170px";


    setTimeout(
        () => {

            player.style.bottom =
                "80px";

            playerJumping = false;

        },
        650
    );

}


/* =========================
   MOVE LEFT
   ========================= */

function moveLeft() {

    if (!running) return;


    if (playerLane > 0) {

        playerLane--;

        updatePlayerPosition();

    }

}


/* =========================
   MOVE RIGHT
   ========================= */

function moveRight() {

    if (!running) return;


    if (playerLane < 2) {

        playerLane++;

        updatePlayerPosition();

    }

}


/* =========================
   CHASER
   ========================= */

function updateChaser() {

    if (!running) return;


    chaserDistance +=
        0.008 *
        level;


    if (
        chaserDistance >= 100
    ) {

        lives--;

        chaserDistance = 0;

        showMessage(
            "👾 TOO CLOSE!"
        );

        updateStats();


        if (lives <= 0) {

            endGame();

        }

    }


    const baseBottom = 15;

    const extra =
        chaserDistance * 0.4;


    chaser.style.bottom =
        `${baseBottom + extra}px`;

}


/* =========================
   DIFFICULTY
   ========================= */

function increaseDifficulty() {

    if (!running) return;


    level++;


    gameSpeed += 0.7;


    showMessage(
        `🔥 LEVEL ${level}`
    );


    updateStats();

}


/* =========================
   MESSAGE
   ========================= */

function showMessage(text) {

    const message =
        document.getElementById(
            "levelMessage"
        );


    message.textContent =
        text;


    message.classList.remove(
        "show"
    );


    void message.offsetWidth;


    message.classList.add(
        "show"
    );

}


/* =========================
   STATS
   ========================= */

function updateStats() {

    document.getElementById(
        "score"
    ).textContent =
        score;


    document.getElementById(
        "lives"
    ).textContent =
        lives;


    document.getElementById(
        "level"
    ).textContent =
        level;

}


/* =========================
   GAME OVER
   ========================= */

function endGame() {

    running = false;


    clearInterval(
        objectTimer
    );

    clearInterval(
        difficultyTimer
    );


    cancelAnimationFrame(
        gameLoop
    );


    document.getElementById(
        "finalScore"
    ).textContent =
        score;


    document.getElementById(
        "gameOver"
    ).style.display =
        "flex";


    objects.innerHTML = "";

}


/* =========================
   RESTART
   ========================= */

function restartGame() {

    objects.innerHTML = "";


    playerJumping = false;

    player.style.bottom =
        "80px";


    chaser.style.bottom =
        "15px";


    startGame();

}


/* =========================
   BACK TO AI
   ========================= */

function goBackToAI() {

    window.location.href =
        "ai.html";

}


/* =========================
   KEYBOARD
   ========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            moveLeft();

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            moveRight();

        }


        if (
            event.key === "ArrowUp" ||
            event.key === " " ||
            event.key.toLowerCase() === "w"
        ) {

            event.preventDefault();

            jump();

        }

    }
);


/* =========================
   MOBILE CONTROLS
   ========================= */

document.getElementById(
    "leftButton"
).addEventListener(
    "click",
    moveLeft
);


document.getElementById(
    "rightButton"
).addEventListener(
    "click",
    moveRight
);


document.getElementById(
    "jumpButton"
).addEventListener(
    "click",
    jump
);


/* =========================
   INITIAL POSITION
   ========================= */

window.addEventListener(
    "resize",
    updatePlayerPosition
);


updatePlayerPosition();
