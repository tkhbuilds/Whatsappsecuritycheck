import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    fullWidth?: boolean;
  }
) {
  const { variant = 'primary', fullWidth, className, ...rest } = props;
  return (
    <button
      {...rest}
      className={['btn', `btn--${variant}`, fullWidth ? 'w-full' : '', className ?? ''].join(' ')}
      style={{ width: fullWidth ? '100%' : undefined, ...(props.style ?? {}) }}
    />
  );
}
