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
          'rounded-classic flex items-center justify-center font-bold tracking-tight border transition-colors shrink-0',
          isSmall ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base',
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
            'font-sans font-bold tracking-tight leading-tight transition-colors',
            isLight
              ? 'text-text-on-dark group-hover:text-brand-gold-light'
              : 'text-text-primary group-hover:text-brand-gold-dark',
            isSmall ? 'text-base sm:text-[17px]' : 'text-lg sm:text-xl'
          )}
        >
          {hotelName}
        </span>
        <span
          className={cn(
            'font-sans font-medium tracking-normal mt-0.5',
            isLight ? 'text-brand-gold-light/90' : 'text-text-secondary',
            isSmall ? 'text-[11px]' : 'text-xs'
          )}
        >
          Lưu trú sạch sẽ &amp; Tiện nghi
        </span>
      </div>
    </Link>
  );
};
