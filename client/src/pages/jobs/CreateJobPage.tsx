import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Container, Section, Typography } from "../../components/ui";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../styles/quill.css";

export default function CreateJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: location.state?.job?.title || "",
    companyName: location.state?.job?.company_name || "",
    jobDescription: location.state?.job?.job_description || "",
    location: location.state?.job?.location || "",
  });

  useEffect(() => {
    if (location.state?.job) {
      setIsEditMode(true);
    }
  }, [location.state]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.companyName || !formData.jobDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a job");
      return;
    }

    setIsSubmitting(true);

    if (isEditMode && location.state?.job?.id) {
      // Edit existing job
      try {
        const res = await fetch(
          `http://localhost:3000/api/jobs/${location.state.job.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token") ?? ""}`,
            },
            body: JSON.stringify({
              clientId: user.id,
              title: formData.title,
              companyName: formData.companyName,
              jobDescription: formData.jobDescription,
              location: formData.location,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update job");
        }

        toast.success("Job updated successfully!");
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error.message || "Error updating job");
      } finally {
        setIsSubmitting(false);
      }
      return;
    } else {
      // Create new job

      try {
        const res = await fetch("http://localhost:3000/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token") ?? ""}`,
          },
          body: JSON.stringify({
            clientId: user.id,
            title: formData.title,
            companyName: formData.companyName,
            jobDescription: formData.jobDescription,
            location: formData.location,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create job");
        }

        toast.success("Job created successfully!");
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error.message || "Error creating job");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Section fullScreen>
      <div className="absolute inset-0 overflow-hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 z-10 flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-lg bg-white/20 border border-white/20 hover:bg-white/30 transition shadow-xl"
          aria-label="Back"
          style={{ marginTop: "2rem", marginLeft: "2rem" }} // 2rem is ~mt-8/ml-8, tune for perfect alignment
        >
          <FiArrowLeft className="text-white text-2xl" />
        </button>
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
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <Container className="relative flex min-h-screen">
        {/* Left Column - Hero Content */}
        <motion.div
          className="hidden lg:flex flex-col justify-center w-2/5 pr-12"
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
              {!isEditMode ? (
                <Typography variant="display-large" className="text-white">
                  Create a{" "}
                  <span className="bg-gradient-to-r from-apple-blue to-purple-500 bg-clip-text text-transparent">
                    New Job Listing
                  </span>
                </Typography>
              ) : (
                <Typography variant="display-large" className="text-white">
                  Edit{" "}
                  <span className="bg-gradient-to-r from-apple-blue to-purple-500 bg-clip-text text-transparent">
                    Job Listing
                  </span>
                </Typography>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography
                variant="body-large"
                color="text-gray-400"
                className="max-w-xs"
              >
                Post your open position and attract the best candidates with our
                AI-powered hiring platform.
              </Typography>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Form */}
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Job Title"
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                />
                <input
                  type="text"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                />
                <div className="quill-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={formData.jobDescription}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        jobDescription: value,
                      }))
                    }
                    placeholder="Job Description"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["clean"],
                      ],
                    }}
                    className="bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </div>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location (optional)"
                  className="w-full h-14 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all duration-300"
                />

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                  className="mt-4"
                >
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Edit Job"
                    : "Create Job"}
                </Button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
