import React from 'react';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, label, error, helperText, leftIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary"
          >
            {label}
            {props.required && <span className="text-state-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-bg-ivory-white text-text-primary placeholder:text-text-muted text-sm px-3.5 py-2.5 rounded-classic border transition-colors duration-150 focus:outline-none',
              leftIcon && 'pl-10',
              error
                ? 'border-state-danger focus:border-state-danger focus:ring-1 focus:ring-state-danger/30'
                : 'border-border-default hover:border-border-strong focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-state-danger mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium uppercase tracking-[0.12em] text-text-secondary"
          >
            {label}
            {props.required && <span className="text-state-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full bg-bg-ivory-white text-text-primary placeholder:text-text-muted text-sm px-3.5 py-2.5 rounded-classic border transition-colors duration-150 focus:outline-none',
            error
              ? 'border-state-danger focus:border-state-danger focus:ring-1 focus:ring-state-danger/30'
              : 'border-border-default hover:border-border-strong focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-state-danger mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-text-muted mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

TextAreaField.displayName = 'TextAreaField';
