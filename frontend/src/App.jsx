import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Sales from './components/Sales';
import SaleVehicleDetails from './components/SaleVehicleDetails';
import Rentals from './components/Rentals';
import RentVehicleDetails from './components/RentVehicleDetails';
import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/:id" element={<SaleVehicleDetails />} />
        <Route path="/rent" element={<Rentals />} />
        <Route path="/rent/:id" element={<RentVehicleDetails />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Redirect root to login for now */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
