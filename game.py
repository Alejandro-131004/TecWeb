class Game:
    def __init__(self):
        self.board = self.create_board()
        self.turn = 'red'  # O jogador vermelho começa
    
    def create_board(self):
        # Inicializar o tabuleiro 9x9 com '-'
        board = [['-' for _ in range(9)] for _ in range(9)]
        
        # Definir as posições válidas onde as peças podem ser colocadas
        self.valid_positions = [(0, 0), (0, 4), (0, 8),
                                (1, 1), (1, 4), (1, 7),
                                (2, 2), (2, 4), (2, 6),
                                (4, 0), (4, 1), (4, 2), (4, 6), (4, 7), (4, 8),
                                (6, 2), (6, 4), (6, 6),
                                (7, 1), (7, 4), (7, 7),
                                (8, 0), (8, 4), (8, 8)]
        
        # Substituir as posições válidas por ' ' para indicar que são jogáveis
        for pos in self.valid_positions:
            board[pos[0]][pos[1]] = ' '

        return board
    
    def display_board(self):
        # Imprimir o tabuleiro no terminal
        for row in self.board:
            print(" ".join(row))
    
    def make_move(self, row, col):
        # Verificar se a posição é válida para jogar
        if self.board[row][col] == ' ':
            # Colocar a peça do jogador atual (R ou B)
            self.board[row][col] = 'R' if self.turn == 'red' else 'B'
            
            # Alternar o turno
            self.turn = 'blue' if self.turn == 'red' else 'red'
        else:
            print("Movimento inválido. Escolha outra posição.")
            
    def play_all_positions(self):
        # Jogar em todas as posições válidas, alternando entre 'R' e 'B'
        for pos in self.valid_positions:
            self.make_move(pos[0], pos[1])

# Exemplo de uso
game = Game()
game.display_board()

print("\nJogando em todas as posições válidas...\n")
game.play_all_positions()
game.display_board()
