let phase = 1;
let piecesPlaced = 0;
let redPiecesPlaced = 0; // Peças colocadas pelo jogador Red
let bluePiecesPlaced = 0; // Peças colocadas pelo jogador Blue
let currentPlayer = 'red';
let selectedPiece = null;
let maxPieces = 0;
let board = [];
const status = document.getElementById('status');
const boardElement = document.getElementById('board');


function startGame() {
    const numSquares = parseInt(document.getElementById('numSquares').value);

    if (numSquares < 2) {
        status.textContent = "Número inválido. Escolha um número maior que 2.";
        return;
    }

    resetBoard();
    generateBoard(numSquares);
    phase = 1;
    piecesPlaced = 0;
    redPiecesPlaced = 0; // Reiniciar contagem de peças para Red
    bluePiecesPlaced = 0; // Reiniciar contagem de peças para Blue
    currentPlayer = 'red';
    status.textContent = `Vez de Red`;

    maxPieces = getNumberOfPieces(numSquares) / 2; // Número máximo de peças por jogador
}


function generateBoard(numSquares) {
    boardElement.innerHTML = ''; // Limpar tabuleiro anterior

    const boardCenter = 400; // Centro do tabuleiro (800px / 2)
    const maxRadius = 300; // Raio máximo ajustado para o quadrado maior

    for (let square = 0; square < numSquares; square++) {
        const radius = maxRadius - (square * (maxRadius / numSquares));
        const positions = calculatePositions(radius);

        positions.forEach((pos, index) => {
            createCircle(boardElement, boardCenter + pos.x, boardCenter + pos.y, `cell-${square}-${index}`);
        });

        if (square !== numSquares - 1) {
            createLine(boardElement, boardCenter - radius, boardCenter, boardCenter + radius, boardCenter); // Linha horizontal no centro
            createLine(boardElement, boardCenter, boardCenter - radius, boardCenter, boardCenter + radius); // Linha vertical no centro
        }

        // Desenhar linhas entre os círculos
        for (let i = 0; i < positions.length; i++) {
            const nextPos = positions[(i + 1) % positions.length];
            createLine(boardElement, boardCenter + positions[i].x, boardCenter + positions[i].y, boardCenter + nextPos.x, boardCenter + nextPos.y);
        }
    }
}

function calculatePositions(radius) {
    return [
        { x: -radius, y: -radius },
        { x: 0-4, y: -radius },
        { x: radius, y: -radius },
        { x: radius, y: 0 },
        { x: radius, y: radius },
        { x: 0-4, y: radius },
        { x: -radius, y: radius },
        { x: -radius, y: 0 }
    ];
}

function createCircle(boardElement, x, y, id) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.left = `${x - 15}px`; // Ajuste para centralizar os círculos
    cell.style.top = `${y - 15}px`; 
    cell.id = id;
    cell.addEventListener('click', () => handleCellClick(cell));
    boardElement.appendChild(cell);
}

function createLine(boardElement, x1, y1, x2, y2) {
    const line = document.createElement('div');
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    line.classList.add('line');
    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;

    boardElement.appendChild(line);
}

function handleCellClick(cell) {
    if (phase === 1 && !cell.innerHTML) {
        placePiece(cell);
    }
}

function placePiece(cell) {
    // Verifica se o jogador atual está dentro do limite de peças
    if ((currentPlayer === 'red' && redPiecesPlaced < maxPieces) ||
        (currentPlayer === 'blue' && bluePiecesPlaced < maxPieces)) {

        // Alterar a cor de fundo da célula com base no jogador atual
        if (currentPlayer === 'red') {
            cell.style.backgroundColor = 'red';
            redPiecesPlaced++; // Incrementa o número de peças para Red
        } else if (currentPlayer === 'blue') {
            cell.style.backgroundColor = 'blue';
            bluePiecesPlaced++; // Incrementa o número de peças para Blue
        }
        togglePlayer();

        const piece = document.createElement('div');
        piece.classList.add('piece', currentPlayer);
        cell.appendChild(piece);
        piecesPlaced++;

        // Verifica se uma mill foi formada
        if (checkForMill(cell)) {
            status.textContent = `${currentPlayer} formou uma mill! Remova uma peça do oponente.`;
            removeOpponentPiece(); // Alternância de jogador ocorrerá dentro de removeOpponentPiece após remoção
        } else {
            // Verifica se todas as peças foram colocadas
            if (redPiecesPlaced === maxPieces && bluePiecesPlaced === maxPieces) {
                phase = 2;
                status.textContent = "Fase 2: Mover peças - Vez de Red";
            } else {
                togglePlayer(); // Continua alternando os jogadores enquanto as peças não foram todas colocadas
            }
        }

        // Atualiza o status com a contagem de peças colocadas
        updatePieceCount();
    } else {
        // Mensagem de erro caso o jogador tente colocar mais peças do que o permitido
        status.textContent = `${currentPlayer} já colocou todas as peças.`;
    }
}

function updatePieceCount() {
    status.textContent = `
        Vez de ${currentPlayer}. 
        Red: ${redPiecesPlaced}/${maxPieces} peças colocadas. 
        Blue: ${bluePiecesPlaced}/${maxPieces} peças colocadas.
    `;
}

function togglePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    updatePieceCount(); // Atualiza o status sempre que alterna o jogador
}

function getNumberOfPieces(numSquares) {
    return 3 * numSquares * 2; // 3*n peças para cada jogador, multiplicado por 2 para dois jogadores
}

function resetBoard() {
    boardElement.innerHTML = '';
    board = [];
}

function checkForMill(cell) {
    const [square, index] = cell.id.split('-').slice(1).map(Number);
    const millLines = getMillLines(square, index);
    
    // Verificar se alguma linha de três peças é uma mill
    for (let line of millLines) {
        if (line.every(c => board[c.square][c.index] === currentPlayer)) {
            return true;
        }
    }
    return false;
}

function getMillLines(square, index) {
    const numPositions = 8; // O número de posições em cada círculo
    const millLines = [];

    // 1. Adicionar linha horizontal (dentro do mesmo círculo)
    const horizontalLine = [];
    for (let i = 0; i < numPositions; i++) {
        horizontalLine.push({ square, index: i });
    }
    millLines.push(horizontalLine);

    // 2. Adicionar linha vertical (mesmo index, mas em círculos diferentes)
    const verticalLine = [];
    for (let s = 0; s <= 2; s++) {  // Assume que existem 3 círculos (square 0, 1, 2)
        verticalLine.push({ square: s, index });
    }
    millLines.push(verticalLine);

    return millLines;
}


function removeOpponentPiece() {
    boardElement.addEventListener('click', function removePiece(event) {
        const cell = event.target.closest('.cell');
        const piece = cell.querySelector('.piece');
        
        if (piece && piece.classList.contains(opponentPlayer()) && !checkForMill(cell)) {
            cell.innerHTML = ''; // Remove a peça
            status.textContent = `${currentPlayer} removeu uma peça!`;
            boardElement.removeEventListener('click', removePiece);
            
            // Após remover a peça, alterna para o próximo jogador
            togglePlayer();
        }
    });
}

function opponentPlayer() {
    return currentPlayer === 'red' ? 'blue' : 'red';
}