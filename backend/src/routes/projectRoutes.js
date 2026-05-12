import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectMembers,
} from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createProject);
router.get('/', authenticateToken, getProjects);
router.get('/:projectId', authenticateToken, getProjectById);
router.put('/:projectId', authenticateToken, updateProject);
router.delete('/:projectId', authenticateToken, deleteProject);
router.post('/:projectId/members', authenticateToken, addProjectMember);
router.get('/:projectId/members', authenticateToken, getProjectMembers);

export default router;
