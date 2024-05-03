window.onload = () => {
    const
        background = document.getElementById("background"),  // Background of the tetris playing field/grid
        scoreLbl = document.getElementById("score"),  // Game score
        linesLbl = document.getElementById("lines"),  // Game lines
        canvas = document.getElementById("game-canvas"),  // Used to draw field/grid
        ctx = canvas.getContext("2d");  // Context

    class Tetromino {
        static COLORS = ["blue", "green", "yellow", "red", "orange", "light-blue", "purple"];  // Block colors
        static BLOCK_SIZE = 28;  // Size of each block (px)
        static DELAY = 400;  // Time taken for the tetromino to move down one block (ms)
        static DELAY_INCREASED = 5;  // Tetromino falling speed increase factor when down arrow is pressed

        constructor(xs, ys, color = null) {
            // Each tetromino is made of 4 blocks
            // x and y are each 1x4 arrays, where (x[0], y[0]), (x[1], y[1]), (x[2], y[2]), (x[3], y[3]) represent the placements of the 4 blocks
            this.x = xs;
            this.y = ys;
            this.length = xs.length;
            // If color is given, set it and fetch the appropriate colored block from resources to put into img
            if (color !== null) {
                this.color = color;
                this.img = new Image();
                this.img.src = `resources/${Tetromino.COLORS[color]}.jpg`
            }
        }

        /* Update context and redraw tetromino */
        update(updFunc) {
            for (let i = 0; i < this.length; ++i) {
                ctx.clearRect(
                    this.x[i] * Tetromino.BLOCK_SIZE,
                    this.y[i] * Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE
                );

                updFunc(i);
            }

            this.draw();
        }

        /* Dynamically display the tetromino on the field */
        draw() {
            if (!this.img.complete) {
                this.img.onload = () => this.draw();
                return;
            }
            // Print the current tetromine
            for (let i = 0; i < this.length; ++i) {
                ctx.drawImage(
                    this.img,
                    this.x[i] * Tetromino.BLOCK_SIZE,
                    this.y[i] * Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE,
                    Tetromino.BLOCK_SIZE
                );
            }
        }

        /* Checks for collisions between the falling tetromino and the field (i.e. already placed tetrominos and the bottom of the playable grid) */
        collides(checkFunc) {
            for (let i = 0; i < this.length; ++i) {
                const { x, y } = checkFunc(i);
                if (x < 0 || x >= FIELD_WIDTH || y < 0 || y >= FIELD_HEIGHT || FIELD[y][x] !== false)
                    return true;
            }
            return false;
        }

        /* Merge blocks of the same color together */
        merge() {
            for (let i = 0; i < this.length; ++i) {
                FIELD[this.y[i]][this.x[i]] = this.color;
            }
        }

        /* Rotate tetromino counterclockwise */
        rotate() {
            const
                maxX = Math.max(...this.x),
                minX = Math.min(...this.x),
                minY = Math.min(...this.y),
                nx = [],
                ny = [];

            if (!this.collides(i => {
                    nx.push(maxX + minY - tetromino.y[i]);
                    ny.push(tetromino.x[i] - minX + minY);
                    return { x: nx[i], y: ny[i] };
                })) {
                this.update(i => {
                    this.x[i] = nx[i];
                    this.y[i] = ny[i];
                });
            }
        }
    }

    const
        FIELD_WIDTH = 10,  // Width of the playing space (in blocks)
        FIELD_HEIGHT = 20,  // Height of the playing space (in blocks)
        FIELD = Array.from({ length: FIELD_HEIGHT }),  // Playing field/grid
        MIN_VALID_ROW = 4,
        /* All possible tetromino configurations -- see https://en.wikipedia.org/wiki/Tetromino for shapes, orientations, & names */
        TETROMINOES = [
            new Tetromino([0, 0, 0, 0], [0, 1, 2, 3]),  // Vertical straight tetromino
            new Tetromino([0, 0, 1, 1], [0, 1, 0, 1]),  // Square tetromino
            new Tetromino([0, 1, 1, 1], [0, 0, 1, 2]),  // L-tetromino (vertically reflected)
            new Tetromino([0, 0, 0, 1], [0, 1, 2, 0]),  // L-tetromino
            new Tetromino([0, 1, 1, 2], [0, 0, 1, 1]),  // Skew tetromino
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 1]),  // T-tetromino
            new Tetromino([0, 1, 1, 2], [1, 1, 0, 0])   // Skew tetromino (vertically reflected)
        ];

    let tetromino = null,
        delay,
        score,
        lines;


    /* Initial setup of game */
    (function setup() {
        /* Draw playing field/grid */
        canvas.style.top = Tetromino.BLOCK_SIZE;
        canvas.style.left = Tetromino.BLOCK_SIZE;

        ctx.canvas.width = FIELD_WIDTH * Tetromino.BLOCK_SIZE;
        ctx.canvas.height = FIELD_HEIGHT * Tetromino.BLOCK_SIZE;

        // Scale background
        const scale = Tetromino.BLOCK_SIZE / 13.83333333333;
        background.style.width = scale * 166;
        background.style.height = scale * 304;

        // Offset each block to the middle of the table width
        const middle = Math.floor(FIELD_WIDTH / 2);
        for (const t of TETROMINOES) t.x = t.x.map(x => x + middle);

        reset();
        draw();
    })();

    /* Reset the game to its original state */
    function reset() {
        // Make false all blocks
        FIELD.forEach((_, y) => FIELD[y] = Array.from({ length: FIELD_WIDTH }).map(_ => false));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        delay = Tetromino.DELAY;
        score = 0;
        lines = 0;
    }

    /* Dynamically display tetrominos and other blocks */
    function draw() {
        if (tetromino) {

            // Collision?
            if (tetromino.collides(i => ({ x: tetromino.x[i], y: tetromino.y[i] + 1 }))) {
                tetromino.merge();
                // Prepare for new tetromino
                tetromino = null;

                // Check for completed rows
                let completedRows = 0;
                for (let y = FIELD_HEIGHT - 1; y >= MIN_VALID_ROW; --y)
                    if (FIELD[y].every(e => e !== false)) {
                        for (let ay = y; ay >= MIN_VALID_ROW; --ay)
                            FIELD[ay] = [...FIELD[ay - 1]];

                        ++completedRows;
                        // Keep the same row
                        ++y;
                    }

                if (completedRows) {
                    // Print againt the table
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (let y = MIN_VALID_ROW; y < FIELD_HEIGHT; ++y) {
                        for (let x = 0; x < FIELD_WIDTH; ++x) {
                            if (FIELD[y][x] !== false) new Tetromino([x], [y], FIELD[y][x]).draw();
                        }
                    }

                    score += [40, 100, 300, 1200][completedRows - 1];
                    lines += completedRows;
                } else {
                    // Check if player has lost
                    if (FIELD[MIN_VALID_ROW - 1].some(block => block !== false)) {
                        // Popup with losing message
                        alert("You have lost!");
                        // Reset the game after some time even if user has not clicked "OK" on the alert popup
                        reset();
                    }
                }


            } else
                tetromino.update(i => ++tetromino.y[i]);  // No collision => continue to move the tetromino down
        }
        // No tetromino failing
        else {

            scoreLbl.innerText = score;
            linesLbl.innerText = lines;

            // Create random tetromino
            tetromino = (({ x, y }, color) =>
                new Tetromino([...x], [...y], color)
            )(
                TETROMINOES[Math.floor(Math.random() * (TETROMINOES.length - 1))],
                Math.floor(Math.random() * (Tetromino.COLORS.length - 1))
            );

            tetromino.draw();
        }

        setTimeout(draw, delay);
    }

    /* Keyboard inputs */
    window.onkeydown = event => {
        switch (event.key) {
            /* Left arrow key: move the tetromino left by 1 block */
            case "ArrowLeft":
                if (!tetromino.collides(i => ({ x: tetromino.x[i] - 1, y: tetromino.y[i] })))
                    tetromino.update(i => --tetromino.x[i]);
                break;
            /* Right arrow key: move the tetromino right by 1 block*/
            case "ArrowRight":
                if (!tetromino.collides(i => ({ x: tetromino.x[i] + 1, y: tetromino.y[i] })))
                    tetromino.update(i => ++tetromino.x[i]);
                break;
            /* Down arrow key: increase the speed at which the tetromino falls by decreasing the delay time for the tetromino to move one block */
            case "ArrowDown":
                // Every time the down arrow is pressed, the delay is decreased by a factor of DELAY_INCREASED (i.e. falling rate is sped up by DELAY_INCREASED times)
                delay = Tetromino.DELAY / Tetromino.DELAY_INCREASED;
                break;
            /* Space bar: rotate the tetromino clockwise by 90 degrees */
            case " ":
                tetromino.rotate();
                break;
        }
    }
    /* Up arrow key: reset the speed at which the tetromino falls if it was previously sped up using the down arrow key */
    window.onkeyup = event => {
        if (event.key === "ArrowDown")
            delay = Tetromino.DELAY;
    }

}