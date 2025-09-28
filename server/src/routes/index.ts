import express from 'express';
import { 
    create,
    getJobById,
    updateJob,
    deleteJob,
    listJobs
} from '../controllers/jobsController';
import {
    register,
    login,
    getProfile,
    updateProfile
} from '../controllers/clientsController';
import {
    submitApplication,
    getApplicationById,
    listApplications,
    updateStructuredApplication
} from '../controllers/applicationsController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Client routes (protected)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Jobs routes (protected except for creation through shareable link)
router.post('/jobs', verifyToken, create);
router.get('/jobs/:id', getJobById);
router.put('/jobs/:id', verifyToken, updateJob);
router.delete('/jobs/:id', verifyToken, deleteJob);
router.get('/jobs', verifyToken, listJobs);

// Applications routes
router.post('/jobs/:jobId/applications', submitApplication); // Public endpoint for job applications
router.get('/applications/:id', verifyToken, getApplicationById);
router.get('/applications', verifyToken, listApplications);
router.put('/applications/:id', verifyToken, updateStructuredApplication);

export default router;
