import { useEffect, useState } from 'react';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { Typography } from '../../components/ui/Typography';
import { Section } from '../../components/ui/Section';
import type { Application } from '../../lib/types';
import { 
  FiArrowLeft, 
  FiFilter, 
  FiChevronDown, 
  FiRefreshCw, 
} from 'react-icons/fi';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <Typography variant="body-large" className="text-red-400 mb-2">
            Something went wrong displaying this card
          </Typography>
          <Typography variant="body-small" className="text-gray-400">
            {this.state.error?.message}
          </Typography>
        </div>
      );
    }

    return this.props.children;
  }
}

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.41, 0.1, 0.2, 1],
    },
  }),
};

function CandidateCard({ application, index }: { application: Application; index: number }) {
  const {
    raw_data,
    structured_applications,
    resume_file_url,
  } = application;

  let formData;
  try {
    formData = typeof raw_data === 'string' ? JSON.parse(raw_data) : raw_data;
  } catch (e) {
    console.error('Error parsing raw_data:', e);
    formData = {};
  }

  const defaultStructured = {
    full_name: '',
    email: '',
    skills: [],
    score: 0,
    verdict: 'needs_review' as const,
    metrics: { skill_match: 0, experience_match: 0 },
    justification: 'Application not processed yet'
  };

  // structured_applications is an array from the database join, get the first item
  const structured = Array.isArray(structured_applications) && structured_applications.length > 0 
    ? structured_applications[0] 
    : defaultStructured;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
    >
      {/* Profile Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <Typography variant="body-large" className="text-white">
            {structured.full_name || formData.name}
          </Typography>
          <Typography variant="body-small" className="text-gray-400">
            {structured.email || formData.email}
          </Typography>
        </div>
        <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${structured.verdict === 'accepted' ? 'bg-green-400/10 text-green-400' : 
            structured.verdict === 'rejected' ? 'bg-red-400/10 text-red-400' :
            'bg-yellow-400/10 text-yellow-400'}
        `}>
          {structured.verdict ? (
            structured.verdict.charAt(0).toUpperCase() + structured.verdict.slice(1)
          ) : (
            'Needs Review'
          )}
        </div>
      </div>

      {/* Score and Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <Typography variant="body-large" className="text-white font-semibold">
            {structured.score || 0}%
          </Typography>
          <Typography variant="body-small" className="text-gray-400">
            Overall Score
          </Typography>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <Typography variant="body-large" className="text-white font-semibold">
            {(structured.metrics?.skill_match ?? 0).toFixed(0)}%
          </Typography>
          <Typography variant="body-small" className="text-gray-400">
            Skill Match
          </Typography>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <Typography variant="body-large" className="text-white font-semibold">
            {(structured.metrics?.experience_match ?? 0).toFixed(0)}%
          </Typography>
          <Typography variant="body-small" className="text-gray-400">
            Experience Match
          </Typography>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <Typography variant="body-medium" className="text-white font-semibold mb-2">
          Skills
        </Typography>
        <div className="flex flex-wrap gap-2">
          {(structured.skills || []).map((skill: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 bg-apple-blue/10 text-apple-blue rounded-md text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* AI Justification */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-3 mb-4">
        <Typography variant="body-medium" className="text-white font-semibold mb-2">
          AI Analysis
        </Typography>
        <Typography variant="body-small" className="text-gray-400">
          {structured.justification}
        </Typography>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {resume_file_url && (
          <a
            href={resume_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-apple-blue hover:bg-apple-blue/90 text-white rounded-md text-sm transition-colors"
          >
            View Resume
          </a>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(`mailto:${structured.email || formData.email}`);
          }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm transition-colors"
        >
          Contact
        </button>
      </div>
    </motion.div>
  );
}

export default function CandidatesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    verdict: 'all',
    sortBy: 'score',
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/applications?jobId=${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setApplications(data.data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => 
      filters.verdict === 'all' || 
      (Array.isArray(app.structured_applications) && 
       app.structured_applications[0]?.verdict === filters.verdict)
    )
    .sort((a, b) => {
      if (filters.sortBy === 'score') {
        const scoreA = Array.isArray(a.structured_applications) ? 
          a.structured_applications[0]?.score || 0 : 0;
        const scoreB = Array.isArray(b.structured_applications) ? 
          b.structured_applications[0]?.score || 0 : 0;
        return scoreB - scoreA;
      }
      return 0;
    });

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
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-apple-blue/20 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
    
      <Container className="relative py-8 mt-12">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-large" className="text-white mb-2">
            Candidate Applications
          </Typography>
          <Typography variant="body-large" className="text-gray-400">
            Review and manage candidate applications
          </Typography>
        </div>

      {/* Applications Grid */}
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="headline-small" className="text-white">Applications</Typography>
          <div className="flex gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <select
                  value={filters.verdict}
                  onChange={(e) => setFilters(f => ({ ...f, verdict: e.target.value }))}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent
                    hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm
                    text-sm font-medium"
                >
                  <option value="all">All Verdicts</option>
                  <option value="accepted" className="text-green-400">Accepted</option>
                  <option value="rejected" className="text-red-400">Rejected</option>
                  <option value="needs_review" className="text-yellow-400">Needs Review</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiFilter className="w-4 h-4" />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
                  group-hover:text-white transition-colors">
                  <FiChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div className="relative group">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent
                    hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-sm
                    text-sm font-medium"
                >
                  <option value="score">Sort by Score</option>
                  <option value="recent">Sort by Recent</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
                  group-hover:text-white transition-colors">
                  <FiChevronDown className="w-4 h-4" />
                </div>
              </div>

              <motion.button
                onClick={() => setFilters({ verdict: 'all', sortBy: 'score' })}
                className="p-2.5 bg-white/5 text-gray-400 hover:text-white border border-white/10 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-apple-blue hover:bg-white/10 
                  transition-colors backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset Filters"
              >
                <FiRefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center h-64">
            <Typography variant="body-large" className="text-gray-400">
              Loading applications...
            </Typography>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="grid place-items-center h-64">
            <Typography variant="body-large" className="text-gray-400">
              No applications found
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredApplications.map((application, index) => (
              <ErrorBoundary key={application.id}>
                <CandidateCard
                  application={application}
                  index={index}
                />
              </ErrorBoundary>
            ))}
          </div>
        )}
      </div>
      </Container>
    </Section>
  );
}