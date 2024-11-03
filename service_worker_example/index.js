
const [setTaskQueue, setTaskStatus,notifyTaskCompletion] = useTasks({
    taskStatusParentId:"taskStatus",
    taskQueueParentId:"taskQueue",
})

const [notifyPermission,notify,toggleNotification] = useNotification()
const [networkStatus,setNetworkStatus] = useState(navigator.onLine);

attachListnerToWorker((event) => {
    const { type, value } = event.data;
    switch (type) {
        case "taskQueue":
            setTaskQueue(value)
            break;
        case "taskStatus":
            setTaskStatus(value)
            break;
        case "taskCompleted":
            notifyTaskCompletion(value)
            break;
        case "network_status":
            if("online" in value){
                setNetworkStatus(value.online)
            }
            break;
        default:
            break;
    }
})

// Function to add a new task
function addTask() {
    const taskType = document.getElementById("taskType").value;
    const taskName = document.getElementById("taskName").value;

    if (taskName && taskType) {
      MainWorker.postMessage({
        action: "addTask",
        task: { name: taskName, type: taskType },
      });
      document.getElementById("taskName").value = ""; // Clear input
      document.getElementById("taskType").value = ""; // Clear input
    }
};

useEffect(()=>{
    notify(`Your are ${networkStatus.value?"Online":"Offline"}`, "Network Status")
},[networkStatus])

useEffect(()=>{
    MainWorker.postMessage({ action: "setPermission", task:{type:"notification",value:notificationPermission.value}})
},[notificationPermission])

window.onload = () => {
  useEffect(() => {
      document.getElementById("notify").innerText = notificationPermission.value?"Silent Notification":"Notify Me!";
  }, [notificationPermission]);
};