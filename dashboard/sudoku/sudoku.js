let gameActive = true;
let selectedKeyIndex = null;
let selectedBoardIndex = null;

const boardCells = document.querySelectorAll('.cell');
const keyPadCells = document.querySelectorAll('.number-pad-cell');
let solvedSudoku = [5, 3, 4, 6, 7, 8, 9, 1, 2, 
	6, 7, 2, 1, 9, 5, 3, 4, 8, 
	1, 9, 8, 3, 4, 2, 5, 6, 7, 
	8, 5, 9, 7, 6, 1, 4, 2, 3, 
	4, 2, 6, 8, 5, 3, 7, 9, 1, 
	7, 1, 3, 9, 2, 4, 8, 5, 6, 
	9, 6, 1, 5, 3, 7, 2, 8, 4, 
	2, 8, 7, 4, 1, 9, 6, 3, 5, 
	3, 4, 5, 2, 8, 6, 1, 7, 9];

remove60(solvedSudoku);

function isGameOver() {
	for (let i = 1; i < 82; ++i) {
		let cell = document.getElementById("cell-"+i);
		if(cell.textContent === "") {
			return false;
		}
	}
	return true;
}

function remove60(board) {
	let count = 0;
	while(count < 50) {
		let randomCell = Math.floor((Math.random() * 80) + 1);
		if(board[randomCell] != "") {
			board[randomCell] = "";
			++count;
		}
	}
}

function loadBoard(board) {
	for(let i = 1; i < 82; ++i) {
		if(board[i] == "") {
			continue;
		}
		const cell = document.getElementById("cell-" + i);
		cell.setAttribute("removable", "false");
		cell.textContent = board[i];
	}
}

document.addEventListener('DOMContentLoaded', () => {
    createBoard();
	loadBoard(solvedSudoku);
    createNumberPad();
    attachEventListeners();
});

function createBoard() {
    let board = document.getElementById("board");
    for(let i = 1; i < 82; i++) {
        const cell = document.createElement('button');
        cell.className = "cell";
        cell.id = "cell-" + i;
        cell.setAttribute("index", i.toString());
        cell.textContent = "";
        board.appendChild(cell);
    }
}

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

function handleBoardCellClick(boardCellClickEvent) {
	console.log("board click");
	const clickedBoardCell = boardCellClickEvent.target;
    const clickedCellIndex = parseInt(clickedBoardCell.getAttribute('index'));
	const displayText = document.getElementById('display');

	if(selectedKeyIndex == null && clickedBoardCell.textContent == "") {
		displayText.textContent = "You must select a number before selecting a cell";
		return;
	} else if(selectedKeyIndex == null && clickedBoardCell.textContent != "" && clickedBoardCell.getAttribute("removable") != false) {
		clickedBoardCell.textContent = "";
	}else if(clickedBoardCell.textContent != "") {
		displayText.textContent = "You must select an empty cell";
		return;
	} else if(validColumn(clickedCellIndex, selectedKeyIndex) && validRow(clickedCellIndex, selectedKeyIndex) && valid3by3Section(clickedCellIndex, selectedKeyIndex)) {
		clickedBoardCell.textContent = "" + selectedKeyIndex;
		displayText.textContent = "";
	} else {
		displayText.textContent = "The number you selected breaks the rules of Sudoku.";
	}
	selectedKeyIndex = null;
	selectedBoardIndex = null;
}

function valid3by3Section(boardCellIndex, keyIndex) {
	// TODO: FIX
	return true;
}

function validColumn(boardCellIndex, keyIndex) {
	// TODO: FIX
	let startIndex = boardCellIndex % 9;
	let displayText = document.getElementById('display');

	for(let i = startIndex; i < 82; i += 9) {
		if(parseInt(document.getElementById('cell-' + i).textContent) == keyIndex) {
			displayText.textContent = "You can't have multiple of the same number in a column";
			return false;
		}
	}
	return true;
}

function validRow(boardCellIndex, keyIndex) {
	// TODO: FIX
	let startIndex = Math.floor(boardCellIndex / 9) * 9 + 1;
	let displayText = document.getElementById('display');

	for(let i = 0; i < 9; ++i) {
		if(parseInt(document.getElementById('cell-' + (i + startIndex)).textContent) == keyIndex) {
			displayText.textContent = "You can't have multiple of the same number in a row";
			return false;
		}
	}

	return true;
}

function handleNumberPadCellClick(padCellClickEvent) {
	console.log("board click");
	const clickedKeyPadCell = padCellClickEvent.target;
    const clickedKeyPadIndex = parseInt(clickedKeyPadCell.getAttribute('index'));
	selectedKeyIndex = clickedKeyPadIndex;
	console.log(selectedKeyIndex)
	return;
}

function restartGame() {
	clearBoard();
	selectedBoardIndex = null;
	selectedKeyIndex = null;
	console.log("game restarted");
}

function clearBoard() {
	for (let i = 1; i < 82; ++i) {
		let cell = document.getElementById("cell-"+i);
		cell.textContent = "";
	}
	console.log("board cleared");
}