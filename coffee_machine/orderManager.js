const { useState, useEffect } = require("../hooks");
const getPreparationTime = require("./prep_time");

const useOrderManager = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);

  const addOrder = (name, items) => {
    const orderId = new Date().getTime(); // Unique order ID based on timestamp
    const newOrder = {
      id: orderId,
      name,
      items: items.map(item => ({
        name: item.trim(),
        status: "Pending",
      })),
    };
    setAllOrders([...allOrders.value, newOrder]);
    setActiveOrders([...activeOrders.value, newOrder]);
    return orderId;
  };

  const updateOrderStatus = (orderId, itemName, status) => {
    setActiveOrders((prevOrders) =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map(item => {
              if (item.name === itemName) {
                return { ...item, status };
              }
              return item;
            }),
          };
        }
        return order;
      })
    );

    setAllOrders((prevOrders) =>
        prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item.name === itemName) {
                  return { ...item, status };
                }
                return item;
              }),
            };
          }
          return order;
        })
      );

  };

  useEffect(()=>{
    for (const order of activeOrders.value) {
      for(const item of order.items) {
        setTimeout(async () => {
          updateOrderStatus(order.id, item.name, "Ready");
        }, getPreparationTime(item.name)); // simulate preparation time based on the item
      }
    }
  },[activeOrders])

  useEffect(()=>{
    const activeOrders = []
    for (const order of allOrders.value) {
      let isActive = false
      for (const item of order.items) {
        if(item.status === "In Progress") {
          isActive = true
        }
      }
      if(isActive){
        activeOrders.push(order);
      }
    }
    setActiveOrders(activeOrders)
  },[allOrders])

  return {
    allOrders,
    activeOrders,
    addOrder,
    updateOrderStatus,
  };
};

module.exports = { useOrderManager };
