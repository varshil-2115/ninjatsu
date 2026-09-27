const levels = [
    { scrambled: "PMUJ", correct: "JUMP" },
    { scrambled: "TSAF", correct: "FAST" },
    { scrambled: "NIPS", correct: "SPIN" },
    { scrambled: "YALP", correct: "PLAY" },
    { scrambled: "RATS", correct: "STAR" },
    { scrambled: "ROEH", correct: "HERO" },
    { scrambled: "MBILC", correct: "CLIMB" },
    { scrambled: "REWOP", correct: "POWER" },
    { scrambled: "EVARB", correct: "BRAVE" },
    { scrambled: "TRAMS", correct: "SMART" },
    { scrambled: "IARNT", correct: "TRAIN" }
];

let currentLevel = 0;
let timeLeft = 15;
let timerInterval;

const scrambledEl = document.getElementById('scrambledWord');
const inputEl = document.getElementById('wordInput');
const submitBtn = document.getElementById('submitBtn');
const roundEl = document.getElementById('roundIndicator');
const timerEl = document.getElementById('timerDisplay');
const arenaBox = document.getElementById('arenaBox');
const completionModal = document.getElementById('completionModal');
const finishBtn = document.getElementById('finishBtn');

function startTimer() {
    timeLeft = 15;
    timerEl.innerText = `⏱️ Time: ${timeLeft}s`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = `⏱️ Time: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (window.NinjaAudio) NinjaAudio.comfort();
            currentLevel = 0;
            loadLevel();
        }
    }, 1000);
}

function loadLevel() {
    if (currentLevel < levels.length) {
        scrambledEl.innerText = levels[currentLevel].scrambled;
        roundEl.innerText = `Word: ${currentLevel + 1} / ${levels.length} ⭐`;
        inputEl.value = "";
        inputEl.placeholder = "Type the word here...";
        startTimer();
    } else {
        clearInterval(timerInterval);
        
        fetch('/api/update-xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp: 50, game_name: 'Word Speed Run' })
        }).catch(error => console.log('Star sync error'));

        if (window.NinjaAudio) NinjaAudio.cheer();

        if (completionModal) {
            completionModal.style.display = 'flex';
        }
    }
}

function checkAnswer() {
    const userVal = inputEl.value.trim().toUpperCase();
    if (userVal === levels[currentLevel].correct) {
        if (window.NinjaAudio) NinjaAudio.cheer();
        currentLevel++;
        loadLevel();
    } else {
        if (window.NinjaAudio) NinjaAudio.comfort();
        arenaBox.classList.add('shake');
        setTimeout(() => arenaBox.classList.remove('shake'), 300);
        inputEl.value = "";
        inputEl.placeholder = "❌ Try again!";
    }
}

if (submitBtn) {
    submitBtn.addEventListener('click', checkAnswer);
}

if (inputEl) {
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

if (finishBtn) {
    finishBtn.addEventListener('click', () => {
        if (window.NinjaAudio) NinjaAudio.playWhoosh();
        window.location.href = "/start-learning";
    });
}

loadLevel();