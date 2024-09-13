const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
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
      if (currentTetromino.shape[row][col] &&
          (board[row + y] && board[row + y][col + x]) !== 0) {
        return false;
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

function gameLoop() {
  drawBoard();
  drawTetromino();
  moveDown();
  setTimeout(gameLoop, 1000);
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    moveLeft();
  } else if (event.key === 'ArrowRight') {
    moveRight();
  } else if (event.key === 'ArrowUp') {
    rotateTetromino();
  } else if (event.key === 'ArrowDown') {
    moveDown();
  }
});

newTetromino();
gameLoop();
