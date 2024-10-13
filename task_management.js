const { useState, useEffect } = require('./hooks');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [nextId, setNextId] = useState(1);

  const addTask = (description) => {
    setTasks(prev => {
        return [...prev, { id: nextId.value, description, completed: false }]
    });
    setNextId(prev => prev + 1);
  };

  const completeTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ));
  };

  return { tasks, addTask, completeTask };
}

function TaskManagerCLI() {
  const { tasks, addTask, completeTask } = useTasks();
  const [running, setRunning] = useState(true);

  const listTasks = () => {
    console.log('\nCurrent tasks:');
    if (tasks.value.length === 0) {
      console.log('No tasks yet.');
    } else {
      tasks.value.forEach(task => {
        console.log(`${task.id}. [${task.completed ? 'x' : ' '}] ${task.description}`);
      });
    }
  };

  useEffect(() => {
    if (!running.value) {
      console.log('\nFinal state of tasks:');
      listTasks();
      rl.close();
    }
  }, [running]);

  function promptUser() {
    rl.question('\nEnter command (add/complete/list/quit): ', (command) => {
      switch(command.toLowerCase()) {
        case 'add':
          rl.question('Enter task description: ', (description) => {
            addTask(description);
            console.log('Task added successfully.');
            promptUser();
          });
          break;
        case 'complete':
          rl.question('Enter task ID to complete: ', (id) => {
            const taskId = Number(id);
            const task = tasks.value.find(t => t.id === taskId);
            if (task) {
              completeTask(taskId);
              console.log(`Task ${taskId} marked as completed.`);
            } else {
              console.log(`Task with ID ${taskId} not found.`);
            }
            promptUser();
          });
          break;
        case 'list':
          listTasks();
          promptUser();
          break;
        case 'quit':
          setRunning(false);
          break;
        default:
          console.log('Unknown command. Please try again.');
          promptUser();
      }
    });
  }

  return () => {
    console.log('Welcome to the Task Manager CLI!');
    promptUser();
  };
}

// Run the CLI application
const runCLI = TaskManagerCLI();
runCLI();