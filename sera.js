let board = [
    ["X", "O", "X", null, "O", null, "X", "O"], // Círculo 0
    ["X", "O", "O", null, "X", null, "X", "O"], // Círculo 1
    ["O", "X", "X", null, "O", null, "O", "X"]  // Círculo 2
];
let currentPlayer = "X";
let square = 1; // Círculo 1
let index = 0; // Posição 0 no Círculo 1
let numCircles = 3;


checkForMill(1, 0, board, currentPlayer, numCircles)