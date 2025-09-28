import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiBriefcase, FiClock, FiCheckCircle, FiAlertCircle, FiLogOut } from "react-icons/fi";
import { Button, Container, Section, Typography } from "../../components/ui";
import { jobsApi } from "../../lib/api";
import type { Job } from "../../lib/types";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface ActivityItemProps {
  jobId: string;
  title: string;
  description: string;
  time: string;
  status: "pending" | "completed" | "urgent";
  totalApplicants: number;
  metrics: {
    accepted: number;
    rejected: number;
    needs_review: number;
    avg_score: number;
    avg_skill_match: number;
    avg_experience_match: number;
    total: number;
  };
  onClick?: () => void;
}

const MetricCard = ({ icon, label, value }: MetricCardProps) => (
  <motion.div
    className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    {/* Content */}
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <Typography 
        variant="display-small" 
        className="text-white mb-2 transition-transform group-hover:scale-105 origin-left"
      >
        {value}
      </Typography>
      <Typography 
        variant="body-medium" 
        className="text-gray-400"
      >
        {label}
      </Typography>
    </div>

    {/* Background Blur Effect */}
    <motion.div
      className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-apple-blue/20 blur-xl"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.15, 0.1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);

const ActivityItem = ({ 
  jobId,
  title, 
  description, 
  time, 
  status, 
  totalApplicants,
  metrics,
  onClick 
}: ActivityItemProps) => {
  const navigate = useNavigate();
  
  const statusConfig = {
    pending: {
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      icon: FiClock,
      label: "In Progress"
    },
    completed: {
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      icon: FiCheckCircle,
      label: "Completed"
    },
    urgent: {
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      icon: FiAlertCircle,
      label: "Urgent"
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  const calculateProgress = (accepted: number, total: number) => {
    return total > 0 ? (accepted / total) * 100 : 0;
  };

  const progress = calculateProgress(metrics.accepted, metrics.total);

  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      className={`p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer backdrop-blur-sm ${
        onClick ? "focus:outline-none focus:ring-2 focus:ring-apple-blue" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${currentStatus.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
            </div>
            <div>
              <Typography variant="headline-small" className="text-white mb-1">
                {title}
              </Typography>
              <Typography variant="body-small" className="text-gray-400">
                {description}
              </Typography>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              size="small"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/candidates?jobId=${jobId}`);
              }}
            >
              View Candidates
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <Typography variant="body-small" className="text-gray-400 mb-1">
              Total Applicants
            </Typography>
            <Typography variant="headline-small" className="text-white">
              {totalApplicants}
            </Typography>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <Typography variant="body-small" className="text-gray-400 mb-1">
              Average Score
            </Typography>
            <Typography variant="headline-small" className="text-apple-blue">
              {(metrics.avg_score).toFixed(0)}%
            </Typography>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <Typography variant="body-small" className="text-gray-400 mb-1">
              Needs Review
            </Typography>
            <Typography variant="headline-small" className="text-yellow-400">
              {metrics.needs_review}
            </Typography>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <Typography variant="body-small" className="text-gray-400 mb-1">
              Success Rate
            </Typography>
            <div className="flex items-center space-x-2">
              <Typography variant="headline-small" className="text-green-400">
                {(progress).toFixed(0)}%
              </Typography>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex space-x-2">
              <span className="text-green-400">{metrics.accepted} Accepted</span>
              <span className="text-gray-400">•</span>
              <span className="text-red-400">{metrics.rejected} Rejected</span>
            </div>
            <span className="text-gray-400">{time}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [name, setName] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = sessionStorage.getItem("name");
    if (storedName) {
      setName(storedName.replace(/\b\w/g, (char) => char.toUpperCase()));
    }

    async function fetchJobs() {
      setLoadingJobs(true);
      try {
        const response = await jobsApi.list();        
        if (response?.data?.data) {
          setJobs(response.data.data);
        } else {
          console.warn("Unexpected response structure:", response);
          setJobs([]);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    }

    fetchJobs();
  }, []);

  const totalOpenJobs = jobs.filter((j) => j.status === "open").length;
  const totalApplicants = jobs.reduce((sum, job) => sum + (job.total_applicants ?? 0), 0);
  const avgApplicantsPerJob =
    totalOpenJobs > 0 ? (totalApplicants / totalOpenJobs).toFixed(1) : "0";

  return (
    <Section fullScreen>
      <div className="absolute inset-0 overflow-hidden">
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

      <Container className="relative py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Typography variant="display-small" className="text-white mb-2">
              Welcome back, <span className="text-apple-blue font-semibold">{name ?? "User"}</span>
            </Typography>
            <Typography variant="body-large" className="text-gray-400">
              Here's an overview of your hiring pipeline and recruitment metrics
            </Typography>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => {
                sessionStorage.clear();
                window.location.href = "/login";
              }}
            >
              <FiLogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={<FiBriefcase className="w-6 h-6 text-purple-400" />}
            label="Active Jobs"
            value={totalOpenJobs.toString()}
          />
          <MetricCard
            icon={<FiUsers className="w-6 h-6 text-apple-blue" />}
            label="Total Applicants"
            value={totalApplicants.toString()}
          />
          <MetricCard
            icon={<motion.div
              className="w-6 h-6 text-orange-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FiClock className="w-6 h-6" />
            </motion.div>}
            label={`Avg. Applicants per Job`}
            value={avgApplicantsPerJob}
          />
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Typography variant="headline-medium" className="text-white mb-2">
                Active Jobs
              </Typography>
              <Typography variant="body-medium" className="text-gray-400">
                Track and manage all your job listings
              </Typography>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="medium"
                onClick={() => navigate("/jobs/create")}
              >
                <FiBriefcase className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {loadingJobs ? (
              <div className="flex items-center justify-center h-40">
                <motion.div 
                  className="w-8 h-8 border-4 border-apple-blue/30 border-t-apple-blue rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Typography variant="body-large" className="text-gray-400 mb-4">
                  No jobs posted yet
                </Typography>
                <Button size="medium" onClick={() => navigate("/jobs/create")}>
                  Create Your First Job
                </Button>
              </div>
            ) : (
              jobs.map((job) => (
                <ActivityItem
                  key={job.id}
                  jobId={job.id}
                  title={job.title}
                  description={job.company_name}
                  time={job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}
                  status={job.status === "open" ? "pending" : "completed"}
                  totalApplicants={job.total_applicants || 0}
                  metrics={job.aiMetrics || {
                    accepted: 0,
                    rejected: 0,
                    needs_review: 0,
                    avg_score: 0,
                    avg_skill_match: 0,
                    avg_experience_match: 0,
                    total: 0
                  }}
                  onClick={() => navigate(`/jobs/${job.shareable_link}`)}
                />
              ))
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
