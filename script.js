// ================== DATA ==================
const shapeData = {
  'Kubus': { sisi: 6, rusuk: 12, sudut: 8 },
  'Balok': { sisi: 6, rusuk: 12, sudut: 8 },
  'Prisma': { sisi: 5, rusuk:  9, sudut: 6 },
  'Tabung': { sisi: 3, rusuk:  2, sudut: 0 },
  'Limas': { sisi: 5, rusuk:  8, sudut: 5 },
  'Kerucut': { sisi: 2, rusuk:  1, sudut: 1 },
  'Bola': { sisi: 1, rusuk:  0, sudut: 0 },
  'Prisma Segitiga': { sisi: 5, rusuk:  9, sudut: 6 }
};

// ================== AR (tidak digunakan karena mandiri) ==================
// Fungsi selectARShape disediakan oleh ar.html sendiri

// ================== KUIS (dipanggil dari kuis.html) ==================
let quizQuestions = [
  { q: 'Berapa jumlah sisi pada Kubus?', a: '6', opts: ['4','6','8','12'] },
  { q: 'Berapa jumlah rusuk pada Balok?', a: '12', opts: ['6','8','10','12'] },
  { q: 'Bentuk apakah yang memiliki 0 titik sudut?', a: 'Bola', opts: ['Kubus','Balok','Kerucut','Bola'] },
  { q: 'Tabung memiliki berapa rusuk?', a: '2', opts: ['0','1','2','3'] }
];
let quizIndex = 0, quizScore = 0;

function initQuiz() {
  loadQuizQuestion();
  document.getElementById('next-btn')?.addEventListener('click', () => {
    quizIndex++;
    if (quizIndex >= quizQuestions.length) {
      document.getElementById('quiz-question').textContent = 'Kuis selesai!';
      document.getElementById('options-container').innerHTML = '';
      document.getElementById('next-btn').classList.add('hidden');
      document.getElementById('score-display').textContent = `Skor Akhir: ${quizScore}/${quizQuestions.length}`;
      return;
    }
    loadQuizQuestion();
  });
}

function loadQuizQuestion() {
  const q = quizQuestions[quizIndex];
  document.getElementById('quiz-question').textContent = q.q;
  const optsDiv = document.getElementById('options-container');
  optsDiv.innerHTML = '';
  q.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium';
    btn.textContent = opt;
    btn.addEventListener('click', () => checkQuizAnswer(opt, q.a));
    optsDiv.appendChild(btn);
  });
  document.getElementById('next-btn').classList.add('hidden');
}

function checkQuizAnswer(selected, correct) {
  if (selected === correct) {
    quizScore++;
    alert('Benar! 🎉');
  } else {
    alert(`Salah. Jawaban: ${correct}`);
  }
  document.getElementById('score-display').textContent = `Skor: ${quizScore}`;
  document.getElementById('next-btn').classList.remove('hidden');
}

// ================== RACING GAME ==================
let isRacing = false, isJumping = false, gameActive = true;
let speed = 3, score = 0, obstacles = [];
let lastSpawnTime = 0, spawnRate = 2000;

function initRacingGame() {
  const gasBtn = document.getElementById('gas-btn');
  const jumpBtn = document.getElementById('jump-btn');
  const car = document.getElementById('car-sprite');
  if (!gasBtn || !jumpBtn || !car) return;

  const startGas = (e) => { e.preventDefault(); isRacing = true; };
  const stopGas = () => { isRacing = false; };
  gasBtn.addEventListener('mousedown', startGas);
  gasBtn.addEventListener('mouseup', stopGas);
  gasBtn.addEventListener('touchstart', startGas);
  gasBtn.addEventListener('touchend', stopGas);

  jumpBtn.addEventListener('click', () => {
    if (!isJumping && gameActive) {
      isJumping = true;
      car.classList.add('car-jump');
      setTimeout(() => {
        car.classList.remove('car-jump');
        isJumping = false;
      }, 500);
    }
  });

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!gameActive) return;
  if (isRacing) {
    document.getElementById('speed-val').textContent = (speed/3).toFixed(1) + 'x';
    speed += 0.002;
    updateObstacles();
  }
  requestAnimationFrame(gameLoop);
}

function updateObstacles() {
  const now = Date.now();
  if (now - lastSpawnTime > spawnRate / (speed/3)) {
    spawnObstacle();
    lastSpawnTime = now;
  }

  const car = document.getElementById('car-sprite');
  const carRect = car.getBoundingClientRect();

  for (let i = obstacles.length-1; i >= 0; i--) {
    const obs = obstacles[i];
    let right = parseFloat(obs.style.right || -80);
    right += speed;
    obs.style.right = right + 'px';

    const obsRect = obs.getBoundingClientRect();
    if (!isJumping &&
        carRect.right > obsRect.left &&
        carRect.left < obsRect.right &&
        carRect.bottom > obsRect.top &&
        carRect.top < obsRect.bottom) {
      gameActive = false;
      isRacing = false;
      obstacles.forEach(o => o.remove());
      obstacles = [];
      showGameQuestion();
      return;
    }

    if (right > window.innerWidth) {
      obs.remove();
      obstacles.splice(i,1);
      score += 10;
      document.getElementById('score-val').textContent = score;
    }
  }
}

function spawnObstacle() {
  const obs = document.createElement('div');
  obs.className = 'obstacle';
  obs.style.right = '-80px';
  obs.textContent = '⚠️';
  document.getElementById('obstacle-container').appendChild(obs);
  obstacles.push(obs);
}

function showGameQuestion() {
  const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
  document.getElementById('game-question').textContent = q.q;
  const optsDiv = document.getElementById('options-container');
  optsDiv.innerHTML = '';
  q.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bg-white/20 py-2 rounded-lg';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      document.getElementById('question-overlay').classList.add('hidden');
      if (opt === q.a) {
        gameActive = true;
        isRacing = true;
        requestAnimationFrame(gameLoop);
      } else {
        document.getElementById('gameover-overlay').classList.remove('hidden');
      }
    });
    optsDiv.appendChild(btn);
  });
  document.getElementById('question-overlay').classList.remove('hidden');
}