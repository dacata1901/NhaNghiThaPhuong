import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  tone?: 'dark' | 'light';
  size?: 'large' | 'small';
  hotelName?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  tone = 'dark',
  size = 'large',
  hotelName = 'Nhà Nghỉ Tha Phương',
  className,
}) => {
  const isLight = tone === 'light';
  const isSmall = size === 'small';

  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-3 group focus:outline-none shrink-0',
        className
      )}
    >
      <img
        src="/images/logo-tha-phuong.webp"
        alt={`Logo ${hotelName}`}
        className={cn(
          'rounded-full object-cover border-2 transition-transform group-hover:scale-105 shrink-0 bg-white shadow-sm',
          isSmall
            ? 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14'
            : 'w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16',
          isLight ? 'border-brand-gold' : 'border-brand-gold/60'
        )}
      />
      <div className="flex flex-col">
        <span
          className={cn(
            'font-sans font-extrabold tracking-tight leading-tight transition-colors',
            isLight
              ? 'text-text-on-dark group-hover:text-brand-gold-light'
              : 'text-text-primary group-hover:text-brand-gold-dark',
            isSmall
              ? 'text-base md:text-lg lg:text-[22px]'
              : 'text-lg sm:text-xl lg:text-2xl'
          )}
        >
          {hotelName}
        </span>
        <span
          className={cn(
            'font-sans font-semibold tracking-normal mt-0.5',
            isLight ? 'text-brand-gold-light/90' : 'text-text-secondary',
            isSmall ? 'text-[11px] lg:text-xs' : 'text-xs lg:text-sm'
          )}
        >
          Lưu trú sạch sẽ &amp; Tiện nghi
        </span>
      </div>
    </Link>
  );
};
