const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ===== LOAD IMAGES =====

const shipImg = new Image();
shipImg.src = "images/fighter.png";

const chickenImg = new Image();
chickenImg.src = "images/fly1.png";

const bossImg = new Image();
bossImg.src = "images/ga.png";

// ===== GAME STATE =====

let ship = {
    x: canvas.width/2-20,
    y: canvas.height
    -60,
    width:40,
    height:40,
    fireRate:120
};

let bullets = [];
let chickens = [];
let eggs = [];
let bossBullets = [];

let score = 0;
let lives = 3;

let keys = {};
let shooting = false;

let gameOver = false;
let lastShot = 0;

// ===== LEVEL SYSTEM =====

let level = 1;
let scoreToNext = 15;

let levelTime = 30;
let timeLeft = levelTime;

// ===== BOSS =====

let boss = null;
let bossHP = 20;
let bossMaxHP = 20;
let bossAppearTime = 20;
let bossSpawned = false;


// ===== DRAW =====

function drawShip(){
    if(shipImg.complete){
        ctx.drawImage(shipImg,ship.x,ship.y,ship.width,ship.height);
    }else{
        ctx.fillStyle="cyan";
        ctx.fillRect(ship.x,ship.y,ship.width,ship.height);
    }
}

function drawBullets(){
    ctx.fillStyle="yellow";
    bullets.forEach(b=>{
        ctx.fillRect(b.x,b.y,b.width,b.height);
    });
}

function drawChickens(){
    chickens.forEach(c=>{
        if(chickenImg.complete){
            ctx.drawImage(
                chickenImg,
                c.x-c.radius,
                c.y-c.radius,
                c.radius*2,
                c.radius*2
            );
        }
    });
}

function drawEggs(){
    ctx.fillStyle="white";
    eggs.forEach(e=>{
        ctx.fillRect(e.x,e.y,e.width,e.height);
    });
}

// ===== BOSS =====

function drawBoss(){

    if(!boss) return;

    ctx.drawImage(bossImg,boss.x,boss.y,boss.width,boss.height);

    let hpPercent = bossHP / bossMaxHP;

    ctx.fillStyle="red";
    ctx.fillRect(boss.x,boss.y-15,boss.width,10);

    ctx.fillStyle="lime";
    ctx.fillRect(boss.x,boss.y-15,boss.width*hpPercent,10);
}

function drawBossBullets(){

    ctx.fillStyle="orange";

    bossBullets.forEach(b=>{
        ctx.fillRect(b.x,b.y,b.width,b.height);
    });

}

// ===== MOVEMENT =====

function moveBullets(){
    bullets.forEach(b=> b.y -= 8);
    bullets = bullets.filter(b=> b.y>-10);
}

function moveChickens(){

    chickens.forEach(c=>{

        c.y += 2;

        if(Math.random()<0.003){

            eggs.push({
                x:c.x,
                y:c.y,
                width:10,
                height:10
            });

        }

    });

}

function moveEggs(){
    eggs.forEach(e=> e.y += 5);
    eggs = eggs.filter(e=> e.y < canvas.height+10);
}

// ===== BOSS MOVE =====

function moveBoss(){

    if(!boss) return;

    boss.x += boss.speed;

    if(boss.x < 0 || boss.x + boss.width > canvas.width){
        boss.speed *= -1;
    }

    if(Math.random()<0.02){

        bossBullets.push({
            x:boss.x + boss.width/2,
            y:boss.y + boss.height,
            width:6,
            height:12
        });

    }

}

function moveBossBullets(){

    bossBullets.forEach(b=>{
        b.y += 2; // tốc đọ đạn boss
    });

    bossBullets = bossBullets.filter(b=> b.y < canvas.height);

}

// ===== COLLISION =====

