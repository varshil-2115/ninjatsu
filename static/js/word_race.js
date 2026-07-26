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

// Boht saare words ki ek achi list
const wordList = [
    "LOCKS", "BLUNT", "COAT", "HEAD", "MYANMAR", "FUND", "PLANNED", "SURFACE", "BUILD", "BILLING",
    "NINJA", "SHADOW", "BLADE", "SCROLL", "STRIKE", "WARRIOR", "DOJO", "SHURIKEN", "CHAKRA", "LEGEND",
    "SPEED", "FLASH", "TOWER", "RACE", "COMBAT", "SILENT", "STEALTH", "HONOR", "SPIRIT", "MASTER"
];

let currentWord = "";
let timeLeft = 30;
let playerBlocks = 0;
let bot1Blocks = 0;
let bot2Blocks = 0;
let bot3Blocks = 0;
const maxBlocks = 12;
let gameInterval;
let botInterval;

function startGame() {
    getNextWord();
    updateTowers();
    gameInterval = setInterval(updateTimer, 1000);
    botInterval = setInterval(moveBots, 1200);

    wordInput.addEventListener('input', handleTyping);
}

// Sirf ek naya word pick karega aur screen par dikhayega
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

    // Jaise hi user exact word type kar dega
    if (typedText === currentWord) {
        e.target.value = ''; // Input box clear kar do
        playerBlocks++;
        updateTowers();
        
        // Agla naya word laao
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
    if (Math.random() > 0.45) bot1Blocks++;
    if (Math.random() > 0.5) bot2Blocks++;
    if (Math.random() > 0.55) bot3Blocks++;

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
        { name: 'AMI (You 🥷)', blocks: playerBlocks, isPlayer: true },
        { name: 'GUEST 7165 (Bot 1)', blocks: bot1Blocks, isPlayer: false },
        { name: 'GUEST 9714 (Bot 2)', blocks: bot2Blocks, isPlayer: false },
        { name: 'GUEST 268 (Bot 3)', blocks: bot3Blocks, isPlayer: false }
    ];

    participants.sort((a, b) => b.blocks - a.blocks);

    const playerRank = participants.findIndex(p => p.isPlayer) + 1;
    const isWin = (playerRank === 1);

    if (isWin) {
        modalTitle.innerText = "🎉 YOU GOT 1ST RANK!";
        fetch('/api/update-xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp: 80, game_name: 'Word Race Tower 1st Rank' })
        }).catch(err => console.log('XP sync error'));
    } else {
        modalTitle.innerText = `🏁 RACE ENDED - RANK #${playerRank}`;
    }

    let rankingHTML = "<ul style='list-style: none; padding: 0; margin-top: 10px; text-align: left;'>";
    participants.forEach((p, index) => {
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "4️⃣";
        let weight = p.isPlayer ? "font-weight: bold; color: #d97706;" : "";
        rankingHTML += `<li style="padding: 5px 0; border-bottom: 1px dashed #ddd; ${weight}">${medal} <b>#${index + 1}</b> ${p.name} - <b>${p.blocks}</b> blocks</li>`;
    });
    rankingHTML += "</ul>";

    finalScoreText.innerHTML = rankingHTML;
    completionModal.style.display = 'flex';
}

finishBtn.addEventListener('click', () => {
    window.location.href = '/start-learning';
});

startGame();