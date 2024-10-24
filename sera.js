function generateBoard(numSquares) {
    const boardSize = 2 * numSquares + 1;
    const board = Array.from(Array(boardSize), () => Array(boardSize).fill(null));
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Limpa o tabuleiro anterior

    // Definir as casas válidas (cantos e meios dos lados)
    for (let square = 0; square < numSquares; square++) {
        const min = square;
        const max = boardSize - square - 1;

        // Canto superior esquerdo, superior direito, inferior esquerdo, inferior direito
        board[min][min] = 'valid';
        board[min][max] = 'valid';
        board[max][min] = 'valid';
        board[max][max] = 'valid';

        // Meio dos lados
        const mid = (min + max) / 2;
        board[min][mid] = 'valid'; // Meio superior
        board[mid][min] = 'valid'; // Meio esquerdo
        board[mid][max] = 'valid'; // Meio direito
        board[max][mid] = 'valid'; // Meio inferior
    }

    // Criar o tabuleiro visual usando DOM
    for (let row = 0; row < boardSize; row++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[row][col] === 'valid') {
                cell.classList.add('valid'); // Marcamos as casas válidas
                const cellId = String.fromCharCode(65 + row) + (col + 1); // IDs tipo A1, B2, etc.
                cell.id = cellId;
                cell.addEventListener('click', () => handleCellClick(cell, row, col));
            }
            rowElement.appendChild(cell);
        }
        boardElement.appendChild(rowElement);
    }

    // Desenhar linhas conectando as casas válidas (opcional)
    drawConnections(board, numSquares);
}

function handleCellClick(cell, row, col) {
    console.log(`Cell clicked: ${cell.id} at row ${row}, col ${col}`);
}

function drawConnections(board, numSquares) {
    // Lógica para desenhar as linhas conectando as casas válidas
    // Isso pode ser feito com SVG ou manipulando estilos CSS.
}
