import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'overlay' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary:
        'bg-brand-gold text-white hover:bg-brand-gold-dark border border-brand-gold hover:border-brand-gold-dark shadow-sm',
      secondary:
        'bg-bg-ivory-white text-text-primary border border-border-strong hover:bg-bg-cream hover:border-brand-gold-dark shadow-2xs',
      outline:
        'bg-bg-ivory-white text-text-primary border border-border-strong hover:bg-bg-cream hover:border-brand-gold-dark',
      dark:
        'bg-bg-wood-deep text-white hover:bg-bg-wood border border-bg-wood-deep',
      overlay:
        'bg-white/15 text-white border border-white/50 hover:bg-white/25 backdrop-blur-sm',
      danger:
        'bg-state-danger text-white hover:opacity-90 border border-state-danger',
      ghost:
        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-cream/60 border border-transparent',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-[13px]',
      md: 'px-5 py-2.5 text-[14px]',
      lg: 'px-7 py-3.5 text-[15px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-sans font-bold tracking-normal rounded-classic transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 disabled:opacity-55 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
