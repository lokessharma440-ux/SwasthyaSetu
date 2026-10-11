import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-primary-light text-primary-dark hover:bg-green-200 focus:ring-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light focus:ring-primary',
    ghost: 'text-primary hover:bg-primary-light focus:ring-primary'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-lg',
    lg: 'px-8 py-4 text-xl w-full'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
