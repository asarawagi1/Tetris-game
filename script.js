const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = canvas.width / COLS; // Ensure canvas width is divisible by COLS
const colors = ['#000', '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];

const tetrominoes = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]] // J
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentTetromino, currentX, currentY;
let dropInterval = 500; // Interval in milliseconds
let fastDropInterval = 50; // Faster interval for rapid down movement
let lastDropTime = 0;
let isFastDropping = false;
let fastDropTriggered = false;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) {
        ctx.fillStyle = colors[board[row][col]];
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function drawTetromino() {
  ctx.fillStyle = colors[currentTetromino.color];
  for (let row = 0; row < currentTetromino.shape.length; row++) {
    for (let col = 0; col < currentTetromino.shape[row].length; col++) {
      if (currentTetromino.shape[row][col]) {
        ctx.fillRect((currentX + col) * BLOCK_SIZE, (currentY + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect((currentX + col) * BLOCK_SIZE, (currentY + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function rotateTetromino() {
  const shape = currentTetromino.shape;
  currentTetromino.shape = shape[0].map((_, i) => shape.map(row => row[i])).reverse();
  if (!isValidMove(currentX, currentY)) {
    currentTetromino.shape = shape;
  }
}

function isValidMove(x, y) {
  for (let row = 0; row < currentTetromino.shape.length; row++) {
    for (let col = 0; col < currentTetromino.shape[row].length; col++) {
      if (currentTetromino.shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
}

function mergeTetromino() {
  for (let row = 0; row < currentTetromino.shape.length; row++) {
    for (let col = 0; col < currentTetromino.shape[row].length; col++) {
      if (currentTetromino.shape[row][col]) {
        board[row + currentY][col + currentX] = currentTetromino.color;
      }
    }
  }
}

function removeFullLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell)) {
      board.splice(row, 1);
      board.unshift(Array(COLS).fill(0));
    }
  }
}

function newTetromino() {
  const type = Math.floor(Math.random() * tetrominoes.length);
  currentTetromino = { shape: tetrominoes[type], color: type + 1 };
  currentX = Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2);
  currentY = 0;
  if (!isValidMove(currentX, currentY)) {
    alert('Game Over!');
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }
}

function moveDown() {
  if (isValidMove(currentX, currentY + 1)) {
    currentY++;
  } else {
    mergeTetromino();
    removeFullLines();
    newTetromino();
  }
}

function moveLeft() {
  if (isValidMove(currentX - 1, currentY)) {
    currentX--;
  }
}

function moveRight() {
  if (isValidMove(currentX + 1, currentY)) {
    currentX++;
  }
}

function dropDownFast() {
  while (isValidMove(currentX, currentY + 1)) {
    currentY++;
  }
  mergeTetromino();
  removeFullLines();
  newTetromino();
}

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastDropTime;

  if (deltaTime > (isFastDropping ? fastDropInterval : dropInterval)) {
    drawBoard();
    drawTetromino();
    moveDown();
    lastDropTime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

// Handle swipe and tap for mobile devices
function handleTouchStart(event) {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event) {
  const touch = event.touches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
}

function handleTouchEnd() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      moveRight(); // Swipe right
    } else {
      moveLeft(); // Swipe left
    }
  } else {
    if (deltaY > 0) {
      isFastDropping = true; // Swipe down
    }
  }

  if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
    rotateTetromino(); // Tap to rotate
  }

  touchEndX = 0;
  touchEndY = 0;
  isFastDropping = false;
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    moveLeft();
  } else if (event.key === 'ArrowRight') {
    moveRight();
  } else if (event.key === 'ArrowUp') {
    rotateTetromino();
  } else if (event.key === 'ArrowDown') {
    isFastDropping = true;
  }
});

document.addEventListener('keyup', event => {
  if (event.key === 'ArrowDown') {
    isFastDropping = false;
  }
});

// Add touch event listeners for mobile support
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

newTetromino();
requestAnimationFrame(gameLoop);