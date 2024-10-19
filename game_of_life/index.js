const { useState, useEffect } = require("../hooks"); // Replace with actual path
const readline = require("readline");

const gridSize = [30, 60]

// Create the grid with random alive (1) or dead (0) cells
const createGrid = (rows, cols) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.round(Math.random()))
  );
};

// Display the grid in the console
const displayGrid = (grid, userInput) => {
  console.log("\x1Bc"); // Clears the screen but preserves the readline input

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
  console.log(`${userInput}`); // Always show the user's input
};

// Count alive neighbors for a cell
const countAliveNeighbors = (grid, row, col) => {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  let count = 0;

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (
      newRow >= 0 &&
      newRow < grid.length &&
      newCol >= 0 &&
      newCol < grid[0].length
    ) {
      count += grid[newRow][newCol];
    }
  });
  return count;
};

// Generate the next state of the grid based on Conway's Game of Life rules
const getNextState = (grid) => {
  const nextGrid = createGrid(grid.length, grid[0].length);

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const aliveNeighbors = countAliveNeighbors(grid, row, col);
      if (grid[row][col] === 1) {
        // Rule 1: Survives with 2 or 3 live neighbors
        nextGrid[row][col] =
          aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
      } else {
        // Rule 2: Becomes alive with exactly 3 live neighbors
        nextGrid[row][col] = aliveNeighbors === 3 ? 1 : 0;
      }
    }
  }

  return nextGrid;
};

// Start the Game of Life
const startGame = () => {
  const [intervalId, setIntervalId] = useState(undefined); // Initialize a 20x20 grid
  const [grid, setGrid] = useState(createGrid(gridSize[0],gridSize[1])); // Initialize a 20x20 grid
  const [userInput, setUserInput] = useState(""); // State to store the user's input
  const [isRunning, setIsRunning] = useState(true); // State to manage whether the game is running

  // Effect to update grid state
  useEffect(() => {
    if (isRunning.value && !intervalId.value) {
      setIntervalId(() => {
        return setInterval(() => {
          setGrid((prevGrid) => getNextState(prevGrid)); // Update to the next grid state
        }, 150);
      });
    } else {
      clearInterval(intervalId.value);
      setIntervalId(null)
    }
  }, [isRunning]);

  // Put the terminal in raw mode to capture each key press
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  process.stdin.setRawMode(true); // Enables raw mode to capture individual key presses

  useEffect(()=>{
      displayGrid(grid.value, userInput.value); // Display the grid and current user input
  },[grid,userInput])

  // Capture key presses
  rl.input.on("keypress", async (char, key) => {
    // If 'Enter' is pressed, evaluate the input
    if (key && key.name === "return") {
      if (userInput.value === "exit") {
        console.log("Exiting the game.");
        rl.close();
        clearInterval(intervalId.value); // Stop the display loop
        process.exit(0); // Ensure clean exit
      } else if (userInput.value === "stop") {
        setIsRunning(false);
      } else if (userInput.value === "restart") {
        setGrid(createGrid(gridSize[0],gridSize[1]));
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
      // Exit on Ctrl+C or ESC
      rl.close();
      process.exit(0);
    } else if (key && key.name === "backspace") {
      // Remove the last character from userInput
      setUserInput((prevInput) => prevInput.slice(0, -1));
    } else {
      // Otherwise, update userInput state with the pressed key
      setUserInput((prevInput) => prevInput + char);
    }
  });

  rl.on("close", () => {
    process.exit(0); // Ensure the program exits cleanly
  });
};

// Run the game
console.log("Welcome to Conway's Game of Life!");
console.log("Type 'exit' to quit.\n");
startGame();
