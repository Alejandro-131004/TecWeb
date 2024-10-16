class Game {
    constructor() {
        this.board = this.createBoard();
        this.turn = 'red'; // let red begin
        this.validPositions = [
            [0, 0], [0, 4], [0, 8],
            [1, 1], [1, 4], [1, 7],
            [2, 2], [2, 4], [2, 6],
            [4, 0], [4, 1], [4, 2], [4, 6], [4, 7], [4, 8],
            [6, 2], [6, 4], [6, 6],
            [7, 1], [7, 4], [7, 7],
            [8, 0], [8, 4], [8, 8]
        ];
    }

    createBoard() {
        // Initializing the 9x9 board with '-'
        let board = [];
        for (let i = 0; i < 9; i++) {
            let row = [];
            for (let j = 0; j < 9; j++) {
                row.push('-');
            }
            board.push(row);
        }

        // Replace valid positions with 'X' to indicate they are playable
        for (let pos of this.validPositions) {
            board[pos[0]][pos[1]] = 'X';
        }

        return board;
    }

    printBoard() {
        // Print the board with row and column indices
        console.log("   " + [...Array(9).keys()].join(" ")); // Print column numbers

        for (let i = 0; i < this.board.length; i++) {
            console.log(i + "  " + this.board[i].join(" "));
        }
    }

    makeMove(row, col) {
        // Check if the position is valid to play
        let position = this.validPositions.find(pos => pos[0] === row && pos[1] === col);
        if (position && this.board[row][col] === 'X') {
            // Place the current player's piece ('R' or 'B')
            this.board[row][col] = this.turn === 'red' ? 'R' : 'B';

            // Remove the position from valid positions
            this.validPositions = this.validPositions.filter(pos => pos[0] !== row || pos[1] !== col);

            // Switch turn
            this.turn = this.turn === 'red' ? 'blue' : 'red';
        } else {
            console.log("Invalid movement. Choose another position.");
        }
    }

    isFinished() {
        // The game is finished when there are no more valid positions
        return this.validPositions.length === 0;
    }

    async play() {
        while (!this.isFinished()) {
            this.printBoard();

            // Get input for row and col
            let row = parseInt(prompt(`It is now ${this.turn}'s turn.\nChoose your row (0-8): `));
            let col = parseInt(prompt(`Choose your column (0-8): `));

            if (isNaN(row) || isNaN(col) || row < 0 || row > 8 || col < 0 || col > 8) {
                console.log("Invalid input. Please enter numbers between 0 and 8.");
                continue;
            }

            // Check if the move is valid
            this.makeMove(row, col);

            // Add a slight delay to mimic the sleep in Python
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log("\nGame finished! No more valid positions.");
        this.printBoard();
    }
}

// Create game instance and start
let game = new Game();
game.play();
