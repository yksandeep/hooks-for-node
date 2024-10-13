const {useState,useEffect, useContext } = require('../hooks');
const {SomeContext} = require('./context');

const [updateNum,setUpdateNum] = useState(false)

const {num,setNum} = useContext(SomeContext)

useEffect(()=>{
    if(updateNum.value){
        console.log("running useEffect")
        setNum(prev=>prev+1)
    }
},[updateNum])


const someFunction = ()=>{
    console.log("initalized currentNum with value",num.value)
    const [currentNum,setCurrentNum] = useState(num.value)
    
    useEffect(()=>{
        console.log("running this effect because currentNum changed/mounted to/with",currentNum.value)
        console.log({currentNum:currentNum.value})
    },[currentNum])

    useEffect(()=>{
        console.log("running this effect because num changed/mounted to/with",num.value)
        setCurrentNum(num.value)
    },[num])

    console.log("changing num value again")
    setNum(prev=>prev+1)
}

console.log("checking the flag to true to update num using effect")
setUpdateNum(true)
console.log("running a function")
someFunction()
console.log("done with context test")