const wordGrid = document.getElementById('word-grid');
const feedback = document.getElementById('feedback');
const wordInput = document.getElementById('word-input');
const submitTypedBtn = document.getElementById('submit-typed-word-btn');
const rewardPopup = document.getElementById('reward-popup');
const popupReplay = document.getElementById('popup-replay');

const gridData = [
  ['N', 'I', 'N', 'J', 'A', 'S', 'X', 'S'],
  ['T', 'R', 'E', 'E', 'M', 'N', 'Q', 'U'],
  ['P', 'B', 'O', 'Y', 'F', 'C', 'W', 'N'],
  ['C', 'A', 'T', 'L', 'E', 'V', 'E', 'L'],
  ['Y', 'B', 'E', 'A', 'R', 'G', 'M', 'A'],
  ['M', 'A', 'T', 'H', 'P', 'J', 'W', 'S'],
  ['S', 'T', 'A', 'R', 'K', 'I', 'D', 'S'],
  ['P', 'O', 'W', 'E', 'R', 'J', 'U', 'N']
];

let foundWords = [];
let permanentHighlights = [];

const wordColors = ['#22c55e', '#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6', '#ef4444', '#06b6d4'];
const validGridWords = ['NINJA', 'TREE', 'CAT', 'BEAR', 'BOY', 'MATH', 'STAR', 'KIDS', 'LEVEL','SUN','POWER'];

function initGrid() {
  if (!wordGrid) return;
  wordGrid.innerHTML = '';
  if (wordInput) wordInput.value = '';
  foundWords = [];
  permanentHighlights = [];

  wordGrid.style.gridTemplateColumns = 'repeat(8, 42px)';
  wordGrid.style.gridTemplateRows = 'repeat(8, 42px)';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('div');
      cell.className = 'letter-cell';
      cell.textContent = gridData[r][c];
      cell.style.fontSize = '18px';
      cell.dataset.row = r;
      cell.dataset.col = c;
      wordGrid.appendChild(cell);
    }
  }
}

function findWordPath(word) {
  const rows = gridData.length;
  const cols = gridData[0].length;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [0, -1],
    [-1, 0],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (gridData[r][c] !== word[0]) continue;

      for (let [dr, dc] of directions) {
        let path = [];
        let matched = true;

        for (let i = 0; i < word.length; i++) {
          let nr = r + dr * i;
          let nc = c + dc * i;

          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || gridData[nr][nc] !== word[i]) {
            matched = false;
            break;
          }
          path.push({ row: nr, col: nc });
        }

        if (matched) {
          return path;
        }
      }
    }
  }
  return null;
}

function handleTypingHighlight() {
  const typedText = wordInput.value.trim().toUpperCase();
  const cells = document.querySelectorAll('.letter-cell');

  cells.forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const foundEntry = permanentHighlights.find(p => p.row === r && p.col === c);

    if (foundEntry) {
      cell.style.backgroundColor = foundEntry.color;
      cell.style.color = '#ffffff';
    } else {
      cell.style.backgroundColor = '#ffffff';
      cell.style.color = '#064e3b';
    }
  });

  if (typedText.length < 2) return;

  const path = findWordPath(typedText);
  if (path) {
    path.forEach(p => {
      const cell = document.querySelector(`[data-row='${p.row}'][data-col='${p.col}']`);
      if (cell) {
        cell.style.backgroundColor = '#facc15';
        cell.style.color = '#78350f';
      }
    });
  }
}

function checkTypedWord() {
  if (!wordInput || !feedback) return;
  const typedWord = wordInput.value.trim().toUpperCase();

  if (typedWord === '') return;

  if (foundWords.includes(typedWord)) {
    if (window.NinjaAudio) NinjaAudio.comfort();
    feedback.textContent = `Already found '${typedWord}'! Keep looking! 🔍`;
    feedback.style.color = '#d97706';
    wordInput.value = '';
    return;
  }

  const path = findWordPath(typedWord);

  if (path && validGridWords.includes(typedWord)) {
    foundWords.push(typedWord);
    if (window.NinjaAudio) NinjaAudio.cheer(); // Correct Answer Celebration

    const assignedColor = wordColors[(foundWords.length - 1) % wordColors.length];

    path.forEach(p => {
      permanentHighlights.push({ row: p.row, col: p.col, color: assignedColor });
      const cell = document.querySelector(`[data-row='${p.row}'][data-col='${p.col}']`);
      if (cell) {
        cell.style.backgroundColor = assignedColor;
        cell.style.color = '#ffffff';
      }
    });

    feedback.textContent = `Found '${typedWord}'! (${foundWords.length}/${validGridWords.length} words) ⭐`;
    feedback.style.color = '#22c55e';
    wordInput.value = '';

    if (foundWords.length === validGridWords.length) {
      fetch('/api/update-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: 30, game_name: 'Big Grid Word Search' })
      })
      .then(res => res.json())
      .then(data => {
        if (rewardPopup) {
          document.getElementById('xpValue').textContent = '+30 STARS ⭐';
          rewardPopup.classList.remove('hidden');
        }
      })
      .catch(err => {
        if (rewardPopup) rewardPopup.classList.remove('hidden');
      });
    }
  } else {
    if (window.NinjaAudio) NinjaAudio.comfort();
    feedback.textContent = `Not in the grid! Try another word! ❌`;
    feedback.style.color = '#ef4444';
  }
}

if (wordInput) {
  wordInput.addEventListener('input', handleTypingHighlight);
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      checkTypedWord();
    }
  });
}

if (submitTypedBtn) {
  submitTypedBtn.addEventListener('click', checkTypedWord);
}

if (popupReplay) {
  popupReplay.addEventListener('click', () => {
    if (window.NinjaAudio) NinjaAudio.playWhoosh();
    if (rewardPopup) rewardPopup.classList.add('hidden');
    feedback.textContent = 'Find words in the grid and type them below! 👇';
    feedback.style.color = '#d97706';
    initGrid();
  });
}

initGrid();