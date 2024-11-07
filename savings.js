//caso seja necessário guardar codigos temporarianente 


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

function handleCellClick(cell) {
    if (phase === 1 && !cell.innerHTML) {
        placePiece(cell);
    } else if (phase === 2) {
        handleMove(cell);
    }
}
function placePiece(cell) {
    const numSquares = board.length; // número de círculos
    console.log(`Valor atualizado de numSquares: ${numSquares}`);
    // Extrai a posição da célula a partir do id
    const [square, index] = cell.id.split('-').slice(1).map(Number); 
    console.log(`Tentativa de colocar peça: jogador ${currentPlayer}, célula ${cell.id} (square: ${square}, index: ${index})`);

    // Verifica se a posição já está ocupada
    if (board[square][index] !== null) {
        status.textContent = "Essa posição já está ocupada!";
        console.log(`Posição ocupada: square ${square}, index ${index}`);
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
            console.log(`Peça vermelha colocada: square ${square}, index ${index}. Total peças vermelhas: ${redPiecesPlaced}`);
        } else if (currentPlayer === 'blue') {
            cell.style.backgroundColor = 'blue';
            bluePiecesPlaced++; // Incrementa o número de peças para Blue
            board[square][index] = 'blue'; // Atualiza a matriz do tabuleiro
            console.log(`Peça azul colocada: square ${square}, index ${index}. Total peças azuis: ${bluePiecesPlaced}`);
        }

        // Verifica se uma mill foi formada
        

        if (checkForMill(square, index, board, currentPlayer, numSquares)) {
            status.textContent = `${currentPlayer} formou uma mill! Remova uma peça do adversário.`;
            console.log(`Mill formada por ${currentPlayer} em square ${square}, index ${index}`);
            // Inicia o processo de seleção de peça do adversário
            startRemoveOpponentPiece(); // Chame a função de remoção de peça
        } else {
            // Se não formou uma mill, alterna o jogador imediatamente
            togglePlayer();
            console.log(`Jogador alternado. Próximo jogador: ${currentPlayer}`);
        }
    } else {
        status.textContent = `${currentPlayer} já colocou todas as suas peças.`;
        console.log(`Jogador ${currentPlayer} já colocou todas as suas peças. Red: ${redPiecesPlaced}, Blue: ${bluePiecesPlaced}`);
    }

    // Verifica se todos os jogadores colocaram suas peças para iniciar a Fase 2
    if (redPiecesPlaced === maxPieces && bluePiecesPlaced === maxPieces) {
        startMovingPhase(); // Inicia a Fase 2 (movimento de peças)
        console.log(`Início da Fase 2: ambos os jogadores colocaram suas peças. Red: ${redPiecesPlaced}, Blue: ${bluePiecesPlaced}`);
    }
}




function togglePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    status.textContent = `Vez de ${currentPlayer}.`;
    //updatePieceCount(); 
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
function checkForMill(square, index, board, currentPlayer, numSquares) {
    // Obter as linhas possíveis de mills para o círculo e índice dados
    const millLines = getMillLines(square, index, numSquares);

    // Verificar se alguma das linhas é um mill completo
    for (let line of millLines) {
        let isMill = line.every(cell => board[cell.square][cell.index] === currentPlayer);
        if (isMill) {
            return true; // Mill encontrado
        }
    }

    return false; // Nenhum mill encontrado
}
function getMillLines(square, index, numSquares) {
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
        if (index === 0 || index === 6) {
            millLines.push([{ square, index: 0 }, { square, index: 7 }, { square, index: 6 }]);
        }
        if (index === 2 || index === 4) {
            millLines.push([{ square, index: 2 }, { square, index: 3 }, { square, index: 4 }]);
        }

    } else if (index === 1 || index === 3 || index === 5 || index === 7) {
        // 2. Linhas verticais (entre círculos) - apenas conjuntos de 3
        const verticalLine = [];
        for (let s = 0; s < numSquares; s++) {
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

    console.log(`Tentando remover peÃ§a em ${square}-${index}.`);
    console.log(`PeÃ§a do oponente: ${board[square][index]}, Jogador atual: ${currentPlayer}`);

    while(board[square][index] !== opponent) {
        status.textContent = "Tens de escolher uma peÃ§a do adversÃ¡rio para remover!";

    }
    
    if (board[square][index] === opponent) {
        const numSquares = board.length;
        if (checkForMill(square, index, board, opponent, numSquares)) {
            console.log("Peça pertence a um moinho, não pode ser removida.");
            status.textContent = "NÃ£o se pode remover uma peÃ§a de um moinho!";
            return false;
        } else {
            cell.style.backgroundColor = "";
            board[square][index] = null;
            status.textContent = `${opponent} teve uma peÃ§a removida. Vez de ${currentPlayer}.`;
            togglePlayer();
            return true;
        }
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
        const [square, index] = cell.id.split('-').slice(1).map(Number);

        // Verifica se a célula está vazia ou pertence ao jogador atual
        if (board[square][index] === null) {
            status.textContent = "Tens de escolher uma peça do adversário para remover!";
            return; // Retorna imediatamente, sem avançar o turno
        }

        // Tenta remover a peça do adversário e avança o turno somente se for bem-sucedido
        if (removeOpponentPiece(cell)) {
            // Remover os listeners após a remoção bem-sucedida
            cells.forEach(c => c.removeEventListener('click', handleRemovePiece));

            // Retoma o jogo
            status.textContent = `Vez de ${currentPlayer}. Continue jogando!`;
        }
    }
}

function opponentPlayer() {
    return currentPlayer === 'red' ? 'blue' : 'red';
}

function startMovingPhase() {
    phase = 2;
    status.textContent = `Fase de mover peças! Vez de ${currentPlayer}.`;
}
 

function isMoveValid(from, to, numSquares) {
    const playerPieces = board.flat().filter(piece => piece === currentPlayer).length;
    if (playerPieces === 3) return true;

    const adjacentCells = getAdjacentCells(from.square, from.index, numSquares);
    console.log(`Células adjacentes de square: ${from.square}, index: ${from.index}`, adjacentCells);
    console.log(`Tentando mover para square: ${to.square}, index: ${to.index}`);

    return adjacentCells.some(cell => cell.square === to.square && cell.index === to.index);
}


function handleMove(cell) {
    if (phase !== 2) return;

    const [square, index] = cell.id.split('-').slice(1).map(Number);

    if (selectedPiece === null) {
        if (board[square][index] === currentPlayer) {
            selectedPiece = { square, index };
            cell.classList.add('selected');
            status.textContent = `Movendo ${currentPlayer}, selecione uma casa contígua vazia.`;
        } else {
            status.textContent = `Escolha uma de suas peças para mover!`;
        }
    } else {
        const numSquares = board.length;
        if (selectedPiece.square === square && selectedPiece.index === index) {
            cell.classList.remove('selected');
            selectedPiece = null;
            status.textContent = `Seleção cancelada. Escolha uma peça para mover.`;
        } else if (board[square][index] === null && isMoveValid(selectedPiece, { square, index }, numSquares)) {
            movePiece(selectedPiece, { square, index });
            document.getElementById(`cell-${selectedPiece.square}-${selectedPiece.index}`).classList.remove('selected');
            selectedPiece = null;

            // Verifica se um moinho foi formado
            if (checkForMill(square, index, board, currentPlayer, numSquares)) {
                status.textContent = `${currentPlayer} formou uma mill! Remova uma peça do adversário.`;
                startRemoveOpponentPiece(); // Inicia o processo de remoção
                togglePlayer();
            } else {
                togglePlayer(); // Alterna turno somente se nenhum moinho foi formado
            }
        } else {
            status.textContent = `Movimento inválido!`;
        }
    }
}

function startRemoveOpponentPiece() {
    status.textContent = `${currentPlayer} formou um moinho! Selecione uma peça do adversário para remover.`;

    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => cell.addEventListener('click', handleRemovePiece));

    function handleRemovePiece(event) {
        const cell = event.target;
        const [square, index] = cell.id.split('-').slice(1).map(Number);

        if (board[square][index] === null || board[square][index] === currentPlayer) {
            status.textContent = "Tens de escolher uma peça do adversário para remover!";
            return;
        }

        if (removeOpponentPiece(cell)) {
            cells.forEach(c => c.removeEventListener('click', handleRemovePiece));
            togglePlayer();  // Alterna o turno após a remoção bem-sucedida
            status.textContent = `Vez de ${currentPlayer}. Continue jogando!`;
        }
    }
}


