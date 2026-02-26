import axios from "axios";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

axios.defaults.baseURL = "https://api.weather.gov";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App/>
    </StrictMode>
);