import React from 'react';

interface FormCardProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const maxWidths = { small: 420, medium: 640, large: 860 };

export const FormCard: React.FC<FormCardProps> = ({
  children,
  size = 'medium',
  className = '',
}) => (
  <div
    className={className}
    style={{
      width: '100%',
      maxWidth: maxWidths[size],
      background: 'rgba(255,255,255,0.035)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18,
      padding: '32px 28px',
    }}
  >
    {children}
  </div>
);
