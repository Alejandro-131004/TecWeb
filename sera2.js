let currentPlayer = 'red'; // Player 1 (red) starts
const status = document.getElementById('status');
let phase = 1; // Phase 1: Placing pieces
let selectedPiece = null; // For storing the selected piece to move
let piecesPlaced = 0; // Count of placed pieces
const maxPieces = 9; // Each player has 9 pieces
let board = Array(24).fill(null); // Board representation (24 valid positions)

// Mapping valid cells (simulating valid_positions from Python)
const validPositions = Array.from({ length: 24 }, (_, i) => i);

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
    if (piecesPlaced === maxPieces * 2) { // Total pieces placed (9 for each player)
        phase = 2;
        status.textContent = `Phase 2: Move pieces - Turn of Player 1 (Red)`;
    }
}

// Select piece to move
function selectPieceToMove(cell) {
    cell.firstChild.classList.add('movable');
    selectedPiece = cell;
}

// Move the selected piece
function movePiece(targetCell, index) {
    if (selectedPiece) {
        targetCell.appendChild(selectedPiece.firstChild);
        board[index] = currentPlayer; // Update the board with the new position
        const previousIndex = Array.from(selectedPiece.parentElement.children).indexOf(selectedPiece);
        board[previousIndex] = null; // Clear the previous position
        selectedPiece = null;
        document.querySelectorAll('.movable').forEach(piece => piece.classList.remove('movable'));
        togglePlayer();
    }
}

// Restart the game
document.getElementById('restartBtn').addEventListener('click', restartGame);

function restartGame() {
    // Reset variables
    currentPlayer = 'red'; // Player 1 (red) starts
    phase = 1; // Phase 1: Placing pieces
    selectedPiece = null; // Reset selected piece
    piecesPlaced = 0; // Reset pieces placed
    board = Array(24).fill(null); // Reset the board

    // Clear the board visually
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerHTML = ''; // Remove all pieces from the cells
    });

    // Reset the status message
    status.textContent = 'Turn of Player 1 (Red)';
}

// Check if the game is finished (full board)
function isFinished() {
    return board.every(cell => cell !== null);
}

// Check if all pieces have been moved
function checkGameOver() {
    if (isFinished()) {
        status.textContent = `Game Over! ${currentPlayer === 'red' ? 'Player 1 (Red)' : 'Player 2 (Blue)'} wins!`;
    }
}
