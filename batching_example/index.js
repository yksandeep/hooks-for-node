const readline = require('readline');
const { useState, useEffect } = require('../hooks'); // Assuming hooks.js is where your hooks are

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function for terminal-based input
const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

// Test application that demonstrates batching
(async () => {
    const [count, setCount] = useState(0);
    const [text, setText] = useState('initial');

    // Effect that logs count changes and text changes
    useEffect(() => {
        console.log(`\n=== Render: Count changed to ${count.value} ===`);
        console.log(`\n=== Render: Text changed to "${text.value}" ===`);
    }, [count,text]);

    // Ask for input to trigger batching example
    console.log("\nType 'b' to see batching in action with multiple state updates. Logs will be separated by lines for clarity.");

    const input = await askQuestion("Press 'b' to start batching: ");

    if (input === 'b') {
        console.log("\nStarting batching...");

        // Simulating multiple state changes in quick succession (batched together)
        const batchInterval = setInterval(() => {
            console.log("\n--- Updating state ---");

            setCount(prev => prev + 1);
            setText(prev => prev === 'initial' ? 'batched' : 'batched again');
            
            console.log("\nState updates triggered. Effects will batch and log after all updates.");
            console.log("\n-----------------------");
        }, 2000);

        // Automatically stop batching after 3 intervals for the sake of the example
        setTimeout(() => {
            clearInterval(batchInterval);
            console.log("\nBatching complete.\n");
            rl.close(); // Close the readline interface
        }, 7000); // After 7 seconds, stop
    } else {
        console.log("Invalid input. Exiting.");
        rl.close();
    }
})();
