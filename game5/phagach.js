const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Cấu hình Thanh chèo (Đã chỉnh dài hơn: 180) ---
const paddle = {
    width: 180, 
    height: 10,
    x: (canvas.width - 180) / 2,
    speed: 8
};

let rightPressed = false;
let leftPressed = false;
const ballRadius = 10;
let level = 1; // --- Thêm biến Cấp độ ---

let balls = [{
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 3.5,
    dy: -3.5
}];

let brickRowCount = 7;
let brickColumnCount = 7;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 40;
const brickOffsetLeft = 30;

let bricks = [];
let score = 0;
let lives = 3;
let isPaused = false;
let isStarted = false;

const powerUpTypes = ['score', 'speed', 'clone'];
let powerUp = { x: -1, y: -1, radius: 10, speed: 2, active: false, type: '', color: 'gold' };
let powerUpMessage = '';
let powerUpTimer = 0;

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    else if (e.key === "p" || e.key === "P") {
        isPaused = !isPaused;
        if (!isPaused) draw();
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const y = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r] = { x, y, status: 1, color: getRandomColor() };
        }
    }
}

function getRandomColor() {
    const colors = ['#FF4C4C', '#FFD700', '#00CED1', '#32CD32', '#FF69B4'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                ctx.beginPath();
                ctx.rect(b.x, b.y, brickWidth, brickHeight);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0b8a00";
    ctx.fill();
    ctx.closePath();
}
function drawPowerUp() {
    if (powerUp.active) {
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        ctx.fillStyle = powerUp.color;
        ctx.fill();
        ctx.closePath();
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                balls.forEach(ball => {
                    if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score++;
                        if (Math.random() < 0.1 && !powerUp.active) spawnPowerUp(b.x + brickWidth / 2, b.y + brickHeight / 2);

                        // --- Logic Lên Cấp Khi Phá Hết Gạch ---
                        if (score === brickRowCount * brickColumnCount) {
                            level++;
                            alert("CHÚC MỪNG! BẠN LÊN CẤP " + level);
                            score = 0;
                            // Reset bóng và tăng tốc độ dựa trên level
                            balls = [{
                                x: canvas.width / 2,
                                y: canvas.height - 30,
                                dx: 3.5 + (level * 0.5), 
                                dy: -(3.5 + (level * 0.5))
                            }];
                            paddle.x = (canvas.width - paddle.width) / 2;
                            initBricks();
                        }
                    }
                });
            }
        }
    }
}

function spawnPowerUp(x, y) {
    powerUp.x = x; powerUp.y = y; powerUp.active = true;
    powerUp.type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
}

function applyPowerUp() {
    if (powerUp.type === 'score') { score += 10; powerUpMessage = "+10 Điểm!"; }
    else if (powerUp.type === 'speed') { paddle.speed += 2; powerUpMessage = "Tăng tốc thanh chèo!"; }
    else if (powerUp.type === 'clone') {
        const newBall = { ...balls[0] }; newBall.dx = -newBall.dx;
        balls.push(newBall); powerUpMessage = "Nhân bản bóng!";
    }
    powerUpTimer = 120;
}

function drawScore() {
    ctx.font = "16px Arial"; ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 8, 20);
    ctx.fillText("Level: " + level, 100, 20); // Hiển thị Level
}

function drawLives() {
    ctx.font = "16px Arial"; ctx.fillStyle = "#fff";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function drawHighScore() {
    ctx.font = "16px Arial"; ctx.fillStyle = "#fff";
    ctx.fillText("High Score: " + highScore, canvas.width / 2 - 50, 20);
}

function drawPowerUpMessage() {
    if (powerUpTimer > 0) {
        ctx.font = "20px Arial"; ctx.fillStyle = "yellow";
ctx.fillText(powerUpMessage, canvas.width / 2 - 80, canvas.height / 2);
        powerUpTimer--;
    }
}

function draw() {
    if (isPaused || !isStarted) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    balls.forEach(drawBall);
    drawPaddle();
    drawScore();
    drawLives();
    drawHighScore();
    drawPowerUp();
    drawPowerUpMessage();
    collisionDetection();

    balls.forEach((ball, index) => {
        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ballRadius) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ballRadius) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) ball.dy = -ball.dy;
            else {
                if (balls.length > 1) balls.splice(index, 1);
                else {
                    lives--;
                    if (!lives) {
                        if (score > highScore) localStorage.setItem('highScore', score);
                        alert("GAME OVER"); document.location.reload();
                    } else {
                        ball.x = canvas.width / 2; ball.y = canvas.height - 30;
                        ball.dx = 3.5 + (level * 0.5); ball.dy = -(3.5 + (level * 0.5));
                        paddle.x = (canvas.width - paddle.width) / 2;
                    }
                }
            }
        }
        ball.x += ball.dx; ball.y += ball.dy;
    });

    if (powerUp.active) {
        powerUp.y += powerUp.speed;
        if (powerUp.y > canvas.height) powerUp.active = false;
        if (powerUp.y + powerUp.radius > canvas.height - paddle.height && powerUp.x > paddle.x && powerUp.x < paddle.x + paddle.width) {
            applyPowerUp(); powerUp.active = false;
        }
    }

    if (rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
    else if (leftPressed && paddle.x > 0) paddle.x -= paddle.speed;

    requestAnimationFrame(draw);
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    isStarted = true;
    initBricks();
    draw();
}