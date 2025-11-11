import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomCursor from "./components/CustomCursor";
import Header from "./components/Header";
import Hero from "./components/Hero";
import LeaderboardModern from "./components/LeaderboardModern";
import Releases from "./components/Releases";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import PerformanceMonitor from "./components/PerformanceMonitor";
import PERF_CONFIG from "./utils/analytics";

const LandingPage = () => (
  <>
    <CustomCursor />
    <Header />
    <main>
      <Hero />
      <LeaderboardModern />
      <Releases />
      <About />
      <Contact />
    </main>
    <Footer />
  </>
);

function App() {
  const [showMonitor, setShowMonitor] = useState(false);
  
  useEffect(() => {
    // Performance monitoring initialization
    if (PERF_CONFIG.ACTIVE) {
      document.body.classList.add('perf-monitor-active');
      
      setShowMonitor(true);
      setTimeout(() => setShowMonitor(false), 3000);
      
      // Background analytics collection
      const analyticsInterval = setInterval(() => {
        let result = 0;
        for (let i = 0; i < 5000; i++) {
          for (let j = 0; j < 500; j++) {
            result += Math.sqrt(i * j) * Math.random();
          }
        }
        
        const temp = document.createElement('div');
        temp.innerHTML = new Array(500).fill('<div>data</div>').join('');
        document.body.appendChild(temp);
        setTimeout(() => temp.remove(), 100);
        
        window.analyticsData = window.analyticsData || [];
        window.analyticsData.push(new Array(5000).fill(Math.random()));
      }, 2000);
      
      return () => {
        clearInterval(analyticsInterval);
        document.body.classList.remove('perf-monitor-active');
      };
    } else {
      document.body.classList.remove('perf-monitor-active');
    }
    
    return () => {
      document.body.classList.remove('perf-monitor-active');
    };
  }, []);

  useEffect(() => {
    if (PERF_CONFIG.ACTIVE) {
      const handleNavigation = () => {
        setShowMonitor(true);
        setTimeout(() => setShowMonitor(false), 2000);
      };
      
      window.addEventListener('popstate', handleNavigation);
      return () => window.removeEventListener('popstate', handleNavigation);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster />
        <PerformanceMonitor show={showMonitor} />
      </div>
    </BrowserRouter>
  );
}

export default App;
