import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Container } from './Container';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'backdrop-blur-xl bg-white/80 dark:bg-apple-black/80' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.41, 0.1, 0.2, 1] }}
      >
        <Container>
          <nav className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-display font-semibold">
              HireAI
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/dashboard" current={location.pathname === '/dashboard'}>
                Dashboard
              </NavLink>
              <NavLink to="/jobs" current={location.pathname.startsWith('/jobs')}>
                Jobs
              </NavLink>
              <NavLink to="/applications" current={location.pathname.startsWith('/applications')}>
                Applications
              </NavLink>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className={`text-sm font-medium transition-colors duration-200 ${
                  isScrolled ? 'text-apple-black dark:text-white' : 'text-apple-black dark:text-white'
                }`}
              >
                Profile
              </Link>
            </div>
          </nav>
        </Container>
      </motion.header>
    </AnimatePresence>
  );
}

function NavLink({ to, current, children }: { to: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`relative py-2 text-sm font-medium transition-colors duration-200 ${
        current ? 'text-apple-blue' : 'text-apple-gray-medium hover:text-apple-black dark:hover:text-white'
      }`}
    >
      {children}
      {current && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-apple-blue"
          layoutId="underline"
          transition={{ duration: 0.3, ease: [0.41, 0.1, 0.2, 1] }}
        />
      )}
    </Link>
  );
}
