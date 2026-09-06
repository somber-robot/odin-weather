import "./style.css";

import { LogicHandler } from "./logic.js";
import { loadPage } from "./display.js";

const logic = new LogicHandler();
loadPage(logic);
