// ===== CONFIG =====
let move_speed = 5;
let gravity = 0.5;

// ===== ELEMENTS =====
let bird = document.querySelector('.bird');
let bird_imgs = [
    'game/b1.png',
    'game/b2.png',
    'game/b3.png',
    'game/b4.png'
];
let bird_img_index = 0;

let score_val = document.querySelector('.score_val');
let score_title = document.querySelector('.score_title');
let message = document.querySelector('.message');
let background = document.querySelector('.background').getBoundingClientRect();

// ===== STATE =====
let game_state = 'Start';
let bird_dy = 0;

// ===== ANIMATE BIRD =====
function animate_bird() {
    if (game_state !== 'Play') return;

    bird_img_index = (bird_img_index + 1) % bird_imgs.length;
    bird.src = bird_imgs[bird_img_index];

    setTimeout(animate_bird, 150);
}

// ===== KEY CONTROL (CHỈ 1 LẦN – KHÔNG LẶP) =====
document.addEventListener('keydown', (e) => {

    // Start / Restart game
    if (e.key === 'Enter' && game_state !== 'Play') {
        document.querySelectorAll('.pipe_sprite').forEach(p => p.remove());

        bird.style.top = '40vh';
        bird.style.transform = 'none';
        bird.src = 'game/b1.png';

        bird_dy = 0;
        score_val.innerHTML = '0';
        score_title.innerHTML = 'Điểm :';
        message.innerHTML = '';

        game_state = 'Play';

        play();
        animate_bird();
        apply_gravity();
        create_pipe();
    }

    // Jump
    if ((e.key === 'ArrowUp' || e.key === ' ') && game_state === 'Play') {
        bird_dy = -7.6;
    }
});

// ===== GRAVITY =====
function apply_gravity() {
    if (game_state !== 'Play') return;

    bird_dy += gravity;
    let bird_props = bird.getBoundingClientRect();

    if (bird_props.bottom >= background.bottom || bird_props.top <= 0) {
        game_state = 'End';
        message.innerHTML = 'Press Enter To Restart';
        message.style.left = '28vw';
        return;
    }

    bird.style.top = bird_props.top + bird_dy + 'px';
    requestAnimationFrame(apply_gravity);
}

// ===== MOVE PIPES + COLLISION + SCORE =====
function play() {

    function move() {
        if (game_state !== 'Play') return;

        let pipes = document.querySelectorAll('.pipe_sprite');
        let bird_props = bird.getBoundingClientRect();

        pipes.forEach(pipe => {
            let pipe_props = pipe.getBoundingClientRect();

            // Remove pipe
            if (pipe_props.right <= 0) {
                pipe.remove();
                return;
            }

            // Collision
            if (
                bird_props.left < pipe_props.left + pipe_props.width &&
                bird_props.left + bird_props.width > pipe_props.left &&
                bird_props.top < pipe_props.top + pipe_props.height &&
                bird_props.top + bird_props.height > pipe_props.top
            ) {
                game_state = 'End';
                message.innerHTML = 'Press Enter To Restart';
                message.style.left = '28vw';
                return;
            }

            // Score (CHỈ +1 LẦN)
            if (
                pipe_props.right < bird_props.left &&
                pipe.increase_score === '1'
            ) {
                score_val.innerHTML = +score_val.innerHTML + 1;
                pipe.increase_score = '0';
            }

            pipe.style.left = pipe_props.left - move_speed + 'px';
        });

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}

// ===== CREATE PIPE =====
let pipe_seperation = 120;
let pipe_gap = 40;

function create_pipe() {
    if (game_state !== 'Play') return;

    if (pipe_seperation > 115) {
        pipe_seperation = 0;

        let pipe_posi = Math.floor(Math.random() * 43) + 8;

        // Upper pipe
        let pipe_inv = document.createElement('div');
        pipe_inv.className = 'pipe_sprite';
        pipe_inv.style.top = pipe_posi - 70 + 'vh';
        pipe_inv.style.left = '100vw';

        document.body.appendChild(pipe_inv);

        // Lower pipe
        let pipe = document.createElement('div');
        pipe.className = 'pipe_sprite';
        pipe.style.top = pipe_posi + pipe_gap + 'vh';
        pipe.style.left = '100vw';
        pipe.increase_score = '1';

        document.body.appendChild(pipe);
    }

    pipe_seperation++;
    requestAnimationFrame(create_pipe);
}