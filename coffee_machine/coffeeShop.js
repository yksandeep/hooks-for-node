const readline = require("readline");

const { useEffect, useState, useContext } = require("../hooks");
const ShopContext  = require("./coffee_shop-context");
const getPreparationTime = require("./prep_time");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const CoffeeShop = () => {

  const {
    selectedItems,
    setSelectedItems,
    customerName,
    setCustomerName,
    orderManager,
    coffeeMachine,
  } = useContext(ShopContext);

  const menuOptions = `
    Menu:
    1. Order Coffee
    2. Order Muffins
    3. Order Snacks
    4. Order Coffee and Muffins
    5. Start Cleaning
    6. Exit
  `;

  const displayActiveOrders = () => {
    const activeOrders = orderManager.allOrders.value;
    let statusDisplay = "\n=== Current Orders ===\n";
    if (activeOrders.length === 0) {
      statusDisplay += "No active orders.\n";
    } else {
      activeOrders.forEach(order => {
        statusDisplay += `Order ID: ${order.id}, Customer: ${order.name} ${JSON.stringify(order)}\n`;
        order.items.forEach(item => {
          statusDisplay += `- ${item.name}: ${item.status}\n`;
        });
      });
    }
    statusDisplay += "======================\n";
    return statusDisplay;
  };

  const displayCurrentOrderInPrep = () => {
    const currentOrders = orderManager.activeOrders.value;
    let prepDisplay = "\n=== Current Order in Prep ===\n";
    if (!currentOrders.length) {
      prepDisplay += "No order is currently being prepared.\n";
    } else {
        currentOrders.forEach((order,idx)=>{
            prepDisplay += `Preparing Order ID: ${order.id} ${idx===0?"In Kitchen":""}\n`;
        })
    }
    prepDisplay += "============================\n";
    return prepDisplay;
  };

  const displaySelectedItems = () => {
    let itemsDisplay = "\n=== Selected Items ===\n";
    if(customerName.value){
      itemsDisplay += "Taking order's for : " + customerName.value+"\n"
    }
    if (selectedItems.value.length === 0) {
      itemsDisplay += "No items selected.\n";
    } else {
      selectedItems.value.forEach(item => {
        itemsDisplay += `- ${item}\n`;
      });
    }
    itemsDisplay += "======================\n";
    return itemsDisplay;
  };


  const repaintTerminal = () => {
    console.clear(); // Clear console
    const orderStatus = displayActiveOrders();
    const currentOrderStatus = displayCurrentOrderInPrep();
    const selectedItemsDisplay = displaySelectedItems();
    console.log(orderStatus);
    console.log(currentOrderStatus);
    console.log(menuOptions);
    console.log(selectedItemsDisplay);
    readline.moveCursor(process.stdout, 22+customerName.value.length);
    if (!customerName.value) {
      getCustomerName(); // Go back to asking for name
    }
    getMenuSelection();
  };

  const getCustomerName = () => {
    rl.question(`Please enter your name: `, (name) => {
      setCustomerName(name)
    });
  };

  const getMenuSelection = () => {
    rl.question("Please select an option:  ", (input) => handleMenuSelection(input));
  };

  const handleMenuSelection = (input) => {
    const currentSelection = input.trim();
    switch (currentSelection) {
      case "1":
        addToOrder("coffee");
        break;
      case "2":
        addToOrder("muffins");
        break;
      case "3":
        addToOrder("snacks");
        break;
      case "4":
        addToOrder("coffee and muffins");
        break;
      case "5":
        coffeeMachine.startCleaning();
        break;
      case "6":
        rl.close();
        break;
      default:
        console.log("Invalid option, please try again.");
        repaintTerminal();
        break;
    }
  };

  const addToOrder = async (item) => {
      // Await the confirmation to ensure it's properly sequenced
      rl.question("Do you want to continue placing orders? (yes/no): ", async (answer) => {
        if (answer.trim().toLowerCase() === 'yes') {
          setSelectedItems(prevItems => [...prevItems, item]);
          // pass
        } else {
            setCustomerName("")
            setSelectedItems(prevItems => [...prevItems, item]);
            await finalizeOrder(); // Finalize the order if they do not want to continue
        }
    });
  };

  const finalizeOrder = async () => {
    if (selectedItems.value.length === 0) {
      console.log("No items to finalize. Returning to menu...");
      setSelectedItems(prevItems => [...prevItems])
      return;
    }
    const orderId = orderManager.addOrder(customerName.value, selectedItems.value);
    console.log(`Order placed: ${selectedItems.value.join(", ")} (Order ID: ${orderId})`);

    for (const item of selectedItems.value) {
      const preparationTime = getPreparationTime(item);
      coffeeMachine.prepareItem(orderManager.activeOrders.value[orderManager.activeOrders.value.length - 1], preparationTime);
      orderManager.updateOrderStatus(orderId, item, "In Progress");
    }
    setSelectedItems([])
  };

  
  useEffect(()=>{
    repaintTerminal()
  },[customerName,orderManager.allOrders,coffeeMachine.isCleaning,selectedItems])
};

CoffeeShop();
