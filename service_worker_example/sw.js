importScripts('../hooks.js');

const [taskQueue, setTaskQueue] = useState([]);
const [taskStatus, setTaskStatus] = useState({}); // Track status of tasks
const [isProcessing, setIsProcessing] = useState(false); // Is the queue being processed?

// Effect to handle task queue updates
useEffect(() => {
    postMessage({ type: 'taskQueue', value: taskQueue.value });
}, [taskQueue]);

// Effect to handle task status updates
useEffect(() => {
    postMessage({ type: 'taskStatus', value: taskStatus.value });
}, [taskStatus]);

// Effect to process tasks when a new task is added
useEffect(() => {
    if (!isProcessing.value && taskQueue.value.length > 0) {
        processNextTask();
    }
}, [taskQueue, isProcessing]);

const processNextTask = async () => {
    if (taskQueue.value.length === 0) {
        setIsProcessing(false); // No tasks left to process
        return;
    }

    const task = taskQueue.value[0]; // Get the first task in the queue
    updateTaskStatus(task.id, 'in-progress'); // Set status to in-progress

    await executeTask(task); // Execute the task
    updateTaskStatus(task.id, 'completed'); // Update status to completed
    setTaskQueue(prev => prev.slice(1)); // Remove completed task from queue

    // Process the next task after the current one is done
    processNextTask();
};

const updateTaskStatus = (taskId, status) => {
    setTaskStatus(prev => ({ ...prev, [taskId]: status }));
};

// Simulate executing a task with random processing time
const executeTask = (task) => {
    const processingTime = Math.floor(Math.random() * 2000) + 1000; // Simulated processing time between 1-3 seconds
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, processingTime);
    });
};

// Message listener for incoming commands
self.onmessage = (event) => {
    const { action, task } = event.data;

    if (action === 'addTask') {
        const newTask = { id: Date.now(), ...task }; // Assign unique ID to each task
        setTaskQueue(prev => [...prev, newTask]); // Add task to queue
    }
};
