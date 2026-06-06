// ── Helpers ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Matrix rain ────────────────────────────────────────────────────────────
(function initMatrix() {
  const canvas = $('matrix-canvas');
  const ctx    = canvas.getContext('2d');
  const chars  = '0123456789ABCDEF◈⊛▦◷⬡⬢◉◎⊕'.split('');
  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / 18);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(3,11,20,.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00c8ff';
    ctx.font = '14px Courier New';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.globalAlpha = Math.random() * .5 + .1;
      ctx.fillText(char, i * 18, y * 18);
      if (y * 18 > canvas.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    });
    ctx.globalAlpha = 1;
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 55);
})();

// ── Apply config ────────────────────────────────────────────────────────────
$('bank-name-header').textContent  = CONFIG.bankName;
$('bank-tagline-header').textContent = CONFIG.bankTagline;

// ── Format card number input ────────────────────────────────────────────────
const cardInput = $('card-number');
cardInput.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16);
  e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  $('card-display').textContent = e.target.value || '•••• •••• •••• ••••';
  validate('card-number');
});

// ── Format expiry input ─────────────────────────────────────────────────────
const expiryInput = $('expiry');
expiryInput.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
  e.target.value = v;
  $('expiry-display').textContent = v || 'MM/YY';
  validate('expiry');
});

// ── CVC ─────────────────────────────────────────────────────────────────────
$('cvc').addEventListener('input', () => validate('cvc'));

// ── PIN dots ────────────────────────────────────────────────────────────────
const pinInput  = $('pin');
const pinDots   = $('pin-dots');
const pinHidden = document.querySelector('.pin-hidden-input');

pinDots.addEventListener('click', () => pinHidden.focus());
pinHidden.addEventListener('focus', () => pinDots.classList.add('focused'));
pinHidden.addEventListener('blur',  () => pinDots.classList.remove('focused'));

pinHidden.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
  e.target.value = v;
  document.querySelectorAll('.pin-dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < v.length);
  });
  validate('pin');
});

// ── Validate a field ────────────────────────────────────────────────────────
function normalize(val) { return val.replace(/\s/g, ''); }

function fieldValue(id) {
  if (id === 'pin') return pinHidden.value;
  return $(id).value;
}

function validate(id) {
  const val = fieldValue(id);
  if (!val) { setStatus(id, ''); return false; }

  let correct;
  switch (id) {
    case 'card-number': correct = normalize(val) === normalize(CONFIG.cardNumber); break;
    case 'expiry':      correct = val === CONFIG.expiry; break;
    case 'cvc':         correct = val === CONFIG.cvc; break;
    case 'pin':         correct = val === CONFIG.pin; break;
  }

  setStatus(id, correct ? '✓' : '');
  if (id !== 'pin') {
    $(id).classList.toggle('valid',   correct);
    $(id).classList.toggle('invalid', !correct && val.length >= maxLen(id));
  } else {
    pinDots.classList.toggle('valid',   correct);
    pinDots.classList.toggle('invalid', !correct && val.length === 4);
  }
  return correct;
}

function maxLen(id) {
  return { 'card-number': 19, expiry: 5, cvc: 3 }[id];
}

function setStatus(id, icon) {
  const el = $('status-' + id);
  if (!el) return;
  el.textContent = icon;
  if (icon === '✓') el.style.color = '#00ff9d';
}

// ── Submit ──────────────────────────────────────────────────────────────────
$('bank-form').addEventListener('submit', e => {
  e.preventDefault();

  const allCorrect =
    validate('card-number') &&
    validate('expiry') &&
    validate('cvc') &&
    validate('pin');

  if (allCorrect) {
    $('credit-card').classList.add('correct');
    setTimeout(showReveal, 800);
  } else {
    showError('Invalid credentials. Access denied.');
  }
});

function showError(msg) {
  const el = $('error-msg');
  $('error-text').textContent = msg;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  setTimeout(() => el.classList.add('hidden'), 3500);
}

// ── Reveal screen ───────────────────────────────────────────────────────────
function showReveal() {
  $('login-screen').classList.remove('active');
  const rev = $('reveal-screen');
  rev.classList.add('active');

  $('bank-name-reveal').textContent = CONFIG.bankName;
  $('reveal-name').textContent      = CONFIG.birthdayPerson;
  $('reveal-amount').textContent    = CONFIG.totalAmount;

  // Populate friends list
  const list = $('friends-list');
  CONFIG.friends.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'friend-row';
    row.innerHTML = `
      <div class="friend-avatar">${f.name[0].toUpperCase()}</div>
      <div class="friend-name">${f.name}</div>
      <div class="friend-amount">${f.amount}</div>
    `;
    list.appendChild(row);
    setTimeout(() => row.classList.add('visible'), 300 + i * 80);
  });

  startFireworks();
}

// ── Fireworks ───────────────────────────────────────────────────────────────
function startFireworks() {
  const canvas = $('fireworks-canvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const COLORS = [
    '#00c8ff', '#00ff9d', '#ffd700', '#ff4060',
    '#7b2fff', '#ff9f00', '#ff60b0', '#80ffcc',
  ];

  class Particle {
    constructor(x, y, color) {
      this.x    = x;
      this.y    = y;
      this.vx   = (Math.random() - .5) * 8;
      this.vy   = (Math.random() - .5) * 8 - 2;
      this.life = 1;
      this.decay = Math.random() * .015 + .008;
      this.size  = Math.random() * 3 + 1;
      this.color = color;
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 6) this.trail.shift();
      this.vy  += .12;
      this.x   += this.vx;
      this.y   += this.vy;
      this.life -= this.decay;
    }
    draw() {
      this.trail.forEach((p, i) => {
        const alpha = (i / this.trail.length) * this.life * .5;
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = this.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.size * (i / this.trail.length), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = this.life;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function burst(x, y) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
  }

  let frameCount = 0;
  let running = true;
  const intervals = [];

  // Initial salvo
  for (let i = 0; i < 5; i++) {
    setTimeout(() => burst(
      Math.random() * canvas.width * .6 + canvas.width * .2,
      Math.random() * canvas.height * .5 + 60
    ), i * 200);
  }

  // Ongoing bursts for 12 seconds
  const burstTimer = setInterval(() => {
    burst(
      Math.random() * canvas.width * .7 + canvas.width * .15,
      Math.random() * canvas.height * .55 + 40
    );
  }, 600);
  setTimeout(() => clearInterval(burstTimer), 12000);

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);

    ctx.fillStyle = 'rgba(3,11,20,.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
  }
  loop();
}
