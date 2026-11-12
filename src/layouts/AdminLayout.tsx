import React, { useState } from 'react';
import { NavLink, Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  CheckCheck,
  Volume2,
  VolumeX,
  ArrowLeftRight,
  Phone,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useHotelData } from '@/context/HotelDataContext';
import { SEOHead } from '@/components/common/SEOHead';
import { cn, formatDateTimeVN } from '@/lib/utils';

const ADMIN_NAV_ITEMS = [
  { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Đơn đặt phòng', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Danh sách Phòng', path: '/admin/rooms', icon: BedDouble },
  { label: 'Tin nhắn Khách', path: '/admin/messages', icon: MessageSquare },
  { label: 'Cài đặt Nhà nghỉ', path: '/admin/settings', icon: Settings },
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
      <SEOHead
        title="Quản trị hệ thống | Nhà Nghỉ Tha Phương"
        description="Trang quản trị nội bộ Nhà Nghỉ Tha Phương"
        canonicalPath="/admin"
        noIndex={true}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[270px] bg-bg-wood-deep text-text-on-dark flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 shrink-0 shadow-luxury-lg',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <span className="font-serif text-lg font-extrabold tracking-[0.12em] uppercase text-brand-gold-light block">
                THA PHƯƠNG ADMIN
              </span>
              <span className="text-xs font-semibold text-text-on-dark/70">
                Quản lý đơn giản &amp; nhanh chóng
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

          {/* Nút chuyển nhanh qua lại Admin <-> User */}
          <div className="px-4 pt-4">
            <Link
              to="/"
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light font-extrabold text-xs hover:bg-brand-gold hover:text-text-on-dark transition-all shadow-sm"
            >
              <span className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Chuyển qua Giao diện Khách
              </span>
            </Link>
          </div>

          <nav className="p-4 space-y-1.5">
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
                      'flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all',
                      isActive
                        ? 'bg-brand-gold text-text-on-dark font-extrabold shadow-sm'
                        : 'text-text-on-dark/80 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-state-warning text-white">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2.5">
          <div className="px-4 py-2.5 rounded-xl bg-white/5 text-xs text-text-on-dark/80">
            <span className="block font-extrabold text-brand-gold-light">
              {adminUser?.name}
            </span>
            <span className="block truncate text-[11px] text-text-on-dark/65">
              {adminUser?.email}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-extrabold text-red-300 hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-bg-ivory-white border-b border-border-default px-4 sm:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-border-default text-text-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-extrabold text-text-primary">
                Quản lý {settings.hotel_name}
              </h1>
              <p className="text-xs font-semibold text-text-secondary hidden sm:flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-gold-dark" />
                Hotline: <strong>{settings.phone_primary}</strong> • Email:{' '}
                <strong>{settings.email_notification}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative">
            {/* Nút chuyển nhanh Admin <-> User trên thanh Header */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-bg-wood-deep text-brand-gold-light hover:bg-brand-gold hover:text-text-on-dark text-xs font-extrabold transition-colors shadow-sm"
              title="Chuyển ngay sang trang Khách hàng (User)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Giao diện Khách (User)</span>
            </Link>

            <button
              type="button"
              onClick={toggleSoundAlerts}
              className={cn(
                'p-2.5 rounded-xl border text-xs flex items-center gap-1.5 font-bold transition-colors',
                settings.sound_alerts_enabled
                  ? 'border-brand-gold bg-brand-champagne/40 text-bg-wood-deep'
                  : 'border-border-default bg-bg-ivory text-text-muted'
              )}
              title="Bật/tắt âm thanh chuông báo khi có đơn mới"
            >
              {settings.sound_alerts_enabled ? (
                <Volume2 className="w-4 h-4 text-brand-gold-dark" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="hidden md:inline">
                {settings.sound_alerts_enabled ? 'Chuông: Bật' : 'Chuông: Tắt'}
              </span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2.5 rounded-xl border border-border-default bg-bg-ivory hover:bg-bg-cream text-text-primary transition-colors"
                title="Thông báo mới"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-state-danger text-white text-[10px] font-extrabold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bg-ivory-white border border-border-strong rounded-2xl shadow-luxury-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-bg-cream border-b border-border-default flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                      Thông báo ({unreadNotifCount} mới)
                    </span>
                    {unreadNotifCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-extrabold text-brand-gold-dark hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Đã đọc hết
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border-default">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs font-semibold text-text-muted">
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
                            <span className="font-extrabold text-text-primary">
                              {n.title}
                            </span>
                            <span className="text-[10px] font-semibold text-text-muted shrink-0">
                              {formatDateTimeVN(n.created_at)}
                            </span>
                          </div>
                          <p className="font-medium text-text-secondary mt-1">
                            {n.message}
                          </p>
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
