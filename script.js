let currentPlayer = 'red'; // Jogador 1 (vermelho) começa
const status = document.getElementById('status');
let phase = 1; // Fase 1: Colocação de peças, Fase 2: Movimentação de peças
let selectedPiece = null; // Para armazenar a peça selecionada para mover

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
    checkPhaseTransition();
    togglePlayer();
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
    cell.firstChild.classList.add('movable');
    selectedPiece = cell;
}

// Mover a peça selecionada
function movePiece(targetCell) {
    if (selectedPiece) {
        targetCell.appendChild(selectedPiece.firstChild);
        selectedPiece = null;
        document.querySelectorAll('.movable').forEach(piece => piece.classList.remove('movable'));
        togglePlayer();
    }
}
