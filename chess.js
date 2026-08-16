const board = document.getElementById("chessBoard");

const pieces = {
    black: {
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        p: "♟"
    },
    white: {
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        p: "♙"
    }
};

let gameBoard = [
    ["br","bn","bb","bq","bk","bb","bn","br"],
    ["bp","bp","bp","bp","bp","bp","bp","bp"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["wp","wp","wp","wp","wp","wp","wp","wp"],
    ["wr","wn","wb","wq","wk","wb","wn","wr"]
];

function createBoard() {
    if (!board) {
        console.error("chessBoard element was not found.");
        return;
    }

    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("chess-square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light-square");
            } else {
                square.classList.add("dark-square");
            }

            const piece = gameBoard[row][col];

            if (piece) {
                const color = piece[0];
                const type = piece[1];

                const pieceElement = document.createElement("span");

                pieceElement.classList.add("chess-piece");

                pieceElement.textContent =
                    color === "w"
                        ? pieces.white[type]
                        : pieces.black[type];

                square.appendChild(pieceElement);
            }

            board.appendChild(square);
        }
    }
}

createBoard();
