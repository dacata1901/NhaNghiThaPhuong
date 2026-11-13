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
      <div
        className={cn(
          'rounded-classic flex items-center justify-center font-extrabold tracking-tight border transition-colors shrink-0',
          isSmall
            ? 'w-9 h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-sm md:text-base lg:text-lg'
            : 'w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-base md:text-lg lg:text-xl',
          isLight
            ? 'bg-brand-gold text-text-on-dark border-brand-gold'
            : 'bg-bg-wood-deep text-brand-gold-light border-bg-wood-deep group-hover:bg-brand-gold group-hover:text-text-on-dark group-hover:border-brand-gold'
        )}
      >
        TP
      </div>
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
