const { useState, useEffect } = require("../hooks"); // Replace with actual path
const readline = require("readline");

// zoom out from the terminal until you something like generation on top
const gridSize = [100, 200];

// Create the grid with dead cells
const createGrid = (rows, cols) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );
};

// Set the initial pattern
const setInitialPattern = (grid) => {
  const midRow = Math.floor(grid.length / 2);
  const midCol = Math.floor(grid[0].length / 2);

  // Set the starting pattern (cross shape)
  grid[midRow - 1][midCol] = 1; // Cell above the center
  grid[midRow][midCol - 1] = 1; // Cell to the left of the center
  grid[midRow][midCol] = 1; // Cell to the right of the center
  grid[midRow + 1][midCol] = 1; // Cell below the center
  grid[midRow + 1][midCol + 1] = 1; // Cell diagonally below right of the center

  return grid;
};

// Display the grid in the console
const displayGrid = (grid, userInput, generation, aliveCount) => {
  console.log("\x1Bc"); // Clears the screen but preserves the readline input
  console.log(`Generation: ${generation}`); // Show the current generation
  console.log(`Alive: ${aliveCount}`); // Show the current generation

  // Render the grid with extra spacing between rows
  grid.forEach((row, rowIndex) => {
    console.log(row.map((cell) => (cell ? "█" : " ")).join(" "));
    // Add an extra newline after each row except the last one
    if (rowIndex < grid.length - 1) {
      console.log(); // This adds space between rows
    }
  });

  // Render the commands and the current user input
  console.log("\nCommands: 'exit' to quit.");
  console.log(userInput); // Always show the user's input
};

// Count the number of alive neighbors for a given cell at (row, col)
const countAliveNeighbors = (grid, row, col) => {
  // Define the 8 possible neighboring directions around a cell
  const directions = [
    [-1, -1], // top-left
    [-1, 0],  // top-center
    [-1, 1],  // top-right
    [0, -1],  // left
    [0, 1],   // right
    [1, -1],  // bottom-left
    [1, 0],   // bottom-center
    [1, 1],   // bottom-right
  ];

  // Variable to store the count of alive (1) neighbors
  let count = 0;

  // Loop over each direction to check the neighboring cells
  directions.forEach(([dx, dy]) => {
    // Calculate the new coordinates of the neighboring cell
    const newRow = row + dx;
    const newCol = col + dy;

    // Check if the new coordinates are within grid boundaries
    if (
      newRow >= 0 &&                   // Ensure row is not out of bounds (above)
      newRow < grid.length &&           // Ensure row is not out of bounds (below)
      newCol >= 0 &&                   // Ensure column is not out of bounds (left)
      newCol < grid[0].length          // Ensure column is not out of bounds (right)
    ) {
      // If the neighboring cell is alive (1), increment the count
      count += grid[newRow][newCol];
    }
  });

  // Return the total count of alive neighbors
  return count;
};


// Generate the next state of the grid based on Conway's Game of Life rules
const getNextState = (grid, setAliveCount) => {
  const nextGrid = createGrid(grid.length, grid[0].length);

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const aliveNeighbors = countAliveNeighbors(grid, row, col);

      if (grid[row][col] === 1) {
        // Rule 1: Survives with 2 or 3 live neighbors
        // Rule 2: Dies from underpopulation or overpopulation
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
          setAliveCount((prev) => prev - 1);
        }
        nextGrid[row][col] = aliveNeighbors < 2 || aliveNeighbors > 3 ? 0 : 1;
      } else {
        // Rule 3: Dead cell becomes alive with exactly 3 live neighbors
        if (aliveNeighbors === 3) {
          setAliveCount((prev) => prev + 1);
        }
        nextGrid[row][col] = aliveNeighbors === 3 ? 1 : 0;
      }
    }
  }

  return nextGrid;
};

// Start the Game of Life
const startGame = () => {
  const [aliveCount, setAliveCount] = useState(5);
  const [generation, setGeneration] = useState(0);
  const [intervalId, setIntervalId] = useState(undefined);
  const [grid, setGrid] = useState(createGrid(gridSize[0], gridSize[1])); // Initialize an empty grid
  const [userInput, setUserInput] = useState("");
  const [isRunning, setIsRunning] = useState(true);

  // Set the initial pattern when the grid is first created
  useEffect(() => {
    setGrid(setInitialPattern(createGrid(gridSize[0], gridSize[1])));
  }, []);

  // Effect to update grid state
  useEffect(() => {
    if (isRunning.value) {
      setIntervalId(() => {
        return setInterval(() => {
          setGrid((prevGrid) => getNextState(prevGrid, setAliveCount));
          setGeneration((prev) => prev + 1);
        }, 100); // Update interval can be adjusted
      });
    } else if (intervalId.value) {
      clearInterval(intervalId.value);
    }
  }, [isRunning]);

  // Put the terminal in raw mode to capture each key press
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  process.stdin.setRawMode(true);

  useEffect(() => {
    displayGrid(
      grid.value,
      userInput.value,
      generation.value,
      aliveCount.value
    );
  }, [grid, userInput, generation]);

  // Capture key presses
  rl.input.on("keypress", (char, key) => {
    if (key && key.name === "return") {
      if (userInput.value === "exit") {
        console.log("Exiting the game.");
        rl.close();
        clearInterval(intervalId.value);
        process.exit(0);
      } else if (userInput.value === "stop") {
        setIsRunning(false);
      } else if (userInput.value === "restart") {
        setGrid(setInitialPattern(createGrid(gridSize[0], gridSize[1]))); // Reset grid to the initial pattern
        setAliveCount(5);
        setGeneration(0); // Reset generation
      } else if (userInput.value === "start") {
        setIsRunning(true);
      } else {
        console.log("Invalid command. Type 'exit'.");
      }
      setUserInput(""); // Clear user input after command execution
    } else if (
      key &&
      ((key.ctrl && key.name === "c") || key.name === "escape")
    ) {
      rl.close();
      process.exit(0);
    } else if (key && key.name === "backspace") {
      setUserInput((prevInput) => prevInput.slice(0, -1));
    } else {
      setUserInput((prevInput) => prevInput + char);
    }
  });

  rl.on("close", () => {
    process.exit(0);
  });
};

// Run the game
console.log("Welcome to Conway's Game of Life!");
console.log("Type 'exit' to quit.\n");
startGame();