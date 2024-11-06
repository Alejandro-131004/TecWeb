// Function to get all opponent pieces on the board
function getOpponentPieces(opponentColor) {
    let opponentPieces = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === opponentColor) {
                opponentPieces.push({ x: i, y: j });
            }
        }
    }
    return opponentPieces;
}

// Function to remove a piece from the board, ensuring it's an opponent piece
function removePiece(x, y, currentPlayer) {
    const opponentColor = (currentPlayer === "red") ? "blue" : "red";
    
    if (board[x][y] !== opponentColor) {
        status.textContent = "Invalid removal. Choose an opponent's piece.";
        return false;  // Indicate that the removal was not successful
    }

    board[x][y] = null;  // Remove the piece
    status.textContent = `${opponentColor} piece removed at (${x}, ${y})`;
    return true;  // Indicate successful removal
}

// Function to handle computer's removal of an opponent's piece after forming a mill
function computerRemovePiece() {
    const opponentPieces = getOpponentPieces(humanColor);  // Get all human pieces

    if (opponentPieces.length === 0) return;  // No pieces to remove
    
    // Choose a random piece to remove
    const randomIndex = Math.floor(Math.random() * opponentPieces.length);
    const pieceToRemove = opponentPieces[randomIndex];
    
    // Remove the chosen piece
    removePiece(pieceToRemove.x, pieceToRemove.y, computerColor);
}

// Update function to handle mill formation
function checkAndRemoveOpponentPiece(currentPlayer) {
    if (millFormed) {  // Assuming 'millFormed' is set to true when a mill is detected
        if (currentPlayer === computerColor) {
            setTimeout(computerRemovePiece, 500);  // Small delay for computer's removal
        } else {
            status.textContent = "Select an opponent's piece to remove";
        }
    }
}