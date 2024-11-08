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
var clickSound;
let waitingForRemoval = false;
let win=false;
let pecas_fora_red;
let pecas_fora_blue;
let aiLevel ;


/*----------------------------------------------------------------------------------COMEÇAR O JOGO----------------------------------------------------------------------------------*/

function initializeGame() {
    clickSound = new sound("sound.wav");
    document.getElementById('quit-game').style.display = 'block';
    document.getElementById('config-area').style.display = 'none';
    
    // Obtém as configurações do jogo a partir do HTML
    let gameMode = document.getElementById("game-mode").value;
    const firstPlayer = document.getElementById("first-player").value;
    aiLevel = document.getElementById("ai-level").value;

    console.log("Modo de Jogo:", gameMode);
    console.log("Primeiro Jogador:", firstPlayer);
    console.log("Nível da IA:", aiLevel);

    // Verifica o modo de jogo e inicializa o jogo conforme a escolha
    if (gameMode === "computer") {
        humanColor = firstPlayer; // O jogador humano tem a cor escolhida
        computerColor = (humanColor === "red") ? "blue" : "red"; // O computador assume a cor oposta
        startGameWithAI(computerColor);
    } else {
        startGameTwoPlayers(firstPlayer);
    }
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
}


/*--------------------------------------------------------------------------------IMPLEMENTAÇÃO DO JOGO--------------------------------------------------------------------------------*/