function getAdjacentCells(square, index, numSquares) {
    const adjacentCells = [];
    console.log(`Calculando células adjacentes para square: ${square}, index: ${index}`);
    // Adiciona adjacentes com base no índice
    switch (index) {

        // (círculo, 1) e (círculo, 3)
        case 0:
            adjacentCells.push({ square, index: 1 }, { square, index: 7 });
            if (square > 0) adjacentCells.push({ square: square - 1, index });
            if (square < numSquares - 1) adjacentCells.push({ square: square + 1, index });
            break;

        // (círculo, 0), (círculo, 2), (círculo+1, 1) caso exista, (círculo-1, 1) caso exista
        case 1:
            adjacentCells.push({ square, index: 0 }, { square, index: 2 });
            if (square > 0) adjacentCells.push({ square: square - 1, index });
            if (square < numSquares - 1) adjacentCells.push({ square: square + 1, index });
            break;

        case 2:
            // (círculo, 1), (círculo, 7)
            adjacentCells.push({ square, index: 1 });
            adjacentCells.push({ square, index: 3 });
            break;

        case 3:
            // (círculo, 0), (círculo, 4), (círculo+1, 3) caso exista, (círculo-1, 3) caso exista
            adjacentCells.push({ square, index: 2 });
            adjacentCells.push({ square, index: 4 });
            if (square + 1 <= numSquares) {
                adjacentCells.push({ square: square + 1, index: 3 });
            }
            if (square - 1 >= 0) {
                adjacentCells.push({ square: square - 1, index: 3 });
            }
            break;

        case 4:
            // (círculo, 3), (círculo, 5)
            adjacentCells.push({ square, index: 3 });
            adjacentCells.push({ square, index: 5 });
            break;

        case 5:
            // (círculo, 4), (círculo, 6), (círculo+1, 5) caso exista, (círculo-1, 5) caso exista
            adjacentCells.push({ square, index: 4 });
            adjacentCells.push({ square, index: 6 });
            if (square + 1 <= numSquares) {
                adjacentCells.push({ square: square + 1, index: 5 });
            }
            if (square - 1 >= 0) {
                adjacentCells.push({ square: square - 1, index: 5 });
            }
            break;

        case 6:
            // (círculo, 5), (círculo, 7)
            adjacentCells.push({ square, index: 5 });
            adjacentCells.push({ square, index: 7 });
            break;

        case 7:
            // (círculo, 6), (círculo, 2), (círculo+1, 7) caso exista, (círculo-1, 7) caso exista
            adjacentCells.push({ square, index: 6 });
            adjacentCells.push({ square, index: 0 });
            if (square + 1 <= numSquares) {
                adjacentCells.push({ square: square + 1, index: 7 });
            }
            if (square - 1 >= 0) {
                adjacentCells.push({ square: square - 1, index: 7 });
            }
            break;

        default:
            // Caso não reconhecido
            break;
    }
    console.log(`Células adjacentes para square: ${square}, index: ${index}`, adjacentCells);
    return adjacentCells;
}

function movePiece(from, to) {
    // Atualiza o estado do tabuleiro
    board[to.square][to.index] = currentPlayer;
    board[from.square][from.index] = null;

    // Atualiza visualmente as células
    document.getElementById(`cell-${from.square}-${from.index}`).style.backgroundColor = '';
    document.getElementById(`cell-${to.square}-${to.index}`).style.backgroundColor = currentPlayer;

    status.textContent = `Peça movida. Vez de ${opponentPlayer()}`;
    togglePlayer(); // Troca de jogador já está aqui
}

function getCurrentPlayerPieces() {
    // Retorna uma lista das peças do jogador atual
    return board.flatMap((circle, square) => 
        circle.map((piece, index) => 
            piece === currentPlayer ? { square, index } : null
        )
    ).filter(piece => piece !== null);
}

function checkEndGameConditions() {
    const redPieces = getCurrentPlayerPieces('red').length;
    const bluePieces = getCurrentPlayerPieces('blue').length;

    if (redPieces < 3 || bluePieces < 3) {
        status.textContent = `${redPieces < 3 ? 'Red' : 'Blue'} venceu o jogo!`;
        phase = 3; // Finaliza o jogo
    } //else if (isDrawConditionMet()) {
        //status.textContent = "O jogo terminou em empate!";
        //phase = 3;
    //Ss}
}


function removePieceIfValid(cell, possibleRemoves) {
    const [square, index] = cell.id.split('-').slice(1).map(Number);
    const opponent = opponentPlayer();
    if (!Array.isArray(possibleRemoves)) {
        console.error("Erro: possibleRemoves está indefinido ou não é um array.", possibleRemoves);
        return false;
    }

    // Verifica se a peça está entre as possíveis para remoção
    const isRemovable = possibleRemoves.some(
        (removable) => removable.square === square && removable.index === index
    );

    if (!isRemovable) {
        console.log("A peça não está entre as possíveis para remoção.");
        return false;
    }

    // Verifica se a célula selecionada é uma peça do oponente
    if (board[square][index] === opponent) {
        // Remove a peça do tabuleiro
        board[square][index] = null;
        cell.style.backgroundColor = "";  // Remove visualmente a peça do tabuleiro
        clickSound.play();
        console.log(`Peça removida com sucesso: square ${square}, index ${index}.`);
        status.textContent = `Peça removida com sucesso. Vez de ${currentPlayer}.`;
        waitingForRemoval = false;
        console.log("O valor de waitingForRemoval é posto falso:", waitingForRemoval);
        togglePlayer();
        return true;
    } else {
        console.log(`Erro inesperado: entrou no else. board[${square}][${index}] = ${board[square][index]}, opponent = ${opponent}`);
        return false;
    }
}