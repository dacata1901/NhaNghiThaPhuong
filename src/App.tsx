import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from '@/context/ToastContext';
import { HotelDataProvider } from '@/context/HotelDataContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ToastProvider>
          <HotelDataProvider>
            <AdminAuthProvider>
              <AppRoutes />
            </AdminAuthProvider>
          </HotelDataProvider>
        </ToastProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