function startGame(firstPlayer) {
    const numSquares = parseInt(document.getElementById('numSquares').value);
    pecas_fora_red=numSquares*3-1;
    pecas_fora_blue=numSquares*3-1;


    if (numSquares < 2) {
        status.textContent = "Número inválido. Escolha um número maior que 2.";
        return;
    }

    resetBoard();
    generateBoard(numSquares);
    createPieceStorage(numSquares);

    board = Array.from({ length: numSquares }, () => Array(8).fill(null));

    phase = 1;
    piecesPlaced = 0;
    redPiecesPlaced = 0;
    bluePiecesPlaced = 0;

    currentPlayer = firstPlayer; // Define o jogador inicial
    if (win===false){

        status.textContent = `Vez de ${firstPlayer.charAt(0).toUpperCase() + firstPlayer.slice(1)}`;
    }


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
    const maxRadius = 400; // Raio máximo ajustado para o quadrado maior
    

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

function createPieceStorage(numSquares) {
    const pieceStorageElement = document.getElementById('pieceStorage');
    pieceStorageElement.innerHTML = ''; // Limpa peças anteriores

    const piecesPerColumn = 3; // Máximo de peças por coluna
    const bluePieces = numSquares * piecesPerColumn;
    const redPieces = numSquares * piecesPerColumn;

    // Ajustes das posições iniciais
    const blueStartX = 500; // Mais à esquerda
    const redStartX = 1450;  // Mais à direita
    const startY = 700; // Posição vertical inicial

    for (let i = 0; i < bluePieces; i++) {
        const piece = document.createElement('div');
        piece.classList.add('piece', 'blue-piece');
        piece.style.position = 'absolute';

        // Ajuste para organizar da direita para a esquerda
        piece.style.left = `${blueStartX - Math.floor(i / piecesPerColumn) * 40}px`;
        piece.style.top = `${startY + (i % piecesPerColumn) * 40}px`;
        piece.id = `blue-piece-${i}`;
        pieceStorageElement.appendChild(piece);
    }

    for (let i = 0; i < redPieces; i++) {
        const piece = document.createElement('div');
        piece.classList.add('piece', 'red-piece');
        piece.style.left = `${redStartX + Math.floor(i / piecesPerColumn) * 40}px`;
        piece.style.top = `${startY + (i % piecesPerColumn) * 40}px`;
        piece.id = `red-piece-${i}`;
        pieceStorageElement.appendChild(piece);
    }
}

function retirarPeca(cor, indice) {
    const piece = document.getElementById(`${cor}-piece-${indice}`);
    if (piece) {
        piece.style.visibility = 'hidden';
    }
}

// Função para repor uma peça no armazenamento (mostrar a peça novamente)
function reporPeca(cor, indice) {
    const piece = document.getElementById(`${cor}-piece-${indice}`);
    if (piece) {
        console.log(`Repondo a peça: ${cor}-piece-${indice}`);
        piece.style.visibility = 'visible';
    } else {
        console.error(`Peça não encontrada: ${cor}-piece-${indice}`);
    }
}


function handleCellClick(cell) {
    const [square, index] = cell.id.split('-').slice(1).map(Number);
    console.log("O valor de waitingForRemoval handle é:", waitingForRemoval);
    console.log("O valor de phase handle é:", phase);

    // Verificar ocupação diretamente na matriz board
    if (phase === 1 && board[square][index] === null && waitingForRemoval===false) {
        console.log("cond1");
        placePiece(cell);
    } else if (phase === 1 && board[square][index] !== null && waitingForRemoval===true ) {
        console.log("cond2");
        //removePieceIfValid(cell); 
    } else if (phase === 2) {
        console.log("cond3");
        handleMove(cell);
    }
}

function placePiece(cell) {
    const numSquares = board.length; // número de círculos
    const [square, index] = cell.id.split('-').slice(1).map(Number);

    // Verificar se a posição já está ocupada
    if (board[square][index] !== null) {
        status.textContent = "Essa posição já está ocupada!";
        return;
    }

    // Atualizar o tabuleiro com a peça do jogador atual
    if (currentPlayer === 'red' && redPiecesPlaced < maxPieces) {
        cell.style.backgroundColor = 'red';
        redPiecesPlaced++;
        retirarPeca('red',pecas_fora_red );
        pecas_fora_red--;
        board[square][index] = 'red';

    } else if (currentPlayer === 'blue' && bluePiecesPlaced < maxPieces) {
        cell.style.backgroundColor = 'blue';
        bluePiecesPlaced++;
        retirarPeca('blue',pecas_fora_blue );
        console.log("valor de pecas_fora_blue ",pecas_fora_blue);
        pecas_fora_blue--;
        board[square][index] = 'blue';
    }

    // Tocar som ao colocar a peça
    clickSound.play();

    // Verifica se um moinho foi formado
    const isMillFormed = checkForMill(square, index, board, currentPlayer, numSquares);

    // Verificar se é a última jogada de colocação
    const isFinalPlacement = redPiecesPlaced === maxPieces && bluePiecesPlaced === maxPieces;

    
    if (isMillFormed) {
        waitingForRemoval = true;
        // Atualizar o status com a mensagem do moinho
        status.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} formou um moinho! Remova uma peça do adversário.`;

        // Inicia a remoção de peça do oponente
        if (isFinalPlacement) {
            startRemoveOpponentPiece_specialCase();
        } else {
            startRemoveOpponentPiece();
        }
    } else if (isFinalPlacement) {
        if(gameMode === "computer"){
            togglePlayerAI();}
        else{
            togglePlayer();
        }
        // Inicia a fase de movimentação caso nenhum moinho tenha sido formado na última jogada
        startMovingPhase();
    } else {
        // Alterna o jogador caso não seja a última jogada de colocação
        if(gameMode === "computer"){
            togglePlayerAI();}
        else{
            togglePlayer();
        }
    }
}

function togglePlayer() {
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    if(gameMode === "computer"){
        togglePlayerAI()
    }
    if (win===false){
        status.textContent = `Vez de ${currentPlayer}.`;
    }
    
    
    
    
    
    updatePieceCount(); 
}

function togglePlayerAI() {
    // Alternate between 'red' (human) and 'computerColor' (AI)
    if(currentPlayer == computerColor){
        currentPlayer = humanColor
    }
    else{
        currentPlayer = computerColor
    }

    if (win === false) {
        status.textContent = `Vez de ${currentPlayer === 'red' ? 'Jogador Humano' : 'Computador'}.`;
    }

    // If it's the computer's turn, make a random move with a slight delay
    if (currentPlayer === computerColor) {
        setTimeout(makeRandomMove(), 5); // Delay for natural pacing of AI's move
    }

    updatePieceCount();
}


function updatePieceCount() {
    if (win===false){
        status.textContent = `
        Vez de ${currentPlayer}. 
        Red: ${redPiecesPlaced}/${maxPieces} peças colocadas. 
        Blue: ${bluePiecesPlaced}/${maxPieces} peças colocadas.
    `;
    }
    
}


function getNumberOfPieces(numSquares) {
    return 3 * numSquares * 2; // 3*n peças para cada jogador, multiplicado por 2 para dois jogadores
}

function resetBoard() {
    boardElement.innerHTML = '';
    board = [];
}

function checkForMill(square, index, board, currentPlayer, numSquares) {
    if (waitingForRemoval) return false; // Evitar verificar moinho enquanto aguardamos remoção

    const millLines = getMillLines(square, index, numSquares);
    for (let line of millLines) {
        const isMill = line.every(cell => board[cell.square][cell.index] === currentPlayer);
        if (isMill) {
            waitingForRemoval = true;
            return true;
        }
    }
    return false;
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
        if (index === 2 || index === 4 ) {
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
        if (index === 3 || index === 4) {
            millLines.push([{ square, index: 2 }, { square, index: 3 }, { square, index: 4 }]);
        }


    }

    return millLines;
}

// Função para obter todas as peças do adversário que podem ser removidas (não estão em um moinho)
function get_possible_removes(currentPlayer) {
    const opponent = currentPlayer === 'red' ? 'blue' : 'red'; //Se currentPlayer for igual a 'red', então opponent será 'blue'. Caso contrário, opponent será 'red'.
    const possibleRemoves = [];

    board.forEach((square, squareIndex) => {
        square.forEach((cell, cellIndex) => {
            // Verifica se a célula pertence ao oponente e não está em um moinho
            if (cell === opponent && !checkForMill(squareIndex, cellIndex, board, opponent, board.length)) {
                possibleRemoves.push({ square: squareIndex, index: cellIndex });
            }
        });
    });

    // Exibe todos os movimentos possíveis para remoção no console
    console.log("Movimentos possíveis para remoção:", possibleRemoves);
    
    return possibleRemoves;
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
            if (opponent==='blue'){
                pecas_fora_blue++;
                reporPeca('blue',pecas_fora_blue);
                
            }
            else{
                pecas_fora_red++;
                reporPeca('red',pecas_fora_red);
                

            }
        // Remove a peça do tabuleiro
        board[square][index] = null;
        cell.style.backgroundColor = "";  // Remove visualmente a peça do tabuleiro
        clickSound.play();
        
        console.log(`Peça removida com sucesso: square ${square}, index ${index}.`);
        status.textContent = `Peça removida com sucesso. Vez de ${currentPlayer}.`;
        waitingForRemoval = false;
        
        if(phase===2){
            checkEndGameConditions();
        }
        if(gameMode === "computer"){
            togglePlayerAI();}
        else{
            togglePlayer();
        }
        return true;
    } else {
        
        return false;
    }
}


function startRemoveOpponentPiece() {
    const possibleRemoves = get_possible_removes(currentPlayer); // Movimentos possiveis para remoção bla bla
    console.log("Sim, esta merda esta a rodar aqui00");

    // Verifique se há peças para remover
    if (possibleRemoves.length === 0) {
        console.log("Nenhuma peça disponível para remoção.");
        return;
    }
    const cells = boardElement.querySelectorAll('.cell');
    // Função de evento para tentar remover a peça
    function handleRemovePiece(event) {
        const cell = event.target;
        console.log("Sim, esta merda esta a rodar aqui1");
        // Tenta remover a peça e avança o turno apenas se for bem-sucedido
        if (removePieceIfValid(cell, possibleRemoves)) {
            console.log("Sim, esta merda esta a rodar aqui");
            cells.forEach(c => c.removeEventListener('click', handleRemovePiece)); // Remove os listeners de todas as células
            clickSound.play();
            if (win===false){
                status.textContent = `Vez de ${currentPlayer}. Continue jogando!`;
            }
            
        } else {
            console.log("Tens de escolher uma peça do adversário para remover");
            status.textContent = "Tens de escolher uma peça do adversário para remover";
        }
    }

    // Adiciona o evento de clique para todas as células
    cells.forEach(cell => {
        cell.addEventListener('click', handleRemovePiece);
    });
}

function startRemoveOpponentPiece_specialCase() {
    
    const possibleRemoves = get_possible_removes(currentPlayer);

    const cells = boardElement.querySelectorAll('.cell');

    // Define o evento de clique para todas as células
    function handleRemovePiece1(event) {
        const cell = event.target;
        // Tenta remover a peça e avança o turno apenas se for bem-sucedido
        if (removePieceIfValid(cell, possibleRemoves)) {
            // Remove os listeners de todas as células após a remoção bem-sucedida
            cells.forEach(c => c.removeEventListener('click', handleRemovePiece1));
            clickSound.play();
            startMovingPhase();
        }
        else {
            // Mensagem para manter o turno de remoção
            status.textContent = "Tens de escolher uma peça do adversário para remover";
        }
    }

    // Adiciona o listener para remover uma peça do oponente
    cells.forEach(cell => {
        cell.addEventListener('click', handleRemovePiece1);
    });
}

//saber temporariamente o adversário
function opponentPlayer() {
    return currentPlayer === 'red' ? 'blue' : 'red';
}

function startMovingPhase() {
    phase = 2;
    waitingForRemoval = false; 
    status.textContent = `Fase de mover peças! Vez de ${currentPlayer}.`;
}
 
//fase 2 de mover pecas 
function isMoveValid(from, to, numSquares) {
    try {
        const playerPieces = board.flat().filter(piece => piece === currentPlayer).length;
        const playerPieces_opponent = board.flat().filter(piece => piece === opponentPlayer).length;

        // If player has exactly 3 pieces, they can move to any empty cell
        if (playerPieces === 3) {
            if (playerPieces_opponent === 3) {
                console.log("Both players have exactly 3 pieces remaining.");
                movesWithoutMill++;
            }
            return board[to.square][to.index] === null; // Check if target cell is empty
        }

        // For more than 3 pieces, restrict to adjacent cells only
        const adjacentCells = getAdjacentCells(from.square, from.index, numSquares);

        // Check if the target cell is in bounds, adjacent, and empty
        return adjacentCells.some(cell =>
            cell.square === to.square &&
            cell.index === to.index &&
            cell.square >= 0 && cell.square < numSquares && // Check ring bounds
            cell.index >= 0 && cell.index < 8 &&            // Check position within ring
            board[to.square][to.index] === null
        );
    } catch (error) {
        console.error("Invalid move attempt:", error);
        return false; // Out-of-bounds or invalid move
    }
}



function handleMove(cell) {
    if (phase !== 2 || waitingForRemoval) return; // Verifica se estamos na Fase 2

    const [square, index] = cell.id.split('-').slice(1).map(Number);

    if (selectedPiece === null) {
        // Seleciona a peça do jogador se nenhuma peça estiver selecionada
        if (board[square][index] === currentPlayer) {
            selectedPiece = { square, index };
            cell.classList.add('selected');
            status.textContent = `Movendo ${currentPlayer}, selecione uma casa contígua vazia.`;
        } else {
            status.textContent = `Escolha uma de suas peças para mover!`;
        }
    } else {
        const numSquares = board.length;

        // Desseleciona a peça se a mesma célula for clicada novamente
        if (selectedPiece.square === square && selectedPiece.index === index) {
            cell.classList.remove('selected');
            selectedPiece = null;
            status.textContent = `Seleção cancelada. Escolha uma peça para mover.`;
        } 
        // Verifica se o movimento é válido
        else if (board[square][index] === null && isMoveValid(selectedPiece, { square, index }, numSquares)) {
            movePiece(selectedPiece, { square, index });
            document.getElementById(`cell-${selectedPiece.square}-${selectedPiece.index}`).classList.remove('selected');
            selectedPiece = null;

            // Verifica se o movimento formou um moinho
            if (checkForMill(square, index, board, currentPlayer, numSquares)) {
                status.textContent = `${currentPlayer} formou um moinho! Remova uma peça do adversário.`;
                startRemoveOpponentPiece();
                movesWithoutMill = 0;  // Reseta o contador porque um moinho foi formado
            } else {
                // Incrementa o contador apenas se ambos os jogadores tiverem exatamente 3 peças
                const redPieces = board.flat().filter(piece => piece === 'red').length;
                const bluePieces = board.flat().filter(piece => piece === 'blue').length;

                if (redPieces === 3 && bluePieces === 3) {
                    movesWithoutMill++;
                    console.log(`Movimentos sem formar moinho: ${movesWithoutMill}`);
                }

                if(gameMode === "computer"){
                    togglePlayerAI();}
                else{
                    togglePlayer();
                }
                status.textContent = `Vez de ${currentPlayer}. Continue jogando!`;
            }

            // Verifica condições de fim de jogo ou empate
            checkForDraw();
            checkEndGameConditions();
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
    clickSound.play();
    board[to.square][to.index] = currentPlayer;
    board[from.square][from.index] = null;

    // Atualiza visualmente as células
    document.getElementById(`cell-${from.square}-${from.index}`).style.backgroundColor = '';
    document.getElementById(`cell-${to.square}-${to.index}`).style.backgroundColor = currentPlayer;

    status.textContent = `Peça movida. Vez de ${opponentPlayer()}`;
    
}

function getCurrentPlayerPieces(player) {
    return board.flatMap((circle, square) => 
        circle.map((piece, index) => 
            piece === player ? { square, index } : null
        )
    ).filter(piece => piece !== null);
}

function checkEndGameConditions() {
    const redPieces = getCurrentPlayerPieces('red').length;
    const bluePieces = getCurrentPlayerPieces('blue').length;

    if (redPieces < 3) {
        console.log("peças ver:",redPieces);
        win=true;
        status.textContent = "Jogador Blue venceu!";
        endGame(1);
    } else if (bluePieces < 3) {
        console.log("peças azu:",bluePieces);
        win=true;
        status.textContent = "Jogador Red venceu!";
        endGame(2);
    }
}

function endGame(winner) {
    let resultMessage;

    switch (winner) {
        case 0:
            resultMessage = "Empate!";
            break;
        case 1:
            resultMessage = "Vitória do Azul!";
            break;
        case 2:
            resultMessage = "Vitória do Vermelho!";
            break;
        default:
            resultMessage = "Resultado indefinido.";
            break;
    }

    // Display the result message
    alert(resultMessage);
    
    // Show the "quit-game" button and change its text to "Jogar Novamente"
    const quitButton = document.getElementById('quit-game');
    quitButton.style.display = "block";
    quitButton.textContent = "Jogar Novamente";
}

function checkForDraw() {
    const redPieces = board.flat().filter(piece => piece === 'red').length;
    const bluePieces = board.flat().filter(piece => piece === 'blue').length;

    // 1. Verifica se passaram 10 movimentos sem formação de moinho
    if (movesWithoutMill ===10) {
        status.textContent = "Empate! Foram feitas 10 jogadas com 3 peças em cada jogador"
        endGame(0);

    // 2. Verifica se ambos os jogadores não têm jogadas válidas
    const redHasMoves = hasValidMoves('red');
    const blueHasMoves = hasValidMoves('blue');
            
    if (!redHasMoves && !blueHasMoves) {
        status.textContent = "Empate! Ambos os jogadores não têm movimentos válidos.";
        endGame(0);
        return;
    }
        
    }
}

function hasValidMoves(player) {
    const playerPieces = getCurrentPlayerPieces(player);

    for (const piece of playerPieces) {
        const adjacentCells = getAdjacentCells(piece.square, piece.index, board.length);
        // Verifica se há uma célula adjacente vazia para pelo menos uma peça
        if (adjacentCells.some(cell => board[cell.square][cell.index] === null)) {
            return true; // Há pelo menos um movimento válido
        }
    }

    return false; // Nenhum movimento válido encontrado
}

function viewScores() {
    alert("Visualizando as classificações!");
}

function startGameTwoPlayers(firstPlayer) {
    currentPlayer = firstPlayer; // Define o jogador inicial com base na seleção
    startGame(firstPlayer); // Passa o jogador inicial para a função startGame
    console.log(`Iniciando jogo entre dois jogadores. Primeiro a jogar: ${firstPlayer}`);
}

/*-------------------------------------------------------------------------------------------AI-------------------------------------------------------------------------------------------*/

// Funções de exemplo para iniciar o jogo
function startGameWithAI(firstPlayer) {
    currentPlayer = firstPlayer;
    startGame(firstPlayer); // Configura o tabuleiro e variáveis

     makeRandomMove(); // Computador faz a primeira jogada se for o jogador inicial
    
}
function placePieceAI({ square, index, cell }) {
    if (!cell) {
        console.error("Cell element not found");
        return;
    }

    const numSquares = board.length;

    // Place the computer's piece and update the cell visually
    if (computerColor === 'red' && redPiecesPlaced < maxPieces) {
        cell.style.backgroundColor = 'red';
        redPiecesPlaced++;
        retirarPeca('red', pecas_fora_red);
        pecas_fora_red--;
        board[square][index] = 'red';
    } else if (computerColor === 'blue' && bluePiecesPlaced < maxPieces) {
        cell.style.backgroundColor = 'blue';
        bluePiecesPlaced++;
        retirarPeca('blue', pecas_fora_blue);
        pecas_fora_blue--;
        board[square][index] = 'blue';
    }

    // Check if a mill was formed
    const isMillFormed = checkForMill(square, index, board, computerColor, numSquares);

    // Check if it's the final placement move
    const isFinalPlacement = redPiecesPlaced === maxPieces && bluePiecesPlaced === maxPieces;

    if (isMillFormed) {
        waitingForRemoval = true;
        status.textContent = "Computador formou um moinho! Removendo uma peça do jogador.";
        removePlayerPieceAI(); // Automatically remove a player piece for AI
    } else if (isFinalPlacement) {
        // If final placement move, start moving phase and toggle to player
        startMovingPhase();
        togglePlayerAI();
    } else {
        // Toggle to the human player after the AI's move
        togglePlayerAI();
    }
}


// Modified `makeRandomMove` to select a random move and pass it to `placePieceAI`
function makeRandomMove() {
    const availableMove = availableMoves();  // Get the next valid move (this should already return an object with selectedPiece and move)
    difficulty = aiLevel
    if (availableMove) {
        const { selectedPiece, move } = availableMove;  // Destructure the available move
        const { square, index } = move;
            const cell = document.getElementById(`cell-${square}-${index}`);        
        // Perform the move
        if (phase === 1) {
            if (checkForMill(square, index, board, computerColor, board.length)) {
                status.textContent = "Computador formou um moinho! Removendo uma peça do jogador.";
                removePlayerPieceAI();}
            else{
            placePieceAI({ square, index, cell });  // Handle placing the piece for Phase 1
            }
        } else {
            handleMoveAI(selectedPiece, cell);  // Handle movement for Phase 2 or 3
        }
    }
}

function handleMoveAI(selectedPiece,cell) {
    // Ensure we're in Phase 2 (Movement phase) and not waiting for removal
    if (phase !== 2 || waitingForRemoval) return;
    
    const [square, index] = cell.id.split('-').slice(1).map(Number);
    
    // Validate that `selectedPiece` exists and `cell` is a valid target
    if (selectedPiece && board[square] && board[square][index] === null) {
        movePiece(selectedPiece, { square, index });
        
        // Clear the selected class from the previous piece
        document.getElementById(`cell-${selectedPiece.square}-${selectedPiece.index}`).classList.remove('selected');
        selectedPiece = null;

        // Check if the move forms a mill
        if (checkForMill(square, index, board, currentPlayer, board.length)) {
            if(currentPlayer === humanColor){
            status.textContent = `${currentPlayer} formou um moinho! Remova uma peça do adversário.`;
            startRemoveOpponentPiece();}
            else{
                removePlayerPieceAI();
            }
            movesWithoutMill = 0;  // Reset the counter because a mill was formed
        } else {
            // Track moves if both players have exactly 3 pieces
            const redPieces = board.flat().filter(piece => piece === 'red').length;
            const bluePieces = board.flat().filter(piece => piece === 'blue').length;

            if (redPieces === 3 && bluePieces === 3) {
                movesWithoutMill++;
                console.log(`Movimentos sem formar moinho: ${movesWithoutMill}`);
            }

            // Toggle player or switch to AI depending on game mode
            if (gameMode === "computer") {
                togglePlayerAI(); // Switch to AI's turn
                setTimeout(makeRandomMove, 1000); // Make AI move after a short delay
            } else {
                togglePlayer(); // Normal player turn switching
            }

            status.textContent = `Vez de ${currentPlayer}. Continue jogando!`;
        }

        // Check for game-ending conditions
        checkForDraw();
        checkEndGameConditions();
    } else {
        console.warn("Invalid move or no piece selected for AI.");
    }
}




function availableMoves() {
    const availableMoves = [];
    const computerPieces = [];
    let possibleMoves = [];

    // Define total number of squares for bounds checking
    const numSquares = board.length;

    if (phase === 1) {
        // Phase 1: Look for empty cells on the board
        for (let square = 0; square < numSquares; square++) {
            for (let index = 0; index < board[square].length; index++) {
                if (board[square][index] === null) { // Only add if cell is empty
                    availableMoves.push({ square, index });
                }
            }
        }
    } else if (phase === 2 || phase === 3) {
        // Phase 2 or 3: Find all computer's pieces and check adjacent cells for valid moves
        for (let square = 0; square < numSquares; square++) {
            for (let index = 0; index < board[square].length; index++) {
                if (board[square][index] === computerColor) {
                    computerPieces.push({ square, index });
                }
            }
        }

        // For each computer piece, find valid adjacent moves
        for (let piece of computerPieces) {
            possibleMoves = getAdjacentCells(piece.square, piece.index, numSquares);

            for (let move of possibleMoves) {
                const { square, index } = move;

                // Check that the destination cell is within bounds and empty
                if (
                    square >= 0 && square < numSquares &&
                    index >= 0 && index < board[square].length &&
                    isMoveValid(piece, move, numSquares) &&
                    board[square][index] === null
                ) {
                    // For medium difficulty, check if move creates a mill sometimes
                    if (difficulty === 'medium' && Math.random() < 0.5) {
                        if (checkForMill(square, index, board, computerColor, numSquares)) {
                            return { selectedPiece: piece, move: { square, index }}; // Return immediately if a mill is formed
                        } else {
                            availableMoves.push({ piece, square, index, createsMill: false });
                        }
                    } 
                    // For hard difficulty, always check if move creates a mill
                    else if (difficulty === 'hard' && checkForMill(square, index, board, computerColor, numSquares)) {
                        return { selectedPiece: piece, move: { square, index } }; // Return immediately if a mill is formed
                    } 
                    // If no mill creation is considered, just add the move
                    else {
                        availableMoves.push({ piece, square, index, createsMill: false });
                    }
                }
            }
        }
    }

    // If there are valid moves available, select a random one
    if (availableMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        const { piece, square, index } = availableMoves[randomIndex];

        return { selectedPiece: piece, move: { square, index } };
    }

    return null;  // No valid moves available
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

// Lógica para quando o computador precisar remover uma peça do oponente
function computerRemoveOpponentPiece() {
    const possibleRemoves = get_possible_removes(currentPlayer);
    if (possibleRemoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * possibleRemoves.length);
        const { square, index } = possibleRemoves[randomIndex];
        const cell = document.querySelector(`#cell-${square}-${index}`);

        // Tenta remover a peça do oponente (usando removeOpponentPiece) e valida a remoção
        if (removeOpponentPiece(cell)) {
            console.log("Computador removeu uma peça válida.");
        } else {
            console.log("Erro: Computador tentou remover uma peça inválida.");
        }
    } else {
        console.log("Nenhuma peça disponível para remoção.");
    }
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
    const quitButton = document.getElementById('quit-game');
    
    // Check if the button is in "Jogar Novamente" mode
    if (quitButton.textContent === "Jogar Novamente") {
        const confirmRestart = confirm("Deseja jogar novamente com as mesmas configurações?");
        if (confirmRestart) {
            console.log("O jogador optou por reiniciar o jogo.");
            alert("O jogo reiniciou");

            document.getElementById("config-area").style.display = "block";
            quitButton.style.display = "none";
            quitButton.textContent = "Desistir do Jogo";
            document.getElementById("status").innerText = "Você pode recomeçar o jogo!";
            generateBoard(numSquares);
        
        }
    } else {
        // Execute a função original de "Desistir do Jogo"
        console.log("sjdhbs");
        const confirmQuit = confirm("Tem certeza de que deseja desistir do jogo?");
        if (confirmQuit) {
            console.log("Jogo finalizado pelo jogador.");
            alert("Você desistiu do jogo.");
            document.getElementById("config-area").style.display = "block";
            quitButton.style.display = "none";
            quitButton.textContent = "Desistir do Jogo";
            document.getElementById("status").innerText = "Você pode recomeçar o jogo!";
            generateBoard(numSquares);
        }
    }
}

// Funções para mostrar/ocultar configurações e comandos
function toggleConfig() {
    const configArea = document.getElementById("config-area");
    const isHidden = configArea.style.display === "none";
    configArea.style.display = isHidden ? "block" : "none";
    
    document.getElementById("quit-game").style.display="none";

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

// Função para autenticar o jogador e exibir o menu de configurações
function authenticateUser(event) {
    event.preventDefault(); // Impede o envio real do formulário

    // Oculta a área de identificação e exibe as configurações de jogo
    document.getElementById('identification').style.display = 'none';
    document.getElementById('config-area').style.display = 'block';

    // Atualiza o status para "Configurações de Jogo"
    document.getElementById('status').textContent = "Configurações de Jogo";
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
