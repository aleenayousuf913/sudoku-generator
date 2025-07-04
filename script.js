let board = [];

// Check if placing num at (row, col) is valid
function isValid(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  let startRow = Math.floor(row / 3) * 3;
  let startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
}

// Shuffle array in-place (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Fill board using backtracking
function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        let numbers = [1,2,3,4,5,6,7,8,9];
        shuffle(numbers);
        for (let num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Create empty 9x9 board
function createEmptyBoard() {
  let b = [];
  for(let i=0; i<9; i++){
    b.push(new Array(9).fill(0));
  }
  return b;
}

// Remove cells to create puzzle (keep `clues` filled cells)
function makePuzzle(board, clues=35) {
  let puzzle = JSON.parse(JSON.stringify(board)); // deep copy
  let attempts = 81 - clues;
  while (attempts > 0) {
    let row = Math.floor(Math.random()*9);
    let col = Math.floor(Math.random()*9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      attempts--;
    }
  }
  return puzzle;
}

// Render puzzle to the page
function renderBoard(puzzle) {
  const grid = document.getElementById("sudoku-grid");
  grid.innerHTML = ""; // Clear previous

  for (let row=0; row<9; row++) {
    for (let col=0; col<9; col++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");

      if (puzzle[row][col] !== 0) {
        cellDiv.textContent = puzzle[row][col];
        cellDiv.style.fontWeight = "bold";
      } else {
        const input = document.createElement("input");
        input.setAttribute("maxlength", "1");
        input.setAttribute("type", "text");
        input.addEventListener("input", (e) => {
          // Allow only digits 1-9
          const val = e.target.value;
          if (!/^[1-9]$/.test(val)) {
            e.target.value = "";
          }
        });
        cellDiv.appendChild(input);
      }
      grid.appendChild(cellDiv);
    }
  }
}

// Get current user board (including inputs)
function getUserBoard() {
  const grid = document.getElementById("sudoku-grid");
  const cells = grid.children;
  let userBoard = [];
  for (let r = 0; r < 9; r++) {
    userBoard[r] = [];
    for (let c = 0; c < 9; c++) {
      const cell = cells[r * 9 + c];
      if (cell.textContent !== "") {
        userBoard[r][c] = parseInt(cell.textContent);
      } else {
        const input = cell.querySelector("input");
        let val = input.value;
        userBoard[r][c] = val === "" ? 0 : parseInt(val);
      }
    }
  }
  return userBoard;
}

// Check if board is fully filled
function isComplete(board) {
  for (let row = 0; row < 9; row++)
    for (let col = 0; col < 9; col++)
      if (board[row][col] === 0) return false;
  return true;
}

// Check solution correctness
function checkSolution() {
  const userBoard = getUserBoard();
  const resultMessage = document.getElementById("result-message");

  if (!isComplete(userBoard)) {
    resultMessage.textContent = "Please fill all cells before checking.";
    resultMessage.style.color = "orange";
    return;
  }

  for (let i = 0; i < 9; i++) {
    let rowSet = new Set();
    let colSet = new Set();
    let boxSet = new Set();

    for (let j = 0; j < 9; j++) {
      // Row check
      if (rowSet.has(userBoard[i][j])) {
        resultMessage.textContent = "Incorrect solution: duplicate in a row.";
        resultMessage.style.color = "red";
        return;
      }
      rowSet.add(userBoard[i][j]);

      // Column check
      if (colSet.has(userBoard[j][i])) {
        resultMessage.textContent = "Incorrect solution: duplicate in a column.";
        resultMessage.style.color = "red";
        return;
      }
      colSet.add(userBoard[j][i]);

      // Box check
      const boxRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
      const boxCol = 3 * (i % 3) + (j % 3);
      if (boxSet.has(userBoard[boxRow][boxCol])) {
        resultMessage.textContent = "Incorrect solution: duplicate in a 3x3 box.";
        resultMessage.style.color = "red";
        return;
      }
      boxSet.add(userBoard[boxRow][boxCol]);
    }
  }

  resultMessage.textContent = "Congratulations! You solved the puzzle correctly!";
  resultMessage.style.color = "green";
}

// Generate a new puzzle
function newPuzzle() {
  board = createEmptyBoard();
  fillBoard(board);
  const puzzle = makePuzzle(board, 35);
  renderBoard(puzzle);
  document.getElementById("result-message").textContent = "";
}

// Setup event listeners and load first puzzle
window.onload = () => {
  newPuzzle();
  document.getElementById("new-puzzle").onclick = newPuzzle;
  document.getElementById("check-solution").onclick = checkSolution;
};
