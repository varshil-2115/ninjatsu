const wordArena = document.getElementById('wordArena');
const wordInput = document.getElementById('wordInput');
const timerDisplay = document.getElementById('timerDisplay');
const playerTower = document.getElementById('playerTower');
const bot1Tower = document.getElementById('bot1Tower');
const bot2Tower = document.getElementById('bot2Tower');
const bot3Tower = document.getElementById('bot3Tower');
const completionModal = document.getElementById('completionModal');
const modalTitle = document.getElementById('modalTitle');
const finalScoreText = document.getElementById('finalScoreText');
const finishBtn = document.getElementById('finishBtn');

const wordList = [
    "CAT", "DOG", "SUN", "RUN", "JUMP", "STAR", "FISH", "BALL", "BOOK", "TREE",
    "NINJA", "TOY", "PLAY", "CAKE", "MILK", "BIRD", "MOON", "BLUE", "FROG", "DUCK",
    "SHIELD", "HERO", "GOLD", "FIRE", "WATER", "WIND", "FAST", "SLIDE", "KITE"
];

let currentWord = "";
let timeLeft = 30;
let playerBlocks = 0;
let bot1Blocks = 0;
let bot2Blocks = 0;
let bot3Blocks = 0;
let gameInterval;
let botInterval;

function startGame() {
    getNextWord();
    updateTowers();
    gameInterval = setInterval(updateTimer, 1000);
    botInterval = setInterval(moveBots, 1400);
    wordInput.addEventListener('input', handleTyping);
}

function getNextWord() {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex];
    
    wordArena.innerHTML = '';
    const div = document.createElement('div');
    div.classList.add('target-word');
    div.innerText = currentWord;
    wordArena.appendChild(div);
}

function handleTyping(e) {
    const typedText = e.target.value.trim().toUpperCase();

    if (typedText === currentWord) {
        if (window.NinjaAudio) NinjaAudio.playTap(); // Clean block placement sound
        e.target.value = '';
        playerBlocks++;
        updateTowers();
        getNextWord();
    }
}

function updateTowers() {
    playerTower.innerHTML = '';
    for (let i = 0; i < playerBlocks; i++) {
        playerTower.appendChild(createBlock());
    }
    bot1Tower.innerHTML = '';
    for (let i = 0; i < bot1Blocks; i++) {
        bot1Tower.appendChild(createBlock());
    }
    bot2Tower.innerHTML = '';
    for (let i = 0; i < bot2Blocks; i++) {
        bot2Tower.appendChild(createBlock());
    }
    bot3Tower.innerHTML = '';
    for (let i = 0; i < bot3Blocks; i++) {
        bot3Tower.appendChild(createBlock());
    }
}

function createBlock() {
    const div = document.createElement('div');
    div.classList.add('block');
    return div;
}

function moveBots() {
    if (Math.random() > 0.5) bot1Blocks++;
    if (Math.random() > 0.53) bot2Blocks++;
    if (Math.random() > 0.56) bot3Blocks++;
    updateTowers();
}

function updateTimer() {
    timeLeft--;
    timerDisplay.innerText = `⏱️ 0:${timeLeft < 10 ? '0' : ''}${timeLeft}`;

    if (timeLeft <= 0) {
        clearInterval(gameInterval);
        clearInterval(botInterval);
        showRankings();
    }
}

function showRankings() {
    const participants = [
        { name: 'YOU (Super Ninja 🥷)', blocks: playerBlocks, isPlayer: true },
        { name: 'Robo-Bot 🤖', blocks: bot1Blocks, isPlayer: false },
        { name: 'Ninja Fox 🦊', blocks: bot2Blocks, isPlayer: false },
        { name: 'Speedy Panda 🐼', blocks: bot3Blocks, isPlayer: false }
    ];

    participants.sort((a, b) => b.blocks - a.blocks);

    const playerRank = participants.findIndex(p => p.isPlayer) + 1;
    const isWin = (playerRank === 1);

    if (isWin) {
        if (window.NinjaAudio) NinjaAudio.cheer();
        modalTitle.innerText = "🏆 1ST PLACE WINNER!";
    } else {
        if (window.NinjaAudio) NinjaAudio.comfort();
        modalTitle.innerText = `🏁 FINISHED - RANK #${playerRank}!`;
    }

    fetch('/api/update-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: isWin ? 80 : 30, game_name: 'Word Race Tower' })
    }).catch(err => console.log('Star sync error'));

    let rankingHTML = "<ul style='list-style: none; padding: 0; margin-top: 10px; text-align: left;'>";
    participants.forEach((p, index) => {
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "4️⃣";
        let weight = p.isPlayer ? "font-weight: bold; color: #d97706;" : "";
        rankingHTML += `<li style="padding: 6px 0; border-bottom: 1px dashed #cbd5e1; ${weight}">${medal} <b>#${index + 1}</b> ${p.name} - <b>${p.blocks}</b> blocks built</li>`;
    });
    rankingHTML += "</ul>";

    finalScoreText.innerHTML = rankingHTML;
    completionModal.style.display = 'flex';
}

finishBtn.addEventListener('click', () => {
    if (window.NinjaAudio) NinjaAudio.playWhoosh();
    window.location.href = '/start-learning';
});

startGame();