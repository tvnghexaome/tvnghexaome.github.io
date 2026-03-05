let score = 0;
let timeLeft = 30;
let gameActive = false;
let birdTimer, countdownTimer;

const container = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const flapImages = ["game/frame-1.png", "game/frame-2.png", "game/frame-3.png", "game/frame-4.png"];

// Lắng nghe phím Enter để bắt đầu
window.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && !gameActive) {
        startGame();
    }
});

document.getElementById('restart-btn').onclick = startGame;

function playSound(freq) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
    osc.stop(context.currentTime + 0.1);
}

function startGame() {
    score = 0;
    timeLeft = 30;
    gameActive = true;
    scoreDisplay.innerText = score;
    timerDisplay.innerText = timeLeft;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    document.querySelectorAll('.bird').forEach(b => b.remove());

    countdownTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);

    spawnBird();
}

function spawnBird() {
    if (!gameActive) return;

    const birdDiv = document.createElement('div');
    birdDiv.className = 'bird';
    const birdImg = document.createElement('img');
    birdImg.src = flapImages[0];
    birdImg.alt = ""; // Xóa chữ Bird
    birdDiv.appendChild(birdImg);

    // Hiệu ứng vỗ cánh
    let frame = 0;
    const flap = setInterval(() => {
        if (!birdDiv.parentNode) clearInterval(flap);
        frame = (frame + 1) % flapImages.length;
        birdImg.src = flapImages[frame];
    }, 100);

    // Xuất hiện từ bên PHẢI
    const randomY = Math.random() * (container.offsetHeight - 150);
    birdDiv.style.top = randomY + 'px';
    let posX = container.offsetWidth;
    birdDiv.style.left = posX + 'px';
    container.appendChild(birdDiv);

    let speed = Math.random() * 3 + 4;

    function move() {
        if (!gameActive || !birdDiv.parentNode) return;
        posX -= speed; // Bay sang TRÁI
        birdDiv.style.left = posX + 'px';

        if (posX > -120) requestAnimationFrame(move);
        else birdDiv.remove();
    }
    requestAnimationFrame(move);

    birdDiv.onmousedown = (e) => {
        e.stopPropagation();
        score += 10;
        scoreDisplay.innerText = score;
        playSound(600);
        birdDiv.classList.add('hit');
        setTimeout(() => birdDiv.remove(), 400);
    };

    birdTimer = setTimeout(spawnBird, Math.random() * 600 + 500);
}

function endGame() {
    gameActive = false;
    clearTimeout(birdTimer);
    clearInterval(countdownTimer);
    document.getElementById('final-score').innerText = "Tổng điểm: " + score;
    gameOverScreen.style.display = 'flex';
}