const blessed = require("blessed");
const { initializeRoutes } = require("./router");
const routeConfig = require("./src/routes");

const screen = blessed.screen({
  useBCE: true,
  smartCSR: true,
  title: "Terminal Routing",
  keys: true,
  mouse: true,

  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "magenta",
    border: {
      fg: "#f0f0f0",
    },
    hover: {
      bg: "green",
    },
  },
  dockBorders: false,
  width: "100%",
  height: "shrink",
  scrollable: true,
  scrollbar: {
    style: { bg: "grey" },
  }
});
try {
  initializeRoutes(routeConfig, screen);

  screen.key(["q", "escape", "C-c"], () => process.exit(0));

  screen.render();
} catch (error) {
  console.log({ error });
  process.exit(1);
}
