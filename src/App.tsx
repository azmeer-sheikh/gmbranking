import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext';
import MainApp from './pages/MainApp';
import AdminPanel from './pages/AdminPanel';
import DatabaseInitializer from './components/DatabaseInitializer';

export default function App() {
  return (
    <BrowserRouter>
      <ClientProvider>
        <DatabaseInitializer />
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </ClientProvider>
    </BrowserRouter>
  );
}