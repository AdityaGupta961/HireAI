import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
  animate?: boolean;
}

export function Container({ 
  children, 
  className = '', 
  fullHeight = false,
  animate = false,
}: ContainerProps) {
  const baseStyles = 'w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl';
  const heightStyles = fullHeight ? 'min-h-screen' : '';

  if (animate) {
    return (
      <motion.div
        className={`${baseStyles} ${heightStyles} ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.41, 0.1, 0.2, 1] }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyles} ${heightStyles} ${className}`}>
      {children}
    </div>
  );
}
