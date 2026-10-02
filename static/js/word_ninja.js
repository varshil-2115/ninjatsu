const wordDisplay = document.getElementById('display-word');
const feedback = document.getElementById('feedback');
const letterButtonsContainer = document.querySelector('.letter-buttons');
const hintImg = document.getElementById('hint-img');

const submitBtn = document.getElementById('submit-btn');
const rewardPopup = document.getElementById('reward-popup');
const popupNext = document.getElementById('popup-next');

const words = [
  { word: 'SUN', file: 'sun.gif' },
  { word: 'NINJA', file: 'ninja.gif' },
  { word: 'TREE', file: 'tree.gif' },
  { word: 'CAT', file: 'cat.gif' },
  { word: 'FISH', file: 'fish.gif' },
  { word: 'BEE', file: 'bee.gif' },
  { word: 'DOG', file: 'dog.gif' },
  { word: 'FLOWER', file: 'flower.gif' },
  { word: 'MOON', file: 'moon.gif' },
  { word: 'BIRD', file: 'bird.gif' },
  { word: 'PANDA', file: 'panda.gif' },
  { word: 'COW', file: 'cow.gif' },
  { word: 'STAR', file: 'star.gif' },
  { word: 'BOY', file: 'boy.mp4' },
  { word: 'GIRL', file: 'girl.gif' },
  { word: 'APPLE', file: 'apple.gif' },
  { word: 'FOX', file: 'fox.gif' },
  { word: 'PLANE', file: 'plane.gif' },
  { word: 'CAR', file: 'car.gif' },
  { word: 'BUS', file: 'bus.gif' },
  { word: 'FIRE', file: 'fire.gif' },
  { word: 'WATER', file: 'water.gif' },
  { word: 'NEST', file: 'nest.jfif' },
  { word: 'ICECREAME', file: 'icecreame.gif' },
  { word: 'BUTTERFLY', file: 'butterfly.gif' },
  { word: 'ICE', file: 'ice.gif' }
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
  
  feedback.textContent = 'Spell what you see! ⭐';
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
    feedback.textContent = 'Nice job! ⭐';
    feedback.style.color = '#22c55e';
    if (window.NinjaAudio) NinjaAudio.cheer();
  } else {
    btn.style.background = '#ef4444';
    feedback.textContent = 'Try another letter! 😊';
    feedback.style.color = '#ef4444';
    if (window.NinjaAudio) NinjaAudio.comfort();
  }

  updateWordDisplay();
}

submitBtn.addEventListener('click', () => {
  if (window.NinjaAudio) NinjaAudio.playTap();

  if (!currentWord.includes('_')) {
    // Sends exactly 1 XP to backend
    fetch('/api/update-xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xp: 1, game_name: 'Word Ninja' })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        if (window.NinjaAudio) NinjaAudio.cheer();
        rewardPopup.classList.remove('hidden');
      } else {
        alert("Log in to save your stars! ⭐");
      }
    })
    .catch(() => {
      rewardPopup.classList.remove('hidden');
    });

  } else {
    feedback.textContent = 'Fill all missing letters first! 🤗';
    feedback.style.color = '#d97706';
    if (window.NinjaAudio) NinjaAudio.comfort();
  }
});

popupNext.addEventListener('click', () => {
  if (window.NinjaAudio) NinjaAudio.playWhoosh();
  rewardPopup.classList.add('hidden');
  pickWord();
});

pickWord();