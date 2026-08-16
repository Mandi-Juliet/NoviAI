// ============================================
// NOVIAI RUN
// ============================================

const game = document.getElementById("game");
const player = document.getElementById("player");
const objects = document.getElementById("objects");

const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("finalScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const jumpButton = document.getElementById("jumpButton");
const slideButton = document.getElementById("slideButton");


// ============================================
// GAME VARIABLES
// ============================================

let running = false;

let score = 0;

let lives = 3;

let lane = 1;

let speed = 6;

let gameTime = 0;

let spawnTimer = 0;

let animationFrame;


// LANE POSITIONS

const lanes = [
    28,
    50,
    72
];


// ============================================
// PLAYER POSITION
// ============================================

function updatePlayerLane() {

    player.style.left = lanes[lane] + "%";

}


// ============================================
// MOVE LEFT
// ============================================

function moveLeft() {

    if (!running) return;

    if (lane > 0) {

        lane--;

        updatePlayerLane();

    }

}


// ============================================
// MOVE RIGHT
// ============================================

function moveRight() {

    if (!running) return;

    if (lane < 2) {

        lane++;

        updatePlayerLane();

    }

}


// ============================================
// JUMP
// ============================================

function jump() {

    if (!running) return;

    if (player.classList.contains("jumping")) return;

    player.classList.add("jumping");

    player.style.bottom = "28%";

    setTimeout(() => {

        player.style.bottom = "10%";

    }, 420);

    setTimeout(() => {

        player.classList.remove("jumping");

    }, 500);

}


// ============================================
// SLIDE
// ============================================

function slide() {

    if (!running) return;

    if (player.classList.contains("sliding")) return;

    player.classList.add("sliding");

    player.style.transform =
        "translateX(-50%) scaleY(0.55)";

    setTimeout(() => {

        player.classList.remove("sliding");

        player.style.transform =
            "translateX(-50%)";

    }, 550);

}


// ============================================
// KEYBOARD CONTROLS
// ============================================

document.addEventListener("keydown", (event) => {

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {

        event.preventDefault();

        moveLeft();

    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {

        event.preventDefault();

        moveRight();

    }

    if (event.key === "ArrowUp" || event.key === " ") {

        event.preventDefault();

        jump();

    }

    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {

        event.preventDefault();

        slide();

    }

});


// ============================================
// MOBILE BUTTONS
// ============================================

leftButton.addEventListener("pointerdown", moveLeft);

rightButton.addEventListener("pointerdown", moveRight);

jumpButton.addEventListener("pointerdown", jump);

slideButton.addEventListener("pointerdown", slide);


// ============================================
// TOUCH SWIPE
// ============================================

let touchStartX = 0;
let touchStartY = 0;

game.addEventListener("touchstart", (event) => {

    const touch = event.changedTouches[0];

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

});


game.addEventListener("touchend", (event) => {

    const touch = event.changedTouches[0];

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    const minimumSwipe = 35;


    if (Math.abs(dx) > Math.abs(dy)) {

        if (Math.abs(dx) > minimumSwipe) {

            if (dx > 0) {

                moveRight();

            } else {

                moveLeft();

            }

        }

    } else {

        if (Math.abs(dy) > minimumSwipe) {

            if (dy < 0) {

                jump();

            } else {

                slide();

            }

        }

    }

});


// ============================================
// CREATE COIN
// ============================================

function createCoin() {

    const coin = document.createElement("div");

    coin.className = "coin";

    coin.textContent = "★";

    const randomLane =
        Math.floor(Math.random() * 3);

    coin.dataset.lane = randomLane;

    coin.style.left =
        lanes[randomLane] + "%";

    coin.style.top = "-60px";

    objects.appendChild(coin);

}


// ============================================
// CREATE OBSTACLE
// ============================================

function createObstacle() {

    const obstacle = document.createElement("div");

    obstacle.className = "obstacle";

    const randomLane =
        Math.floor(Math.random() * 3);

    obstacle.dataset.lane = randomLane;

    obstacle.style.left =
        lanes[randomLane] + "%";

    obstacle.style.top = "-80px";

    objects.appendChild(obstacle);

}


// ============================================
// SPAWN OBJECTS
// ============================================

function spawnObjects() {

    const random = Math.random();

    if (random < 0.58) {

        createCoin();

    } else {

        createObstacle();

    }

}


// ============================================
// COLLISION
// ============================================

function collision(a, b) {

    const rectA = a.getBoundingClientRect();

    const rectB = b.getBoundingClientRect();

    return !(
        rectA.right < rectB.left ||
        rectA.left > rectB.right ||
        rectA.bottom < rectB.top ||
        rectA.top > rectB.bottom
    );

}


// ============================================
// UPDATE OBJECTS
// ============================================

function updateObjects() {

    const allObjects =
        document.querySelectorAll(
            ".coin, .obstacle"
        );


    allObjects.forEach((object) => {

        let currentTop =
            parseFloat(object.style.top);

        currentTop += speed;

        object.style.top =
            currentTop + "px";


        // ====================================
        // COIN
        // ====================================

        if (object.classList.contains("coin")) {

            if (
                object.dataset.lane == lane &&
                collision(player, object)
            ) {

                score += 10;

                scoreElement.textContent =
                    score;

                object.remove();

            }

        }


        // ====================================
        // OBSTACLE
        // ====================================

        if (object.classList.contains("obstacle")) {

            if (
                object.dataset.lane == lane &&
                collision(player, object)
            ) {

                // Don't repeatedly hit same obstacle

                object.remove();

                loseLife();

            }

        }


        // ====================================
        // REMOVE OLD OBJECTS
        // ====================================

        if (currentTop > window.innerHeight + 100) {

            object.remove();

        }

    });

}


// ============================================
// LOSE LIFE
// ============================================

function loseLife() {

    lives--;

    updateLives();

    player.animate(
        [
            { opacity: 1 },
            { opacity: 0.2 },
            { opacity: 1 }
        ],
        {
            duration: 400
        }
    );


    if (lives <= 0) {

        endGame();

    }

}


// ============================================
// UPDATE HEARTS
// ============================================

function updateLives() {

    const hearts =
        document.querySelectorAll(".lives span");

    hearts.forEach((heart, index) => {

        heart.textContent =
            index < lives
                ? "❤️"
                : "🖤";

    });

}


// ============================================
// SCORE
// ============================================

function updateScore() {

    if (!running) return;

    score++;

    scoreElement.textContent =
        score;

}


// ============================================
// INCREASE SPEED
// ============================================

function increaseSpeed() {

    if (!running) return;

    speed += 0.002;

}


// ============================================
// GAME LOOP
// ============================================

function gameLoop() {

    if (!running) return;


    gameTime++;

    spawnTimer++;


    if (spawnTimer > 65) {

        spawnObjects();

        spawnTimer = 0;

    }


    updateObjects();

    increaseSpeed();


    if (gameTime % 12 === 0) {

        updateScore();

    }


    animationFrame =
        requestAnimationFrame(gameLoop);

}


// ============================================
// START GAME
// ============================================

function startGame() {

    running = true;

    score = 0;

    lives = 3;

    lane = 1;

    speed = 6;

    gameTime = 0;

    spawnTimer = 0;


    scoreElement.textContent =
        "0";

    updateLives();

    updatePlayerLane();


    objects.innerHTML = "";


    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");


    cancelAnimationFrame(animationFrame);

    gameLoop();

}


// ============================================
// END GAME
// ============================================

function endGame() {

    running = false;

    cancelAnimationFrame(animationFrame);

    finalScoreElement.textContent =
        score;

    gameOverScreen.classList.remove(
        "hidden"
    );

}


// ============================================
// BUTTONS
// ============================================

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);


// ============================================
// INITIAL POSITION
// ============================================

updatePlayerLane();

updateLives();
