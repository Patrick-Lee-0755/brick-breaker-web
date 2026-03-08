const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const actionButton = document.getElementById("actionButton");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const boardWrap = document.getElementById("boardWrap");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const launchButton = document.getElementById("launchButton");

const game = {
  width: canvas.width,
  height: canvas.height,
  running: false,
  awaitingLaunch: true,
  status: "ready",
  score: 0,
  lives: 3,
  maxLives: 3,
  maxScore: 0,
};

const paddle = {
  w: 128,
  h: 16,
  x: game.width / 2 - 64,
  y: game.height - 36,
  speed: 9,
  dx: 0,
};

const ball = {
  r: 9,
  x: game.width / 2,
  y: paddle.y - 9,
  vx: 0,
  vy: 0,
  speed: 5.6,
};

const bricks = {
  rows: 6,
  cols: 11,
  gap: 8,
  top: 72,
  left: 28,
  width: 58,
  height: 22,
  items: [],
};

const keyState = {
  left: false,
  right: false,
};

let audioCtx;

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function blip({ freq = 440, type = "sine", dur = 0.06, gain = 0.06 } = {}) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  osc.connect(amp);
  amp.connect(audioCtx.destination);
  osc.start();
  amp.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  osc.stop(audioCtx.currentTime + dur);
}

function createBricks() {
  bricks.items = [];
  const palette = ["#ff8f85", "#ffd079", "#fff27a", "#8af59e", "#6de7ff", "#acb7ff"];

  for (let row = 0; row < bricks.rows; row += 1) {
    for (let col = 0; col < bricks.cols; col += 1) {
      const x = bricks.left + col * (bricks.width + bricks.gap);
      const y = bricks.top + row * (bricks.height + bricks.gap);
      bricks.items.push({ x, y, alive: true, color: palette[row % palette.length] });
    }
  }

  game.maxScore = bricks.items.length * 100;
}

function resetBallToPaddle() {
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.r - 1;
  ball.vx = 0;
  ball.vy = 0;
  game.awaitingLaunch = true;
}

function setOverlay(title, text, buttonText) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  actionButton.textContent = buttonText;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function updateHUD() {
  scoreEl.textContent = String(game.score);
  livesEl.textContent = String(game.lives);
}

function resetRun() {
  game.score = 0;
  game.lives = game.maxLives;
  game.running = true;
  game.status = "playing";
  paddle.x = game.width / 2 - paddle.w / 2;
  paddle.dx = 0;
  createBricks();
  resetBallToPaddle();
  hideOverlay();
  updateHUD();
}

function loseLife() {
  game.lives -= 1;
  updateHUD();
  blip({ freq: 145, type: "square", dur: 0.15, gain: 0.08 });

  if (game.lives <= 0) {
    game.running = false;
    game.status = "lost";
    setOverlay("Game Over", `Final score: ${game.score}.`, "Try Again");
    return;
  }

  resetBallToPaddle();
}

function launchBall() {
  if (!game.awaitingLaunch || !game.running) return;
  const angle = (Math.random() * 0.8 + 0.35) * Math.PI;
  ball.vx = Math.cos(angle) * ball.speed;
  ball.vy = -Math.abs(Math.sin(angle) * ball.speed);
  game.awaitingLaunch = false;
  blip({ freq: 600, type: "triangle", dur: 0.07, gain: 0.05 });
}

function maybeWin() {
  const remaining = bricks.items.some((brick) => brick.alive);
  if (!remaining) {
    game.running = false;
    game.status = "won";
    blip({ freq: 880, type: "sawtooth", dur: 0.14, gain: 0.04 });
    setOverlay("You Win!", `You cleared all bricks with ${game.lives} lives left.`, "Play Again");
  }
}

