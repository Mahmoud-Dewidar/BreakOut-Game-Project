
WebFont.load({
    google: {
        families: ['Dancing Script']
    }
});

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const Score = document.getElementById("Score")
const Lives = document.getElementById("Lives")
const HighScore = document.getElementById("HighScore")
const Level = document.getElementById("Level")
const results = document.getElementById("info");
const play = document.getElementById("start");
const rematch = document.getElementById("rematch");
const hold = document.getElementById("hold");
const audio = document.getElementById("audio");
const muted = document.getElementById("mute");
const gameAudio = new Audio("./audio/Music.mp3");
let lives = 3;
let level = 1;
let rightPressed = false;
let leftPressed = false;
let s = 0;
let moveX = 5;
let moveY = -5;
let mute = 0;
let sounds = ["./audio/2.mp3", "./audio/3.mp3", "./audio/Arcade game over sound effect!.mp3", "./audio/Fail sound effect.mp3"]
var gameStarted = false;
var gamePaused = false;

const bricks = [];

function musicStart(t) {
    if (mute == 0) {
        audio.currentTime = t;
        audio.play();
    }
}

//----------------------------------------------------------------
// Welcome
function welcome() {

    ctx.font = "90px Dancing Script";
    ctx.textAlign = "center";
    // Create black border around text
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.strokeText("Welcome To Our Simple", canvas.width / 2, canvas.height / 2 - 45);
    ctx.strokeText("Breakout Game Project", canvas.width / 2, canvas.height / 2 + 45);

    // Fill text with gradient
    var textGradient = ctx.createLinearGradient(0, canvas.height / 2 - 30, 0, canvas.height / 2 + 30);
    textGradient.addColorStop(0, "#fdbb2d");
    textGradient.addColorStop(1, "#22c1c3");

    ctx.fillStyle = textGradient;
    ctx.fillText("Welcome To Our Simple", canvas.width / 2, canvas.height / 2 - 45);
    ctx.fillText("Breakout Game Project", canvas.width / 2, canvas.height / 2 + 45);
}
setTimeout(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    welcome()
}, 500);

setTimeout(function () {
    play.addEventListener("click", startGame)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
}, 4000);
//----------------------------------------------------------------
// Buttons Events
muted.addEventListener("click", muteSound)
rematch.addEventListener("click", newGame)
hold.addEventListener("click", pauseGame)
//----------------------------------------------------------------
//LocalStorage 
if (localStorage.getItem("highScore") === null) {
    localStorage.setItem("highScore", "0");
}
let highScore = Number(localStorage.getItem("highScore"));
//----------------------------------------------------------------
// Paddle Object Properties
const paddle = {
    x: (canvas.width - 170) / 2,
    y: canvas.height - 2 * 25,
    width: 170,
    height: 25,
    cornerRadius: 10,
    speed: 7,
};
// brick Object Properties
const brick = {
    width: 80,
    height: 20,
    padding: 10,
    offsetX: 45,
    offsetY: 45,
    visible: true,
    hits: 2,
    brickRadius: 5,
    color: 'black',
};
// Ball Object Properties
const ball = {
    x: (canvas.width) / 2,
    y: canvas.height - 3 * 25,
}

