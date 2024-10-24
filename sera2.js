let currentPlayer = 'red'; // Jogador 1 (red) começa
let phase = 1; // Fase 1: Colocando peças
let selectedPiece = null; // Armazena a peça selecionada para mover
let piecesPlaced = 0; // Contador de peças colocadas
const maxPieces = 9; // Número máximo de peças por jogador
let board = []; // Representação do tabuleiro
let numSquares = 3; // Valor inicial para quadrados

const status = document.getElementById('status');
const boardElement = document.getElementById('board');

function startGame() {
    numSquares = parseInt(document.getElementById('numSquares').value);

    // Verifica se o número de quadrados é menor ou igual a 2
    if (numSquares <= 2) {
        status.textContent = "Invalid number. Please choose a number greater than 2.";
        return; // Impede a continuação do jogo
    }
    alert ("Red turns first followed by blue") //alerta antes de comecar o jogo

    resetBoard();
    generateBoard(numSquares);
    phase = 1; // Voltar à fase 1
    piecesPlaced = 0;
    currentPlayer = 'red'; // Reset para jogador 1
    status.textContent = `Red's turn`;
}

// Iniciar o jogo com base no número de quadrados
document.getElementById('startBtn').addEventListener('click', startGame);

// Gerar tabuleiro com base no número de quadrados
function generateBoard(numSquares) {
    boardElement.innerHTML = ''; // Limpa o tabuleiro anterior
    board = Array(numSquares * numSquares * 2).fill(null); // Ajustar o tamanho do array

    // Gerar quadrados concêntricos
    for (let i = 0; i < numSquares; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.style.top = `${i * 50}px`;
        square.style.left = `${i * 50}px`;
        square.style.width = `${400 - i * 100}px`;
        square.style.height = `${400 - i * 100}px`;
        boardElement.appendChild(square);
    }

    // Adicionar as células válidas
    let validPositions = generateValidPositions(numSquares);
    validPositions.forEach((pos, index) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.top = `${pos.top}px`;
        cell.style.left = `${pos.left}px`;
        cell.id = `cell-${index}`;
        cell.addEventListener('click', () => handleCellClick(cell, index));
        boardElement.appendChild(cell);
    });
}

// Gerar posições válidas para células em torno dos quadrados concêntricos
function generateValidPositions(numSquares) {
    const positions = [];
    const boardSize = 400; // Tamanho total do tabuleiro
    const gap = (boardSize - 30) / (numSquares - 1); // Ajustar o espaçamento dinamicamente

    // Gerar posições
    for (let i = 0; i < numSquares; i++) {
        positions.push({ top: i * gap, left: 0 }); // Esquerda
        positions.push({ top: i * gap, left: boardSize / 2 - 15 }); // Centro
        positions.push({ top: i * gap, left: boardSize - 30 }); // Direita
    }
    return positions;
}

// Lidar com o clique nas células
function handleCellClick(cell, index) {
    if (phase === 1 && !cell.innerHTML) { // Colocar peça
        placePiece(cell, index);
    } else if (phase === 2) { // Mover peça
        if (!selectedPiece && cell.firstChild && cell.firstChild.classList.contains(currentPlayer)) {
            selectPieceToMove(cell);
        } else if (selectedPiece && !cell.innerHTML) {
            movePiece(cell, index);
        }
    }
}

// Colocar a peça na fase 1
function placePiece(cell, index) {
    const piece = document.createElement('div');
    piece.classList.add('piece', currentPlayer);
    cell.appendChild(piece);
    board[index] = currentPlayer; // Atualizar o estado do tabuleiro
    piecesPlaced++;
    checkPhaseTransition();
    togglePlayer();
}

// Verificar se todas as peças foram colocadas para iniciar a fase 2
function checkPhaseTransition() {
    if (piecesPlaced === maxPieces * 2) { // Total de peças colocadas
        phase = 2;
        status.textContent = `Phase 2: Move pieces - Red's turn`;
    }
}

// Alternar entre os jogadores
function togglePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    status.textContent = currentPlayer === 'red' ? "Red's turn" : "Blue's turn";
}

// Selecionar peça para mover
function selectPieceToMove(cell) {
    cell.firstChild.classList.add('movable');
    selectedPiece = cell;
}

// Mover a peça selecionada
function movePiece(targetCell, index) {
    if (selectedPiece) {
        targetCell.appendChild(selectedPiece.firstChild);
        board[index] = currentPlayer; // Atualizar a nova posição
        const previousIndex = Array.from(selectedPiece.parentElement.children).indexOf(selectedPiece);
        board[previousIndex] = null; // Limpar a posição anterior
        selectedPiece = null;
        document.querySelectorAll('.movable').forEach(piece => piece.classList.remove('movable'));
        togglePlayer();
    }
}

// Reiniciar o jogo
document.getElementById('restartBtn').addEventListener('click', resetBoard);

function resetBoard() {
    boardElement.innerHTML = '';
}
