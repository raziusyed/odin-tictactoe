// create players via factory function

const createPlayer = function (name, marker) {

    const getName = () => name;
    const getMarker = () => marker;

    return {
        getName,
        getMarker,
    }
}

const player1 = createPlayer("Player 1", "X")
const player2 = createPlayer("Player 2", "O")

// create gameboard

const gameboard = (() => {
    const board = Array.from({ length: 3 }, () => Array(3).fill(null));

    function getBoard() {
        return board;
    }

    function placeMarker(player, row, col) {
        if (isValidMove(row, col)) {
            board[row][col] = player.getMarker();
            return true;
        }
        return false;
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
        if (row == 1 && col == 1) {
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

    let currentPlayer = player1;
    let winner = null;

    function setWinner(player) {
        winner = player;
    }

    function getWinner() {
        return winner;
    }

    function getCurrentPlayer() {
        return currentPlayer;
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    function playTurn(row, col) {
        if (!gameboard.placeMarker(currentPlayer, row, col)) {
            return;
        };
        let isWinner = gameboard.isWinner(currentPlayer, row, col);
        if (isWinner) {
            console.log(`${currentPlayer.getName()} wins!`);
            setWinner(currentPlayer);
            return;
        }
        switchPlayer();
    }

    return {
        playTurn,
        getCurrentPlayer,
        getWinner,
    }

})();

(() => {
    const playerTurn = document.querySelector("#playerTurn");
    const cellButtons = document.querySelectorAll(".cell");
    const dialog = document.querySelector("dialog");
    console.log(dialog);
    cellButtons.forEach(cell => cell.addEventListener("click", cellClickHandler));

    function render() {

        // check for winner
        const winner = game.getWinner();
        if (winner) {
            console.log("winner found");
        }

        // clear the board
        cellButtons.forEach(cell => cell.textContent = "");

        // get newest version of board and player turn
        const board = gameboard.getBoard();
        const currentPlayer = game.getCurrentPlayer();

        // Display player's turn
        playerTurn.textContent = `Make your move ${currentPlayer.getName()}!`;

        // update board
        board.forEach((row, r) => row.forEach((cell, c) => {
            cellButtons[r * 3 + c].textContent = cell;
        }))

    }

    function cellClickHandler(e) {
        const cell = e.currentTarget;
        const { row, col } = cell.dataset;
        game.playTurn(row, col);
        render();
    }

    render();

})();
