// create players via factory function

const createPlayer = function (name, marker) {

    const getName = () => name;
    const getMarker = () => marker;

    return {
        getName,
        getMarker,
    }
}

const player1 = createPlayer("player1", "X")
const player2 = createPlayer("player2", "O")

// create gameboard

const gameboard = (() => {
    const board = Array.from({ length: 3 }, () => Array(3).fill(null));

    function getBoard() {
        return board;
    }

    function placeMarker(player, row, col) {
        if (isValidMove(row, col)) {
            board[row][col] = player.getMarker();
        }
    }

    function isValidMove(row, col) {
        if (row > 2 || col > 2 || row < 0 || col < 0 || board[row][col] !== null) {
            return false;
        }

        return true;
    }

    function resetBoard() {
        for (const row of board) {
            row.fill(null);
        }
    }

    function isWinner(player, row, col) {
        const marker = player.getMarker();
        return isRowWinner(marker, row) || isColWinner(marker, col) || isDiagWinner(marker, row, col)
    }

    function isRowWinner(marker, row) {
        for (const cell of board[row]) {
            if (cell !== marker) {
                return false;
            }
        }

        return true;
    }

    function isColWinner(marker, col) {
        for (const row of board) {
            if (row[col] !== marker) {
                return false;
            }
        }

        return true;
    }

    function isDiagWinner(marker, row, col) {
        // check if diagonal even possible
        // it is only possible if the marker is on the corners or the center
        if (((row == 0 || row == 2) && col == 1)
            || (row == 1 && (col == 0 || col == 2))
        ) {
            return false;
        }

        // determine which diagonal to check based on row and column
        
        // if top left corner or bottom right, check negative diagonal
        if ((row == 0 && col == 0) ||
            (row == 2 && col == 2)
        ) {
            return isNegDiagonal(marker);
        }

        // if top right or bottom left, check positive diagonal
        if ((row == 0 && col == 2) ||
            (row == 2 && col == 0)
        ) {
            return isPosDiagonal(marker);
        }

        // if middle, check both
        if(row == 1 && col == 1) {
            return isNegDiagonal(marker) || isPosDiagonal(marker);
        }
       
    }

    function isNegDiagonal(marker) {
        for (let i = 0; i < 3; i++) {
            if (board[i][i] !== marker) {
                return false;
            }
        }

        return true;
    }

    function isPosDiagonal(marker) {
        for (let i = 0; i < 3; i++) {
            if (board[i][2 - i] !== marker) {
                return false;
            }
        }

        return true;
    }

    return {
        getBoard,
        placeMarker,
        resetBoard,
        isWinner,
    }
})();

const game = (() => {
    
    function playGame() {

        let currentPlayer = player1;

        while (true) {
            let isWinner = playTurn(currentPlayer);
            console.log(gameboard.getBoard());
            if (isWinner) {
                break;
            }
            currentPlayer = currentPlayer === player1 ? player2 : player1;
        }

        console.log(`Player ${currentPlayer.getName()} won!`);
    }

    function playTurn(player, row = null, col = null) {
        console.log(`Make your move ${player.getName()}`);
        if (row === null || col === null) {
            const input = prompt("Enter the row and column of your intended move: ");
            [row, col] = input.split(' ');
        }
        gameboard.placeMarker(player, row, col);
        return gameboard.isWinner(player, row, col);
    }

    return {
        playGame,
        playTurn,
    }

})();

game.playGame();
