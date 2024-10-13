const { useState, useEffect } = require('./hooks');

// Create a counter state with an initial value of 0
const [count, setCount] = useState(0);

// Create a second state to track the number of times the counter has been incremented
const [incrementCount, setIncrementCount] = useState(0);

// Create a third state to track the number of times the counter has been decremented
const [decrementCount, setDecrementCount] = useState(0);

// Use effect to log the current count whenever it changes
useEffect(() => {
  console.log(`Count changed: ${count.value}`);
}, [count]);

// Use effect to log the number of times the counter has been incremented
useEffect(() => {
  console.log(`Increment count changed: ${incrementCount.value}`);
}, [incrementCount]);

// Use effect to log the number of times the counter has been decremented
useEffect(() => {
  console.log(`Decrement count changed: ${decrementCount.value}`);
}, [decrementCount]);

// Use effect to update the increment count when the counter is incremented
useEffect(() => {
  if (count.value > 0) {
    setIncrementCount(incrementCount.value + 1);
  }
}, [count]);

// Use effect to update the decrement count when the counter is decremented
useEffect(() => {
  if (count.value < 0) {
    setDecrementCount(decrementCount.value + 1);
  }
}, [count]);

// Simulate some state updates
setTimeout(() => setCount(count.value + 1), 1000);
setTimeout(() => setCount(count.value - 1), 2000);
setTimeout(() => setCount(count.value + 2), 3000);
setTimeout(() => setCount(count.value - 2), 4000);

// Log the final state values after 5 seconds
setTimeout(() => {
  console.log(`Final count: ${count.value}`);
  console.log(`Final increment count: ${incrementCount.value}`);
  console.log(`Final decrement count: ${decrementCount.value}`);
}, 5 * 1000);