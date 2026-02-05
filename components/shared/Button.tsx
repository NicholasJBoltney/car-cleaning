import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-electric-cyan text-void-black hover:bg-[#d4a017] hover:shadow-[0_0_25px_rgba(230,179,30,0.4)] hover:-translate-y-0.5',
    secondary: 'bg-transparent text-void-black border border-slate-grey hover:border-electric-cyan hover:text-electric-cyan',
    ghost: 'bg-transparent text-void-black hover:bg-slate-grey hover:text-void-black',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm',
    md: 'px-4 py-2 text-sm md:px-6 md:py-3 md:text-base',
    lg: 'px-6 py-3 text-base md:px-8 md:py-4 md:text-lg',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
