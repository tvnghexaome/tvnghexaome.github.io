const board = document.getElementById("game-board")
const scoreText = document.getElementById("score")
const levelText = document.getElementById("level")
const livesText = document.getElementById("lives")
const gameOverScreen = document.getElementById("game-over")

const width = 30
const height = 20

let snake, food, direction, score, level, lives, speed, interval

function initGame(){

snake = [{x:10,y:10}]
direction = "right"
score = 0
level = 1
lives = 3
speed = 150

scoreText.textContent = "SCORE: 000"
levelText.textContent = "LEVEL: 01"
livesText.textContent = "❤️❤️❤️"

gameOverScreen.style.display = "none"

createGrid()
spawnFood()
draw()

clearInterval(interval)
interval = setInterval(gameLoop, speed)
}

function createGrid(){

board.innerHTML=""

for(let y=0;y<height;y++){
for(let x=0;x<width;x++){

const cell = document.createElement("div")
cell.classList.add("cell")
cell.id=`cell-${x}-${y}`

board.appendChild(cell)

}
}
}

function draw(){

document.querySelectorAll(".snake,.head").forEach(e=>{
e.classList.remove("snake","head")
})

document.querySelectorAll(".food").forEach(e=>{
e.classList.remove("food")
})

snake.forEach((segment,index)=>{

const cell = document.getElementById(`cell-${segment.x}-${segment.y}`)

if(!cell) return

if(index===0){
cell.classList.add("head")
}else{
cell.classList.add("snake")
}

})

const foodCell = document.getElementById(`cell-${food.x}-${food.y}`)

if(foodCell){
foodCell.classList.add("food")
}

}

function spawnFood(){

let valid=false

while(!valid){

food={
x:Math.floor(Math.random()*width),
y:Math.floor(Math.random()*height)
}

valid=!snake.some(s=>s.x===food.x && s.y===food.y)

}

}

function move() {
    const head = { ...snake[0] };

    if (direction === "up") head.y--;
    if (direction === "down") head.y++;
    if (direction === "left") head.x--;
    if (direction === "right") head.x++;

    // Logic xuyên tường:
    if (head.x < 0) head.x = width - 1;       // Sang trái quá giới hạn -> hiện ra bên phải
    if (head.x >= width) head.x = 0;          // Sang phải quá giới hạn -> hiện ra bên trái
    if (head.y < 0) head.y = height - 1;      // Lên trên quá giới hạn -> hiện ra ở dưới
    if (head.y >= height) head.y = 0;         // Xuống dưới quá giới hạn -> hiện ra ở trên

    snake.unshift(head);

    // Kiểm tra ăn mồi
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreText.textContent = "SCORE: " + score.toString().padStart(3, "0");

        if (score % 50 === 0) {
            level++;
            levelText.textContent = "LEVEL: " + level.toString().padStart(2, "0");
            speed = Math.max(50, speed - 10); // Giới hạn tốc độ tối thiểu để game không quá nhanh
            clearInterval(interval);
            interval = setInterval(gameLoop, speed);
        }
        spawnFood();
    } else {
        snake.pop();
    }
}

function collision() {
    const head = snake[0];

    // Chỉ kiểm tra va chạm với thân (bỏ phần kiểm tra x < 0, x >= width...)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            loseLife();
            return true;
        }
    }

    return false;
}

function loseLife(){

lives--

livesText.textContent="❤️".repeat(lives)

if(lives<=0){

clearInterval(interval)

gameOverScreen.style.display="flex"

}else{

snake=[{x:10,y:10}]
direction="right"

}

}

function gameLoop(){

move()

if(!collision()){
draw()
}

}

document.addEventListener("keydown",e=>{

if(e.key==="ArrowUp" && direction!=="down") direction="up"
if(e.key==="ArrowDown" && direction!=="up") direction="down"
if(e.key==="ArrowLeft" && direction!=="right") direction="left"
if(e.key==="ArrowRight" && direction!=="left") direction="right"

})

function restartGame(){
initGame()
}

initGame()