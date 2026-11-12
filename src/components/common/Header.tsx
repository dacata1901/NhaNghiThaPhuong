import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, CalendarCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Hạng phòng', path: '/rooms' },
  { label: 'Giới thiệu', path: '/about' },
  { label: 'Liên hệ', path: '/contact' },
];

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-bg-ivory-white/95 backdrop-blur-md shadow-luxury border-b border-border-default/80 py-2.5'
          : 'bg-bg-ivory-white/90 backdrop-blur-sm border-b border-border-default/50 py-3.5'
      )}
    >
      <div className="container-luxury flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <Logo size="small" hotelName="Nhà Nghỉ Tha Phương" />

        {/* Center: Refined, Graceful Desktop Navigation */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden lg:flex items-center gap-1 bg-bg-cream/60 px-2.5 py-1.5 rounded-full border border-border-default/80 shadow-xs"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-200',
                  isActive
                    ? 'bg-bg-wood-deep text-brand-gold-light shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-ivory-white/80'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Call + Book CTA (No Admin switch, No SMS button) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="tel:0944861242"
            className="hidden xl:inline-flex items-center gap-2 bg-bg-cream/60 px-4 py-2 rounded-full border border-border-default/80 text-xs font-extrabold text-text-primary hover:text-brand-gold-dark transition-colors"
            title="Gọi điện lễ tân"
          >
            <Phone className="w-3.5 h-3.5 text-state-success" />
            0944 861 242
          </a>

          <Link to="/booking">
            <Button
              variant="primary"
              size="md"
              leftIcon={<CalendarCheck className="w-4 h-4" />}
              className="rounded-full shadow-xs font-extrabold px-5"
            >
              Đặt phòng ngay
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMobileMenuOpen}
          className="lg:hidden p-2.5 text-text-primary hover:text-brand-gold-dark rounded-xl border border-border-default bg-bg-ivory-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-bg-ivory-white border-b border-border-default shadow-luxury-lg animate-fadeIn">
          <div className="container-luxury py-4 flex flex-col gap-1.5">
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'py-3 px-4 rounded-xl text-[15px] font-bold transition-colors flex items-center justify-between',
                    isActive
                      ? 'bg-bg-wood-deep text-brand-gold-light'
                      : 'text-text-primary hover:bg-bg-cream/60'
                  )
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="pt-3 mt-2 border-t border-border-default grid grid-cols-2 gap-2.5">
              <a
                href="tel:0944861242"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-state-success/15 text-state-success text-sm font-extrabold border border-state-success/30"
              >
                <Phone className="w-4 h-4" />
                Gọi: 0944 861 242
              </a>
              <Link to="/booking">
                <Button variant="primary" fullWidth className="rounded-xl font-extrabold">
                  Đặt phòng ngay
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
