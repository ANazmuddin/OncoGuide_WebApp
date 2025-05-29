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
    appId={import.meta.env.VITE_PRIVY_APP_ID}
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


const sendAnalyticsEvent = async () => {
  try {
    const res = await fetch("/api/privy-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "login",
        user_id: user?.id,
        email: user?.email?.address,
        timestamp: new Date().toISOString(),
      }),
    });

    const data = await res.json();
    console.log("Analytics sent:", data);
  } catch (error) {
    console.error("Proxy fetch error:", error);
  }
};

