const getPreparationTime = (item) => {
    switch (item) {
      case "coffee":
        return 3000;
      case "muffins":
        return 2000;
      case "snacks":
        return 2500;
      case "coffee and muffins":
        return 5000;
      default:
        return 0;
    }
  };

  module.exports = getPreparationTime