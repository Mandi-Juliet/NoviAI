```javascript
const boardElement = document.getElementById("chessBoard");

const turnDisplay = document.getElementById("turnDisplay");
const statusDisplay = document.getElementById("status");

const newGameButton = document.getElementById("newGameButton");
const undoButton = document.getElementById("undoButton");

const gameMessage = document.getElementById("gameMessage");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const messageButton = document.getElementById("messageButton");

const pieces = {
    white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
    },

    black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
    }
};

let board = [];
let selected = null;
let turn = "white";
let history = [];
let gameOver = false;


/* ================= CREATE BOARD ================= */

function createStartingBoard() {

    return [
        [
            {type:"rook",color:"black"},
            {type:"knight",color:"black"},
            {type:"bishop",color:"black"},
            {type:"queen",color:"black"},
            {type:"king",color:"black"},
            {type:"bishop",color:"black"},
            {type:"knight",color:"black"},
            {type:"rook",color:"black"}
        ],

        [
            {type:"pawn",color:"black"},
            {type:"pawn",color:"black"},
            {type:"pawn",color:"black"},
            {type:"pawn",color:"black"},
            {type:"pawn",color:"black"},
            {type:"pawn",color:"black"},
            {type:"pawn",color:"black"},
            {type:"pawn",color:"black"}
        ],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [null,null,null,null,null,null,null,null],

        [
            {type:"pawn",color:"white"},
            {type:"pawn",color:"white"},
            {type:"pawn",color:"white"},
            {type:"pawn",color:"white"},
            {type:"pawn",color:"white"},
            {type:"pawn",color:"white"},
            {type:"pawn",color:"white"},
            {type:"pawn",color:"white"}
        ],

        [
            {type:"rook",color:"white"},
            {type:"knight",color:"white"},
            {type:"bishop",color:"white"},
            {type:"queen",color:"white"},
            {type:"king",color:"white"},
            {type:"bishop",color:"white"},
            {type:"knight",color:"white"},
            {type:"rook",color:"white"}
        ]
    ];

}


/* ================= DRAW BOARD ================= */

function drawBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];

            if (piece) {

                const pieceElement = document.createElement("span");

                pieceElement.classList.add("piece");

                if (piece.color === "white") {
                    pieceElement.classList.add("white-piece");
                } else {
                    pieceElement.classList.add("black-piece");
                }

                pieceElement.textContent =
                    pieces[piece.color][piece.type];

                square.appendChild(pieceElement);
            }

            square.addEventListener("click", () => {
                handleSquareClick(row, col);
            });

            boardElement.appendChild(square);
        }
    }

    highlightSelected();
}


/* ================= CLICK HANDLER ================= */

function handleSquareClick(row, col) {

    if (gameOver) return;

    if (turn !== "white") return;

    const clickedPiece = board[row][col];

    if (selected === null) {

        if (
            clickedPiece &&
            clickedPiece.color === "white"
        ) {

            selected = {row, col};

            drawBoard();
        }

        return;
    }


    if (
        clickedPiece &&
        clickedPiece.color === "white"
    ) {

        selected = {row, col};

        drawBoard();

        return;
    }


    if (isLegalMove(
        selected.row,
        selected.col,
        row,
        col
    )) {

        savePosition();

        movePiece(
            selected.row,
            selected.col,
            row,
            col
        );

        selected = null;

        turn = "black";

        updateTurn();

        drawBoard();

        if (checkGameEnd("black")) {
            return;
        }

        setTimeout(computerMove, 500);

    }

}


/* ================= HIGHLIGHT ================= */

function highlightSelected() {

    if (!selected) return;

    const squares =
        document.querySelectorAll(".square");

    squares.forEach(square => {

        const row = Number(square.dataset.row);
        const col = Number(square.dataset.col);

        if (
            row === selected.row &&
            col === selected.col
        ) {

            square.classList.add("selected");

        }

        if (
            isLegalMove(
                selected.row,
                selected.col,
                row,
                col
            )
        ) {

            if (board[row][col]) {
                square.classList.add("capture-move");
            } else {
                square.classList.add("valid-move");
            }

        }

    });

}


/* ================= MOVE PIECE ================= */

function movePiece(fromRow, fromCol, toRow, toCol) {

    board[toRow][toCol] =
        board[fromRow][fromCol];

    board[fromRow][fromCol] = null;

}


/* ================= LEGAL MOVE ================= */

function isLegalMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    if (
        fromRow === toRow &&
        fromCol === toCol
    ) {
        return false;
    }

    const piece = board[fromRow][fromCol];

    if (!piece) return false;

    const target = board[toRow][toCol];

    if (
        target &&
        target.color === piece.color
    ) {
        return false;
    }

    const rowDistance =
        Math.abs(toRow - fromRow);

    const colDistance =
        Math.abs(toCol - fromCol);


    /* PAWN */

    if (piece.type === "pawn") {

        const direction =
            piece.color === "white" ? -1 : 1;

        const startingRow =
            piece.color === "white" ? 6 : 1;


        if (
            colDistance === 0 &&
            !target &&
            toRow - fromRow === direction
        ) {

            return true;
        }


        if (
            colDistance === 0 &&
            !target &&
            fromRow === startingRow &&
            toRow - fromRow === direction * 2 &&
            !board[fromRow + direction][fromCol]
        ) {

            return true;
        }


        if (
            colDistance === 1 &&
            toRow - fromRow === direction &&
            target
        ) {

            return true;
        }

        return false;
    }


    /* KNIGHT */

    if (piece.type === "knight") {

        return (
            (rowDistance === 2 && colDistance === 1) ||
            (rowDistance === 1 && colDistance === 2)
        );

    }


    /* KING */

    if (piece.type === "king") {

        return (
            rowDistance <= 1 &&
            colDistance <= 1
        );

    }


    /* ROOK */

    if (piece.type === "rook") {

        if (
            fromRow !== toRow &&
            fromCol !== toCol
        ) {
            return false;
        }

        return pathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );

    }


    /* BISHOP */

    if (piece.type === "bishop") {

        if (rowDistance !== colDistance) {
            return false;
        }

        return pathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );

    }


    /* QUEEN */

    if (piece.type === "queen") {

        const straight =
            fromRow === toRow ||
            fromCol === toCol;

        const diagonal =
            rowDistance === colDistance;

        if (!straight && !diagonal) {
            return false;
        }

        return pathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );

    }

    return false;
}


/* ================= PATH CHECK ================= */

function pathClear(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const rowStep =
        Math.sign(toRow - fromRow);

    const colStep =
        Math.sign(toCol - fromCol);

    let row = fromRow + rowStep;
    let col = fromCol + colStep;

    while (
        row !== toRow ||
        col !== toCol
    ) {

        if (board[row][col]) {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}


/* ================= COMPUTER MOVE ================= */

function computerMove() {

    if (gameOver) return;

    const possibleMoves = [];

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = board[row][col];

            if (
                !piece ||
                piece.color !== "black"
            ) {
                continue;
            }

            for (let targetRow = 0; targetRow < 8; targetRow++) {

                for (let targetCol = 0; targetCol < 8; targetCol++) {

                    if (
                        isLegalMove(
                            row,
                            col,
                            targetRow,
                            targetCol
                        )
                    ) {

                        possibleMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: targetRow,
                            toCol: targetCol
                        });

                    }

                }

            }

        }

    }


    if (possibleMoves.length === 0) {

        endGame(
            "You Win!",
            "NoviAI has no legal moves."
        );

        return;
    }


    /*
        Prefer capturing moves.
    */

    const captures =
        possibleMoves.filter(move =>
            board[move.toRow][move.toCol]
        );


    const moves =
        captures.length > 0
            ? captures
            : possibleMoves;


    const move =
        moves[
            Math.floor(Math.random() * moves.length)
        ];


    movePiece(
        move.fromRow,
        move.fromCol,
        move.toRow,
        move.toCol
    );


    turn = "white";

    updateTurn();

    drawBoard();

    checkGameEnd("white");

}


/* ================= CHECK GAME END ================= */

function checkGameEnd(color) {

    let kingExists = false;

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const piece = board[row][col];

            if (
                piece &&
                piece.type === "king" &&
                piece.color === color
            ) {

                kingExists = true;

            }

        }

    }


    if (!kingExists) {

        if (color === "black") {

            endGame(
                "You Win!",
                "You captured NoviAI's king."
            );

        } else {

            endGame(
                "Game Over",
                "NoviAI captured your king."
            );

        }

        return true;
    }

    return false;
}


/* ================= UPDATE TURN ================= */

function updateTurn() {

    if (turn === "white") {

        turnDisplay.textContent =
            "White's turn";

        statusDisplay.textContent =
            "Your turn.";

    } else {

        turnDisplay.textContent =
            "NoviAI is thinking...";

        statusDisplay.textContent =
            "NoviAI is thinking...";

    }

}


/* ================= SAVE POSITION ================= */

function savePosition() {

    history.push(
        JSON.stringify(board)
    );

}


/* ================= UNDO ================= */

function undoMove() {

    if (history.length === 0) return;

    const previous =
        history.pop();

    board =
        JSON.parse(previous);

    selected = null;

    turn = "white";

    gameOver = false;

    gameMessage.style.display = "none";

    updateTurn();

    drawBoard();

}


/* ================= END GAME ================= */

function endGame(title, text) {

    gameOver = true;

    messageTitle.textContent = title;
    messageText.textContent = text;

    gameMessage.style.display = "flex";

}


/* ================= NEW GAME ================= */

function newGame() {

    board = createStartingBoard();

    selected = null;

    turn = "white";

    history = [];

    gameOver = false;

    gameMessage.style.display = "none";

    updateTurn();

    drawBoard();

}


/* ================= BUTTONS ================= */

newGameButton.addEventListener(
    "click",
    newGame
);

undoButton.addEventListener(
    "click",
    undoMove
);

messageButton.addEventListener(
    "click",
    newGame
);


/* ================= START ================= */

newGame();
```
