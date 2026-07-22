const wordDisplay = document.getElementById('display-word');
const feedback = document.getElementById('feedback');
const letterButtonsContainer = document.querySelector('.letter-buttons');
const hintImg = document.getElementById('hint-img');

const submitBtn = document.getElementById('submit-btn');
const rewardPopup = document.getElementById('reward-popup');
const popupNext = document.getElementById('popup-next');

// Exact file extensions matching your folder (.gif for all these items)
const words = [
  { word: 'SUN', file: 'sun.gif' },
  { word: 'NINJA', file: 'ninja.gif' },
  { word: 'TREE', file: 'tree.gif' },
  { word: 'CAT', file: 'cat.gif' },
  { word: 'FISH', file: 'fish.gif' },
  { word: 'BEE', file: 'bee.gif' }
];

let correctWord;
let currentWord;

function pickWord() {
  const chosen = words[Math.floor(Math.random() * words.length)];
  correctWord = chosen.word;
  currentWord = Array(correctWord.length).fill('_');
  
  if (hintImg) {
    hintImg.src = `/static/image/${chosen.file}`;
    hintImg.style.display = 'block';
  }
  
  feedback.textContent = 'Look at the picture and spell the word!';
  feedback.style.color = '#fbbf24';

  const randomIdx = Math.floor(Math.random() * correctWord.length);
  currentWord[randomIdx] = correctWord[randomIdx];

  updateWordDisplay();
  generateButtons();
}

function generateButtons() {
  letterButtonsContainer.innerHTML = '';
  const letters = new Set(correctWord.split(''));

  while (letters.size < correctWord.length + 4) {
    letters.add(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
  }

  [...letters].sort(() => Math.random() - 0.5).forEach(letter => {
    const btn = document.createElement('button');
    btn.textContent = letter;
    btn.className = 'letter-btn';
    btn.onclick = () => checkLetter(letter, btn);
    letterButtonsContainer.appendChild(btn);
  });
}

function updateWordDisplay() {
  wordDisplay.textContent = currentWord.join(' ');
}

function checkLetter(letter, btn) {
  let found = false;

  for (let i = 0; i < correctWord.length; i++) {
    if (correctWord[i] === letter && currentWord[i] === '_') {
      currentWord[i] = letter;
      found = true;
    }
  }

  btn.disabled = true;
  btn.style.opacity = '0.6';

  if (found) {
    btn.style.background = '#22c55e';
    feedback.textContent = 'Great choice! ⭐';
    feedback.style.color = '#22c55e';
  } else {
    btn.style.background = '#ef4444';
    feedback.textContent = 'Oops! Try another letter! 💕';
    feedback.style.color = '#ef4444';
  }

  updateWordDisplay();
}

submitBtn.addEventListener('click', () => {
  if (!currentWord.includes('_')) {
    
    fetch('/api/update-xp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        xp: 10,
        game_name: 'Word Ninja'
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
    feedback.textContent = 'Fill all the missing blanks first! 🤗';
    feedback.style.color = '#d97706';
  }
});

popupNext.addEventListener('click', () => {
  rewardPopup.classList.add('hidden');
  pickWord();
});

pickWord();