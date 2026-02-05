import React from 'react';

interface BookingStepCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * BookingStepCard – dark-theme header + glass panel wrapper for each booking step.
 */
export const BookingStepCard: React.FC<BookingStepCardProps> = ({
  children,
  title,
  subtitle,
  className = '',
}) => (
  <div className="w-full flex justify-center">
    <div className="w-full" style={{ maxWidth: 860 }}>
      {/* header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <h2 style={{
          color: '#F0F0F3',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* glass panel */}
      <div
        className={className}
        style={{
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '32px 28px',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);
