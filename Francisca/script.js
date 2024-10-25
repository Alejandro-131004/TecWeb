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

    // Inicializa o board como matriz vazia com base no número de círculos
    board = Array.from({ length: numSquares }, () => Array(8).fill(null));

    phase = 1;
    piecesPlaced = 0;
    redPiecesPlaced = 0; // Reiniciar contagem de peças para Red
    bluePiecesPlaced = 0; // Reiniciar contagem de peças para Blue
    currentPlayer = 'red';
    status.textContent = `Vez de Red`;

    maxPieces = getNumberOfPieces(numSquares) / 2; // Número máximo de peças por jogador
}

function generateBoard(numSquares) {
    board = [];  // Inicializa o tabuleiro como uma matriz vazia

    for (let square = 0; square < numSquares; square++) {
        const positions = new Array(8).fill(null); // Cria um círculo com 8 posições vazias
        board.push(positions);  // Adiciona o círculo ao tabuleiro
    }

    // Também cria visualmente o tabuleiro na interface
    boardElement.innerHTML = ''; // Limpar tabuleiro anterior
    const boardCenter = 400; // Centro do tabuleiro (800px / 2)
    const maxRadius = 300; // Raio máximo ajustado para o quadrado maior

    for (let square = 0; square < numSquares; square++) {
        const radius = maxRadius - (square * (maxRadius / numSquares));
        const positions = calculatePositions(radius);

        positions.forEach((pos, index) => {
            createCircle(boardElement, boardCenter + pos.x, boardCenter + pos.y, `cell-${square}-${index}`);
        });

        // Desenhar linhas horizontais e verticais no tabuleiro
        if (square !== numSquares - 1) {
            createLine(boardElement, boardCenter - radius, boardCenter, boardCenter + radius, boardCenter); // Linha horizontal
            createLine(boardElement, boardCenter, boardCenter - radius, boardCenter, boardCenter + radius); // Linha vertical
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


//debug prints 
function handleCellClick(cell) {
    if (phase === 1 && !cell.innerHTML) {
        placePiece(cell);
    }

    // Exibir o conteúdo atual do tabuleiro para cada célula
    //let boardContent = board.map((circle, i) =>
        //circle.map((value, j) => `(${i}-${j}: ${value || "empty"})`).join(", ")
    //).join("\n");

    //console.log("Conteúdo do tabuleiro:\n", boardContent); // Exibir no console

    //status.textContent = "Conteúdo do tabuleiro:\n" + boardContent.replace(/\n/g, '<br>'); // Exibir no status
}

function placePiece(cell) {
    const [square, index] = cell.id.split('-').slice(1).map(Number); // Extrai a posição da célula a partir do id

    // Verifica se a posição já está ocupada
    if (board[square][index] !== null) {
        status.textContent = "Essa posição já está ocupada!";
        return;
    }

    // Verifica se o jogador atual ainda pode colocar mais peças
    if ((currentPlayer === 'red' && redPiecesPlaced < maxPieces) ||
        (currentPlayer === 'blue' && bluePiecesPlaced < maxPieces)) {

        // Alterar a cor de fundo da célula com base no jogador atual
        if (currentPlayer === 'red') {
            cell.style.backgroundColor = 'red';
            redPiecesPlaced++; // Incrementa o número de peças para Red
            board[square][index] = 'red'; // Atualiza a matriz do tabuleiro
        } else if (currentPlayer === 'blue') {
            cell.style.backgroundColor = 'blue';
            bluePiecesPlaced++; // Incrementa o número de peças para Blue
            board[square][index] = 'blue'; // Atualiza a matriz do tabuleiro
        }

        // Verifica se uma mill foi formada
        const numCircles = board.length; // número de círculos
        if (checkForMill(square, index, board, currentPlayer, numCircles)) {
            status.textContent = `${currentPlayer} formou uma mill! Remova uma peça do adversário.`;

            // Inicia o processo de seleção de peça do adversário
            startRemoveOpponentPiece(); // Chame a função de remoção de peça
        } else {
            // Se não formou uma mill, alterna o jogador imediatamente
            togglePlayer();
        }
    } else {
        status.textContent = `${currentPlayer} já colocou todas as suas peças.`;
    }
}


function checkForMill(square, index, board, currentPlayer, numCircles) {
    // Verifica as possíveis linhas de moinhos e retorna true se encontrar um
    const millLines = getMillLines(square, index, numCircles);

    // Verifica se alguma das linhas é um mill completo
    for (let line of millLines) {
        let isMill = line.every(cell => board[cell.square][cell.index] === currentPlayer);
        if (isMill) {
            return true; // Mill encontrado
        }
    }
    return false; // Nenhum mill encontrado
}


function togglePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    status.textContent = `Vez de ${currentPlayer}.`;
    updatePieceCount(); 
}


function updatePieceCount() {
    status.textContent = `
        Vez de ${currentPlayer}. 
        Red: ${redPiecesPlaced}/${maxPieces} peças colocadas. 
        Blue: ${bluePiecesPlaced}/${maxPieces} peças colocadas.
    `;
}

function getNumberOfPieces(numSquares) {
    return 3 * numSquares * 2; // 3*n peças para cada jogador, multiplicado por 2 para dois jogadores
}

function resetBoard() {
    boardElement.innerHTML = '';
    board = [];
}

function checkForMill(square, index, board, currentPlayer, numCircles) {
    // Obter as linhas possíveis de mills para o círculo e índice dados
    const millLines = getMillLines(square, index, numCircles);

    // Verificar se alguma das linhas é um mill completo
    for (let line of millLines) {
        let isMill = line.every(cell => board[cell.square][cell.index] === currentPlayer);
        if (isMill) {
            return true; // Mill encontrado
        }
    }

    return false; // Nenhum mill encontrado
}



function getMillLines(square, index, numCircles) {
    const millLines = [];

    // Função auxiliar para obter subconjuntos de 3 elementos de uma linha
    function getSubsetsOfThree(line) {
        const subsets = [];
        for (let i = 0; i <= line.length - 3; i++) {
            subsets.push(line.slice(i, i + 3));
        }
        return subsets;
    }

    // 1. Linhas horizontais no mesmo círculo
    if (index === 0 || index === 2 || index === 4 || index === 6) {
        // Linha horizontal no círculo
        if (index === 0 || index === 2) {
            millLines.push([{ square, index: 0 }, { square, index: 1 }, { square, index: 2 }]);
        }
        if (index === 4 || index === 6) {
            millLines.push([{ square, index: 4 }, { square, index: 5 }, { square, index: 6 }]);
        }

        // Linhas verticais dentro do mesmo círculo
        if (index === 0 || index === 4) {
            millLines.push([{ square, index: 0 }, { square, index: 3 }, { square, index: 4 }]);
        }
        if (index === 2 || index === 6) {
            millLines.push([{ square, index: 0 }, { square, index: 7 }, { square, index: 6 }]);
        }

    } else if (index === 1 || index === 3 || index === 5 || index === 7) {
        // 2. Linhas verticais (entre círculos) - apenas conjuntos de 3
        const verticalLine = [];
        for (let s = 0; s < numCircles; s++) {
            verticalLine.push({ square: s, index });
        }
        // Adiciona apenas subconjuntos de 3 peças possíveis para formar um moinho
        millLines.push(...getSubsetsOfThree(verticalLine));

        // Linhas horizontais no mesmo círculo
        if (index === 1 || index === 2) {
            millLines.push([{ square, index: 0 }, { square, index: 1 }, { square, index: 2 }]);
        }
        if (index === 4 || index === 5) {
            millLines.push([{ square, index: 4 }, { square, index: 5 }, { square, index: 6 }]);
        }
        if (index === 6 || index === 7) {
            millLines.push([{ square, index: 0 }, { square, index: 7 }, { square, index: 6 }]);
        }
    }

    return millLines;
}
function removeOpponentPiece(cell) {
    const [square, index] = cell.id.split('-').slice(1).map(Number);
    const opponent = opponentPlayer();

    console.log(`Tentando remover peça em ${square}-${index}.`);
    console.log(`Peça do oponente: ${board[square][index]}, Jogador atual: ${currentPlayer}`);

    if (board[square][index] === opponent) {
        const numCircles = board.length;
        if (checkForMill(square, index, board, opponent, numCircles)) {
            console.log("Peça pertence a um moinho, não pode ser removida.");
            status.textContent = "Não se pode remover uma peça de um moinho!";
            return false;
        } else {
            cell.style.backgroundColor = "";
            board[square][index] = null;
            status.textContent = `${opponent} teve uma peça removida. Vez de ${currentPlayer}.`;
            togglePlayer();
            return true;
        }
    } else if (board[square][index] === null) {
        status.textContent = "Tens de escolher uma peça do adversário para remover!";
        return false;
    }

    return false;
}


function startRemoveOpponentPiece() {
    status.textContent = `${currentPlayer} formou um moinho! Selecione uma peça do adversário para remover.`;

    // Temporariamente desabilitar a colocação de peças e permitir a remoção
    const cells = boardElement.querySelectorAll('.cell');
    
    // Adiciona um listener para remover uma peça do oponente
    cells.forEach(cell => {
        cell.addEventListener('click', handleRemovePiece);
    });

    function handleRemovePiece(event) {
        const cell = event.target;

        // Verifica se a célula está vazia
        const [square, index] = cell.id.split('-').slice(1).map(Number);
        if (board[square][index] === null) {
            status.textContent = "Tens de escolher uma peça do adversário para remover!";
            return; // Para a execução se a célula estiver vazia
        }

        // Tenta remover a peça; turno avança apenas se for bem-sucedida
        if (removeOpponentPiece(cell)) {
            // Remover os listeners após a remoção bem-sucedida
            cells.forEach(c => c.removeEventListener('click', handleRemovePiece));

            // Continua verificando novos moinhos no próximo turno
            status.textContent = `Vez de ${currentPlayer}. Continue jogando!`;
        }
    }
}




function opponentPlayer() {
    return currentPlayer === 'red' ? 'blue' : 'red';
}