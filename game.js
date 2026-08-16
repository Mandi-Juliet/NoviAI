```javascript
const player = document.getElementById("player");
const objects = document.getElementById("objects");

const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const finalScore = document.getElementById("finalScore");

let running = false;

let score = 0;
let lives = 3;

let lane = 1;

let speed = 5;
let spawnTimer = 0;

let jumpTimer = 0;
let slideTimer = 0;

let objectsArray = [];

const lanePositions = ["25%", "50%", "75%"];

/* =========================
   START
========================= */

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

function startGame() {

    score = 0;
    lives = 3;

    speed = 5;
    spawnTimer = 0;

    lane = 1;

    jumpTimer = 0;
    slideTimer = 0;

    objects.innerHTML = "";

    objectsArray = [];

    updateUI();

    player.style.left = lanePositions[lane];

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    running = true;

    requestAnimationFrame(gameLoop);
}

/* =========================
   GAME LOOP
========================= */

let lastTime = 0;

function gameLoop(time) {

    if (!running) return;

    if (!lastTime) {
        lastTime = time;
    }

    const delta = time - lastTime;
    lastTime = time;

    updateGame(delta);

    requestAnimationFrame(gameLoop);
}

/* =========================
   UPDATE
========================= */

function updateGame(delta) {

    spawnTimer += delta;

    if (spawnTimer > Math.max(450, 900 - score * 2)) {

        spawnTimer = 0;

        spawnObject();
    }

    moveObjects(delta);

    updatePlayer();

    score += delta * 0.002;

    scoreDisplay.textContent = Math.floor(score);

    /*
        Gradually increase difficulty.
    */
    speed = Math.min(
        13,
        5 + score / 120
    );
}

/* =========================
   SPAWN
========================= */

function spawnObject() {

    const type = Math.random() < 0.62
        ? "coin"
        : "obstacle";

    const object = document.createElement("div");

    object.className = type;

    const randomLane =
        Math.floor(Math.random() * 3);

    object.dataset.lane = randomLane;

    object.dataset.depth = 0;

    if (type === "coin") {
        object.textContent = "★";
    }

    objects.appendChild(object);

    objectsArray.push({
        element: object,
        lane: randomLane,
        depth: 0,
        type: type
    });
}

/* =========================
   MOVE OBJECTS
========================= */

function moveObjects(delta) {

    const multiplier =
        delta / 16.67;

    for (let i = objectsArray.length - 1; i >= 0; i--) {

        const obj = objectsArray[i];

        obj.depth += speed * multiplier;

        /*
            Perspective movement.
            Objects begin small near horizon
            and become larger toward player.
        */

        const progress =
            obj.depth / 1000;

        const scale =
            0.25 + progress * 2.5;

        const x =
            getLaneX(obj.lane, progress);

        const y =
            35 + progress * 70;

        obj.element.style.left = x + "%";
        obj.element.style.top = y + "%";

        obj.element.style.transform =
            `translate(-50%, -50%) scale(${scale})`;

        /*
            Collision zone.
        */

        if (obj.depth > 800) {

            if (
                obj.lane === lane &&
                !isJumping() &&
                !isSliding()
            ) {

                if (obj.type === "coin") {

                    collectCoin(i);

                    continue;

                } else {

                    hitObstacle(i);

                    continue;
                }
            }
        }

        /*
            Remove objects after passing player.
        */

        if (obj.depth > 1100) {

            obj.element.remove();

            objectsArray.splice(i, 1);
        }
    }
}

/* =========================
   LANE POSITION
========================= */

function getLaneX(laneNumber, progress) {

    const center = 50;

    const spread = 28 + progress * 15;

    if (laneNumber === 0) {
        return center - spread;
    }

    if (laneNumber === 2) {
        return center + spread;
    }

    return center;
}

/* =========================
   COIN
========================= */

function collectCoin(index) {

    score += 15;

    const obj =
        objectsArray[index];

    obj.element.remove();

    objectsArray.splice(index, 1);
}

/* =========================
   OBSTACLE
========================= */

function hitObstacle(index) {

    lives--;

    updateUI();

    const obj =
        objectsArray[index];

    obj.element.remove();

    objectsArray.splice(index, 1);

    /*
        Flash player.
    */

    player.style.filter =
        "brightness(2)";

    setTimeout(() => {

        player.style.filter = "";

    }, 180);

    if (lives <= 0) {

        endGame();
    }
}

/* =========================
   PLAYER MOVEMENT
========================= */

function moveLeft() {

    if (!running) return;

    if (lane > 0) {

        lane--;

        player.style.left =
            lanePositions[lane];
    }
}

function moveRight() {

    if (!running) return;

    if (lane < 2) {

        lane++;

        player.style.left =
            lanePositions[lane];
    }
}

/* =========================
   JUMP
========================= */

function jump() {

    if (!running) return;

    if (jumpTimer > 0) return;

    jumpTimer = 550;

    player.style.transition =
        "transform .18s ease";

    player.style.transform =
        "translateX(-50%) translateY(-105px) scale(1.08)";

    setTimeout(() => {

        if (!running) return;

        player.style.transform =
            "translateX(-50%)";

    }, 550);
}

function isJumping() {

    return jumpTimer > 0;
}

/* =========================
   SLIDE
========================= */

function slide() {

    if (!running) return;

    if (slideTimer > 0) return;

    slideTimer = 600;

    player.style.transform =
        "translateX(-50%) translateY(25px) scaleY(.65)";

    setTimeout(() => {

        if (!running) return;

        player.style.transform =
            "translateX(-50%)";

    }, 600);
}

function isSliding() {

    return slideTimer > 0;
}

/* =========================
   PLAYER TIMER
========================= */

function updatePlayer() {

    if (jumpTimer > 0) {

        jumpTimer -= 16.67;

        if (jumpTimer < 0) {
            jumpTimer = 0;
        }
    }

    if (slideTimer > 0) {

        slideTimer -= 16.67;

        if (slideTimer < 0) {
            slideTimer = 0;
        }
    }
}

/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", event => {

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
        event.key === "w" ||
        event.key === " "
    ) {

        event.preventDefault();

        jump();
    }

    if (
        event.key === "ArrowDown" ||
        event.key.toLowerCase() === "s"
    ) {

        slide();
    }
});

/* =========================
   MOBILE BUTTONS
========================= */

document.querySelectorAll(".controls button")
.forEach(button => {

    const action =
        button.dataset.action;

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            if (action === "left") {
                moveLeft();
            }

            if (action === "right") {
                moveRight();
            }

            if (action === "jump") {
                jump();
            }

            if (action === "slide") {
                slide();
            }
        }
    );
});

/* =========================
   UI
========================= */

function updateUI() {

    scoreDisplay.textContent =
        Math.floor(score);

    livesDisplay.textContent =
        "❤️ ".repeat(lives).trim();
}

/* =========================
   GAME OVER
========================= */

function endGame() {

    running = false;

    finalScore.textContent =
        Math.floor(score);

    gameOverScreen.classList.remove("hidden");
}

/* =========================
   INITIAL STATE
========================= */

player.style.left =
    lanePositions[1];

updateUI();
```
