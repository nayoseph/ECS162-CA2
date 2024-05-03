// Globals, used to track game status and the board/keypad tiles & info
let gameActive = true;
let selectedKeyIndex = null;
let selectedBoardIndex = null;

const boardCells = document.querySelectorAll('.cell');
const keyPadCells = document.querySelectorAll('.number-pad-cell');

// Checks if the game is over (grid is full)
function isGameOver() {
	for (let i = 1; i <= 81; ++i) {
		let cell = document.getElementById("cell-"+i);
		if(cell.textContent === "") {
			return false;
		}
	}
	return true;
}

// Randomly removes 35 elements from a solved board
function remove35(board) {
	let count = 0;
	while(count < 35) {
		let randomCell = Math.floor((Math.random() * 80));
		if(board[randomCell] != "") {
			board[randomCell] = "";
			++count;
		}
	}
}

// Iterates through cells of the sudoku board in HTML and populates it accordingly
function loadBoard(board) {
	for(let i = 1; i <= 81; ++i) {
		if(board[i - 1] == "") {
			continue;
		}
		const cell = document.getElementById("cell-" + i);
		cell.setAttribute("removable", "false");
		cell.textContent = board[i - 1];
	}
}

// Functions run when page is loaded (create board & keypad, initializes the game and attaches event listeners)
document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    createNumberPad();
	restartGame();
    attachEventListeners();
});

// Creates the HTML sudoku board object
function createBoard() {
    let board = document.getElementById("board");
    for(let i = 1; i <= 81; i++) {
        const cell = document.createElement('button');
        cell.className = "cell";
        cell.id = "cell-" + i;
        cell.setAttribute("index", i.toString());
        cell.textContent = "";
        board.appendChild(cell);
    }
}

// Creates and loads the keypad HTML object
function createNumberPad() {
    let numberPad = document.getElementById("number-pad");
    for(let i = 1; i <= 9; ++i) {
        const cell = document.createElement('button');
        cell.className = "number-pad-cell";
        cell.id = "number-pad-cell-" + i;
        cell.setAttribute("index", i.toString());
        cell.textContent = "" + i;
        numberPad.appendChild(cell);
    }
}

// Attaches clicking event listeners to the sudoku board & keypad
function attachEventListeners() {
    const boardCells = document.querySelectorAll('.cell');
    const keyPadCells = document.querySelectorAll('.number-pad-cell');

    boardCells.forEach(cell => {
        cell.addEventListener('click', handleBoardCellClick);
    });
    keyPadCells.forEach(cell => {
        cell.addEventListener('click', handleNumberPadCellClick);
    });
}

// Handler for when a cell within the sudoku board is clicked, handles validation for user's move and executes it
function handleBoardCellClick(boardCellClickEvent) {
	if(!gameActive) {
		return;
	}
	const clickedBoardCell = boardCellClickEvent.target;
    const clickedCellIndex = parseInt(clickedBoardCell.getAttribute('index'));
	const displayText = document.getElementById('display');

	if(selectedKeyIndex == null && clickedBoardCell.textContent == "") {
		displayText.textContent = "You must select a number before selecting a cell";
		return;
	} else if(selectedKeyIndex == null && clickedBoardCell.textContent != "" && clickedBoardCell.getAttribute("removable") != "false") {
		clickedBoardCell.textContent = "";
		return;
	} else if(clickedBoardCell.textContent != "") {
		displayText.textContent = "You must select an empty cell";
		return;
	} else if(validColumn(clickedCellIndex, selectedKeyIndex) && validRow(clickedCellIndex, selectedKeyIndex) && valid3by3Section(clickedCellIndex, selectedKeyIndex)) {
		clickedBoardCell.textContent = "" + selectedKeyIndex;
		displayText.textContent = "";
	}

	if(isGameOver()) {
		gameActive = false;
		displayText.textContent = "Congrats! You won!";
	}

	selectedKeyIndex = null;
	selectedBoardIndex = null;
	document.getElementById('selected-num').textContent = "";
}

// Ensures the user does not place a duplicate number in any one of the 9 3x3 grids
function valid3by3Section(boardCellIndex, keyIndex) {
	let startRowIndex = Math.floor(Math.floor(boardCellIndex / 9) / 3) * 3;
	let startColIndex = Math.floor(((boardCellIndex - 1) % 9) / 3) * 3;
	const displayText = document.getElementById('display');

	for(let row = 0; row < 3; ++row) {
		for(let col = 0; col < 3; ++col) {
			let ind = (startRowIndex + row) * 9 + (startColIndex + col) + 1;
			if(parseInt(document.getElementById('cell-' + ind).textContent) == keyIndex) {
				displayText.textContent = "You can't have multiple of the same number in a 3x3 block";
				return false;
			}
		}
	}
	return true;
}

// Ensures the number the user places is unique in it's respective column
function validColumn(boardCellIndex, keyIndex) {
	let startIndex = ((boardCellIndex - 1) % 9) + 1;
	let displayText = document.getElementById('display');

	for(let cell = startIndex; cell <= 81; cell += 9) {
		if(parseInt(document.getElementById('cell-' + cell).textContent) == keyIndex) {
			displayText.textContent = "You can't have multiple of the same number in a column";
			return false;
		}
	}
	return true;
}

// Ensures the number the user places is unique in it's respective row
function validRow(boardCellIndex, keyIndex) {
	let startIndex = Math.floor(boardCellIndex / 9) * 9;
	let displayText = document.getElementById('display');

	for(let cell = 1; cell <= 9; ++i) {
		if(parseInt(document.getElementById('cell-' + (i + startIndex)).textContent) == keyIndex) {
			displayText.textContent = "You can't have multiple of the same number in a row";
			return false;
		}
	}
	return true;
}

// Handler for when user selects a number from the keypad, stores the selected number
function handleNumberPadCellClick(padCellClickEvent) {
	if(!gameActive) {
		return;
	}
	const clickedKeyPadCell = padCellClickEvent.target;
    const clickedKeyPadIndex = parseInt(clickedKeyPadCell.getAttribute('index'));
	selectedKeyIndex = clickedKeyPadIndex;
	document.getElementById('selected-num').textContent = "Selected number: " + selectedKeyIndex;
	return;
}

// Restarts the game by clearing and reloading the board, as well as re-initializing globals
function restartGame() {
	sudokuBoard = [
		[5, 3, 4, 6, 7, 8, 9, 1, 2],
		[6, 7, 2, 1, 9, 5, 3, 4, 8],
		[1, 9, 8, 3, 4, 2, 5, 6, 7],
		[8, 5, 9, 7, 6, 1, 4, 2, 3],
		[4, 2, 6, 8, 5, 3, 7, 9, 1],
		[7, 1, 3, 9, 2, 4, 8, 5, 6],
		[9, 6, 1, 5, 3, 7, 2, 8, 4],
		[2, 8, 7, 4, 1, 9, 6, 3, 5],
		[3, 4, 5, 2, 8, 6, 1, 7, 9]
	  ];
	let solvedSudoku = sudokuBoard.flat();
	
	remove35(solvedSudoku);
	clearBoard();
	loadBoard(solvedSudoku);
	gameActive = true;
	selectedBoardIndex = null;
	selectedKeyIndex = null;
	let displayText = document.getElementById('display');

	displayText.textContent = "Good Luck!";
}

// Clears the board by emptying text content of each of the sudoku board's cells
function clearBoard() {
	for (let i = 1; i < 82; ++i) {
		let cell = document.getElementById("cell-"+i);
		cell.textContent = "";
	}
}