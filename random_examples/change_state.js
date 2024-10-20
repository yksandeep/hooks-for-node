const {useState,useMacroEffect,useMicroEffect, useEffect} = require("../hooks")

const [count, setCount] = useState(0)

useMacroEffect(()=>{
    console.log("useMacroEffect because count changed",count.value)
},[count])

useMicroEffect(()=>{
    console.log("useMicroEffect because count changed",count.value)
},[count])

useEffect(()=>{
    console.log("Standard effect because count changed",count.value)
},[count])

const changeState = ()=>{
    while(count.value<10){
        console.log("count changed",count.value+1)
        setCount(prev=>prev+1)
    }
}

changeState()
