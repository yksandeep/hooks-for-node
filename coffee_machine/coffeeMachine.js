const { useState } = require("../hooks");

const useCoffeeMachine = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0); // Track the index of the current order in prep

  const prepareItem = (order, preparationTime) => {
    setTimeout(() => {
      order.status = "Ready"; // Update status to ready
      setCurrentOrderIndex((prev) => prev + 1); // Move to the next order
    }, preparationTime);
  };

  const startCleaning = () => {
    setIsCleaning(true);
    console.log("Coffee machine is cleaning...");
    setTimeout(() => {
      setIsCleaning(false);
      console.log("Coffee machine is done cleaning!");
    }, 3000); // Example cleaning time
  };

  return {
    prepareItem,
    startCleaning,
    isCleaning,
    currentOrderIndex,
  };
};

module.exports = { useCoffeeMachine };
