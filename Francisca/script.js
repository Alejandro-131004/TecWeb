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
let movesWithoutMill = 0; // contador de movimentos sem moinho
let lastMillFormedTurn = 0;
let humanColor, computerColor;


/*--------------------------------------------------------------------------------IMPLEMENTAÇÃO DO JOGO--------------------------------------------------------------------------------*/

function startGame(firstPlayer) {
    const numSquares = parseInt(document.getElementById('numSquares').value);

    if (numSquares < 2) {
        status.textContent = "Número inválido. Escolha um número maior que 2.";
        return;
    }

    resetBoard();
    generateBoard(numSquares);

    board = Array.from({ length: numSquares }, () => Array(8).fill(null));

    phase = 1;
    piecesPlaced = 0;
    redPiecesPlaced = 0;
    bluePiecesPlaced = 0;

    currentPlayer = firstPlayer; // Define o jogador inicial
    status.textContent = `Vez de ${firstPlayer.charAt(0).toUpperCase() + firstPlayer.slice(1)}`;

    maxPieces = getNumberOfPieces(numSquares) / 2;
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
        console.log(`Jogador ${currentPlayer} já colocou todas as suas peças. Red: ${redPiecesPlaced}, Blue: ${bluePiecesPlaced} erro`);
    }

    // Verifica se todos os jogadores colocaram suas peças para iniciar a Fase 2
    if (redPiecesPlaced === maxPieces && bluePiecesPlaced === maxPieces) {
        startMovingPhase(); // Inicia a Fase 2 (movimento de peças)
        console.log(`Início da Fase 2: ambos os jogadores colocaram suas peças. Red: ${redPiecesPlaced}, Blue: ${bluePiecesPlaced}`);
    }
}


