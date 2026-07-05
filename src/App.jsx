import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


import { useEffect } from "react";
import {
  requestNotificationPermission,
  startPrayerReminder,
} from "@/utils/notificationScheduler";

import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";

// Pages
import Today from "./pages/Today";
import Qaza from "./pages/Qaza";
// import NearbyMosques from "./components/NearbyMosques";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import LoadingScreen from "./pages/LoadingScreen";
import Progress from "./pages/Progress";
import TawfiqTV from "./pages/TawfiqTV";
import Onboarding from "./pages/Onboarding";
import Quran from "./pages/Quran";
import Sawm from "./pages/Sawm";
import Learn from "./pages/Learn";
import Login from "./pages/Login";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    }

    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Today />} />
      <Route path="/quran" element={<Quran />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/tv" element={<TawfiqTV />} />
      <Route path="/qaza" element={<Qaza />} />
      <Route path="/sawm" element={<Sawm />} />

      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/loading" element={<LoadingScreen />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    requestNotificationPermission();
    startPrayerReminder();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
