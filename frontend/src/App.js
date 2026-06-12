import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AuthPage from "./pages/Auth";
import ClientPortal from "./pages/ClientPortal";
import DriverPortal from "./pages/DriverPortal";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const privatePrefixes = ["/admin", "/client", "/convoyeur"];

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isPrivate = privatePrefixes.some((prefix) => location.pathname.startsWith(prefix));
  if (isPrivate) return children;
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/client" element={<ClientPortal />} />
            <Route path="/convoyeur" element={<DriverPortal />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </LayoutWrapper>
      </BrowserRouter>
    </div>
  );
}

export default App;
