import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center px-4 py-2 text-center';

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;