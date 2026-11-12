import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  light?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3.5 max-w-3xl',
        align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start',
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'text-sm sm:text-base font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full border',
            light
              ? 'text-brand-gold-light border-brand-gold/40 bg-white/5'
              : 'text-brand-gold-dark border-brand-gold/40 bg-brand-champagne/40'
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-tight',
          light ? 'text-text-on-dark' : 'text-text-primary'
        )}
      >
        {title}
      </h2>
      <div className="flex items-center gap-2.5 my-1">
        <span className="w-12 h-[2px] bg-brand-gold" />
        <span className="w-2.5 h-2.5 rotate-45 border-2 border-brand-gold" />
        <span className="w-12 h-[2px] bg-brand-gold" />
      </div>
      {subtitle && (
        <p
          className={cn(
            'text-base sm:text-lg font-medium leading-relaxed',
            light ? 'text-text-on-dark/85' : 'text-text-secondary'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
