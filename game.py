from time import sleep

class Game:
    def __init__(self):
        self.board = self.create_board()
        self.turn = 'red'  # let red begin
    
    def create_board(self):
        # Initializing the 9x9 board with '-' 
        board = [['-' for _ in range(9)] for _ in range(9)]
        
        # Valid positions where we can play
        self.valid_positions = [(0, 0), (0, 4), (0, 8),
                                (1, 1), (1, 4), (1, 7),
                                (2, 2), (2, 4), (2, 6),
                                (4, 0), (4, 1), (4, 2), (4, 6), (4, 7), (4, 8),
                                (6, 2), (6, 4), (6, 6),
                                (7, 1), (7, 4), (7, 7),
                                (8, 0), (8, 4), (8, 8)]
        
        # Replace valid positions with 'X' to indicate they are playable
        for pos in self.valid_positions:
            board[pos[0]][pos[1]] = 'X'

        return board
    
    def printer(self):
        # Print the board with row and column indices
        print("   " + " ".join([str(i) for i in range(9)]))  # Print column numbers
        
        for idx, row in enumerate(self.board):
            print(f"{idx}  " + " ".join(row))  # Print row number and board content
    
    def make_move(self, row, col):
        # Check if the position is valid to play
        if (row, col) in self.valid_positions and self.board[row][col] == 'X':
            # Place the current player's piece (R or B)
            self.board[row][col] = 'R' if self.turn == 'red' else 'B'
            
            # Remove the position from valid positions
            self.valid_positions.remove((row, col))
            
            # switch turn
            self.turn = 'blue' if self.turn == 'red' else 'red'
        else:
            print("Invalid movement. Choose another position.")
            
    def switch_turn(self):
        self.turn = 'blue' if self.turn == 'red' else 'red'

    def isFinished(self):
        # The game is finished when there are no more valid positions
        return len(self.valid_positions) == 0

    def restart_game(self):
        self.board = self.create_board()  # Recreate the board
        self.turn = 'red'  # Reset the turn to red
        print("The game has been restarted.")

    def play(self):
        while not self.isFinished():
            self.printer()
            
            # Get input for row and col
            try:
                row = int(input(f"It is now {self.turn}'s turn.\nChoose your row (0-8), or -1 to restart: "))
                
                if row == -1:  # Check for restart command
                    self.restart_game()
                    continue  # Skip the rest of the loop to restart

                col = int(input("Choose your column (0-8): "))
                
                # Check if the move is valid
                if (row, col) in self.valid_positions:
                    self.make_move(row, col)
                else:
                    print("Invalid move. Position not valid or already occupied.")
            except ValueError:
                print("Please enter valid integers for row and column.")
                
            sleep(1)
        
        print("\nPhase 1 completed! Final board:")
        self.printer()


game = Game()
game.play()
