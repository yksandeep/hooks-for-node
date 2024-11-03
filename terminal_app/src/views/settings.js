const { UIComponentV2 } = require("../Components/UIComponent");

function Settings(screen) {
  const Box = new UIComponentV2({
    parent: screen,
    type:"box",
    top: "center",
    left: "center",
    width: "50%",
    height: "50%",
    content: "Hello {bold}world{/bold}!",
    tags: true,
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
  });

  // If our box is clicked, change the content.
  Box.on("click", function (data) {
    Box.setContent("{center}Some different {red-fg}content{/red-fg}.{/center}");
    screen.render();
  });

  // If box is focused, handle `enter`/`return` and give us some more content.
  Box.key("enter", function (ch, key) {
    Box.setContent(
      "{right}Even different {black-fg}content{/black-fg}.{/right}\n"
    );
    Box.setLine(1, "bar");
    Box.insertLine(1, "foo");
    screen.render();
  });
}

module.exports = Settings;