function collisionDetection(){

    // bắn gà
    for(let bi = bullets.length-1; bi>=0; bi--){

        let b = bullets[bi];

        for(let ci = chickens.length-1; ci>=0; ci--){

            let c = chickens[ci];

            if(
                b.x < c.x + c.radius &&
                b.x + b.width > c.x - c.radius &&
                b.y < c.y + c.radius &&
                b.y + b.height > c.y - c.radius
            ){

                bullets.splice(bi,1);
                chickens.splice(ci,1);

                score++;

                break;
            }

        }

    }

    // bắn boss
    if(boss){

        for(let bi = bullets.length-1; bi>=0; bi--){

            let b = bullets[bi];

            if(
                b.x < boss.x + boss.width &&
                b.x + b.width > boss.x &&
                b.y < boss.y + boss.height &&
                b.y + b.height > boss.y
            ){

                bullets.splice(bi,1);

                bossHP--;

                if(bossHP<=0){

                    boss=null;
                    bossSpawned=false;
                    score+=20;

                }

            }

        }

    }

    // trứng gà trúng tàu
    for(let ei = eggs.length-1; ei>=0; ei--){

        let e = eggs[ei];

        if(
            ship.x < e.x + e.width &&
            ship.x + ship.width > e.x &&
            ship.y < e.y + e.height &&
            ship.y + ship.height > e.y
        ){

            eggs.splice(ei,1);
            lives--;

            if(lives<=0){
                gameOver=true;
            }

        }

    }

    // đạn boss trúng tàu
    for(let bi = bossBullets.length-1; bi>=0; bi--){

        let b = bossBullets[bi];

        if(
            ship.x < b.x + b.width &&
            ship.x + ship.width > b.x &&
            ship.y < b.y + b.height &&
            ship.y + ship.height > b.y
        ){

            bossBullets.splice(bi,1);

            lives--;

            if(lives<=0){
                gameOver=true;
            }

        }

    }

}

// ===== SPAWN CHICKEN =====

function spawnChicken(){

    if(!gameOver){

        chickens.push({
            x:Math.random()*(canvas.width-30)+15,
            y:-20,
            radius:15
        });

    }

}

// ===== UPDATE =====

function update(){

    if(keys["ArrowLeft"]) ship.x -= 6;
    if(keys["ArrowRight"]) ship.x += 6;

    ship.x = Math.max(0,Math.min(canvas.width-ship.width,ship.x));

    // bắn
    if(shooting && !gameOver){

        const now = Date.now();

        if(now-lastShot > ship.fireRate){

            bullets.push({
                x:ship.x + ship.width/2 - 2,
                y:ship.y,
                width:5,
                height:10
            });

            lastShot = now;

        }

    }

    // spawn boss
    if(timeLeft <= bossAppearTime && !bossSpawned){

        boss={
            x:canvas.width/2 - 100,
            y:40,
            width:200,
            height:120,
            speed:2 //tốc độ boss
        };

        bossHP = bossMaxHP;
        bossSpawned=true;

        chickens=[];
    }

    moveBullets();
    moveChickens();
    moveEggs();
    moveBoss();
    moveBossBullets();

    collisionDetection();

    // qua màn
    if(score >= scoreToNext){

        level++;
        score=0;

        timeLeft=levelTime;

        boss=null;
        bossSpawned=false;

        chickens=[];
        eggs=[];

        scoreToNext+=5;

    }

}

// ===== UI =====

function drawUI(){

    ctx.fillStyle="white";
    ctx.font="20px Arial";

    ctx.fillText("Score: "+score,10,25);
    ctx.fillText("Lives: "+lives,canvas.width-100,25);

    ctx.fillText("Level: "+level,canvas.width/2-40,25);
    ctx.fillText("Time: "+timeLeft,canvas.width/2-120,25);

}

// ===== GAME LOOP =====

function gameLoop(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(gameOver){

        ctx.fillStyle="white";
        ctx.font="40px Arial";

        ctx.fillText("GAME OVER",canvas.width/2-120,canvas.height/2);

        ctx.font="25px Arial";
        ctx.fillText("Press ENTER to Restart",canvas.width/2-140,canvas.height/2+50);

        return;
    }

    update();

    drawShip();
    drawBullets();
    drawChickens();
    drawEggs();
    drawBoss();
    drawBossBullets();
    drawUI();

    requestAnimationFrame(gameLoop);

}

// ===== TIME SYSTEM =====

setInterval(()=>{

    if(!gameOver){

        timeLeft--;

        if(timeLeft<=0){

            level++;
            timeLeft=levelTime;

        }

    }

},1000);

// ===== RESET GAME =====

function resetGame(){

    ship.x = canvas.width/2-20;

    bullets=[];
    chickens=[];
    eggs=[];
    bossBullets=[];

    score=0;
    lives=3;

    level=1;
    timeLeft=levelTime;

    boss=null;
    bossSpawned=false;

    gameOver=false;

}

// ===== INPUT =====

document.addEventListener("keydown",(e)=>{

    keys[e.key]=true;

    if(e.key===" "){
        shooting=true;
    }

    if(e.key==="Enter" && gameOver){
        resetGame();
        gameLoop();
    }

});

document.addEventListener("keyup",(e)=>{

    keys[e.key]=false;

    if(e.key===" "){
        shooting=false;
    }

});

// ===== START =====

setInterval(spawnChicken,1000);

gameLoop();