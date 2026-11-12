import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  backgroundImage?: string;
}

export const PageBanner: React.FC<PageBannerProps> = ({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  backgroundImage = '/images/rooms/phong-1-giuong/khong-gian-phong.jpg',
}) => {
  return (
    <section className="relative bg-bg-wood-deep text-text-on-dark pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden border-b border-border-default">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-wood-deep/90 via-bg-wood-deep/80 to-bg-wood-deep/95" />

      <div className="container-luxury relative z-10 flex flex-col items-center text-center">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-text-on-dark/70 mb-4"
          >
            <Link to="/" className="hover:text-brand-gold-light transition-colors">
              Trang chủ
            </Link>
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-brand-gold/70" />
                {bc.href ? (
                  <Link
                    to={bc.href}
                    className="hover:text-brand-gold-light transition-colors"
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-brand-gold-light font-medium">
                    {bc.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {eyebrow && (
          <span className="text-xs sm:text-sm font-semibold text-brand-gold-light mb-2">
            {eyebrow}
          </span>
        )}

        <h1 className="text-heading-h1 text-text-on-dark max-w-3xl">{title}</h1>

        {subtitle && (
          <p className="text-sm sm:text-base text-text-on-dark/80 max-w-2xl mt-3 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};
