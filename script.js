let currentPlayer = 'red'; // Jogador 1 (vermelho) começa
const status = document.getElementById('status');
let phase = 1; // Fase 1: Colocação de peças, Fase 2: Movimentação de peças
let selectedPiece = null; // Para armazenar a peça selecionada para mover
const pieces = { red: 9, blue: 9 }; // Peças de cada jogador
const board = {}; // Representação do tabuleiro para verificar moinhos

// Adicionar eventos às casas
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        if (phase === 1 && !cell.innerHTML) { // Fase de colocação
            placePiece(cell);
        } else if (phase === 2) { // Fase de movimentação
            if (!selectedPiece && cell.firstChild && cell.firstChild.classList.contains(currentPlayer)) {
                selectPieceToMove(cell);
            } else if (selectedPiece && !cell.innerHTML) {
                movePiece(cell);
            }
        }
    });
});

// Alternar entre jogadores
function togglePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    status.textContent = `Vez do Jogador ${currentPlayer === 'red' ? '1 (Vermelho)' : '2 (Azul)'}`;
}

// Colocar peça na fase 1
function placePiece(cell) {
    const piece = document.createElement('div');
    piece.classList.add('piece', currentPlayer);
    cell.appendChild(piece);
    updateBoard(cell); // Atualiza a representação do tabuleiro

    if (checkMill(cell)) { // Verifica se formou um moinho
        capturePiece(() => {
            togglePlayer(); // Alterna o jogador após a captura
        });
    } else {
        togglePlayer(); // Alterna o jogador após uma jogada normal
    }

    checkPhaseTransition();
}

// Atualizar a representação do tabuleiro
function updateBoard(cell, remove = false) {
    const id = cell.id; // Supondo que cada célula tem um id único
    if (remove) {
        delete board[id];
    } else {
        board[id] = currentPlayer;
    }
}

// Verificar se formou um moinho (3 peças consecutivas)
function checkMill(cell) {
    const id = cell.id;
    // Aqui você precisa implementar a lógica de verificação dos moinhos.
    // Vamos supor que existe uma função `checkThreeInARow(id)` que verifica se foi formado um moinho.
    return checkThreeInARow(id);
}

// Capturar uma peça do adversário
function capturePiece(callback) {
    status.textContent = `Moinho! ${currentPlayer} captura uma peça do adversário.`;
    document.querySelectorAll('.cell').forEach(cell => {
        if (cell.firstChild && cell.firstChild.classList.contains(currentPlayer === 'red' ? 'blue' : 'red')) {
            cell.addEventListener('click', (event) => {
                removePiece(event);
                callback(); // Alterna o jogador após a captura
            }, { once: true });
        }
    });
}

// Remover uma peça
function removePiece(event) {
    const cell = event.currentTarget;
    cell.innerHTML = ''; // Remove a peça
    pieces[currentPlayer === 'red' ? 'blue' : 'red']--; // Decrementa o número de peças do adversário
    checkEndGame(); // Verifica se o jogo termina
}

// Verificar se todas as peças foram colocadas para iniciar a fase 2
function checkPhaseTransition() {
    const piecesPlaced = document.querySelectorAll('.piece').length;
    if (piecesPlaced === 18) { // Cada jogador tem 9 peças
        phase = 2;
        status.textContent = `Fase 2: Movimentar peças - Vez do Jogador 1 (Vermelho)`;
    }
}

// Selecionar peça para mover
function selectPieceToMove(cell) {
    if (pieces[currentPlayer] === 3) {
        status.textContent = 'Movimento livre! Escolha uma peça para mover.';
    }
    cell.firstChild.classList.add('movable');
    selectedPiece = cell;
}

// Mover a peça selecionada
function movePiece(targetCell) {
    if (selectedPiece) {
        const validMove = pieces[currentPlayer] === 3 || checkAdjacent(selectedPiece, targetCell);
        if (validMove) {
            targetCell.appendChild(selectedPiece.firstChild);
            updateBoard(targetCell);
            updateBoard(selectedPiece, true); // Remove da célula anterior
            selectedPiece = null;
            document.querySelectorAll('.movable').forEach(piece => piece.classList.remove('movable'));
            if (checkMill(targetCell)) {
                capturePiece(() => {
                    togglePlayer(); // Alterna o jogador após a captura
                });
            } else {
                togglePlayer(); // Alterna o jogador após uma jogada normal
            }
            checkEndGame();
        } else {
            status.textContent = 'Movimento inválido! Escolha uma célula adjacente.';
        }
    }
}

// Verificar se as casas são adjacentes (movimento válido)
function checkAdjacent(fromCell, toCell) {
    // Lógica para verificar se as células são adjacentes
    return true; // Supondo que as células são adjacentes, precisa implementar
}

// Verificar se o jogo termina
function checkEndGame() {
    const playerPieces = pieces[currentPlayer === 'red' ? 'blue' : 'red'];
    if (playerPieces === 2) {
        status.textContent = `${currentPlayer} venceu!`;
        endGame();
    }
}

// Finalizar o jogo
function endGame() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.replaceWith(cell.cloneNode(true)); // Remove todos os event listeners
    });
}
