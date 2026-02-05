import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs md:text-sm font-medium text-void-black mb-2">
          {label}
          {props.required && <span className="text-electric-cyan ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-void-black opacity-50">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-white border ${
            error ? 'border-red-500' : 'border-slate-grey/30'
          } text-void-black px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-lg focus:outline-none focus:border-electric-cyan focus:shadow-[0_0_20px_rgba(230,179,30,0.2)] transition-all duration-300 ${
            icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs md:text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs md:text-sm text-void-black opacity-60">{helperText}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs md:text-sm font-medium text-void-black mb-2">
          {label}
          {props.required && <span className="text-electric-cyan ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full bg-white border ${
          error ? 'border-red-500' : 'border-slate-grey/30'
        } text-void-black px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-lg focus:outline-none focus:border-electric-cyan focus:shadow-[0_0_20px_rgba(230,179,30,0.2)] transition-all duration-300 resize-vertical min-h-[100px] md:min-h-[120px] ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs md:text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs md:text-sm text-void-black opacity-60">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs md:text-sm font-medium text-void-black mb-2">
          {label}
          {props.required && <span className="text-electric-cyan ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full bg-white border ${
          error ? 'border-red-500' : 'border-slate-grey/30'
        } text-void-black px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-lg focus:outline-none focus:border-electric-cyan focus:shadow-[0_0_20px_rgba(230,179,30,0.2)] transition-all duration-300 ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs md:text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs md:text-sm text-void-black opacity-60">{helperText}</p>
      )}
    </div>
  );
};