function checkForMill(square, index, board, currentPlayer, numSquares) {
    // Verifica as possíveis linhas de moinhos e retorna true se encontrar um

    const millLines = getMillLines(square, index, numSquares);

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

    if (board[square][index] !== opponent){
        console.log(`niggggggger 1`);

    }

    if (board[square][index]===null ){
        console.log(`niggggggger 2`);
    }


    while(board[square][index] !== opponent && board[square][index]===null ) {
        status.textContent = "Tens de escolher uma peça do adversário para remover removeOpponentPiece!";
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

        console.log(`niggggggger`);
        // Verifica se a célula está vazia ou pertence ao jogador atual
        if (board[square][index] === null) {
            status.textContent = "Tens de escolher uma peça do adversário para remover! dentro handle";
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
    if (playerPieces === 3) return true; //A função verifica se o jogador possui exatamente três peças em jogo. Se sim, ele pode mover-se para qualquer célula livre, então a função retorna true.

    const adjacentCells = getAdjacentCells(from.square, from.index, numSquares);
    console.log(`Células adjacentes de square: ${from.square}, index: ${from.index}`, adjacentCells);
    console.log(`Tentando mover para square: ${to.square}, index: ${to.index}`);

    return adjacentCells.some(cell => cell.square === to.square && cell.index === to.index);
}

function handleMove(cell) {
    if (phase !== 2) return; // Verifica se a fase é a Fase 2

    const [square, index] = cell.id.split('-').slice(1).map(Number);

    if (selectedPiece === null) {
        // Seleciona a peça caso nenhuma esteja selecionada ainda
        if (board[square][index] === currentPlayer) {
            selectedPiece = { square, index };
            cell.classList.add('selected');
            status.textContent = `Movendo ${currentPlayer}, selecione uma casa contígua vazia.`;
        } else {
            status.textContent = `Escolha uma de suas peças para mover!`;
        }
    } else {
        const numSquares = board.length;

        // Se a mesma célula for clicada novamente, desseleciona a peça
        if (selectedPiece.square === square && selectedPiece.index === index) {
            cell.classList.remove('selected');
            selectedPiece = null;
            status.textContent = `Seleção cancelada. Escolha uma peça para mover.`;
        } 
        // Verifica se a célula é vazia e se o movimento é válido
        else if (board[square][index] === null && isMoveValid(selectedPiece, { square, index }, numSquares)) {
            movePiece(selectedPiece, { square, index });
            document.getElementById(`cell-${selectedPiece.square}-${selectedPiece.index}`).classList.remove('selected');
            selectedPiece = null;

            // Verificar se o movimento formou uma mill
            if (checkForMill(square, index, board, currentPlayer, numSquares)) {
                status.textContent = `${currentPlayer} formou uma mill! Remova uma peça do adversário.`;
                startRemoveOpponentPiece();
            } else {
                // Se não formou uma mill, alterna o jogador
                movesWithoutMill++; // Incrementa o contador de movimentos sem mill
                console.log({ movesWithoutMill }); 
                togglePlayer();
                status.textContent = `Vez de ${currentPlayer}. Continue jogando!`;
            }

            checkEndGameConditions(); // Verifica condições de fim de jogo
            checkForDraw(); // Verifica se há um empate
        } else {
            status.textContent = `Movimento inválido. Escolha uma casa vazia e contígua.`;
        }
    }
}

function getAdjacentCells(square, index, numSquares) {
    const adjacentCells = [];
    console.log(`Calculando células adjacentes para square: ${square}, index: ${index}`);
    // Adiciona adjacentes com base no índice
    switch (index) {
        case 0:
            // (círculo, 1) e (círculo, 7)
            adjacentCells.push({ square, index: 1 });
            adjacentCells.push({ square, index: 7 });
            
            break;

        case 1:
            // (círculo, 0), (círculo, 2), (círculo+1, 1) caso exista, (círculo-1, 1) caso exista
            adjacentCells.push({ square, index: 0 });
            adjacentCells.push({ square, index: 2 });
            if (square + 1 < numSquares) {
                adjacentCells.push({ square: square + 1, index: 1 });
            }
            if (square - 1 >= 0) {
                adjacentCells.push({ square: square - 1, index: 1 });
            }
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

    if (redPieces < 3) {
        status.textContent = "Jogador Blue venceu!";
        endGame();
    } else if (bluePieces < 3) {
        status.textContent = "Jogador Red venceu!";
        endGame();
    }
}

function endGame() {
    phase = 0; // Encerra o jogo
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => cell.removeEventListener('click', handleCellClick));
}

function checkForDraw() {
    const redPieces = board.flat().filter(piece => piece === 'red').length;
    const bluePieces = board.flat().filter(piece => piece === 'blue').length;

    // Empate se ambos tiverem 3 peças e 10 movimentos sem moinho
    if (movesWithoutMill >= 10 || (redPieces === 3 && bluePieces === 3)) {
        status.textContent = "Empate! Jogo terminado.";
        endGame();
    }
}
 

function initializeGame() {
    const alertMessage = document.getElementById("alertMessage");
    alertMessage.style.display = "none";
    // Obtém as configurações do jogo a partir do HTML
    const gameMode = document.getElementById("game-mode").value;
    const firstPlayer = document.getElementById("first-player").value;
    const aiLevel = document.getElementById("ai-level").value;

    console.log("Modo de Jogo:", gameMode);
    console.log("Primeiro Jogador:", firstPlayer);
    console.log("Nível da IA:", aiLevel);

    // Verifica o modo de jogo e inicializa o jogo conforme a escolha
    if (gameMode === "computer") {
        humanColor = firstPlayer; // O jogador humano tem a cor escolhida
        computerColor = (humanColor === "red") ? "blue" : "red"; // O computador assume a cor oposta
        startGameWithAI(computerColor, aiLevel);
    } else {
        startGameTwoPlayers(firstPlayer);
    }
}




// Funções de exemplo para iniciar o jogo
function startGameWithAI(firstPlayer, aiLevel) {
    currentPlayer = firstPlayer;
    startGame(firstPlayer); // Configura o tabuleiro e variáveis

    if (currentPlayer === computerColor) {
        makeRandomMove(); // Computador faz a primeira jogada se for o jogador inicial
    }
}

function togglePlayerAI() {
    currentPlayer = (currentPlayer === 'red') ? 'computer' : 'red';
    status.textContent = `Vez de ${currentPlayer === 'red' ? 'Jogador Humano' : 'Computador'}`;

    // Se for a vez do computador, ele faz uma jogada aleatória
    if (currentPlayer === 'computer') {
        setTimeout(makeRandomMove, 5); // Delay para parecer mais natural
    }
}

function makeRandomMove() {
    const availableMoves = [];
    for (let square = 0; square < board.length; square++) {
        for (let index = 0; index < board[square].length; index++) {
            if (board[square][index] === null) {
                availableMoves.push({ square, index });
            }
        }
    }

    if (availableMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        const { square, index } = availableMoves[randomIndex];
        board[square][index] = computerColor; // Coloca a peça do computador
        document.getElementById(`cell-${square}-${index}`).style.backgroundColor = computerColor;

        if (checkForMill(square, index, board, computerColor, board.length)) {
            status.textContent = "Computador formou um moinho! Removendo uma peça do jogador.";
            removePlayerPieceAI();
        } else {
            togglePlayerAI(); // Alterna para o jogador humano
        }
    }
}

function removePlayerPieceAI() {
    const playerPieces = [];
    for (let square = 0; square < board.length; square++) {
        for (let index = 0; index < board[square].length; index++) {
            if (board[square][index] === humanColor) {
                playerPieces.push({ square, index });
            }
        }
    }

    if (playerPieces.length > 0) {
        const randomIndex = Math.floor(Math.random() * playerPieces.length);
        const { square, index } = playerPieces[randomIndex];
        board[square][index] = null;
        document.getElementById(`cell-${square}-${index}`).style.backgroundColor = '';

        togglePlayerAI(); // Alterna para o jogador humano após remover a peça
        status.textContent = "Vez do jogador humano.";
    }
}

function startGameTwoPlayers(firstPlayer) {
    currentPlayer = firstPlayer; // Define o jogador inicial com base na seleção
    startGame(firstPlayer); // Passa o jogador inicial para a função startGame
    console.log(`Iniciando jogo entre dois jogadores. Primeiro a jogar: ${firstPlayer}`);
}


function viewScores() {
    alert("Visualizando as classificações!");
}



/*-------------------------------------------------------------------------------------------BOTÕES-------------------------------------------------------------------------------------------*/


function openInstructions() {
    document.getElementById("instructionsModal").style.display = "block";
}

function closeInstructions() {
    document.getElementById("instructionsModal").style.display = "none";
}

// Fecha o modal ao clicar fora do conteúdo
window.onclick = function(event) {
    const modal = document.getElementById("instructionsModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Referências para elementos de configuração
const gameModeSelect = document.getElementById("game-mode");
const firstPlayerSelect = document.getElementById("first-player");
const aiLevelSelect = document.getElementById("ai-level");
const startGameButton = document.getElementById("start-game");

// Variáveis de controle
let gameMode = "player"; // Dois jogadores por padrão
let firstPlayer = "red"; // Red inicia por padrão
let aiLevel = "easy"; // Nível de dificuldade da IA, caso seja modo contra o computador

// Ativa ou desativa o nível de IA com base no modo selecionado
gameModeSelect.addEventListener("change", function () {
    gameMode = gameModeSelect.value;
    aiLevelSelect.disabled = gameMode !== "computer";
});

// Captura as outras configurações ao clicar para iniciar o jogo
startGameButton.addEventListener("click", function () {
    firstPlayer = firstPlayerSelect.value;
    aiLevel = aiLevelSelect.value;

    // Inicializa o jogo conforme as configurações
    initializeGame(gameMode, firstPlayer, aiLevel);
});


// Referência ao botão "Desistir do Jogo"
const quitGameButton = document.getElementById("quit-game");

// Adiciona um evento de clique ao botão para desistir do jogo
quitGameButton.addEventListener("click", function () {
    quitGame();
});

// Função para desistir do jogo
function quitGame() {
    const confirmQuit = confirm("Tem certeza de que deseja desistir do jogo?");
    if (confirmQuit) {
        console.log("Jogo finalizado pelo jogador.");
        alert("Você desistiu do jogo.");
        startGame();
        document.getElementById("status").innerText = "Você pode recomeçar o jogo!";
    }
    
}

// Funções para mostrar/ocultar configurações e comandos
function toggleConfig() {
    const configArea = document.getElementById("config-area");
    const alertMessage = document.getElementById("alertMessage");

    const isHidden = configArea.style.display === "none";
    configArea.style.display = isHidden ? "block" : "none";
    
    // Exibe a mensagem no centro do tabuleiro se as configurações estiverem sendo abertas
    if (isHidden) {
        alertMessage.style.display = "block";
    }
}

function toggleCommands() {
    const commands = document.getElementById("commands");
    commands.style.display = commands.style.display === "none" ? "block" : "none";
}


/*--------------------------------------------------------------------------------------IDENTIFICAÇÃO--------------------------------------------------------------------------------------*/


// Função para alternar a área de identificação
function toggleAuth() {
    const authArea = document.getElementById('identification');
    if (authArea.style.display === 'none') {
        authArea.style.display = 'block';
    } else {
        authArea.style.display = 'none';
    }
}

// Função para autenticar o jogador
function authenticateUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Implementar a lógica de autenticação
    alert(`Usuário: ${username}, Senha: ${password}`);
}


function showInstructionContent(topicId) {
    // Oculta todos os conteúdos de instruções
    const contents = document.querySelectorAll('.instruction-text');
    contents.forEach(content => {
        content.style.display = 'none';
    });

    // Mostra o conteúdo selecionado
    const selectedContent = document.getElementById(topicId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
}

function closeAlert() {
    document.getElementById('alertMessage').style.display = 'none';
}
