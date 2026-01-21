// create players via factory function

const createPlayer = function (name, marker) {

    const getName = () => name;
    const getMarker = () => marker;

    return {
        getName,
        getMarker,
    }
}

// const player1 = createPlayer("Player 1", "X")
// const player2 = createPlayer("Player 2", "O")

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

    let player1 = null;
    let player2 = null;
    let currentPlayer = null;
    let winner = null;
    let draw = false;

    function setPlayer1(player) {
        player1 = player;
        currentPlayer = player1;
    }

    function setPlayer2(player) {
        player2 = player;
    }

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
        setPlayer1,
        setPlayer2,
    }

})();

(() => {
    const playerTurn = document.querySelector("#playerTurn");
    const cellButtons = document.querySelectorAll(".cell");
    const endDialog = document.querySelector("#dialogEnd");
    const endDialogRestartButton = document.querySelector("#dialogRestart");
    const endDialogResult = document.querySelector("#result");
    const startDialog = document.querySelector("#dialogStart");
    const startForm = document.querySelector("#startGameForm");

    startForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(startForm);
        const player1Name = formData.get('player1Name');
        const player2Name = formData.get('player2Name');

        player1 = createPlayer(player1Name, "X");
        player2 = createPlayer(player2Name, "O");

        game.setPlayer1(player1);
        game.setPlayer2(player2);

        startDialog.close();
        render();
    })

    cellButtons.forEach(cell => cell.addEventListener("click", cellClickHandler));

    endDialogRestartButton.addEventListener("click", restartGame)

    function render() {
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

        // check for winner or draw
        const winner = game.getWinner();
        const draw = game.checkDraw();
        if (winner) {
            endDialogResult.innerText = `${winner.getName()} wins!`;
            endDialog.showModal();
            return;
        }

        if (draw) {
            endDialogResult.innerText = "It's a draw!";
            endDialog.showModal();
            return;
        }


    }

    function cellClickHandler(e) {
        const cell = e.currentTarget;
        const { row, col } = cell.dataset;
        game.playTurn(row, col);
        render();
    }

    function restartGame() {
        game.resetGame();
        endDialog.close();
        render();
    }

    startDialog.showModal();

})();
