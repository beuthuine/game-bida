const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const info = document.getElementById("info");
const ballInput = document.getElementById("ballCount");

canvas.width = 800;
canvas.height = 600;

let balls = [];
let totalBalls = 5;
let lostBalls = 0;
let holes = [];
let gameOver = false;
let mapNumber = 1;
let bar = { x: 350, y: 550, width: 120, height: 10, speed: 10 };
let keys = {};

function initMap(map) {
  holes = [];
  if (map === 1) {
    holes.push({ x: canvas.width / 2, y: 50, r: 60 });
  } else if (map === 2) {
    holes.push({ x: canvas.width / 4, y: 60, r: 40 });
    holes.push({ x: (canvas.width * 3) / 4, y: 60, r: 40 });
  } else if (map === 3) {
    holes.push({ x: canvas.width / 2, y: 50, r: 40 });
    holes.push({ x: 150, y: 70, r: 35 });
    holes.push({ x: 650, y: 70, r: 35 });
  }
}

function resetGame() {
  balls = [];
  lostBalls = 0;
  gameOver = false;
  document.getElementById("status").textContent = "Trò chơi đang diễn ra...";
  for (let i = 0; i < totalBalls; i++) {
    balls.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height / 2) + 100,
      radius: 8,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2
    });
  }
}

function drawHoles() {
  holes.forEach(hole => {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  });
}

function drawBar() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
}

function drawBalls() {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
  });
}

function updateBalls() {
  balls.forEach((ball, index) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Va chạm tường
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy *= -1;
    }

    // Va chạm thanh ngang (tăng tốc mạnh hơn)
    if (
      ball.y + ball.radius >= bar.y &&
      ball.x > bar.x &&
      ball.x < bar.x + bar.width &&
      ball.dy > 0
    ) {
      ball.dy *= -1.5;
      ball.dx *= 1.5;
      ball.dx = Math.max(Math.min(ball.dx, 10), -10);
      ball.dy = Math.max(Math.min(ball.dy, 10), -10);
      ball.y = bar.y - ball.radius;
    }

    // Rơi khỏi thanh
    if (ball.y - ball.radius > canvas.height) {
      balls.splice(index, 1);
      lostBalls++;
    }

    // Vào lỗ
    holes.forEach(hole => {
      const dx = ball.x - hole.x;
      const dy = ball.y - hole.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hole.r - 5) {
        balls.splice(index, 1);
      }
    });
  });

  if (lostBalls >= totalBalls * 0.5) {
    gameOver = true;
    document.getElementById("status").textContent = "❌ Thua rồi! Hơn 50% bi đã rơi!";
  } else if (balls.length === 0) {
    gameOver = true;
    document.getElementById("status").textContent = "🏆 Chiến thắng! Tất cả bi đã vào lỗ!";
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawHoles();
  drawBar();
  drawBalls();
}

function moveBar() {
  if (keys["ArrowLeft"]) bar.x -= bar.speed;
  if (keys["ArrowRight"]) bar.x += bar.speed;
  if (bar.x < 0) bar.x = 0;
  if (bar.x + bar.width > canvas.width) bar.x = canvas.width - bar.width;
}

function animate() {
  if (!gameOver) {
    draw();
    updateBalls();
    moveBar();
    requestAnimationFrame(animate);
  }
}

document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

document.getElementById("restartBtn").addEventListener("click", () => {
  resetGame();
  animate();
});

document.querySelectorAll(".map-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    mapNumber = parseInt(btn.dataset.map);
    totalBalls = Math.min(10, Math.max(1, parseInt(ballInput.value)));
    menu.style.display = "none";
    canvas.style.display = "block";
    info.style.display = "block";
    initMap(mapNumber);
    resetGame();
    animate();
  });
});
