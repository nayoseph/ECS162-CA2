let board = [];
let rows = 8;
let cols = 8;

let minesCount = 5;
let minesLocation = [];  // FIXME

let tilesClicked = 0;

let gameOver = false;

window.onload = function() {
    startGame();
}

function startGame() {
    document.getElementById("mines-count").innerText = minesCount;

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            document.getElementById("board").append(tile);
            tile.addEventListener("click", clickTile);
            row.push(tile);
        }
        board.push(row);
    }

    console.log(board);
}

function clickTile() {

}

function setFlag() {
    
}