const blessed = require("blessed");
// Flexbox renderer based on MDN guidelines
function flexboxRenderer(flexDirection, justifyContent, alignItems, gap) {
  return function (coords) {
    const self = this;

    // Calculate the total available width and height
    const width = coords.xl - coords.xi;
    const height = coords.yl - coords.yi;
    let rowOffset = 0;
    let colOffset = 0;

    // Helper function to calculate percentage dimensions
    const parseDimension = (dim, parentSize) => {
      if (typeof dim === "string" && dim.endsWith("%")) {
        return Math.floor((parseFloat(dim) / 100) * parentSize);
      }
      return dim;
    };

    // Gather sizes of children for alignment calculation
    const childSizes = self.children.map((child) => ({
      width: parseDimension(child.width || "0%", width),
      height: parseDimension(child.height || "0%", height),
    }));

    const totalChildWidth = childSizes.reduce(
      (sum, { width }) => sum + width,
      0
    );
    const totalChildHeight = childSizes.reduce(
      (sum, { height }) => sum + height,
      0
    );
    const numChildren = self.children.length;

    // Main axis alignment (justifyContent)
    let extraSpace = 0;
    let spacing = gap;

    if (flexDirection === "row") {
      if (justifyContent === "center") {
        colOffset =
          numChildren === 1
            ? Math.max((width - childSizes[0].width) / 2, 0)
            : Math.max(
                (width - totalChildWidth - gap * (numChildren - 1)) / 2,
                0
              );
      } else if (justifyContent === "flex-end") {
        colOffset = Math.max(
          width - totalChildWidth - gap * (numChildren - 1),
          0
        );
      } else if (justifyContent === "space-between") {
        extraSpace = Math.max(width - totalChildWidth, 0);
        spacing = numChildren > 1 ? extraSpace / (numChildren - 1) : 0;
        colOffset = 0; // start from left
      }
    } else {
      if (justifyContent === "center") {
        rowOffset =
          numChildren === 1
            ? Math.max((height - childSizes[0].height) / 2, 0)
            : Math.max(
                (height - totalChildHeight - gap * (numChildren - 1)) / 2,
                0
              );
      } else if (justifyContent === "flex-end") {
        rowOffset = Math.max(
          height - totalChildHeight - gap * (numChildren - 1),
          0
        );
      } else if (justifyContent === "space-between") {
        extraSpace = Math.max(height - totalChildHeight, 0);
        spacing = numChildren > 1 ? extraSpace / (numChildren - 1) : 0;
        rowOffset = 0; // start from top
      }
    }

    // Return iterator function for each child
    return function iterator(el, i) {
      el.shrink = true;

      const elWidth = childSizes[i].width;
      const elHeight = childSizes[i].height;

      // Align cross axis (alignItems)
      if (flexDirection === "row") {
        if (alignItems === "center") {
          el.position.top = Math.max((height - elHeight) / 2, 0);
        } else if (alignItems === "flex-end") {
          el.position.top = Math.max(height - elHeight, 0);
        } else {
          el.position.top = rowOffset;
        }

        el.position.left = colOffset;
        colOffset += elWidth + spacing;

        // Wrap rows if needed (for multi-line flex layouts)
        if (colOffset + elWidth > width) {
          rowOffset += elHeight + gap;
          colOffset = 0;
        }
      } else {
        if (alignItems === "center") {
          el.position.left = Math.max((width - elWidth) / 2, 0);
        } else if (alignItems === "flex-end") {
          el.position.left = Math.max(width - elWidth, 0);
        } else {
          el.position.left = colOffset;
        }

        el.position.top = rowOffset;
        rowOffset += elHeight + spacing;

        // Wrap columns if needed (for multi-column flex layouts)
        if (rowOffset + elHeight > height) {
          colOffset += elWidth + gap;
          rowOffset = 0;
        }
      }
    };
  };
}

class CustomComponent {
  constructor(widgetType, options = {}) {
    if (!widgetType) {
      throw new Error("A Blessed widget type is required.");
    }

    // Create the Blessed widget using the provided type
    this.element = widgetType({
      padding: 0,
      border: { type: "bg" },
      width: "100%-2",
      height: "shrink",
      ...options,
    });

    return this.element;
  }
}

class UIComponentV2 extends CustomComponent {
  constructor(options = {}) {
    const { onClick, renderFunc, type, ...props } = options;
    super(blessed[type], props); // Pass the widget type to the base class
    if (onClick) {
      this.on("click", this.onClick);
    }
  }
}

class FlexBoxV2 extends CustomComponent {
  constructor(options = {}) {
    const {
      onClick,
      type,
      flexDirection,
      justifyContent,
      alignItems,
      gap,
      ...props
    } = options;
    super(blessed.layout, {
      ...props,
      renderer: flexboxRenderer(flexDirection, justifyContent, alignItems, gap),
    }); // Pass the widget type to the base class
    if (onClick) {
      this.on("click", this.onClick);
    }
  }
}

