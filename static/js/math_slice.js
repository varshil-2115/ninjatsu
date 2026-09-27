const mathProblemDisplay = document.getElementById('math-problem');
const feedback = document.getElementById('feedback');
const answerButtonsContainer = document.querySelector('.answer-buttons');
const nextProblemBtn = document.getElementById('next-problem-btn');
const rewardPopup = document.getElementById('reward-popup');
const popupReplay = document.getElementById('popup-replay');

let correctAnswer;
let problemsSolved = 0;
const totalToWin = 5;
let timer;
let timeLeft = 12;
let streak = 0;

const gameHud = document.querySelector('.game-hud');
const infoContainer = document.createElement('div');
infoContainer.style.display = 'flex';
infoContainer.style.gap = '15px';

const timerElement = document.createElement('div');
timerElement.style.color = '#38bdf8';

const levelElement = document.createElement('div');
levelElement.style.color = '#facc15';
levelElement.textContent = 'STAGE 1 🍃';

infoContainer.appendChild(timerElement);
infoContainer.appendChild(levelElement);
gameHud.appendChild(infoContainer);

const mathCard = document.querySelector('.math-card');
const progressTrack = document.createElement('div');
progressTrack.className = 'progress-track';
const progressFill = document.createElement('div');
progressFill.className = 'progress-fill';
progressTrack.appendChild(progressFill);
mathCard.insertBefore(progressTrack, mathProblemDisplay);

function startTimer() {
    clearInterval(timer);
    timeLeft = 12 - Math.floor(problemsSolved / 2);
    if (timeLeft < 6) timeLeft = 6;
    updateTimerDisplay();

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timer);
            feedback.textContent = '⏱️ Out of time! Next one ready!';
            feedback.style.color = '#ef4444';
            streak = 0;
            if (window.NinjaAudio) NinjaAudio.comfort();
            disableAllButtons();
            if (nextProblemBtn) nextProblemBtn.classList.remove('hidden');
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerElement.textContent = `⏱️ 0:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
}

function disableAllButtons() {
    const allButtons = answerButtonsContainer.querySelectorAll('.answer-btn');
    allButtons.forEach(b => b.disabled = true);
}

function generateMathProblem() {
    if (nextProblemBtn) nextProblemBtn.classList.add('hidden');
    if (answerButtonsContainer) answerButtonsContainer.innerHTML = '';
    
    let maxNum = 10 + (problemsSolved * 2);
    const num1 = Math.floor(Math.random() * maxNum) + 2;
    const num2 = Math.floor(Math.random() * (maxNum - 2)) + 1;
    
    const mode = problemsSolved >= 3 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);

    if (mode === 0) {
        correctAnswer = num1 + num2;
        mathProblemDisplay.textContent = `${num1} + ${num2} = ?`;
    } else if (mode === 1) {
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        correctAnswer = larger - smaller;
        mathProblemDisplay.textContent = `${larger} - ${smaller} = ?`;
    } else {
        let m1 = Math.floor(Math.random() * 6) + 2;
        let m2 = Math.floor(Math.random() * 6) + 2;
        correctAnswer = m1 * m2;
        mathProblemDisplay.textContent = `${m1} × ${m2} = ?`;
    }

    let currentLevel = problemsSolved >= 3 ? 2 : 1;
    levelElement.textContent = currentLevel === 2 ? 'STAGE 2 ⚔️' : 'STAGE 1 🍃';

    feedback.textContent = streak > 1 ? `🔥 Combo x${streak}! Keep going!` : 'Pick the right number! 🍉';
    feedback.style.color = streak > 1 ? '#f97316' : '#fbbf24';

    let choices = new Set([correctAnswer]);
    while (choices.size < 4) {
        let offset = Math.floor(Math.random() * 8) - 4;
        if (offset === 0) offset = 1;
        let wrongChoice = correctAnswer + offset;
        if (wrongChoice >= 0) {
            choices.add(wrongChoice);
        }
    }

    [...choices].sort(() => Math.random() - 0.5).forEach(choice => {
        const btn = document.createElement('button');
        btn.textContent = choice;
        btn.className = 'answer-btn';
        btn.onclick = () => checkAnswer(choice, btn);
        answerButtonsContainer.appendChild(btn);
    });

    startTimer();
}

function checkAnswer(selectedChoice, btn) {
    if (selectedChoice === correctAnswer) {
        clearInterval(timer);
        const allButtons = answerButtonsContainer.querySelectorAll('.answer-btn');
        
        btn.classList.add('correct-slash');
        streak++;
        feedback.textContent = `⚔️ Great slice! Streak x${streak} ⭐`;
        feedback.style.color = '#22c55e';
        
        if (window.NinjaAudio) NinjaAudio.cheer(); // Taiko chime + Bot Voice Cheer

        allButtons.forEach(b => b.disabled = true);
        problemsSolved++;

        let progressPercent = (problemsSolved / totalToWin) * 100;
        progressFill.style.width = `${progressPercent}%`;

        if (problemsSolved >= totalToWin) {
            let totalXpEarned = 15 + (streak * 3);
            fetch('/api/update-xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xp: totalXpEarned, game_name: 'Math Slice' })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('xpValue').textContent = `+${totalXpEarned} STARS ⭐`;
                    rewardPopup.classList.remove('hidden');
                } else {
                    alert("Log in to save your stars! ⭐");
                }
            })
            .catch(err => {
                rewardPopup.classList.remove('hidden');
            });
        } else {
            if (nextProblemBtn) nextProblemBtn.classList.remove('hidden');
        }

    } else {
        // Wrong Answer: Gentle Gong + Bot Voice Comfort
        if (window.NinjaAudio) NinjaAudio.comfort();

        btn.classList.add('wrong-shake');
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        
        streak = 0;
        feedback.textContent = 'Oops! Try another number! 🍓';
        feedback.style.color = '#ef4444';
        
        setTimeout(() => {
            btn.classList.remove('wrong-shake');
        }, 400);
    }
}

if (nextProblemBtn) {
    nextProblemBtn.addEventListener('click', () => {
        if (window.NinjaAudio) NinjaAudio.playWhoosh();
        generateMathProblem();
    });
}

if (popupReplay) {
    popupReplay.addEventListener('click', () => {
        if (window.NinjaAudio) NinjaAudio.playWhoosh();
        rewardPopup.classList.add('hidden');
        problemsSolved = 0;
        streak = 0;
        progressFill.style.width = '0%';
        generateMathProblem();
    });
}

generateMathProblem();