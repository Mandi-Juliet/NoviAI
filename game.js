```javascript
const player = document.getElementById("player");
const gameArea = document.getElementById("gameArea");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");

const coinsContainer = document.getElementById("coins");
const obstaclesContainer = document.getElementById("obstacles");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const jumpButton = document.getElementById("jumpButton");
const slideButton = document.getElementById("slideButton");


/* ================= GAME VARIABLES ================= */

let gameRunning = false;

let score = 0;
let speed = 2.8;

let lane = 1;

let animationTimer;
let obstacleTimer;
let coinTimer;

let highScore = Number(localStorage.getItem("noviaiChaseHighScore")) || 0;


/*
    Three lanes:

       0        1        2
      LEFT    CENTER    RIGHT
*/

function getLanePosition(laneNumber) {

    const positions = ["31%", "50%", "69%"];

    return positions[laneNumber];

}


/* ================= START GAME ================= */

function startGame() {

    gameRunning = true;

    score = 0;
    speed = 2.8;
    lane = 1;

    scoreDisplay.textContent = "0";

    player.style.left = getLanePosition(lane);

    player.classList.add("running");

    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";

    clearGameObjects();

    startSpawning();

    gameLoop();

}


/* ================= RESTART ================= */

function restartGame() {

    startGame();

}


/* ================= CLEAR OBJECTS ================= */

function clearGameObjects() {

    coinsContainer.innerHTML = "";
    obstaclesContainer.innerHTML = "";

}


/* ================= MOVE LEFT ================= */

function moveLeft() {

    if (!gameRunning) return;

    if (lane > 0) {

        lane--;

        player.style.left = getLanePosition(lane);

    }

}


/* ================= MOVE RIGHT ================= */

function moveRight() {

    if (!gameRunning) return;

    if (lane < 2) {

        lane++;

        player.style.left = getLanePosition(lane);

    }

}


/* ================= JUMP ================= */

function jump() {

    if (!gameRunning) return;

    if (player.classList.contains("jump")) return;

    if (player.classList.contains("slide")) return;

    player.classList.add("jump");

    setTimeout(() => {

        player.classList.remove("jump");

    }, 650);

}


/* ================= SLIDE ================= */

function slide() {

    if (!gameRunning) return;

    if (player.classList.contains("slide")) return;

    if (player.classList.contains("jump")) return;

    player.classList.add("slide");

    setTimeout(() => {

        player.classList.remove("slide");

    }, 550);

}


/* ================= KEYBOARD ================= */

document.addEventListener("keydown", function(event) {

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {

        moveLeft();

    }

    else if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {

        moveRight();

    }

    else if (
        event.key === "ArrowUp" ||
        event.key === " "
    ) {

        event.preventDefault();

        jump();

    }

    else if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {

        slide();

    }

});


/* ================= MOBILE BUTTONS ================= */

leftButton.addEventListener("click", moveLeft);
rightButton.addEventListener("click", moveRight);
jumpButton.addEventListener("click", jump);
slideButton.addEventListener("click", slide);


/* ================= TOUCH SUPPORT ================= */

leftButton.addEventListener("touchstart", function(event) {

    event.preventDefault();

    moveLeft();

});

rightButton.addEventListener("touchstart", function(event) {

    event.preventDefault();

    moveRight();

});

jumpButton.addEventListener("touchstart", function(event) {

    event.preventDefault();

    jump();

});

slideButton.addEventListener("touchstart", function(event) {

    event.preventDefault();

    slide();

});


/* ================= SPAWN SYSTEM ================= */

function startSpawning() {

    clearInterval(obstacleTimer);
    clearInterval(coinTimer);

    obstacleTimer = setInterval(() => {

        if (gameRunning) {

            createObstacle();

        }

    }, 950);


    coinTimer = setInterval(() => {

        if (gameRunning) {

            createCoin();

        }

    }, 650);

}


/* ================= CREATE COIN ================= */

function createCoin() {

    if (!gameRunning) return;

    const coin = document.createElement("div");

    coin.className = "coin";

    const randomLane = Math.floor(Math.random() * 3);

    coin.dataset.lane = randomLane;

    coin.style.left = getLanePosition(randomLane);

    coin.style.transform = "translateX(-50%)";

    coin.style.animationDuration =
        Math.max(1.4, speed) + "s";

    coinsContainer.appendChild(coin);

    coin.addEventListener("animationend", () => {

        coin.remove();

    });

}


/* ================= CREATE OBSTACLE ================= */

function createObstacle() {

    if (!gameRunning) return;

    const obstacle = document.createElement("div");

    obstacle.className = "obstacle";

    const randomLane = Math.floor(Math.random() * 3);

    obstacle.dataset.lane = randomLane;

    obstacle.style.left = getLanePosition(randomLane);

    obstacle.style.transform = "translateX(-50%)";

    obstacle.style.animationDuration =
        Math.max(1.5, speed) + "s";

    obstaclesContainer.appendChild(obstacle);

    obstacle.addEventListener("animationend", () => {

        if (obstacle.parentElement) {

            obstacle.remove();

        }

    });

}


/* ================= COLLISION DETECTION ================= */

function rectanglesOverlap(rect1, rect2) {

    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );

}


/* ================= GAME LOOP ================= */

function gameLoop() {

    if (!gameRunning) return;

    checkCoins();

    checkObstacles();

    score++;

    scoreDisplay.textContent = score;

    /*
        Gradually increase the speed.
    */

    if (score % 500 === 0) {

        speed = Math.max(1.35, speed - 0.15);

    }

    animationTimer = requestAnimationFrame(gameLoop);

}


/* ================= COIN CHECK ================= */

function checkCoins() {

    const playerRect = player.getBoundingClientRect();

    const coins = document.querySelectorAll(".coin");

    coins.forEach(coin => {

        const coinRect = coin.getBoundingClientRect();

        if (rectanglesOverlap(playerRect, coinRect)) {

            coin.remove();

            score += 100;

            scoreDisplay.textContent = score;

        }

    });

}


/* ================= OBSTACLE CHECK ================= */

function checkObstacles() {

    const playerRect = player.getBoundingClientRect();

    const obstacles = document.querySelectorAll(".obstacle");

    obstacles.forEach(obstacle => {

        const obstacleRect = obstacle.getBoundingClientRect();

        if (rectanglesOverlap(playerRect, obstacleRect)) {

            /*
                Allow the player to avoid some obstacles
                by jumping or sliding.
            */

            const jumping =
                player.classList.contains("jump");

            const sliding =
                player.classList.contains("slide");

            /*
                If the player is jumping,
                small ground obstacles can be avoided.
            */

            if (jumping) {

                const playerBottom = playerRect.bottom;

                const obstacleTop = obstacleRect.top;

                if (playerBottom < obstacleTop + 20) {

                    return;

                }

            }

            /*
                Sliding gives a little protection
                against obstacles that are higher up.
            */

            if (sliding) {

                if (playerRect.top > obstacleRect.top + 15) {

                    return;

                }

            }

            endGame();

        }

    });

}


/* ================= END GAME ================= */

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;

    cancelAnimationFrame(animationTimer);

    clearInterval(obstacleTimer);
    clearInterval(coinTimer);

    player.classList.remove("running");
    player.classList.remove("jump");
    player.classList.remove("slide");

    finalScoreDisplay.textContent = score;

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "noviaiChaseHighScore",
            highScore
        );

    }

    gameOverScreen.style.display = "flex";

}


/* ================= BUTTONS ================= */

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", restartGame);


/* ================= PREVENT PAGE SCROLL ================= */

document.addEventListener(
    "touchmove",
    function(event) {

        if (gameRunning) {

            event.preventDefault();

        }

    },
    { passive: false }
);


/* ================= INITIAL POSITION ================= */

player.style.left = getLanePosition(1);
```
