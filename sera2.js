let currentPlayer = 'red'; // Player 1 (red) starts
const status = document.getElementById('status');
let phase = 1; // Phase 1: Placing pieces
let selectedPiece = null; // For storing the selected piece to move
let piecesPlaced = 0; // Count of placed pieces
let n = 3; // Default value for number of squares (n)
let Pieces = 9; // Default value for number of pieces of each player
let board = []; 

function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear any existing cells

    const totalPositions = 8 * n;
    Pieces = 3 * n; // Adjust max pieces for each player
    piecesPlaced = 0;
    board = Array(totalPositions).fill(null);
    validPositions = Array.from({ length: totalPositions }, (_, i) => i);

    for (let i = 0; i < totalPositions; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        boardElement.appendChild(cell);
        cell.addEventListener('click', () => handleCellClick(cell, i));
    }

    status.textContent = 'Turn of Player 1 (Red)';
}

// Add events to valid cells
// Add events to valid cells
document.querySelectorAll('.cell').forEach((cell, index) => {
    if (validPositions.includes(index)) {
        cell.addEventListener('click', () => {
            if (phase === 1 && !cell.innerHTML) { // Placing phase
                placePiece(cell, index);
            } else if (phase === 2) { // Moving phase
                if (!selectedPiece && cell.firstChild && cell.firstChild.classList.contains(currentPlayer)) {
                    selectPieceToMove(cell);
                } else if (selectedPiece && !cell.innerHTML) {
                    movePiece(cell, index);
                }
            }
        });
    }
});

// Toggle between players
function togglePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    status.textContent = `Turn of Player ${currentPlayer === 'red' ? '1 (Red)' : '2 (Blue)'}`;
}

// PHASE 1

// Place piece in phase 1
function placePiece(cell, index) {
    const piece = document.createElement('div');
    piece.classList.add('piece', currentPlayer);
    cell.appendChild(piece);
    board[index] = currentPlayer; // Update the board state
    piecesPlaced++;
    checkPhaseTransition();
    togglePlayer();
}

// Check if all pieces have been placed to start phase 2
function checkPhaseTransition() {
    if (piecesPlaced === Pieces) { // Total pieces placed (9 for each player)
        phase = 2;
        status.textContent = `Phase 2: Move pieces - Turn of Player 1 (Red)`;
    }
}



// PHASE 2

// Select piece to move
function selectPieceToMove(cell) {
    cell.firstChild.classList.add('movable');
    selectedPiece = cell;
}

// Move piece logic
function movePiece(targetCell, index) {
    if (selectedPiece) {
        targetCell.appendChild(selectedPiece.firstChild);
        const previousIndex = Array.from(selectedPiece.parentElement.children).indexOf(selectedPiece);
        board[previousIndex] = null;
        board[index] = currentPlayer;
        selectedPiece = null;
        document.querySelectorAll('.movable').forEach(piece => piece.classList.remove('movable'));
        togglePlayer();
    }
}

// Restart game logic
function restartGame() {
    currentPlayer = 'red';
    phase = 1;
    selectedPiece = null;
    createBoard();
}

// Start game with chosen number of squares
document.getElementById('startBtn').addEventListener('click', () => {
    const boardSizeInput = document.getElementById('boardSize');
    n = parseInt(boardSizeInput.value);
    createBoard();
});

// Restart button logic
document.getElementById('restartBtn').addEventListener('click', restartGame);

// Initial board setup
createBoard();






