import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button, Container, Section, Typography } from '../../components/ui';
import toast from 'react-hot-toast';

interface StatItemProps {
  number: string;
  text: string;
}

function StatItem({ number, text }: StatItemProps) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography variant="display-small" className="text-white font-display">
        {number}
      </Typography>
      <Typography variant="body-medium" color="text-gray-400">
        {text}
      </Typography>
    </motion.div>
  );
}

export default function LoginPage() {
  const { login: signIn, user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section fullScreen>
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-apple-black to-apple-gray-dark" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Animated Gradients */}
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <Container className="relative flex min-h-screen">
        {/* Left Column - Form */}
        <motion.div 
          className="w-full lg:w-1/2 flex items-center justify-center order-2 lg:order-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full max-w-md p-8">
            <motion.div
              className="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="space-y-6">
                <div className="text-center">
                  <Typography variant="headline-medium" className="text-white">
                    Pioneer the Future of Hiring
                  </Typography>
                  <Typography variant="body-medium" color="text-gray-400">
                    Early access members get premium features free
                  </Typography>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                      placeholder="Email"
                    />
                    <input
                      type="password"
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                      placeholder="Password"
                    />
                  </motion.div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    className="mt-6"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <Typography variant="body-medium" color="text-gray-400" className="text-center">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-apple-blue hover:text-apple-blue-dark transition-colors duration-300"
                  >
                    Create Account
                  </Link>
                </Typography>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Stats */}
        <motion.div 
          className="hidden lg:flex flex-col justify-center w-1/2 pl-20 order-1 lg:order-2"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="space-y-12">
            <div>
              <Typography variant="display-medium" className="text-white mb-4">
                Be Among the First{' '}
                <span className="bg-gradient-to-r from-apple-blue to-purple-500 bg-clip-text text-transparent">
                  500
                </span>
                {' '}Companies
              </Typography>
              <Typography variant="body-large" color="text-gray-400" className="max-w-md">
                Join the AI revolution in hiring. Our advanced AI technology is set to transform how companies find and evaluate talent. Early adopters get exclusive benefits.
              </Typography>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <StatItem number="85%" text="Projected Cost Reduction" />
              <StatItem number="70%" text="Expected Time Savings" />
              <StatItem number="90%" text="AI Match Accuracy" />
              <StatItem number="24hrs" text="Target Response Time" />
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
