import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TypographyProps {
  variant?: 'display-large' | 'display-medium' | 'display-small' | 
           'headline-large' | 'headline-medium' | 'headline-small' | 
           'body-large' | 'body-medium' | 'body-small';
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  color?: string;
  gradient?: boolean;
  animate?: boolean;
}

export function Typography({
  variant = 'body-medium',
  children,
  as: Component = 'div',
  className = '',
  color = '',
  gradient = false,
  animate = false,
}: TypographyProps) {
  const baseStyles = {
    'display-large': 'text-display-large font-display',
    'display-medium': 'text-display-medium font-display',
    'display-small': 'text-display-small font-display',
    'headline-large': 'text-headline-large font-display',
    'headline-medium': 'text-headline-medium font-display',
    'headline-small': 'text-headline-small font-display',
    'body-large': 'text-body-large',
    'body-medium': 'text-body-medium',
    'body-small': 'text-body-small',
  };

  const colorStyle = color || '';
  const gradientStyle = gradient ? 'bg-clip-text text-transparent bg-gradient-to-r from-apple-blue to-purple-600' : '';
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.41, 0.1, 0.2, 1] }}
      >
        <Component className={`${baseStyles[variant]} ${colorStyle} ${gradientStyle} ${className}`}>
          {children}
        </Component>
      </motion.div>
    );
  }

  return (
    <Component className={`${baseStyles[variant]} ${colorStyle} ${gradientStyle} ${className}`}>
      {children}
    </Component>
  );
}
