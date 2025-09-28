import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Button, Container, Section, Typography } from '../../components/ui';
import toast from 'react-hot-toast';

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <motion.div
      className="flex items-center space-x-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-2xl">{icon}</span>
      <Typography variant="body-large" color="text-gray-300">
        {text}
      </Typography>
    </motion.div>
  );
}

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <Section fullScreen>
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-apple-black to-apple-gray-dark" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Animated Gradients */}
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
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
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
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
        {/* Left Column - Hero Content */}
        <motion.div 
          className="hidden lg:flex flex-col justify-center w-1/2 pr-20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="display-large" className="text-white">
                Welcome to the Future of{' '}
                <span className="bg-gradient-to-r from-apple-blue to-purple-500 bg-clip-text text-transparent">
                  Hiring
                </span>
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography variant="body-large" color="text-gray-400" className="max-w-md">
                Experience the power of AI-driven recruitment. Build your dream team with intelligent matching, automated screening, and data-driven insights.
              </Typography>
            </motion.div>

            {/* Feature List */}
            <motion.div 
              className="space-y-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <FeatureItem icon="⚡️" text="Smart candidate matching" />
              <FeatureItem icon="🤖" text="AI-powered screening" />
              <FeatureItem icon="📊" text="Advanced analytics" />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Form */}
        <motion.div 
          className="w-full lg:w-1/2 flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
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
                    Create Account
                  </Typography>
                  <Typography variant="body-medium" color="text-gray-400">
                    Join thousands of companies hiring smarter
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
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                      placeholder="Email"
                    />
                    <input
                      type="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                      placeholder="Password (8+ characters)"
                      minLength={8}
                    />
                    <input
                      type="password"
                      id="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                      placeholder="Confirm Password"
                      minLength={8}
                    />
                  </motion.div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    className="mt-6"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <Typography variant="body-medium" color="text-gray-400" className="text-center">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-apple-blue hover:text-apple-blue-dark transition-colors duration-300"
                  >
                    Sign in
                  </Link>
                </Typography>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}