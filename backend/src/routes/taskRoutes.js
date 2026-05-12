import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getDashboard,
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard/overview', authenticateToken, getDashboard);
router.post('/:projectId/tasks', authenticateToken, createTask);
router.get('/:projectId/tasks', authenticateToken, getTasks);
router.get('/:projectId/tasks/:taskId', authenticateToken, getTaskById);
router.put('/:projectId/tasks/:taskId', authenticateToken, updateTask);
router.delete('/:projectId/tasks/:taskId', authenticateToken, deleteTask);

export default router;
