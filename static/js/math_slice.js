const mathProblemDisplay = document.getElementById('math-problem');
const feedback = document.getElementById('feedback');
const answerButtonsContainer = document.querySelector('.answer-buttons');
const nextProblemBtn = document.getElementById('next-problem-btn');
const rewardPopup = document.getElementById('reward-popup');
const popupReplay = document.getElementById('popup-replay');

let correctAnswer;
let problemsSolved = 0;
const totalToWin = 3;

function generateMathProblem() {
  if (nextProblemBtn) nextProblemBtn.classList.add('hidden');
  if (answerButtonsContainer) answerButtonsContainer.innerHTML = '';
  
  const num1 = Math.floor(Math.random() * 8) + 1;
  const num2 = Math.floor(Math.random() * 6) + 1;
  const isAddition = Math.random() > 0.5;

  if (isAddition) {
    correctAnswer = num1 + num2;
    mathProblemDisplay.textContent = `${num1} + ${num2} = ?`;
  } else {
    const larger = Math.max(num1, num2);
    const smaller = Math.min(num1, num2);
    correctAnswer = larger - smaller;
    mathProblemDisplay.textContent = `${larger} - ${smaller} = ?`;
  }

  feedback.textContent = 'Slice the correct answer!';
  feedback.style.color = '#fbbf24';

  let choices = new Set([correctAnswer]);
  while (choices.size < 4) {
    let wrongChoice = correctAnswer + (Math.floor(Math.random() * 5) - 2);
    if (wrongChoice !== correctAnswer && wrongChoice >= 0) {
      choices.add(wrongChoice);
    }
  }

  // Shuffle and explicitly create buttons with correct styling classes
  [...choices].sort(() => Math.random() - 0.5).forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.className = 'answer-btn';
    btn.onclick = () => checkAnswer(choice, btn);
    answerButtonsContainer.appendChild(btn);
  });
}

function checkAnswer(selectedChoice, btn) {
  const allButtons = answerButtonsContainer.querySelectorAll('.answer-btn');
  
  if (selectedChoice === correctAnswer) {
    btn.style.background = '#22c55e';
    feedback.textContent = 'Awesome slice! Great job! ⭐';
    feedback.style.color = '#22c55e';
    
    allButtons.forEach(b => b.disabled = true);
    problemsSolved++;

    if (problemsSolved >= totalToWin) {
      fetch('/api/update-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xp: 10,
          game_name: 'Math Slice'
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          rewardPopup.classList.remove('hidden');
        } else {
          alert("Please login first to save your star points!");
        }
      })
      .catch(err => {
        console.error("XP update failed:", err);
        rewardPopup.classList.remove('hidden');
      });
    } else {
      if (nextProblemBtn) nextProblemBtn.classList.remove('hidden');
    }

  } else {
    btn.style.background = '#ef4444';
    btn.disabled = true;
    feedback.textContent = 'Oops! Try another number! 💕';
    feedback.style.color = '#ef4444';
  }
}

if (nextProblemBtn) {
  nextProblemBtn.addEventListener('click', () => {
    generateMathProblem();
  });
}

if (popupReplay) {
  popupReplay.addEventListener('click', () => {
    rewardPopup.classList.add('hidden');
    problemsSolved = 0;
    generateMathProblem();
  });
}

// Initialize first puzzle
generateMathProblem();