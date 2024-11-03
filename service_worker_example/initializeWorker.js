
const [allCallbacks,setAllCallbacks] = useState([])

function attachListnerToWorker(callback){
    setAllCallbacks(prev=>[...prev,callback])
}

const MainWorker = new Worker('sw.js');

MainWorker.onmessage = function(e){
    for (let i = 0; i < allCallbacks.value.length; i++) {
        new Promise(resolve => {
            allCallbacks.value[i](e);
            resolve()
        });
    }
}

