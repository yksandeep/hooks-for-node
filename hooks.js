const stateMap = new WeakMap(); 

const batchEffects = false

const cloneItem = (item) =>
  typeof item === "object" ? JSON.parse(JSON.stringify(item)) : item;

const useState = (initialValue) => {
  const state = {
    value: cloneItem(
      typeof initialValue === "function" ? initialValue() : initialValue
    ),
  };

  const proxy = new Proxy(state, {
    set(target, prop, value) {
      // Trigger effects associated with this proxy
      target[prop] = value;
      triggerEffects(proxy);
      return true;
    },
    get(target, prop) {
      return Reflect.get(...arguments);
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

const effectMap = new WeakMap();
const prevDepsMap = new WeakMap();

const useEffect = (effect, dependencies) => {
  let changed = false;
  // Get previous dependencies
  dependencies.forEach((proxy) => {
    if (!proxy) return effect();

    const effects = effectMap.get(proxy) || [];
    effects.push(effect);
    effectMap.set(proxy, effects);

    const prevDeps = prevDepsMap.get(proxy) || [];
    // Check if dependencies have changed
    const hasChanged =
      !dependencies ||
      dependencies.length !== prevDeps.length ||
      dependencies.some((dep, index) => dep.value !== prevDeps[index].value);
    changed = hasChanged;
    prevDepsMap.set(proxy, dependencies); // Update previous dependencies
  });

  if (changed) {
    runEffect(effect); // Run the effect if dependencies have changed
    changed = false;
  }
};

const runEffect = (effect) => {
  return new Promise((reslove, reject) => {
    try {
      reslove(effect());
    } catch (error) {
      console.error("error while running effect", error);
      reject(error);
    }
  });
};

const createBatcher = () => {
  let effectQueue = new Set();
  let isFlushing = false;

  const addEffect = (effect) => {
      effectQueue.add(effect);
      if (!isFlushing) {
          isFlushing = true;
          
          setTimeout(() => { 
              effectQueue.forEach(effect => effect());
              effectQueue.clear();
              isFlushing = false;
          });
      }
  };

  return { addEffect };
};

const batcher = createBatcher(); // Create a new batcher instance

const triggerEffects = (proxy) => {
  return new Promise((reslove, reject) => {
    try {
      const effects = effectMap.get(proxy) || [];
      if(batchEffects){
        // this will batch the effects and wait for the current call stack to be cleared first before executing effect
        effects.forEach(effect => batcher.addEffect(effect)); // Add effects to the batcher
      }else{
        // effect will be executed immediately after state change
        effects.forEach(effect => effect());
      }
      reslove("SUCCESS");
    } catch (error) {
      console.error("effect error", error);
      reject(error);
    }
  });
};

const contextMap = new WeakMap();

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
  // Node.js environment (CommonJS)
  module.exports = { useState, useEffect, createContext, useContext };
} else {
  // Browser environment
  self.useState = useState;
  self.useEffect = useEffect;
}

