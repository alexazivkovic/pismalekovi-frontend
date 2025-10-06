import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicHome from "./pages/PublicHome.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminSubscribers from "./pages/AdminSubscribers.jsx";
import NotFound from "./pages/NotFound.jsx";
import { getAuth } from "./auth";

import "./index.css";


function Protected({ children }) {
  const authed = !!getAuth();
  return authed ? children : <Navigate to="/admin/login" replace />;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Protected><AdminPanel /></Protected>} />
      <Route path="/admin/subscribers" element={<Protected><AdminSubscribers /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
