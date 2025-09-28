import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  fullScreen?: boolean;
  animate?: boolean;
}

export function Section({
  children,
  className = '',
  dark = false,
  fullScreen = false,
  animate = false,
}: SectionProps) {
  const baseStyles = 'w-full relative overflow-hidden';
  const heightStyles = fullScreen ? 'min-h-screen' : 'py-20 md:py-32';
  const bgStyles = dark ? 'bg-apple-black text-white' : 'bg-white text-apple-black';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.41, 0.1, 0.2, 1],
        staggerChildren: 0.1
      }
    }
  };

  if (animate) {
    return (
      <motion.section
        className={`${baseStyles} ${heightStyles} ${bgStyles} ${className}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {children}
      </motion.section>
    );
  }

  return (
    <section className={`${baseStyles} ${heightStyles} ${bgStyles} ${className}`}>
      {children}
    </section>
  );
}
