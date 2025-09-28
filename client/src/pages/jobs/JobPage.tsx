import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container, Section, Typography } from '../../components/ui';
import toast from 'react-hot-toast';
import type { Job } from '../../lib/types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import 'react-quill/dist/quill.snow.css';
import '../../styles/quill.css';
import '../../styles/job-view.css';
import { FiArrowLeft } from 'react-icons/fi';

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
         <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="absolute top-0 left-0 z-10 flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-lg bg-white/20 border border-white/20 hover:bg-white/30 transition shadow-xl"
                            aria-label="Back"
                            style={{ marginTop: '2rem', marginLeft: '2rem' }} // 2rem is ~mt-8/ml-8, tune for perfect alignment
                          >
                            <FiArrowLeft className="text-white text-2xl" />
                          </button>
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

          <div 
            className="ql-editor job-description mb-6 !p-0" 
            dangerouslySetInnerHTML={{ __html: job.job_description }} 
          />

          {job.location && (
            <Typography variant="body-large" color="text-gray-400" className="mb-2">
              <strong>Location:</strong> {job.location}
            </Typography>
          )}

          <Typography variant="body-large" color="text-gray-400" className="mb-10">
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
                onClick={() => navigate('/jobs/create', { state: { job } })}
                aria-label="Edit"
              >
                Edit
              </button>
            )}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
