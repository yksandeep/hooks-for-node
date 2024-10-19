// worker.js
importScripts('../hooks.js'); // Import hooks.js

const [counterState, setCounter] = useState(0);

useEffect(() => {
  console.log("Worker: Counter updated:", counterState.value);
  postMessage({ type: 'counter', value: counterState.value });
}, [counterState]);

self.onmessage = (event) => {
  const { action } = event.data;
  
  if (action === 'increment') {
    setCounter((prev) => prev + 1); // Increment counter
  }
};
