let currentRoute = null
let routeStack = []

const initializeRoutes = (routeConfig,screen)=>{
    routeConfig.forEach(({path,view})=>{
        console.log("pathView",path,view)
        registerRoute(path,view)
    })
    navigate("/",screen)
}

const routeTable = {}

const registerRoute = (path,handler) => {
    routeTable[path] = handler
}

const matchRoute = (path)=>{
    for(const route in routeTable){
        const routeParts = route.split("/")
        const pathParts = path.split("/")

        if(routeParts.length === pathParts.length){
            let isMatch = true
            const params = {}

            for (let i = 0;i<routeParts.length;i++){
                if(routeParts[i].startsWith(":")){
                    const paramName = routeParts[i].slice(1)
                    params[paramName] = pathParts[i]
                }else if (routeParts[i]!== pathParts[i]){
                    isMatch = false
                    break
                }
            }

            if(isMatch){
                return {handler:routeTable[route],params}
            }
        }
    }
    return null
}

const navigate = (path,screen) => {
    const matchedRoute = matchRoute(path)
    screen.children?.forEach(child => screen.remove(child))
    if(matchedRoute){
        currentRoute = path
        routeStack.push(path)
        matchedRoute.handler(screen,matchedRoute.params)
        screen.render()
    }else{
        console.log("Route not found", path)
    }
}

const navigateBack = (screen) => {
    if(routeStack.length>1){
        routeStack.pop()
        const previousRoute = routeStack[routeStack.length-1]
        navigate(previousRoute,screen)
    }
}


module.exports = {
    initializeRoutes,navigate,navigateBack
}