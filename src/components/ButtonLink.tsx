import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function ButtonLink(
  props: LinkProps & {
    variant?: Variant;
    fullWidth?: boolean;
  }
) {
  const { variant = 'primary', fullWidth, className, ...rest } = props;
  return (
    <Link
      {...rest}
      className={['btn', `btn--${variant}`, className ?? ''].join(' ')}
      style={{ width: fullWidth ? '100%' : undefined }}
    />
  );
}
