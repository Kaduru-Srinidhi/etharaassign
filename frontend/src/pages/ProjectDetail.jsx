import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, getTasks, createTask, updateTask, deleteTask, getProjectMembers, addProjectMember } from '../api';
import '../styles/ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [addMemberIdentifier, setAddMemberIdentifier] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('member');

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        getProjectById(projectId),
        getTasks(projectId),
        getProjectMembers(projectId),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      await createTask(
        projectId,
        newTaskTitle,
        newTaskDesc,
        selectedMemberId || null,
        newTaskPriority,
        newTaskDueDate || null
      );
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setSelectedMemberId('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTask(projectId, taskId, { status: newStatus });
      loadData();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(projectId, taskId);
        loadData();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberIdentifier) {
      setError('Name or email is required');
      return;
    }

    try {
      await addProjectMember(projectId, addMemberIdentifier, addMemberRole);
      setAddMemberIdentifier('');
      setAddMemberRole('member');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  if (loading) {
    return <div className="project-container"><p>Loading...</p></div>;
  }

  if (!project) {
    return <div className="project-container"><p>Project not found</p></div>;
  }

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="project-container">
      <div className="project-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
        <div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="project-content">
        <div className="left-panel">
          <div className="section">
            <h2>Create Task</h2>
            <form onSubmit={handleCreateTask} className="task-form">
              <input
                type="text"
                placeholder="Task Title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                rows="2"
              />
              <div className="form-row">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="">Assign to...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button type="submit">Create Task</button>
            </form>
          </div>

          <div className="section">
            <h2>Project Members</h2>
            <div className="members-list">
              {members.map((m) => (
                <div key={m.id} className="member-item">
                  <div>{m.name}</div>
                  <div className="role-badge">{m.role}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddMember} className="add-member-form">
              <input
                type="text"
                placeholder="Name or Email"
                value={addMemberIdentifier}
                onChange={(e) => setAddMemberIdentifier(e.target.value)}
              />
              <select
                value={addMemberRole}
                onChange={(e) => setAddMemberRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit">Add Member</button>
            </form>
          </div>
        </div>

        <div className="right-panel">
          <div className="kanban-board">
            <div className="kanban-column">
              <h3>📝 To Do ({todoTasks.length})</h3>
              <div className="tasks-column">
                {todoTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="delete-btn"
                      >
                        ✕
                      </button>
                    </div>
                    <p>{task.description}</p>
                    {task.assigned_to_name && (
                      <small>👤 {task.assigned_to_name}</small>
                    )}
                    <div className="task-footer">
                      <span className={`priority ${task.priority}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                        className="status-btn"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="kanban-column">
              <h3>🚀 In Progress ({inProgressTasks.length})</h3>
              <div className="tasks-column">
                {inProgressTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="delete-btn"
                      >
                        ✕
                      </button>
                    </div>
                    <p>{task.description}</p>
                    {task.assigned_to_name && (
                      <small>👤 {task.assigned_to_name}</small>
                    )}
                    <div className="task-footer">
                      <span className={`priority ${task.priority}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'done')}
                        className="status-btn"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="kanban-column">
              <h3>✅ Done ({doneTasks.length})</h3>
              <div className="tasks-column">
                {doneTasks.map((task) => (
                  <div key={task.id} className="task-card done">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="delete-btn"
                      >
                        ✕
                      </button>
                    </div>
                    <p>{task.description}</p>
                    {task.assigned_to_name && (
                      <small>👤 {task.assigned_to_name}</small>
                    )}
                    <div className="task-footer">
                      <span className={`priority ${task.priority}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, 'todo')}
                        className="status-btn"
                      >
                        ↶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
