const grid = document.getElementById('memoryGrid');
const levelTitle = document.getElementById('levelTitle');
const movesDisplay = document.getElementById('movesDisplay');
const matchesDisplay = document.getElementById('matchesDisplay');
const completionModal = document.getElementById('completionModal');
const modalTitle = document.getElementById('modalTitle');
const modalBadge = document.getElementById('modalBadge');
const finalScoreText = document.getElementById('finalScoreText');
const finishBtn = document.getElementById('finishBtn');

const iconSVGs = {
    star: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#064e3b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    shuriken: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#b45309"><circle cx="12" cy="12" r="3" fill="#064e3b"/><path d="M12 2v7a3 3 0 00-3 3H2l10-10zm10 10h-7a3 3 0 00-3 3v7l10-10z"/></svg>`,
    scroll: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#d97706"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`,
    target: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#dc2626"><circle cx="12" cy="12" r="10" fill="none" stroke="#dc2626" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#dc2626"/></svg>`,
    blade: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#4b5563"><path d="M19 3L5 17v4h4L23 7l-4-4z"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#2563eb"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>`,
    lightning: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#eab308"><path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.03-1.18L14 3h1l-1 7h3.55c.99 0 .42 1.05.08 1.48L11 21z"/></svg>`,
    gem: `<svg viewBox="0 0 24 24" width="28" height="28" fill="#9333ea"><path d="M6 3h12l4 6-10 13L2 9l4-6z"/></svg>`
};

const levels = [
    { level: 1, symbols: ['star', 'shuriken', 'scroll', 'target'] },
    { level: 2, symbols: ['star', 'shuriken', 'scroll', 'target', 'blade', 'shield'] },
    { level: 3, symbols: ['star', 'shuriken', 'scroll', 'target', 'blade', 'shield', 'lightning', 'gem'] },
    { level: 4, symbols: ['star', 'shuriken', 'scroll', 'target', 'blade', 'shield', 'lightning', 'gem'] }
];

let currentLevelIndex = parseInt(localStorage.getItem('memory_ninja_max_level')) || 0;
let cards = [];
let flippedCards = [];
let scores = { player: 0, ai: 0 };
let turn = 'player'; // 'player' or 'ai'
let isLocked = false;

function initGame() {
    const cfg = levels[currentLevelIndex];
    levelTitle.innerText = `🃏 VS AI BOT - LEVEL ${cfg.level}`;
    
    scores = { player: 0, ai: 0 };
    turn = 'player';
    flippedCards = [];
    isLocked = false;
    completionModal.style.display = 'none';
    
    updateScoreBoard();

    cards = [...cfg.symbols, ...cfg.symbols];
    cards.sort(() => Math.random() - 0.5);

    grid.innerHTML = '';
    cards.forEach((symbolKey) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.symbol = symbolKey;

        card.innerHTML = `
            <div class="card-face card-front">🥷</div>
            <div class="card-face card-back">${iconSVGs[symbolKey]}</div>
        `;

        card.addEventListener('click', () => {
            if (turn === 'player') flipCard(card);
        });
        grid.appendChild(card);
    });
}

function updateScoreBoard() {
    movesDisplay.innerText = `Turn: ${turn === 'player' ? 'You 🥷' : 'AI Bot 🤖'}`;
    matchesDisplay.innerText = `You: ${scores.player} | Bot: ${scores.ai}`;
}

function flipCard(card) {
    if (isLocked) return;
    if (card === flippedCards[0]) return;
    if (card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    isLocked = true;
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.symbol === card2.dataset.symbol;

    if (isMatch) {
        if (turn === 'player') scores.player++;
        else scores.ai++;

        flippedCards = [];
        isLocked = false;
        updateScoreBoard();
        checkGameEnd();

        // If AI scored a match, it gets another turn
        if (turn === 'ai' && !isGameOver()) {
            setTimeout(aiTurn, 1000);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isLocked = false;

            // Switch turn
            turn = (turn === 'player') ? 'ai' : 'player';
            updateScoreBoard();

            if (turn === 'ai') {
                setTimeout(aiTurn, 1000);
            }
        }, 900);
    }
}

// AI Bot Logic
function aiTurn() {
    if (isGameOver() || turn !== 'ai') return;

    const unclickedCards = Array.from(document.querySelectorAll('.memory-card:not(.flipped)'));
    if (unclickedCards.length < 2) return;

    // Pick two random unclicked cards for the AI
    const randomIdx1 = Math.floor(Math.random() * unclickedCards.length);
    let randomIdx2;
    do {
        randomIdx2 = Math.floor(Math.random() * unclickedCards.length);
    } while (randomIdx1 === randomIdx2);

    const card1 = unclickedCards[randomIdx1];
    const card2 = unclickedCards[randomIdx2];

    card1.classList.add('flipped');
    flippedCards.push(card1);

    setTimeout(() => {
        card2.classList.add('flipped');
        flippedCards.push(card2);
        checkForMatch();
    }, 600);
}

function isGameOver() {
    const cfg = levels[currentLevelIndex];
    return (scores.player + scores.ai) === cfg.symbols.length;
}

function checkGameEnd() {
    const cfg = levels[currentLevelIndex];
    if (isGameOver()) {
        setTimeout(handleEndGameResult, 500);
    }
}

function handleEndGameResult() {
    const cfg = levels[currentLevelIndex];
    const playerWon = scores.player >= scores.ai;

    if (playerWon) {
        fetch('/api/update-xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp: 50, game_name: `Memory Ninja vs AI Lvl ${cfg.level}` })
        }).catch(error => console.log('XP sync error'));

        let savedMaxLevel = parseInt(localStorage.getItem('memory_ninja_max_level')) || 0;
        if (currentLevelIndex + 1 > savedMaxLevel && currentLevelIndex + 1 < levels.length) {
            localStorage.setItem('memory_ninja_max_level', currentLevelIndex + 1);
        }

        if (currentLevelIndex < levels.length - 1) {
            modalBadge.innerText = '🌟';
            modalTitle.innerText = `YOU BEAT THE AI BOT!`;
            finalScoreText.innerText = `Score - You: ${scores.player} | Bot: ${scores.ai}. Get ready for Level ${cfg.level + 1}!`;
            finishBtn.innerText = "NEXT LEVEL";
            finishBtn.onclick = () => {
                currentLevelIndex++;
                initGame();
            };
        } else {
            modalBadge.innerText = '🏆';
            modalTitle.innerText = `ULTIMATE NINJA MASTER!`;
            finalScoreText.innerText = `You defeated the AI across all levels and earned +200 XP!`;
            finishBtn.innerText = "RETURN TO TRAINING CAMP";
            finishBtn.onclick = () => window.location.href = "/start-learning";
        }
    } else {
        modalBadge.innerText = '🤖';
        modalTitle.innerText = `AI BOT WON!`;
        finalScoreText.innerText = `Score - You: ${scores.player} | Bot: ${scores.ai}. Don't give up, challenge the bot again!`;
        finishBtn.innerText = "TRY AGAIN";
        finishBtn.onclick = () => initGame();
    }
    completionModal.style.display = 'flex';
}

initGame();