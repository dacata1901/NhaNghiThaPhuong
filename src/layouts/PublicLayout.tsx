import React, { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export const PublicLayout: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-ivory text-text-primary">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Mobile Sticky CTA Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-wood-deep text-text-on-dark border-t border-brand-gold/40 px-4 py-2.5 flex items-center justify-between gap-3 shadow-luxury-lg">
        <a
          href="tel:0944861242"
          className="h-10 inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-brand-gold-light px-3.5 border border-brand-gold/50 rounded-xl whitespace-nowrap"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>0944 861 242</span>
        </a>
        <Link
          to="/booking"
          className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 bg-brand-gold text-white text-xs font-extrabold uppercase tracking-wider px-4 rounded-xl whitespace-nowrap"
        >
          <span>Đặt phòng ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