for (let i = 0; i < 9; i++) {
    bricks[i] = [];
    for (let j = 0; j < 7; j++) {
        const x = i * (brick.width + brick.padding) + brick.offsetX;
        const y = j * (brick.height + brick.padding) + brick.offsetY;
        bricks[i][j] = { x, y, ...brick };
    }
}
// ----------------------------------------------------------------
// Draw the brick
function drawBricks() {
    const brickGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < bricks[i].length; j++) {
            const brick = bricks[i][j];
            if (brick.visible && brick.hits == 2) {
                ctx.beginPath();
                brickGradient.addColorStop(0, "#fdbb2d");
                brickGradient.addColorStop(1, "#22c1c3");

                ctx.fillStyle = brickGradient;
                ctx.moveTo(brick.x + brick.brickRadius, brick.y);
                ctx.arcTo(brick.x + brick.width, brick.y, brick.x + brick.width, brick.y + brick.height, brick.brickRadius);
                ctx.arcTo(brick.x + brick.width, brick.y + brick.height, brick.x, brick.y + brick.height, brick.brickRadius);
                ctx.arcTo(brick.x, brick.y + brick.height, brick.x, brick.y, brick.brickRadius);
                ctx.arcTo(brick.x, brick.y, brick.x + brick.width, brick.y, brick.brickRadius);
                ctx.closePath();
                ctx.fill();
            }
            else if (brick.visible && brick.hits == 1) {
                ctx.beginPath();
                ctx.fillStyle = '#333';
                ctx.moveTo(brick.x + brick.brickRadius, brick.y);
                ctx.arcTo(brick.x + brick.width, brick.y, brick.x + brick.width, brick.y + brick.height, brick.brickRadius);
                ctx.arcTo(brick.x + brick.width, brick.y + brick.height, brick.x, brick.y + brick.height, brick.brickRadius);
                ctx.arcTo(brick.x, brick.y + brick.height, brick.x, brick.y, brick.brickRadius);
                ctx.arcTo(brick.x, brick.y, brick.x + brick.width, brick.y, brick.brickRadius);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
}
// Draw Ball
function drawBall() {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.fillStyle = '#00c3ff';
    ctx.arc(ball.x, ball.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}
function hitBall() {
    for (var i = 0; i < bricks.length; i++) {
        for (var j = 0; j < bricks[i].length; j++) {
            var b = bricks[i][j];
            if (b.visible == true) {

                if (ball.x > b.x && ball.x < b.x + brick.width && ball.y > b.y && ball.y < b.y + brick.height + 15) {
                    moveY = -moveY;
                    audio.src = `${sounds[2]}`
                    musicStart(1)
                    b.hits--;
                    s++

                    if (b.hits == 0) {
                        b.visible = false;
                        // audio.src = `${sounds[2]}`
                        // musicStart(1)
                        s += 2
                    }
                }
            }
        }
    }
}

// Linear gradient style 
var gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y);
gradient.addColorStop(0, "#fdbb2d");
gradient.addColorStop(1, "#22c1c3");

// Draw the paddle on the canvas
function drawPaddle() {
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.moveTo(paddle.x + paddle.cornerRadius, paddle.y);
    ctx.arcTo(paddle.x + paddle.width, paddle.y, paddle.x + paddle.width, paddle.y + paddle.height, paddle.cornerRadius);
    ctx.arcTo(paddle.x + paddle.width, paddle.y + paddle.height, paddle.x, paddle.y + paddle.height, paddle.cornerRadius);
    ctx.arcTo(paddle.x, paddle.y + paddle.height, paddle.x, paddle.y, paddle.cornerRadius);
    ctx.arcTo(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y, paddle.cornerRadius);
    ctx.stroke();
    ctx.fill();
}
//----------------------------------------------------------------
// Mouse and Keyboard Movement
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        var newPaddleX = relativeX - paddle.width / 2;

        if (newPaddleX >= 0 && newPaddleX + paddle.width <= canvas.width) {
            paddle.x = newPaddleX;
        }
    }
}
function keyDownHandler(e) {
    if (e.keyCode == 39 || e.keyCode == 68) {
        rightPressed = true;
    } else if (e.keyCode == 37 || e.keyCode == 65) {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if (e.keyCode == 39 || e.keyCode == 68) {
        rightPressed = false;
    } else if (e.keyCode == 37 || e.keyCode == 65) {
        leftPressed = false;
    }
}
function pauseKeyPress(e) {
    if (e.keyCode == 27) {
        paused = !paused;
    }
}

document.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("keyup", pauseKeyPress);
//--------------------------------------------------- 
//Results
function ViewResults() {
    Score.textContent = `Score : ${s}`;
    Lives.textContent = `Lives  : ${lives}`;
    Level.textContent = `Level : ${level}`
    HighScore.textContent = `High Score : ${highScore}`;
}

//----------------------------------------------------------------
// Rendering
function updateCanvas() {
    play.removeEventListener("click", startGame)
    draw();
    if (ball.x + moveX > canvas.width - 15 || ball.x + moveX < 15) {
        moveX = -moveX;
        audio.src = `${sounds[2]}`
        musicStart(1)
    }
    if (ball.y + moveY < 15) {
        moveY = -moveY;
        audio.src = `${sounds[2]}`
        musicStart(1)
    }

    else if (ball.y + moveY > canvas.height - 65) {
        if (ball.x > paddle.x + 2 && ball.x < paddle.x + paddle.width + 2) {
            moveY = -moveY;
            audio.src = `${sounds[2]}`
            musicStart(1)
        }
        else {
            lives--;
            if (lives == 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "bold 100px Dancing Script";
                var text = "GAME OVER"
                ctx.lineWidth = 4;
                var x = (canvas.width) / 2;
                var y = canvas.height / 2;
                ctx.strokeText(text, x, y);
                // Fill text with gradient
                ctx.fillStyle = gradient;
                ctx.fillText(text, x, y);
                gameAudio.pause()
                audio.src = `${sounds[3]}`
                musicStart(.8)
                pauseGame()
            }
            else {
                ball.x = (canvas.width) / 2;
                ball.y = canvas.height - 3 * 25;
                moveX = 5;
                moveY = -5;
                paddle.x = (canvas.width - 170) / 2;
            }
            if (s > highScore) {
                highScore = s;
                localStorage.setItem("highScore", `${s}`);
            }
        }
    }
    if (s == 252) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 100px Dancing Script";
        var text = "YOU WIN"
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);
        gameAudio.pause()
        audio.src = `${sounds[1]}`
        musicStart(1)
        pauseGame();
    }
    if (rightPressed) {
        paddle.x += 7;
        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }
    else if (leftPressed) {
        paddle.x -= 7;
        if (paddle.x < 0) {
            paddle.x = 0;
        }
    }
    // Ball Movement 
    if (!gamePaused) {
        ball.x += moveX;
        ball.y += moveY;
        requestAnimationFrame(updateCanvas);
    }
    hitBall()
    ViewResults();
}
// Draw Game Elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBricks();
    drawBall();
}

// Start
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameAudio.play();
        requestAnimationFrame(updateCanvas);
    }
}
// Pause
function pauseGame() {
    if (!gamePaused) {
        gamePaused = true;
        gameAudio.pause()
    } else {
        gamePaused = false;
        gameAudio.play()
        requestAnimationFrame(updateCanvas);
    }
}
// Rematch
function newGame() {
    document.location.reload();
}


//--------------------------------------------------------
// Mute game Music
function muteSound() {
    if(gameStarted) {
        if (!mute){
            mute = true;
            gameAudio.pause()
            muted.textContent = "🔇 UnMute"
        }
        else {
            muted.textContent = "🔊 Mute"
            gameAudio.play()
            mute = false
        }
    }
}
