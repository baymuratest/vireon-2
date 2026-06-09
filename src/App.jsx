import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import AnimePage from './pages/AnimePage';
import CatalogPage from './pages/CatalogPage';
import SetupPage from './pages/SetupPage';
import { setToken, getToken } from './utils/kodik';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Load token from localStorage if saved
    const saved = localStorage.getItem('vireon_token');
    if (saved && !getToken()) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/anime/:id" element={<AnimePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
