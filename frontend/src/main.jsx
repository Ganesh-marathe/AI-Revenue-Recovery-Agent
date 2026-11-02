import "./styles/global.css";
import "./pages/landing/landing.css";

import { renderLandingPage } from "./pages/landing/landing.js";

document.querySelector("#app").innerHTML = renderLandingPage();