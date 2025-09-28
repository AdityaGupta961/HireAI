import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container, Section, Typography } from '../../components/ui';
import toast from 'react-hot-toast';
import type { Job } from '../../lib/types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// Utility for intelligent styling of the job description
function IntelligentDescription({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Section headings: line ends with ":" or is all uppercase, min 5 letters
        if (
          /^[A-Z\s]{5,}:?$/.test(trimmed) ||
          (trimmed.endsWith(':') && trimmed.length > 3)
        ) {
          return (
            <Typography key={idx} variant="headline-small" className="text-white mt-6 mb-3">
              {trimmed.replace(/:$/, '')}
            </Typography>
          );
        }

        // Bullets: - , *, •, or 1. etc.
        if (
          /^([-*•])\s/.test(trimmed) ||
          /^\d+\.\s/.test(trimmed)
        ) {
          return (
            <div key={idx} className="flex items-start ml-5 mb-2">
              <span className="text-apple-blue mr-2 mt-1">•</span>
              <Typography variant="body-medium" className="text-gray-300">
                {trimmed.replace(/^([-*•]|\d+\.)\s/, '')}
              </Typography>
            </div>
          );
        }

        // Skip empty lines, but preserve paragraph breaks
        if (trimmed === "") return <div key={idx} className="mb-2" />;

        // Default: paragraph style
        return (
          <Typography key={idx} variant="body-medium" className="text-gray-300 mb-2">
            {trimmed}
          </Typography>
        );
      })}
    </div>
  );
}

export default function JobPage() {
  const { shareablelink } = useParams<{ shareablelink: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(sessionStorage.getItem('token'));
  }, []);

  useEffect(() => {
    async function fetchJob() {
      if (!shareablelink) return;

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/jobs/${shareablelink}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token') ?? ''}`,
          },
        });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to load job');
        }

        setJob(json); // Backend returns single job object
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch job');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [shareablelink, navigate]);

  if (loading) {
    return (
      <Section fullScreen>
        <Container className="relative py-20 text-center">
          <LoadingSpinner />
        </Container>
      </Section>
    );
  }

  if (!job) {
    return (
      <Section fullScreen>
        <Container className="relative py-20 text-center">
          <Typography variant="headline-large" className="text-white">
            Job not found
          </Typography>
          <Button onClick={() => navigate('/dashboard')} className="mt-6" aria-label="Back to dashboard">
            Back to Dashboard
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section fullScreen>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-apple-black to-apple-gray-dark" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-500/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <Container className="relative flex min-h-screen max-w-[900px] mx-auto items-start py-20">
        <motion.div
          className="w-full backdrop-blur-2xl bg-white/10 rounded-3xl p-12 shadow-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="display-large" className="text-white mb-4">
            {job.title}
          </Typography>
          <Typography variant="headline-small" className="text-apple-blue mb-6">
            {job.company_name}
          </Typography>

          <IntelligentDescription text={job.job_description} className="mb-6" />

          {job.location && (
            <Typography variant="body-medium" color="text-gray-400" className="mb-6">
              <strong>Location:</strong> {job.location}
            </Typography>
          )}

          <Typography variant="body-medium" color="text-gray-400" className="mb-10">
            <strong>Status:</strong> {job.status}
          </Typography>

          {/* Apple esc. style button group */}
          <div className="flex gap-4 mt-10">
            <button
              className="flex-1 py-4 rounded-full bg-apple-blue border border-white/10 backdrop-blur-md shadow-lg text-white text-lg font-semibold transition hover:bg-apple-blue/10 hover:shadow-xl active:scale-95"
              style={{
                WebkitBackdropFilter: 'blur(12px)',
                backdropFilter: 'blur(12px)',
              }}
              onClick={() => navigate(`/jobs/${shareablelink}/apply`)}
              aria-label="Apply to this job"
            >
              Apply
            </button>
            {token && (
              <button
                className="flex-1 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg text-white text-lg font-semibold transition hover:bg-white/15 hover:shadow-xl active:scale-95"
                style={{
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                }}
                onClick={() => navigate('/dashboard')}
                aria-label="Back to dashboard"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
