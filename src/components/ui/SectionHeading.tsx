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
        'flex flex-col gap-3 max-w-2xl',
        align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start',
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'text-xs sm:text-sm font-semibold',
            light ? 'text-brand-gold-light' : 'text-brand-gold-dark'
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'text-heading-h2',
          light ? 'text-text-on-dark' : 'text-text-primary'
        )}
      >
        {title}
      </h2>
      <div className="flex items-center gap-2 my-1">
        <span className="w-8 h-[1px] bg-brand-gold" />
        <span className="w-2 h-2 rotate-45 border border-brand-gold" />
        <span className="w-8 h-[1px] bg-brand-gold" />
      </div>
      {subtitle && (
        <p
          className={cn(
            'text-sm sm:text-base leading-relaxed',
            light ? 'text-text-on-dark/80' : 'text-text-secondary'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
