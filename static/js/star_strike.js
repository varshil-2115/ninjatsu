const arena = document.getElementById('targetArena');
const startBtn = document.getElementById('startBtn');
const startPrompt = document.getElementById('startPrompt');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const completionModal = document.getElementById('completionModal');
const finalScoreText = document.getElementById('finalScoreText');
const finishBtn = document.getElementById('finishBtn');

let score = 0;
let timeLeft = 20;
let gameInterval;
let targetSpawner;
let currentSpawnRate = 1200; 
const icons = ['★', '✦', '❖', '🎯', '📜'];

function startGame() {
    if (window.NinjaAudio) NinjaAudio.playWhoosh();
    startPrompt.style.display = 'none';
    score = 0;
    timeLeft = 60;
    currentSpawnRate = 1200; 
    scoreDisplay.innerText = `Stars: ${score} ⭐`;
    timerDisplay.innerText = `⏱️ Time: ${timeLeft}s`;

    document.querySelectorAll('.target-item').forEach(el => el.remove());

    gameInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = `⏱️ Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    scheduleSpawner();
}

function scheduleSpawner() {
    clearInterval(targetSpawner);
    targetSpawner = setInterval(spawnTarget, currentSpawnRate);
}

function spawnTarget() {
    if (timeLeft <= 0) return;

    const target = document.createElement('div');
    target.classList.add('target-item');

    const isGolden = Math.random() < 0.15;
    if (isGolden) {
        target.innerHTML = '★';
        target.style.color = '#78350f';
        target.style.borderColor = '#fbbf24';
        target.style.background = '#fef08a';
    } else {
        target.innerHTML = icons[Math.floor(Math.random() * icons.length)];
        target.style.color = '#ffffff';
        target.style.borderColor = '#ffffff';
        target.style.background = '#d97706';
    }

    const maxX = arena.clientWidth - 70;
    const maxY = arena.clientHeight - 70;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    target.addEventListener('click', (e) => {
        const points = isGolden ? 30 : 10;
        score += points;
        scoreDisplay.innerText = `Stars: ${score} ⭐`;
        
        if (window.NinjaAudio) {
            if (isGolden) {
                NinjaAudio.cheer();
            } else {
                NinjaAudio.playTap();
            }
        }

        showBurstText(e.clientX, e.clientY, `+${points} ⭐`);
        target.remove();

        if (score >= 60 && currentSpawnRate > 700) {
            currentSpawnRate = 700;
            scheduleSpawner();
        }
    });

    arena.appendChild(target);

    setTimeout(() => {
        if (target.parentElement) {
            target.remove();
        }
    }, 1500);
}

function showBurstText(x, y, text) {
    const burst = document.createElement('div');
    burst.innerText = text;
    burst.style.position = 'fixed';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.color = '#d97706';
    burst.style.fontWeight = 'bold';
    burst.style.fontSize = '20px';
    burst.style.pointerEvents = 'none';
    burst.style.zIndex = '9999';
    burst.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    
    document.body.appendChild(burst);
    
    setTimeout(() => {
        burst.style.transform = 'translateY(-40px) scale(1.3)';
        burst.style.opacity = '0';
    }, 20);

    setTimeout(() => burst.remove(), 500);
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(targetSpawner);
    document.querySelectorAll('.target-item').forEach(el => el.remove());

    fetch('/api/update-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: 50, game_name: 'Star Strike' })
    }).catch(error => console.log('XP sync error'));

    if (window.NinjaAudio) NinjaAudio.cheer();

    finalScoreText.innerText = `Super popping! You won ${score} points and earned +50 Stars! ⭐`;
    completionModal.style.display = 'flex';
}

if (startBtn) {
    startBtn.addEventListener('click', startGame);
}

if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        if (window.NinjaAudio) NinjaAudio.playWhoosh();
        window.location.href = "/start-learning";
    });
}