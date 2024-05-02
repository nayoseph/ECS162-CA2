let board = [];
let rows = 8;
let cols = 8;

let numMines = 5;
let numMinesFlagged = 0;
let minesCoords = [];  // FIXME
let flagIcon = "flag";
let bombIcon = "bomb";

let numOpenedTiles = 0;

let gameOver = false;

window.onload = function() {
    startGame();
}

function startGame() {
    document.getElementById("mines-count").innerText = numMines;
    setMines();

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", openTile);
            tile.addEventListener("contextmenu", flagTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    console.log(board);
}

function setMines() {
    let minesPos = [];

    /* FIXME: generate numbers 1 to minesLeft, index like C arrays -- r = rows * cols / num, c = rows * cols % num?*/
    for (let i = 0; i < numMines; i++) {
        let mine = Math.floor(Math.random() * rows * cols);

        while (minesPos.includes(mine)) {
            mine = Math.floor(Math.random() * rows * cols)
        }

        minesPos.push(mine);
    }

    for (let mine = 0; mine < minesPos.length; mine++) {
        let n = minesPos[mine];
        let r = Math.floor(n / cols);
        let c = n % cols;
        minesCoords.push(r.toString() + "-" + c.toString());
    }
}

function openTile() {
    if (gameOver || this.classList.contains("opened-tile")) {
        return;
    }

    let tile = this;

    if (tile.innerText == flagIcon) {
        // Do not allow tile to be revealed if it is flagged
        return;
    }

    if (minesCoords.includes(tile.id)) {
        gameOver = true;
        revealMines();
        return;
    }

    let coords = tile.id.split("-"); 
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);
}

/* Triggered upon right click (contextmenu event) */
function flagTile(event) {
    // Disable default context menu popup
    event.preventDefault();

    if (gameOver || this.classList.contains("opened-tile")) {
        return;
    }

    let tile = this;
    if (tile.innerText == flagIcon) {
        // unflag
        tile.innerText = "";
        numMinesFlagged--;
    } else if (tile.innerText == "") {
        // flag
        tile.innerText = flagIcon;
        numMinesFlagged++;
    }
    // Update number of mines remaining unflagged
    document.getElementById("mines-count").innerText = Math.max(0, numMines - numMinesFlagged);
}


function revealMines() {
    for (let i = 0; i < minesCoords.length; i++) {
        let coords = tile.id.split("-"); 
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        let tile = board[r][c];
        tile.innerText = bombIcon;
        tile.style.backgroundColor = "red";
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) {
        // Check if out of bounds
        return;
    }

    if (board[r][c].classList.contains("opened-tile")) {
        // Check if tile is already opened
        return;
    }

    // Open the tile
    board[r][c].classList.add("opened-tile");
    numOpenedTiles += 1;

    // Find the number of mines adjacent to the tile
    let minesFound = countMinesAroundTile(r, c);

    if (minesFound > 0) {
        // At least 1 mine adjacent to tile => display the number of mines surrounding it
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        // 0 mines adjacent to tile => blank tile (no text)
        board[r][c].innerText = "";
        
        // Recursively check all the tiles surrounding blank tiles to reveal them all at once
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                if (i == r && j == c) {
                    // Skip the tile itself
                    continue;
                }
                checkMine(i, j);
            }
        }
    }

    /* FIXME: and add animation for game over? */
    if (numOpenedTiles == rows * cols - numMines) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
    }
}

function countMinesAroundTile(r, c) {
    let numMines = 0;

    for (let i = r - 1; i <= r + 1; i++) {
        for (let j = c - 1; j <= c + 1; j++) {
            if (i == r && j == c) {
                // Skip the tile itself
                continue;
            }
            numMines += isTileAMine(i, j);
        }
    }

    return numMines;
}

function isTileAMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) {
        // Check if out of bounds
        return 0;
    }
    return minesCoords.includes(r.toString() + "-" + c.toString());
}