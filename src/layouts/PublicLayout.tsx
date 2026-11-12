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
      <main className="flex-1 pb-16 sm:pb-0">
        <Outlet />
      </main>
      <Footer />

      {/* Mobile Sticky CTA Bar matching Figma Mobile/Tablet frames (24:521, 24:522) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-wood-deep text-text-on-dark border-t border-brand-gold/40 px-4 py-2.5 flex items-center justify-between gap-3 shadow-luxury-lg">
        <a
          href="tel:0944861242"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-gold-light py-2 px-3 border border-brand-gold/40 rounded-classic"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>0944 861 242</span>
        </a>
        <Link
          to="/booking"
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand-gold text-text-on-dark text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-classic"
        >
          <span>Đặt phòng ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
