import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import { StateContextProvider } from "./context";
import App from "./App";
import "./index.css";
// import { PrivyProvider } from "@privy-io/react-auth";
import {PrivyProvider} from '@privy-io/react-auth';


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <PrivyProvider
    appId="cmazcqao400dzjp0md68x79jj"
    config={{
      appearance: {
        theme: "dark",
      },
      embeddedWallets: {
        createOnLogin: "users-without-wallets",
      },
    }}
  >
    <Router>
      <StateContextProvider>
        <App />
      </StateContextProvider>
    </Router>
  </PrivyProvider>
);
