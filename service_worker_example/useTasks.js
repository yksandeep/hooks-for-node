

function useTasks({taskStatusParentId,taskQueueParentId}) {
  const [taskQueue, setTaskQueue] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [notifyPermission, notify] = useNotification();


  // Render task queue
  const renderTaskQueue = (tasks) => {
    const taskContainer = document.getElementById(taskQueueParentId);
    if (!taskContainer) return;
    taskContainer.innerHTML = ""; // Reset options

    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className =
        "bg-yellow-100 bg-white shadow-md rounded-md p-4 mb-2 transition-transform transform hover:scale-105";
      taskElement.innerText = `${task.name} (${task.type})`;
      taskContainer.appendChild(taskElement);
    });
  };

  // Render task status
  const renderTaskStatus = (statuses) => {
    const statusContainer = document.getElementById(taskStatusParentId);
    if (!statusContainer) return;

    statusContainer.innerHTML = ""; // Clear existing statuses

    Object.entries(statuses).forEach(([taskId, status]) => {
      const statusElement = document.createElement("div");
      statusElement.className =
        "bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-2 shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl";
      statusElement.innerText = `Task ID: ${taskId} - Status: ${status}`;
      statusContainer.appendChild(statusElement);
    });
  };

  useMicroEffect(() => {
    renderTaskQueue(taskQueue.value);
  }, [taskQueue, taskStatus]);

  useMicroEffect(() => {
    renderTaskStatus(taskStatus.value); // Update the UI for the task status
  }, [taskStatus]);

  function notifyTaskCompletion(task) {
    if(notifyPermission.value){
        notify(`${task.taskId}-${task.status}`,"task")
    }
  }

  return [setTaskQueue, setTaskStatus,notifyTaskCompletion];
}