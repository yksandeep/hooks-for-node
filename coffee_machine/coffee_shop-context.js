const { createContext,useState } = require("../hooks");
const { useOrderManager } = require("./orderManager");
const { useCoffeeMachine } = require("./coffeeMachine");

  // State to hold selected items
const [selectedItems, setSelectedItems] = useState([]);
const [customerName,setCustomerName] = useState("");
const orderManager = useOrderManager();
const coffeeMachine = useCoffeeMachine();

const ShopContext = createContext({selectedItems,setSelectedItems,customerName,setCustomerName,orderManager,coffeeMachine})

module.exports = ShopContext;