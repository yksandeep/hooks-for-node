const fs = require("fs");
const path = require("path");

const {
  useState,
  useEffect,
  useMacroEffect,
  useMicroEffect,
} = require("../hooks");

const logFilePath = path.join(__dirname, "output.txt");

const writeToFile = (message) => {
  fs.appendFileSync(logFilePath, `${message}\n`, "utf8");
  return message;
};

const [state, setState] = useState(0);
useMacroEffect(() => {
  console.log(state.value, "Macro");
}, [state]);

useEffect(() => {
  if (state.value === 0) return;
  const returnd = writeToFile(`Effect: State is now ${state.value}`);
  console.log(`Effect: Completed writing for state ${returnd}`);
}, [state]);

useMicroEffect(() => {
  for (let i = 0; i < 5; i++) {
    setState(i);
  }
}, []);

console.log("Starting state updates...");
