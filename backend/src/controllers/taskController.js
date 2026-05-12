import pool from '../db/pool.js';

export async function createTask(req, res) {
  const { projectId } = req.params;
  const { title, description, assigned_to, priority, due_date } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    // Check if user is member of project
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assigned_to, priority, due_date, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [projectId, title, description || '', assigned_to || null, priority || 'medium', due_date || null, userId, 'todo']
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Error creating task' });
  }
}

export async function getTasks(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT t.*, u.name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
}

export async function getTaskById(req, res) {
  const { projectId, taskId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT t.*, u.name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1 AND t.project_id = $2`,
      [taskId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Error fetching task' });
  }
}

export async function updateTask(req, res) {
  const { projectId, taskId } = req.params;
  const { title, description, assigned_to, status, priority, due_date } = req.body;
  const userId = req.user.id;

  try {
    // Check if user is member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      `UPDATE tasks SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       assigned_to = COALESCE($3, assigned_to),
       status = COALESCE($4, status),
       priority = COALESCE($5, priority),
       due_date = COALESCE($6, due_date),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND project_id = $8
       RETURNING *`,
      [title, description, assigned_to, status, priority, due_date, taskId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
}

export async function deleteTask(req, res) {
  const { projectId, taskId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1 AND project_id = $2', [taskId, projectId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
}

export async function getDashboard(req, res) {
  const userId = req.user.id;

  try {
    // Get user's tasks with project info
    const tasksResult = await pool.query(
      `SELECT t.*, p.name as project_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.assigned_to = $1
       ORDER BY t.due_date ASC`,
      [userId]
    );

    // Get status breakdown
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM tasks
       WHERE assigned_to = $1
       GROUP BY status`,
      [userId]
    );

    // Get overdue tasks
    const overdueResult = await pool.query(
      `SELECT t.*, p.name as project_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.assigned_to = $1 AND t.status != 'done' AND t.due_date < NOW()
       ORDER BY t.due_date ASC`,
      [userId]
    );

    res.json({
      tasks: tasksResult.rows,
      statusBreakdown: statusResult.rows,
      overdueTasks: overdueResult.rows,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
}