class UIComponent {
  constructor({ type, props, screen, children, onClick, name = "Default" }) {
    this.type = type;
    this.name = name;
    this.node = blessed[type](props);
    this.screen = screen;
    this.children = children || [];
    this.onClick = onClick;

    if (screen) {
      this.screen.append(this.node); // Append the main node to the screen immediately
    }
    // Render children if they exist
    if (this.onClick) {
      this.on("click", this.onClick);
    }
    if (Array.isArray(this.children)) {
      // When children are initialized, pass the screen down to them
      this.children.forEach((child) => {
        if (child && !child.screen) {
          child.screen = this.screen;
        }
      });
    } else {
      this.children.screen = this.screen;
    }

    this.renderChildren();
  }

  addChildren(children) {
    this.children = children;
    if (this.node) {
      this.renderChildren(); // Render children correctly
    }
  }

  renderChildren() {
    if (this.node && this.children) {
      let currentTop = 0;

      this.node.children.forEach((child) => child.remove()); // Remove existing children

      if (Array.isArray(this.children)) {
        this.children.forEach((child) => {
          if (child && child.node) {
            child.screen = this.screen;
            // Ensure the child node width is set to avoid overflow
            if (!("width" in child.node)) {
              child.node.width = "99.5%"; // Set child width to 99.5% of parent
            } else {
              if (
                !["button", "text", "box", "textbox", "layout"].includes(
                  child.node.type
                )
              ) {
                console.log(child.node.type);
                child.node.width = [100, "100%"].includes(child.node?._width)
                  ? "99.5%"
                  : child.node.width;
              }
              if (child.node._height) {
                child.node.top = currentTop; // Position the child based on currentTop
                currentTop += child.node.height + 1; // Increment for next child
              }
            }
            this.node.append(child.node); // Append the child to the parent node
          }
        });
      } else if (this.children && this.children.node) {
        // Handle case when a single child is passed instead of an array
        this.node.append(this.children.node);
      }
    }
  }

  on(event, callback) {
    if (this.node) {
      this.node.on(event, callback); // Delegate the event listener to the node
    }
  }
}

class Screen extends UIComponent {
  constructor({ screen, ...props }) {
    super({
      parent: screen,
      type: "layout",
      name: "Screen",
      layout: "inline",
      autoPadding: true,
      scrollable: true,
      scrollbar: {
        style: { bg: "grey" },
      },
      ...props,
      props: {
        width: "100%",
        height: "100%",
        ...("props" in props ? props.props : {}),
      },
      screen,
    });
  }
}

class Div extends UIComponent {
  constructor({ screen, ...props }) {
    super({
      type: "box",
      scrollable: true, // Allow scrolling if content overflows
      scrollbar: {
        style: { bg: "#ECF0F1" }, // Optional scrollbar styling
      },
      ...props,
      screen,
    });
  }
}

class Button extends UIComponent {
  constructor({ screen, ...props }) {
    super({
      type: "button",
      ...props,
      props: {
        border: { type: "line", fg: "#ECF0F1" },
        ...props.props,
      },
      screen,
    });
  }
}

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
class FlexBox extends UIComponent {
  constructor({ direction = "row", gap = 0, wrap = true, screen, ...props }) {
    super({ type: "box", ...props, screen });
    this.direction = direction;
    this.gap = gap;
    this.wrap = wrap;

    // Apply the initial flex layout
    this.applyFlexLayout();

    // Listen for terminal resize events
    if (this.screen) {
      this.screen.on("resize", () => {
        this.applyFlexLayout(); // Reapply layout on screen resize
      });
    }
  }

  applyFlexLayout() {
    if (this.node) {
      const availableWidth = this.node.width;
      const availableHeight = this.node.height;
      let totalGap = this.gap * (this.children.length - 1);
      let totalChildWidth = 0;

      // Calculate widths for children
      this.children.forEach((child) => {
        if (child.node) {
          child.node.width = Math.floor(
            (availableWidth - totalGap) / this.children.length
          );
          totalChildWidth += child.node.width;
        }
      });

      // Adjust if total child width exceeds available width
      if (totalChildWidth > availableWidth) {
        this.children.forEach((child) => {
          if (child.node) {
            child.node.width = Math.floor(
              (availableWidth - totalGap) / this.children.length
            );
          }
        });
      }

      // Position children
      let currentX = 0;
      let currentY = 0;

      this.children.forEach((child) => {
        if (child.node) {
          child.node.left = currentX; // Set left position
          child.node.top = currentY; // Keep top at 0

          if (this.direction === "row") {
            currentX += child.node.width + this.gap; // Update for next child
          } else {
            currentY += child.node.height + this.gap; // Update for next child
          }

          this.node.append(child.node); // Append the child node
        }
      });

      this.screen.render(); // Re-render the screen
    }
  }
}

module.exports = {
  UIComponent,
  Screen,
  Div,
  Button,
  FlexBox,
  CustomComponent,
  UIComponentV2,
  FlexBoxV2,
};
