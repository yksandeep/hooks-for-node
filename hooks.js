const stateMap = new WeakMap(); 
const effectMap = new WeakMap();
const contextMap = new WeakMap();

const isEqual = (item1,item2)=>{
  let compareItem1 = item1;
  let compareItem2 = item2;
  try{
    if(item1 && typeof item1 === "object"){
      compareItem1 = JSON.stringify(item1);
    }
    if(item2 && typeof item2 === "object"){
      compareItem2 = JSON.stringify(item2);
    }
  
    if(compareItem1 === compareItem2){
      return true;
    }else{
      return false;
    }
  }catch{
    return false
  }
}

const cloneItem = (item) =>
  typeof item === "object" ? JSON.parse(JSON.stringify(item)) : item;


const runMicroEffect = (effect) => {
  Promise.resolve().then(()=>{
    effect()
  })
};
const runMacroEffect = (effect) => {
  setImmediate(()=>{
    effect()
  })
};

const runEffect = (effect) =>{
  effect()
}

const EFFECTS_TYPE = {
  // standard Effect, runs on call stack,
  // run on mount (main call stack/immediately after declaration) and on change
  RUN_EFFECT:"runEffect",
  // Micro Effect, after the call Stack but before macro stack,
  // run on mount (micro task queue) and on change
  RUN_MICRO_EFFECT:"runMicroEffect",
  // Macro Effect, after the micro Stack,
  // run on mount (macro task queue) and on change
  RUN_MACRO_EFFECT:"runMacroEffect",
}

const EFFECTS = {
  [EFFECTS_TYPE.RUN_MICRO_EFFECT]:runMicroEffect,
  [EFFECTS_TYPE.RUN_MACRO_EFFECT]:runMacroEffect,
  [EFFECTS_TYPE.RUN_EFFECT]:runEffect
}

const BATCHING_ENABLED = [EFFECTS_TYPE.RUN_MICRO_EFFECT,EFFECTS_TYPE.RUN_MACRO_EFFECT,EFFECTS_TYPE.RUN_EFFECT]
const RUN_EFFECTS_ON_MOUNTING = [EFFECTS_TYPE.RUN_MICRO_EFFECT,EFFECTS_TYPE.RUN_MACRO_EFFECT]

const addEffect = (effect,dependencies,effectToRun,batcher)=>{
  // Get previous dependencies
  dependencies.forEach((proxy) => {
    if (!proxy) return EFFECTS[effectToRun](effect);

    const effects = effectMap.get(proxy) || [];
    effects.push({effect,effectToRun,batcher});
    effectMap.set(proxy, effects);
   
  });

  if(RUN_EFFECTS_ON_MOUNTING.includes(effectToRun)) {
    batcher.addEffect(effect,effectToRun)
  }else if (effectToRun === EFFECTS_TYPE.RUN_EFFECT){
    // Promise.resolve().then(()=>{
      EFFECTS[effectToRun](effect);
    // })
  }
}

const useState = (initialValue) => {
  const state = {
    value: cloneItem(
      typeof initialValue === "function" ? initialValue() : initialValue
    ),
  };

  const proxy = new Proxy(state, {
    set(target, prop, value) {
      // Trigger effects associated with this proxy
      if(prop in target && isEqual(target[prop],value)) return false 
      target[prop] = value;
      triggerEffects(proxy);
      return true;
    },
  });

  stateMap.set(proxy, state);

  const setState = (newValue) => {
      try {
        if (typeof newValue === "function") {
          proxy.value = newValue(proxy.value);
        } else {
          proxy.value = cloneItem(newValue);
        }
      } catch (error) {
        console.error("Error while setting the state", error);
      }
      
  };

  return [proxy, setState];
};


const useMicroEffect = (effect,dependencies)=>{
  addEffect(effect,dependencies,EFFECTS_TYPE.RUN_MICRO_EFFECT,createBatcher());
}

const useMacroEffect = (effect,dependencies)=>{
  addEffect(effect,dependencies,EFFECTS_TYPE.RUN_MACRO_EFFECT,createBatcher());
}

const useEffect = (effect, dependencies) => {
  addEffect(effect,dependencies,EFFECTS_TYPE.RUN_EFFECT,createBatcher());
};

const createBatcher = () => {
  let isFlushing = false;
  let currentEffect = null
  let currentEffectToRun = null
  function toRun(){
    if(!currentEffectToRun || !currentEffect){
      console.warn("Invalid Hook")
      return
    }
    EFFECTS[currentEffectToRun](currentEffect)
    isFlushing = false;
  }
  const addEffect = (effect,effectToRun) => {
      currentEffect = effect
      currentEffectToRun = effectToRun
      if (!isFlushing) {
          isFlushing = true;
          switch (effectToRun) {
            case EFFECTS_TYPE.RUN_MICRO_EFFECT:
              Promise.resolve().then(toRun)
              break;
            case EFFECTS_TYPE.RUN_MACRO_EFFECT:
              setImmediate(toRun)
              break;
            default:
              toRun()
              break;
          }
      }
  };

  return { addEffect };
};

const triggerEffects = (proxy) => {
    try {
      const effects = effectMap.get(proxy) || [];
      effects.forEach(({effect,effectToRun,batcher}) => {
        if(BATCHING_ENABLED.includes(effectToRun) ) {
          batcher.addEffect(effect,effectToRun)
        }else{
          EFFECTS[effectToRun](effect)
        }
      }); // Add effects to the batcher
    } catch (error) {
      console.error("effect error", error);
    }
};


const createContext = (values) => {
  const state = values;
  const proxy = new Proxy({ value: state }, {});
  contextMap.set(proxy, values);
  return proxy;
};

const useContext = (contextProxy) => {
  const context = contextMap.get(contextProxy);
  if (context) return context;
  throw new Error("Context must be intialized before usage");
};

// Determine the environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useState, useEffect,useMacroEffect,useMicroEffect, createContext, useContext };
} else {
  self.useState = useState;
  self.useEffect = useEffect;
  self.useMacroEffect = useMacroEffect;
  self.useMicroEffect = useMicroEffect;
  self.createContext = createContext;
  self.useContext = useContext;
}

