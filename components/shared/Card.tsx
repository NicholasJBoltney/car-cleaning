import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
  onClick,
}) => {
  const baseStyles = 'rounded-2xl p-4 md:p-8 transition-all duration-300';

  const glassStyles = glass
    ? 'glass bg-white/40'
    : 'bg-white border border-slate-grey/20';

  const hoverStyles = hover
    ? 'cursor-pointer hover:border-electric-cyan hover:shadow-[0_0_30px_rgba(230,179,30,0.15)] hover:-translate-y-1'
    : '';

  return (
    <div
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
