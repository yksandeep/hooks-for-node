const {useState,useEffect, createContext } = require('../hooks');

const [num,setNum] = useState(1)

useEffect(()=>{
    if(num.value!==1){
        console.log("changed num value to",num.value)
    }
},[num])

const SomeContext = createContext({num,setNum})

module.exports = {SomeContext}
