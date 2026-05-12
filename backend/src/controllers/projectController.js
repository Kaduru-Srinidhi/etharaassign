import pool from '../db/pool.js';

export async function createProject(req, res) {
  const { name, description } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    // Create project
    const projectResult = await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', userId]
    );

    const project = projectResult.rows[0];

    // Add creator as admin member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, userId, 'admin']
    );

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Error creating project' });
  }
}

export async function getProjects(req, res) {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT p.* FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Error fetching projects' });
  }
}

export async function getProjectById(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is member of project
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Error fetching project' });
  }
}

export async function updateProject(req, res) {
  const { projectId } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    // Check if user is admin of project
    const adminCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = $3',
      [projectId, userId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only project admin can update' });
    }

    const result = await pool.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Error updating project' });
  }
}

export async function deleteProject(req, res) {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is admin of project
    const adminCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = $3',
      [projectId, userId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only project admin can delete' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
}

export async function addProjectMember(req, res) {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  const currentUserId = req.user.id;

  if (!userId || !role) {
    return res.status(400).json({ error: 'User ID and role are required' });
  }

  try {
    // Check if current user is admin
    const adminCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = $3',
      [projectId, currentUserId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Only project admin can add members' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3',
      [projectId, userId, role]
    );

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Error adding member' });
  }
}

export async function getProjectMembers(req, res) {
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
      `SELECT u.id, u.name, u.email, pm.role
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.role DESC`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Error fetching members' });
  }
}
