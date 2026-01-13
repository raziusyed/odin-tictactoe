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

    function isBoardFilled() {
        return board.every(row => row.every(cell => cell !== null));
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
        isBoardFilled,
    }
})();

const game = (() => {

    let currentPlayer = player1;
    let winner = null;
    let draw = false;

    function resetGame() {
        gameboard.resetBoard();
        winner = null;
        currentPlayer = player1
        draw = false;
    }

    function getCurrentGameData() {
        return [currentPlayer, gameboard.getBoard()];
    }

    function getWinner() {
        return winner;
    }

    function checkDraw() {
        return draw;
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    }

    function playTurn(row, col) {
        // if player tries to play in a cell that is already taken
        if (!gameboard.placeMarker(currentPlayer, row, col)) {
            return;
        };
        let isWinner = gameboard.isWinner(currentPlayer, row, col);
        if (isWinner) {
            winner = currentPlayer;
            return;
        }

        if (gameboard.isBoardFilled()) {
            draw = true;
            return;
        }
        switchPlayer();
    }

    return {
        playTurn,
        getWinner,
        resetGame,
        getCurrentGameData,
        checkDraw,
    }

})();

(() => {
    const playerTurn = document.querySelector("#playerTurn");
    const cellButtons = document.querySelectorAll(".cell");
    const dialog = document.querySelector("dialog");
    const dialogRestartButton = document.querySelector("#dialogRestart");
    const dialogResult = document.querySelector("#result");

    cellButtons.forEach(cell => cell.addEventListener("click", cellClickHandler));

    dialogRestartButton.addEventListener("click", restartGame)

    function render() {

        // check for winner or draw
        const winner = game.getWinner();
        const draw = game.checkDraw();
        if (winner) {
            dialogResult.innerText = `${winner.getName()} wins!`;
            dialog.showModal();
            return;
        }

        if (draw) {
            dialogResult.innerText = "It's a draw!";
            dialog.showModal();
            return;
        }

        // clear the board
        cellButtons.forEach(cell => cell.textContent = "");

        // get newest version of board and player turn
        const [currentPlayer, board] = game.getCurrentGameData();

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

    function restartGame() {
        game.resetGame();
        dialog.close();
        render();
    }

    render();

})();
