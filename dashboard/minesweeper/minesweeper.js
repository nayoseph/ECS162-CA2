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

/* Start a new game on easy (default) difficulty upon first load-in */
window.onload = function() {
    startGame();
}

/* Reset board/mines/other variables -- used for restarting game */
function resetVars() {
    gameOver = false;
    board = [];
    numMinesFlagged = 0;
    minesCoords = [];
    numOpenedTiles = 0;
}

/* Dynamically create all the tile and draw the board */
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

/* Display the total number of mines on the board */
function displayNumMines() {
    document.getElementById("num-mines").innerText = numMines;
}

/* Change the difficulty level of the game (easy, medium, or hard) */
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

/* Start game: reset the vars/board, display the new board and the total number of mines, and generate all mine placements */
function startGame() {
    resetVars();
    displayBoard();
    displayNumMines();
    setMines();
}

/* Called when game is won (all tiles clicked/mines correctly flagged) */
function winGame() {
    gameOver = true;
    document.getElementById("num-mines").innerText = "You won! Play again?";
}

/* Called when game is lost (clicked on a mine) */
function loseGame() {
    gameOver = true;
    revealMines();
    document.getElementById("num-mines").innerText = "You lost! Play again?";
}

/* Generate all mine placements on the board */
function setMines() {
    let minesPos = [];

    for (let i = 0; i < numMines; i++) {
        let mine = Math.floor(Math.random() * rows * cols);

        while (minesPos.includes(mine)) {
            mine = Math.floor(Math.random() * rows * cols);
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

/* Handles clicking on a tile */
function clickTile(event) {
    event.preventDefault();
    let tile = this;

    if (gameOver || this.classList.contains("opened-tile")) {
        // Do nothing if game is already over or user clicked on a tile that is already open
        return;
    }

    if (tile.innerText == flagIcon) {
        // Do not allow tile to be revealed if it is flagged
        return;
    }

    if (minesCoords.includes(tile.id)) {
        // User clicked on a mine
        loseGame();
        return;
    }

    // Open the tile
    let [r, c] = tile.id.split("-"); 
    r = parseInt(r);
    c = parseInt(c);
    openTile(r, c);
}

/* Handles right click on tile (contextmenu event) */
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

/* Display the locations of all the mines on the board (called when game is lost, i.e. user clicks on one mine) */
function revealMines() {
    for (let i = 0; i < minesCoords.length; i++) {
        let mine = minesCoords[i];
        let [r, c] = mine.split("-"); 
        r = parseInt(r);
        c = parseInt(c);
        let tile = board[r][c];

        tile.innerText = mineIcon;
        tile.style.backgroundColor = "red";
    }
}

/* Opens a tile, and all nearby tiles with 0 mines near them */
function openTile(r, c) {
    if (isTileOutOfBounds(r, c)) {
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
        // Game is won when user has clicked on all tiles that are not mines
        winGame();
    }
}

/* Count the number of mines around a given tile */
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

/* Returns 0 if the tile is not a mine, 1 if it is */
function isTileAMine(r, c) {
    if (isTileOutOfBounds(r, c)) {
        // Out-of-bounds "tiles" are not mines
        return 0;
    }
    return minesCoords.includes(r.toString() + "-" + c.toString());
}

/* Returns 0 if tile is not out of bounds, 1 if it is */
function isTileOutOfBounds(r, c) {
    return r < 0 || r >= rows || c < 0 || c >= cols;
}

/* Parse the tile's coordinates (string: r-c) and returns them as an int array ([r, c])*/
// function getTileCoords(tile) {
//     let [r, c] = tile.id.split("-"); 
//     r = parseInt(r);
//     c = parseInt(c);
//     return [r, c];
// }