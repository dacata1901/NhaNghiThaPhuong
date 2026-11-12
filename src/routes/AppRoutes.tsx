import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { HomePage } from '@/pages/public/HomePage';
import { RoomListPage } from '@/pages/public/RoomListPage';
import { RoomDetailPage } from '@/pages/public/RoomDetailPage';
import { BookingPage } from '@/pages/public/BookingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Admin Dashboard Pages
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminRoomsPage } from '@/pages/admin/AdminRoomsPage';
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage';
import { AdminContentPage } from '@/pages/admin/AdminContentPage';
import { AdminSeoPage } from '@/pages/admin/AdminSeoPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

const ScrollToTopOnNavigate: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Routes>
        {/* Public Customer Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/rooms/:slug" element={<RoomDetailPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Redirect removed pages cleanly */}
          <Route path="/booking-lookup" element={<Navigate to="/booking" replace />} />
          <Route path="/design-system" element={<Navigate to="/" replace />} />
          <Route path="/faq" element={<Navigate to="/" replace />} />
          <Route path="/booking-policy" element={<Navigate to="/" replace />} />
          <Route path="/cancellation-policy" element={<Navigate to="/" replace />} />
          <Route path="/privacy-policy" element={<Navigate to="/" replace />} />
          <Route path="/terms" element={<Navigate to="/" replace />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Authentication Route */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="seo" element={<AdminSeoPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<AdminDashboardPage />} />
        </Route>
      </Routes>
    </>
  );
};
