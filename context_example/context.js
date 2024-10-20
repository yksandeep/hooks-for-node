const {useState, createContext, useMacroEffect, useEffect, useMicroEffect } = require('../hooks');

const [num,setNum] = useState(1)

useEffect(()=>{
    console.log("changed num value to",num.value)
},[num])

const SomeContext = createContext({num,setNum})

module.exports = {SomeContext}
