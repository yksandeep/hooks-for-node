const {useState,useEffect} = require("../hooks")

const [count, setCount] = useState(0)

useEffect(()=>{
    console.log("running this effect because count changed",count.value)
},[count])

console.log("changing count")
setCount(prev=>prev+1)
while(true){
    console.clear()
    console.log("count changed",count.value)
}