const wordDisplay = document.getElementById('display-word');
const feedback = document.getElementById('feedback');
const letterButtonsContainer = document.querySelector('.letter-buttons');
const hintImg = document.getElementById('hint-img');

const submitBtn = document.getElementById('submit-btn');
const rewardPopup = document.getElementById('reward-popup');
const popupNext = document.getElementById('popup-next');

// Words list with high-quality icons or clear text hints
const words = [
  { word: 'TREE', hint: '🌳' },
  { word: 'APPLE', hint: '🍎' },
  { word: 'NINJA', hint: '🥷' },
  { word: 'CAT', hint: '🐱' },
  { word: 'SUN', hint: '☀️' },
  { word: 'FISH', hint: '🐟' },
  { word: 'BEE', hint: '🐝' }
];

let correctWord;
let currentWord;

function pickWord() {
  const chosen = words[Math.floor(Math.random() * words.length)];
  correctWord = chosen.word;
  currentWord = Array(correctWord.length).fill('_');
  
  // Set emoji badge/sticker or gif hint
  hintImg.style.display = 'block';
  hintImg.alt = chosen.hint; 
  
  // Custom cool trick: hintImg ki jagah simple text ya large emoji use kar sakte hain
  feedback.innerHTML = `<span style="font-size: 40px;">${chosen.hint}</span> Find this word!`;
  feedback.style.color = '#fff';

  // Reveal 1 random letter initially for kids help
  const randomIdx = Math.floor(Math.random() * correctWord.length);
  currentWord[randomIdx] = correctWord[randomIdx];

  updateWordDisplay();
  generateButtons();
}

function generateButtons() {
  letterButtonsContainer.innerHTML = '';
  const letters = new Set(correctWord.split(''));

  while (letters.size < correctWord.length + 3) {
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

  if (found) {
    btn.style.background = '#4ade80'; // Sweet friendly green
    btn.style.transform = 'scale(0.95)';
    feedback.textContent = 'Wow! Right choice! ⭐';
    feedback.style.color = '#4ade80';
  } else {
    btn.style.background = '#f87171'; // Pastel soft red
    feedback.textContent = 'Oops! Try another letter! 💕';
    feedback.style.color = '#f87171';
  }

  updateWordDisplay();
}

// SUBMIT AT_TACK -> BACKEND REWARD FIX
submitBtn.addEventListener('click', () => {
  if (!currentWord.includes('_')) {
    
    // BACKEND SE CONNECT KARNE KE LIYE FETCH CALL
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
    .then(response => response.get_json ? response.get_json() : response.json())
    .then(data => {
      if (data.status === 'success') {
        // Show reward popup smoothly
        rewardPopup.style.display = 'flex';
      } else {
        alert("Please login first to save your scores!");
      }
    })
    .catch(err => {
      console.error("XP update failed:", err);
      // Agar backend issue ho tab bhi bacchon ka dil nahi todenge, popup dikha denge
      rewardPopup.style.display = 'flex';
    });

  } else {
    feedback.textContent = 'Fill all the missing blanks first! 🤗';
    feedback.style.color = '#facc15';
  }
});

popupNext.addEventListener('click', () => {
  rewardPopup.style.display = 'none';
  pickWord();
});

// Start game initially
pickWord();