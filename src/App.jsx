import React, { useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Sidebar, Navbar } from "./components";
import { Home, Profile, Onboarding } from "./pages";
import MedicalRecords from "./pages/records/index";
import ScreeningSchedule from "./pages/ScreeningSchedule";
import SingleRecordDetails from "./pages/records/single-record-details";
import { useStateContext } from "./context";
import { usePrivy } from "@privy-io/react-auth";

const App = () => {
  const { currentUser, fetchUserByEmail, currentUserChecked } = useStateContext();
  const { user, authenticated } = usePrivy();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchUserByEmail(user.email.address);
    }
  }, [user, fetchUserByEmail]);

  useEffect(() => {
    if (user && !currentUser && currentUserChecked && location.pathname !== "/onboarding") {
      navigate("/onboarding");
    }
  }, [user, currentUser, currentUserChecked, navigate, location.pathname]);

  return (
    <div className="sm:-8 relative flex min-h-screen flex-row bg-[#13131a] p-4">
      <div className="relative mr-10 hidden sm:flex">
        <Sidebar />
      </div>

      <div className="mx-auto max-w-[1280px] flex-1 max-sm:w-full sm:pr-5">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route path="/medical-records/:id" element={<SingleRecordDetails />} />
          <Route path="/screening-schedules" element={<ScreeningSchedule />} />
        </Routes>
      </div>
    </div>
  );
};

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


export default App;