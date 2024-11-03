const Home = require("./views/home");
const Settings = require("./views/settings");

const routes = [
  { path: "/", view: Home },
  { path: "/settings", view: Settings },
];
module.exports = routes;
