let board = [];
let rows = 8;
let cols = 10;
let numMines = 10;
let numMinesFlagged = 0;
let minesCoords = [];
let flagIcon = String.fromCodePoint(0x1F6A9);
let mineIcon = String.fromCodePoint(0x1F4A3);

let numOpenedTiles = 0;

let gameOver = false;

window.onload = function() {
    startGame();
}


function resetVars() {
    gameOver = false;
    board = [];
    numMinesFlagged = 0;
    minesCoords = [];
    numOpenedTiles = 0;
}

function displayBoard() {
    /* Draw the board using the tiles and size of board (dependent on difficulty level) */
    let display = document.getElementById("board")
    display.innerHTML = "";

    let height = 50 * rows;
    let width = 50 * cols;

    document.getElementById("board").style.height = height.toString() + "px";
    document.getElementById("board").style.width = width.toString() + "px";

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            let tile = document.createElement("div");
            tile.className = "tile";
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", flagTile);
            display.append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

function displayNumMines() {
    document.getElementById("num-mines").innerText = numMines;
}

function changeDifficulty(selectObject) {
    let difficulty = selectObject.value;

    if (difficulty === "easy") {
        rows = 8;
        cols = 10;
        numMines = 10;
    } else if (difficulty === "medium") {
        rows = 14;
        cols = 18;
        numMines = 40;
    } else if (difficulty === "hard") {
        rows = 20;
        cols = 24;
        numMines = 99;
    }
    // Restart game every time user changes difficulty
    startGame();
}

function startGame() {
    resetVars();
    displayBoard();
    displayNumMines();
    setMines();
}

function winGame() {
    gameOver = true;
    alert("You won! Play again?");
}

function loseGame() {
    gameOver = true;
    revealMines();
    alert("You lost! Play again?");
}

function setMines() {
    let minesPos = [];

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

function clickTile(event) {
    event.preventDefault();
    let tile = this;

    if (gameOver || this.classList.contains("opened-tile")) {
        return;
    }

    

    if (tile.innerText == flagIcon) {
        // Do not allow tile to be revealed if it is flagged
        return;
    }

    if (minesCoords.includes(tile.id)) {
        loseGame();
        return;
    }

    let coords = tile.id.split("-"); 
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    openTile(r, c);
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
    document.getElementById("num-mines").innerText = Math.max(0, numMines - numMinesFlagged);
}


function revealMines() {
    for (let i = 0; i < minesCoords.length; i++) {
        let mine = minesCoords[i];
        let coords = mine.split("-"); 
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        let tile = board[r][c];

        tile.innerText = mineIcon;
        tile.style.backgroundColor = "red";
    }
}

function openTile(r, c) {
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
        board[r][c].classList.add("tile" + minesFound.toString());
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
                openTile(i, j);
            }
        }
    }

    if (numOpenedTiles == rows * cols - numMines) {
        // document.getElementById("num-mines").innerText = "Cleared";
        winGame();
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