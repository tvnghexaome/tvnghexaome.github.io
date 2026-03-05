// ================= CANVAS =================
const canvas = document.getElementById("gamecv");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ================= IMAGE =================
const planeImg = new Image();
planeImg.src = "images/maybay.png";

const bgImg = new Image();
bgImg.src = "images/background.png";

const birdImgs = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `images/frame-${i}.png`;
  birdImgs.push(img);
}

const fuelImg = new Image();
fuelImg.src = "images/nhienlieu.png";

const starImg = new Image();
starImg.src = "images/star.png";

// ================= GAME STATE =================
let score, level, nextLevelScore, time, gameOver;
let bullets, obstacles, fuels, stars, boss;
let shootCooldown, birdFrame, birdDelay;
let obstacleInterval, obstacleSpawnRate;
let keys = {};

// ================= PLAYER =================
const plane = {
  x: 100,
  y: 300,
  width: 60,
  height: 60,
  speed: 6,
  hp: 3
};

// ================= INPUT =================
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (gameOver && e.key === "Enter") resetGame();
});
document.addEventListener("keyup", e => keys[e.key] = false);

// ================= RESET GAME =================
function resetGame() {
  score = 0;
  level = 1;
  nextLevelScore = 50;
  time = 60;
  gameOver = false;

  bullets = [];
  obstacles = [];
  fuels = [];
  stars = [];
  boss = null;

  shootCooldown = 0;
  birdFrame = 0;
  birdDelay = 0;

  obstacleSpawnRate = 1200;

  plane.hp = 3;
  plane.x = 100;
  plane.y = canvas.height / 2;

  clearInterval(obstacleInterval);
  obstacleInterval = setInterval(spawnObstacle, obstacleSpawnRate);
}

// ================= SPAWN =================
function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 50),
    width: 50,
    height: 50,
    speed: 2 + level * 0.5
  });
}

function spawnFuel() {
  fuels.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 40),
    width: 40,
    height: 40
  });
}

function spawnStar() {
  stars.push({
    x: canvas.width,
    y: Math.random() * (canvas.height - 40),
    width: 40,
    height: 40
  });
}

// ================= COLLISION =================
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ================= LEVEL =================
function checkLevelUp() {
  if (score >= nextLevelScore) {
    level++;
    nextLevelScore += 60 + level * 20;
    plane.hp++;

    obstacleSpawnRate = Math.max(400, obstacleSpawnRate - 150);
    clearInterval(obstacleInterval);
    obstacleInterval = setInterval(spawnObstacle, obstacleSpawnRate);

    if (level % 3 === 0) spawnBoss();
  }
}

// ================= BOSS =================
function spawnBoss() {
  boss = {
    x: canvas.width,
    y: canvas.height / 3,
    width: 150,
    height: 150,
    hp: 20 + level * 5,
    speed: 2
  };
}

function updateBoss() {
  if (!boss) return;

  boss.x -= boss.speed;
  ctx.fillStyle = "purple";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (isColliding(bullets[i], boss)) {
      boss.hp--;
      bullets.splice(i, 1);
      if (boss.hp <= 0) {
        score += 100;
        boss = null;
      }
    }
  }

  if (boss && isColliding(plane, boss)) {
    plane.hp = 0;
    endGame();
  }
}

// ================= END GAME =================
function endGame() {
  gameOver = true;
}

// ================= GAME LOOP =================
function gameLoop() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 180, canvas.height/2 - 20);
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, canvas.width/2 - 70, canvas.height/2 + 30);
    ctx.fillText("Level: " + level, canvas.width/2 - 60, canvas.height/2 + 70);
    ctx.fillText("Press ENTER to Restart", canvas.width/2 - 170, canvas.height/2 + 120);
    requestAnimationFrame(gameLoop);
    return;
  }

  // MOVE
  if (keys["ArrowUp"] && plane.y > 0) plane.y -= plane.speed;
  if (keys["ArrowDown"] && plane.y < canvas.height - plane.height) plane.y += plane.speed;
  if (keys["ArrowLeft"] && plane.x > 0) plane.x -= plane.speed;
  if (keys["ArrowRight"] && plane.x < canvas.width - plane.width) plane.x += plane.speed;

  // SHOOT
  if (keys[" "] && shootCooldown <= 0) {
    bullets.push({
      x: plane.x + plane.width,
      y: plane.y + plane.height/2 - 3,
      width: 15,
      height: 6,
      speed: 8
    });
    shootCooldown = 12;
  }
  shootCooldown--;

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].speed;
    ctx.fillStyle = "yellow";
    ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
    if (bullets[i].x > canvas.width) bullets.splice(i, 1);
  }

  // BIRD ANIMATION
  birdDelay++;
  if (birdDelay > 6) {
    birdFrame = (birdFrame + 1) % birdImgs.length;
    birdDelay = 0;
  }

  // OBSTACLES
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= obs.speed;
    ctx.drawImage(birdImgs[birdFrame], obs.x, obs.y, obs.width, obs.height);

    for (let j = bullets.length - 1; j >= 0; j--) {
      if (isColliding(bullets[j], obs)) {
        obstacles.splice(i, 1);
        bullets.splice(j, 1);
        score += 5;
        break;
      }
    }

    if (isColliding(plane, obs)) {
      plane.hp--;
      obstacles.splice(i, 1);
      if (plane.hp <= 0) endGame();
    }

    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  }

  // FUEL (đã sửa sạch bug)
  for (let i = fuels.length - 1; i >= 0; i--) {
    let f = fuels[i];
    f.x -= 2;
    ctx.drawImage(fuelImg, f.x, f.y, f.width, f.height);

    if (isColliding(plane, f)) {
      time += 10;
      fuels.splice(i, 1);
      continue;
    }

    if (f.x + f.width < 0) fuels.splice(i, 1);
  }

  // STAR
  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    s.x -= 2;
    ctx.drawImage(starImg, s.x, s.y, s.width, s.height);

    if (isColliding(plane, s)) {
      score += 10;
      stars.splice(i, 1);
      continue;
    }

    if (s.x + s.width < 0) stars.splice(i, 1);
  }

  updateBoss();

  ctx.drawImage(planeImg, plane.x, plane.y, plane.width, plane.height);

  time -= 1/60;

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Level: " + level, 150, 30);
  ctx.fillText("HP: " + plane.hp, 250, 30);
  ctx.fillText("Time: " + Math.floor(time), 320, 30);

  if (time <= 0) endGame();

  checkLevelUp();
  requestAnimationFrame(gameLoop);
}

// ================= START =================
resetGame();
setInterval(spawnFuel, 8000);
setInterval(spawnStar, 6000);
gameLoop();