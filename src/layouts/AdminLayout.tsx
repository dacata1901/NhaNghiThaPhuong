import React, { useState } from 'react';
import { NavLink, Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  MessageSquare,
  Settings,
  Bell,
  ExternalLink,
  Menu,
  X,
  LogOut,
  CheckCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { cn, formatDateTimeVN } from '@/lib/utils';

const ADMIN_NAV_ITEMS = [
  { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Quản lý Đặt phòng', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Quản lý Phòng nghỉ', path: '/admin/rooms', icon: BedDouble },
  { label: 'Tin nhắn khách hàng', path: '/admin/messages', icon: MessageSquare },
  { label: 'Cài đặt cơ bản', path: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, adminUser, logout } = useAdminAuth();
  const {
    notifications,
    markAllNotificationsRead,
    bookings,
    contactMessages,
    settings,
    updateSettings,
  } = useHotelData();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const unreadMessagesCount = contactMessages.filter((m) => m.status === 'unread').length;

  const toggleSoundAlerts = () => {
    updateSettings({
      ...settings,
      sound_alerts_enabled: !settings.sound_alerts_enabled,
    });
  };

  return (
    <div className="min-h-screen flex bg-bg-ivory text-text-primary">
      {/* Ensure Admin pages are never indexed by Google */}
      <SEOHead
        title="Quản trị hệ thống | Nhà Nghỉ Tha Phương"
        description="Trang quản trị nội bộ Nhà Nghỉ Tha Phương"
        canonicalPath="/admin"
        noIndex={true}
      />

      {/* Sidebar — warm espresso (#30251F) matching Figma Page 3 (24:509) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[265px] bg-bg-wood-deep text-text-on-dark flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <span className="font-serif text-lg font-semibold tracking-[0.16em] uppercase text-brand-gold-light block">
                THA PHƯƠNG ADMIN
              </span>
              <span className="text-[11px] text-text-on-dark/60 uppercase tracking-widest">
                Hệ thống quản trị chủ nhà
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-on-dark/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const badgeCount =
                item.path === '/admin/bookings'
                  ? pendingBookingsCount
                  : item.path === '/admin/messages'
                  ? unreadMessagesCount
                  : 0;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-4 py-3 rounded-classic text-xs font-medium uppercase tracking-wider transition-colors',
                      isActive
                        ? 'bg-brand-gold text-text-on-dark font-semibold'
                        : 'text-text-on-dark/75 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-state-warning text-white">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-classic text-xs text-brand-gold-light hover:bg-white/10 transition-colors"
          >
            <span>Xem Website khách hàng</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-4 py-2 text-[11px] text-text-on-dark/60 border-t border-white/10">
            <span className="block font-medium text-text-on-dark/90">
              {adminUser?.name}
            </span>
            <span className="block truncate">{adminUser?.email}</span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-classic text-xs font-medium text-red-300 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-bg-ivory-white border-b border-border-default px-4 sm:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-classic border border-border-default text-text-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-semibold text-text-primary">
                Hệ thống Quản trị {settings.hotel_name}
              </h1>
              <p className="text-xs text-text-secondary hidden sm:block">
                Hotline lễ tân: {settings.phone_primary} • Email nhận báo cáo:{' '}
                {settings.email_notification}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative">
            <button
              type="button"
              onClick={toggleSoundAlerts}
              className={cn(
                'p-2.5 rounded-classic border text-xs flex items-center gap-1.5 transition-colors',
                settings.sound_alerts_enabled
                  ? 'border-brand-gold bg-brand-champagne/40 text-bg-wood-deep'
                  : 'border-border-default bg-bg-ivory text-text-muted'
              )}
              title="Bật/tắt âm thanh chuông báo khi có booking mới"
            >
              {settings.sound_alerts_enabled ? (
                <Volume2 className="w-4 h-4 text-brand-gold-dark" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="hidden md:inline font-medium">
                {settings.sound_alerts_enabled ? 'Chuông báo: Bật' : 'Chuông báo: Tắt'}
              </span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2.5 rounded-classic border border-border-default bg-bg-ivory hover:bg-bg-cream text-text-primary transition-colors"
                title="Thông báo mới"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-state-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-ivory-white border border-border-strong rounded-classic shadow-luxury-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-bg-cream border-b border-border-default flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      Thông báo hệ thống ({unreadNotifCount} chưa đọc)
                    </span>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-medium text-brand-gold-dark hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border-default">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-text-muted">
                        Chưa có thông báo mới.
                      </div>
                    ) : (
                      notifications.slice(0, 12).map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            'p-3.5 text-xs transition-colors',
                            !n.is_read ? 'bg-brand-champagne/25' : 'bg-bg-ivory-white'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-text-primary">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-text-muted shrink-0">
                              {formatDateTimeVN(n.created_at)}
                            </span>
                          </div>
                          <p className="text-text-secondary mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