function drawBackgroundGrid() {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#8cc4ff";
  ctx.lineWidth = 1;
  for (let x = 0; x <= game.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, game.height);
    ctx.stroke();
  }
  for (let y = 0; y <= game.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(game.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPaddle() {
  const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
  gradient.addColorStop(0, "#a7f3ff");
  gradient.addColorStop(1, "#52b8ff");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 8);
  ctx.fill();
}

function drawBall() {
  const glow = ctx.createRadialGradient(ball.x - 3, ball.y - 3, 1, ball.x, ball.y, ball.r + 6);
  glow.addColorStop(0, "#ffffff");
  glow.addColorStop(1, "#84f2ff");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawBricks() {
  bricks.items.forEach((brick) => {
    if (!brick.alive) return;
    ctx.fillStyle = brick.color;
    ctx.beginPath();
    ctx.roundRect(brick.x, brick.y, bricks.width, bricks.height, 6);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(brick.x + 4, brick.y + 4, bricks.width - 8, 5, 4);
    ctx.fill();
  });
}

function updatePaddle() {
  if (keyState.left && !keyState.right) {
    paddle.dx = -paddle.speed;
  } else if (keyState.right && !keyState.left) {
    paddle.dx = paddle.speed;
  } else {
    paddle.dx = 0;
  }

  paddle.x += paddle.dx;
  paddle.x = Math.max(0, Math.min(game.width - paddle.w, paddle.x));

  if (game.awaitingLaunch) {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 1;
  }
}

function bounceFromPaddle() {
  if (
    ball.y + ball.r >= paddle.y &&
    ball.y - ball.r <= paddle.y + paddle.h &&
    ball.x + ball.r >= paddle.x &&
    ball.x - ball.r <= paddle.x + paddle.w &&
    ball.vy > 0
  ) {
    const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    const maxAngle = Math.PI / 3;
    const angle = hit * maxAngle;
    ball.vx = Math.sin(angle) * ball.speed;
    ball.vy = -Math.cos(angle) * ball.speed;
    blip({ freq: 310, type: "square", dur: 0.04, gain: 0.04 });
  }
}

function handleWallBounces() {
  if (ball.x - ball.r <= 0 && ball.vx < 0) {
    ball.x = ball.r;
    ball.vx *= -1;
    blip({ freq: 260, dur: 0.03, gain: 0.03 });
  }
  if (ball.x + ball.r >= game.width && ball.vx > 0) {
    ball.x = game.width - ball.r;
    ball.vx *= -1;
    blip({ freq: 260, dur: 0.03, gain: 0.03 });
  }
  if (ball.y - ball.r <= 0 && ball.vy < 0) {
    ball.y = ball.r;
    ball.vy *= -1;
    blip({ freq: 340, dur: 0.03, gain: 0.03 });
  }

  if (ball.y - ball.r > game.height) {
    loseLife();
  }
}

function hitBricks() {
  for (const brick of bricks.items) {
    if (!brick.alive) continue;

    if (
      ball.x + ball.r > brick.x &&
      ball.x - ball.r < brick.x + bricks.width &&
      ball.y + ball.r > brick.y &&
      ball.y - ball.r < brick.y + bricks.height
    ) {
      brick.alive = false;
      game.score += 100;
      updateHUD();

      const overlapLeft = ball.x + ball.r - brick.x;
      const overlapRight = brick.x + bricks.width - (ball.x - ball.r);
      const overlapTop = ball.y + ball.r - brick.y;
      const overlapBottom = brick.y + bricks.height - (ball.y - ball.r);
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        ball.vx *= -1;
      } else {
        ball.vy *= -1;
      }

      blip({ freq: 480 + Math.random() * 80, type: "triangle", dur: 0.05, gain: 0.045 });
      maybeWin();
      break;
    }
  }
}

function updateBall() {
  if (game.awaitingLaunch || !game.running) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  handleWallBounces();
  bounceFromPaddle();
  hitBricks();
}

function draw() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawBackgroundGrid();
  drawBricks();
  drawPaddle();
  drawBall();
}

function tick() {
  updatePaddle();
  updateBall();
  draw();
  requestAnimationFrame(tick);
}

function startGame() {
  ensureAudioContext();
  resetRun();
}

function handleLaunchAction() {
  ensureAudioContext();
  if (!game.running && (game.status === "ready" || game.status === "lost" || game.status === "won")) {
    resetRun();
  } else {
    launchBall();
  }
}

function setMoveState(direction, pressed) {
  if (direction === "left") keyState.left = pressed;
  if (direction === "right") keyState.right = pressed;
}

function movePaddleToClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = ((clientX - rect.left) / rect.width) * game.width;
  paddle.x = relativeX - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(game.width - paddle.w, paddle.x));

  if (game.awaitingLaunch) {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 1;
  }
}

actionButton.addEventListener("click", startGame);
launchButton.addEventListener("click", handleLaunchAction);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keyState.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keyState.right = true;
  }
  if (event.code === "Space") {
    event.preventDefault();
    handleLaunchAction();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keyState.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keyState.right = false;
  }
});

for (const [button, direction] of [
  [leftButton, "left"],
  [rightButton, "right"],
]) {
  const press = (event) => {
    event.preventDefault();
    setMoveState(direction, true);
  };
  const release = (event) => {
    event.preventDefault();
    setMoveState(direction, false);
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
}

boardWrap.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  event.preventDefault();
  ensureAudioContext();
  movePaddleToClientX(event.clientX);
});

boardWrap.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
  if ((event.buttons & 1) !== 1) return;
  event.preventDefault();
  movePaddleToClientX(event.clientX);
});

createBricks();
updateHUD();
draw();
requestAnimationFrame(tick);
