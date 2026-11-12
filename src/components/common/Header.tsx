import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Search, CalendarCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Danh sách phòng', path: '/rooms' },
  { label: 'Đặt phòng nhanh', path: '/booking' },
  { label: 'Tra cứu đơn', path: '/booking-lookup' },
  { label: 'Giới thiệu', path: '/about' },
  { label: 'Liên hệ', path: '/contact' },
];

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isTransparentHeroPage = location.pathname === '/';
  const useSolidStyle = !isTransparentHeroPage || isScrolled || mobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-200',
        useSolidStyle
          ? 'bg-bg-ivory-white/95 backdrop-blur-md border-b border-border-default py-3 shadow-luxury'
          : 'bg-gradient-to-b from-bg-wood-deep/90 via-bg-wood-deep/55 to-transparent py-4'
      )}
    >
      <div className="container-luxury flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Logo
          tone={useSolidStyle ? 'dark' : 'light'}
          size="small"
          hotelName="Nhà Nghỉ Tha Phương"
        />

        {/* Center: Clean Scientific Navigation Bar */}
        <nav
          className={cn(
            'hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-card border transition-colors',
            useSolidStyle
              ? 'bg-bg-ivory border-border-default'
              : 'bg-bg-wood-deep/55 border-white/15 backdrop-blur-sm'
          )}
          aria-label="Menu chính"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-2 rounded-classic text-[14px] font-medium transition-all duration-150 whitespace-nowrap',
                  useSolidStyle
                    ? isActive
                      ? 'bg-bg-wood-deep text-text-on-dark font-semibold shadow-sm'
                      : 'text-text-primary hover:bg-bg-cream hover:text-bg-wood-deep'
                    : isActive
                    ? 'bg-brand-gold text-text-on-dark font-semibold shadow-sm'
                    : 'text-text-on-dark/90 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Hotline + Primary CTA */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <a
            href="tel:0944861242"
            className={cn(
              'inline-flex items-center gap-2 text-[13px] font-semibold px-3.5 py-2 rounded-classic border transition-colors',
              useSolidStyle
                ? 'bg-bg-ivory border-border-default text-text-primary hover:border-brand-gold'
                : 'bg-white/10 border-white/25 text-text-on-dark hover:bg-white/20'
            )}
          >
            <Phone className="w-3.5 h-3.5 text-brand-gold" />
            <span>0944 861 242</span>
          </a>

          <Link to="/booking">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CalendarCheck className="w-4 h-4" />}
            >
              Đặt phòng ngay
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={cn(
            'lg:hidden p-2.5 rounded-classic border transition-colors',
            useSolidStyle
              ? 'text-text-primary border-border-default hover:bg-bg-cream'
              : 'text-text-on-dark border-white/30 hover:bg-white/10'
          )}
          aria-label="Mở menu điều hướng"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-bg-ivory-white border-b border-border-default px-4 pt-3 pb-6 mt-3 space-y-3 shadow-luxury-lg">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'px-3.5 py-2.5 rounded-classic text-[15px] font-medium transition-colors',
                    isActive
                      ? 'bg-bg-wood-deep text-text-on-dark font-semibold'
                      : 'text-text-primary hover:bg-bg-cream'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-border-default flex flex-col gap-2.5">
            <a
              href="tel:0944861242"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold border border-border-strong rounded-classic text-text-primary bg-bg-ivory"
            >
              <Phone className="w-4 h-4 text-brand-gold-dark" />
              Gọi lễ tân: 0944 861 242
            </a>
            <Link to="/booking" className="w-full">
              <Button variant="primary" fullWidth size="md">
                Đặt phòng trực tuyến
              </Button>
            </Link>
            <Link
              to="/booking-lookup"
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary py-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Tra cứu mã đặt phòng
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
