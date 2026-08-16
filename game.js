const game = document.getElementById("game");
const player = document.getElementById("player");
const objects = document.getElementById("objects");

const scoreDisplay = document.getElementById("score");
const finalScore = document.getElementById("final-score");

const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const jumpButton = document.getElementById("jumpButton");

let running = false;
let score = 0;
let lane = 1;

let speed = 5;
let spawnTimer = 0;

let playerY = 0;
let jumping = false;

let gameLoop;

const lanes = [16.66, 50, 83.33];

function setPlayerLane() {

```
player.style.left = lanes[lane] + "%";
```

}

function moveLeft() {

```
if (!running) return;

if (lane > 0) {

    lane--;

    setPlayerLane();

}
```

}

function moveRight() {

```
if (!running) return;

if (lane < 2) {

    lane++;

    setPlayerLane();

}
```

}

function jump() {

```
if (!running || jumping) return;

jumping = true;

playerY = 120;

player.style.bottom = "190px";

setTimeout(() => {

    player.style.bottom = "70px";

    playerY = 0;

    jumping = false;

}, 550);
```

}

function createObject() {

```
const object = document.createElement("div");

object.classList.add("object");

const objectLane = Math.floor(Math.random() * 3);

object.style.left = lanes[objectLane] + "%";

object.style.transform = "translateX(-50%)";

const isCoin = Math.random() < 0.35;

if (isCoin) {

    object.classList.add("coin");

    object.textContent = "🪙";

    object.dataset.type = "coin";

} else {

    object.classList.add("obstacle");

    const obstacles = ["🚧", "🛑", "📦"];

    object.textContent =
        obstacles[Math.floor(Math.random() * obstacles.length)];

    object.dataset.type = "obstacle";

}

object.style.top = "-70px";

object.dataset.lane = objectLane;

objects.appendChild(object);
```

}

function checkCollision(object) {

```
const objectRect = object.getBoundingClientRect();
const playerRect = player.getBoundingClientRect();

const touching =
    objectRect.left < playerRect.right &&
    objectRect.right > playerRect.left &&
    objectRect.top < playerRect.bottom &&
    objectRect.bottom > playerRect.top;

return touching;
```

}

function updateObjects() {

```
const allObjects =
    document.querySelectorAll(".object");

allObjects.forEach(object => {

    let currentTop =
        parseFloat(object.style.top);

    currentTop += speed;

    object.style.top =
        currentTop + "px";

    if (checkCollision(object)) {

        if (object.dataset.type === "coin") {

            score += 10;

            scoreDisplay.textContent =
                score;

            object.remove();

        } else if (!jumping) {

            endGame();

        }

    }

    if (currentTop > game.clientHeight + 100) {

        object.remove();

    }

});
```

}

function updateScore() {

```
if (!running) return;

score++;

scoreDisplay.textContent =
    score;

if (score % 300 === 0) {

    speed += 0.7;

}
```

}

function gameUpdate() {

```
if (!running) return;

spawnTimer++;

if (spawnTimer > Math.max(30, 75 - speed * 5)) {

    createObject();

    spawnTimer = 0;

}

updateObjects();

gameLoop =
    requestAnimationFrame(gameUpdate);
```

}

function startGame() {

```
running = true;

score = 0;
speed = 5;
lane = 1;
spawnTimer = 0;

scoreDisplay.textContent = "0";

objects.innerHTML = "";

setPlayerLane();

startScreen.classList.add("hidden");
gameOverScreen.classList.add("hidden");

clearInterval(window.scoreTimer);

window.scoreTimer =
    setInterval(updateScore, 1000);

cancelAnimationFrame(gameLoop);

gameUpdate();
```

}

function endGame() {

```
if (!running) return;

running = false;

cancelAnimationFrame(gameLoop);

clearInterval(window.scoreTimer);

finalScore.textContent =
    score;

gameOverScreen.classList.remove("hidden");
```

}

document.addEventListener("keydown", event => {

```
if (event.key === "ArrowLeft") {

    moveLeft();

}

if (event.key === "ArrowRight") {

    moveRight();

}

if (
    event.key === "ArrowUp" ||
    event.key === " "
) {

    jump();

}
```

});

leftButton.addEventListener(
"click",
moveLeft
);

rightButton.addEventListener(
"click",
moveRight
);

jumpButton.addEventListener(
"click",
jump
);

startButton.addEventListener(
"click",
startGame
);

restartButton.addEventListener(
"click",
startGame
);

setPlayerLane();
