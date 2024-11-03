const [notifications, setNotifications] = useState([]);
const [notificationsInProcessing, setNotificationsInProcessing] = useState(false); // Is the notification queue being processed?
const [insideSW,setInsideSW] = useState(false);
const [notificationPermission,setNotificationsPermission] = useState(()=>{
    try {
        if("Notification" in window){
            setInsideSW(false)
            return Notification.permission === "granted"
        }
    } catch (error) {
        setInsideSW(true)
        return true
    }
});

function useNotification (){
  
    function checkNotificationPermission(setState) {
        if (!("Notification" in window)) {
          // Check if the browser supports notifications
          if (setState) {
            setState(false);
          }
          return false;
        } else if (Notification.permission === "granted") {
          // Check whether notification permissions have already been granted;
          if (setState) {
            setState(true);
          }
          return true;
          // …
        } else if (Notification.permission !== "denied") {
          // We need to ask the user for permission
          Notification.requestPermission().then((permission) => {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
              if (setState) {
                setState(true);
              }
              return true;
              // …
            }
            if (setState) {
              setState(false);
            }
            return false;
          });
          if (setState) {
            setState(false);
          }
          return false;
        }
      }

    function toggleNotification(){
        if(!notificationPermission.value && !checkNotificationPermission()){
            checkNotificationPermission(setNotificationsPermission)
            return
        }
        setNotificationsPermission(!notificationPermission.value)
    }
    
    function notify(
      message = "Sorry to bother you! Come Checkout some cool stuff we have been building for you",
      tag = "global"
    ) {
      setNotifications((prev) => [...prev, { message, tag }]);
    }
    
    const processNextNotification = () => {
        if (notifications.value.length === 0) {
            setNotificationsInProcessing(false); // No tasks left to process
            return;
        }
        setNotificationsInProcessing(true)
        setNotificationsPermission(notificationPermission.value)
        if(notificationPermission.value) {
            const notification = notifications.value[0]; // Get the first task in the queue
            if(insideSW.value){
                console.error("This hook is not supported for SW")
            }else{
                navigator.serviceWorker.ready.then((myWorker) => {
                    myWorker.showNotification(document.title, {
                        body: notification.message,
                        vibrate: [200, 100, 200, 100, 200, 100, 200],
                        tag:notification.tag,
                    });
                });
            }
        }
        setNotifications(prev => prev.slice(1)); // Remove completed task from queue
        // Process the next task after the current one is done
        processNextNotification();
    };
    
    // Effect to process notification when a new notification is added
    useEffect(() => {
        if (!notificationsInProcessing.value && notifications.value.length > 0) {
            processNextNotification();
        }
    }, [notifications, notificationsInProcessing]);

    return [notificationPermission,notify,toggleNotification]
}
