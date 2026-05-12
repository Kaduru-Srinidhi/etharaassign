import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, getDashboard } from '../api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, dashboardRes] = await Promise.all([
        getProjects(),
        getDashboard(),
      ]);
      setProjects(projectsRes.data);
      setDashboard(dashboardRes.data);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      await createProject(newProjectName, newProjectDesc);
      setNewProjectName('');
      setNewProjectDesc('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your task overview.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-grid">
        {/* Stats */}
        {dashboard && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-value">{dashboard.tasks.length}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.statusBreakdown.find(s => s.status === 'done')?.count || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.overdueTasks.length}</div>
              <div className="stat-label">Overdue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{projects.length}</div>
              <div className="stat-label">Projects</div>
            </div>
          </div>
        )}

        {/* Create Project */}
        <div className="section">
          <h2>Create New Project</h2>
          <form onSubmit={handleCreateProject} className="project-form">
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <textarea
              placeholder="Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows="2"
            />
            <button type="submit">Create Project</button>
          </form>
        </div>

        {/* Projects */}
        <div className="section">
          <h2>Your Projects</h2>
          {projects.length === 0 ? (
            <p className="empty-state">No projects yet. Create one to get started!</p>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <small>Click to manage</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        {dashboard && dashboard.overdueTasks.length > 0 && (
          <div className="section">
            <h2>⚠️ Overdue Tasks</h2>
            <div className="tasks-list">
              {dashboard.overdueTasks.map((task) => (
                <div key={task.id} className="task-item overdue">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <small>{task.project_name}</small>
                  </div>
                  <div className="task-due">
                    <small>{new Date(task.due_date).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
