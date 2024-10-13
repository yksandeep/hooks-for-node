const stateMap = new WeakMap();

const cloneItem = (item)=>typeof item === "object"?JSON.parse(JSON.stringify(item)):item

const useState = (initialValue) => {

    const state = { value: cloneItem( typeof initialValue === "function"? initialValue():initialValue) };

    const proxy = new Proxy(state, {
        set(target, prop, value) {
            target[prop] = value;
            // Trigger effects associated with this proxy
            triggerEffects(proxy);
            return true;
        },
        get(target, prop) {
            return Reflect.get(...arguments)
        }
    });

    stateMap.set(proxy, state);
    
    const setState = (newValue) => {
        if (typeof newValue === 'function') {
            proxy.value = newValue(proxy.value);
        } else {
            proxy.value = cloneItem(newValue);
        }
    };

    return [proxy, setState];
};

const effectMap = new WeakMap();
const prevDepsMap = new WeakMap();

const useEffect = (effect, dependencies) => {
    let changed = false
    // Get previous dependencies
    dependencies.forEach(proxy=>{
        if (!proxy) return effect();
        
        const effects = effectMap.get(proxy) || [];
        effects.push(effect);
        effectMap.set(proxy, effects);

        const prevDeps = prevDepsMap.get(proxy) || [];
        // Check if dependencies have changed
        const hasChanged = !dependencies || 
            dependencies.length !== prevDeps.length || 
            dependencies.some((dep, index) => dep.value !== prevDeps[index].value);
        changed = hasChanged
        prevDepsMap.set(proxy, dependencies); // Update previous dependencies
    })
    
    if (changed) {
        effect(); // Run the effect if dependencies have changed
        changed = false
    }
};

const triggerEffects = (proxy) => {
    const effects = effectMap.get(proxy) || [];
    effects.forEach(effect => effect());
};

const contextMap = new WeakMap()

const createContext = (values)=>{
    const state = values
    const proxy = new Proxy({value:state},{})
    contextMap.set(proxy,values)
    return proxy
}

const useContext = (contextProxy)=>{
    const context = contextMap.get(contextProxy)
    if(context) return context
    throw new Error("Context must be intialized before usage")
}



module.exports = { useState, useEffect,createContext,useContext };
