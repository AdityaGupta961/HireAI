import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container, Section, Typography } from '../../components/ui';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUploadCloud } from 'react-icons/fi';
import type { Job } from '../../lib/types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { uploadFile } from '../../utils/fileUpload'; // Import your LoadingSpinner
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/quill.css';

export default function ApplicationPage() {
  const navigate = useNavigate();
  const { shareablelink } = useParams<{ shareablelink: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    coverLetter: '',
    linkedin: '',
    resume: null as File | null,
  });
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch job details for header
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
        if (!res.ok) throw new Error(json.error || 'Failed to load job');
        setJob(json);
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch job');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [shareablelink, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      resume: e.target.files && e.target.files[0] ? e.target.files[0] : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.coverLetter) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle file upload first
      let resumeFileUrl = '';
      try {
        if (formData.resume) {
          toast.loading('Uploading resume...', { id: 'upload' });
          resumeFileUrl = await uploadFile(formData.resume);
          toast.success('Resume uploaded successfully', { id: 'upload' });
        }
      } catch (error) {
        console.error('Resume upload error:', error);
        toast.error('Failed to upload resume', { id: 'upload' });
        return;
      }

      // Prepare the application data
      const applicationData = {
        rawData: JSON.stringify({
          name: formData.name,
          email: formData.email,
          coverLetter: formData.coverLetter,
          linkedin: formData.linkedin || '',
        }),
        resumeFileUrl: resumeFileUrl
      };

      const res = await fetch(
        `http://localhost:3000/api/jobs/${shareablelink}/applications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Application failed.');
      }

      toast.success('Application submitted!');
      navigate(`/jobs/${shareablelink}`);
    } catch (err: any) {
      toast.error(err.message || 'Error applying');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Section fullScreen>
        <Container className="relative py-20 text-center">
          <LoadingSpinner /> {/* Show spinner while loading job data */}
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
          <Button onClick={() => navigate('/dashboard')} className="mt-6">
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
          style={{ marginTop: '2rem', marginLeft: '2rem' }}
        >
          <FiArrowLeft className="text-white text-2xl" />
        </button>
        <div className="absolute inset-0 bg-gradient-to-br from-apple-black to-apple-gray-dark" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <Container className="relative flex min-h-screen">
        {/* Left Column - Key Job Details Only */}
        <motion.div
          className="hidden lg:flex flex-col justify-center w-2/5 pr-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <Typography variant="display-large" className="text-white mb-6">
              {job.title}
            </Typography>
            <Typography variant="headline-small" className="text-apple-blue mb-4">
              {job.company_name}
            </Typography>
            {job.location && (
              <Typography variant="body-large" color="text-gray-400" className="mb-3">
                <strong>Location:</strong> {job.location}
              </Typography>
            )}
            <Typography variant="body-large" color="text-gray-400" className="mb-10">
              <strong>Status:</strong> {job.status}
            </Typography>
          </div>
        </motion.div>
        {/* Right Column - Application Form */}
        <motion.div
          className="w-full lg:w-3/5 flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full p-12">
            <motion.div
              className="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/10 w-full max-w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography variant="headline-large" className="text-white mb-6 text-center">
                Fill out the form to apply
              </Typography>
              <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                />
                <div className="quill-wrapper">
                                  <ReactQuill
                                    theme="snow"
                                    value={formData.coverLetter}
                                    onChange={(value) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        coverLetter: value,
                                      }))
                                    }
                                    placeholder="Share why you're a great fit for this role"
                                    modules={{
                                      toolbar: [
                                        [{ header: [1, 2, 3, false] }],
                                        ["bold", "italic", "underline", "strike"],
                                        [{ list: "ordered" }, { list: "bullet" }],
                                        ["clean"],
                                      ],
                                    }}
                                    className="bg-white/2 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                                  />
                                </div>
                <input
                  type="text"
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL (optional)"
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                />
                <label className="flex flex-col gap-1">
                  <span className="text-gray-400 mb-0.5">Resume (PDF, optional)</span>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition">
                      <FiUploadCloud className="text-xl" />
                      <span>
                        {formData.resume ? formData.resume.name : "Upload Resume"}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                    </label>
                    {formData.resume && (
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, resume: null }))
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </label>
                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  className="mt-3"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Application'}
                </Button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
