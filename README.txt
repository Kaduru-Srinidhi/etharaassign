# Team Task Manager - Full Stack Web Application

## Overview
Team Task Manager is a comprehensive web application designed for collaborative project and task management with role-based access control. Users can create projects, assign tasks to team members, and track progress through an intuitive dashboard and Kanban board interface.

## Features

### ✅ Core Features Implemented
1. **User Authentication**
   - Secure signup and login with JWT tokens
   - Password hashing with bcryptjs
   - Session management

2. **Project Management**
   - Create, read, update, delete projects
   - Add team members to projects with roles
   - Project-level access control

3. **Task Management**
   - Create tasks with title, description, priority, and due date
   - Assign tasks to team members
   - Track task status (To Do → In Progress → Done)
   - Delete completed tasks

4. **Role-Based Access Control (RBAC)**
   - Admin: Full project control, member management
   - Member: Task assignment and status updates
   - User-level roles for system administration

5. **Dashboard**
   - Overview of assigned tasks
   - Status breakdown (To Do, In Progress, Done)
   - Overdue tasks highlighting
   - Quick project access

6. **Kanban Board**
   - Visual task management across three columns
   - Drag-and-drop task status updates
   - Priority and assignment indicators

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Middleware**: CORS for cross-origin requests

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern gradients and animations

### Deployment
- **Platform**: Railway

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the backend directory:
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/team_task_manager
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
NODE_ENV=development
```

4. **Initialize database**
The database will be automatically initialized on first server run.

5. **Start the backend server**
```bash
npm run dev
```
Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```
Application will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires token)

### Project Endpoints
- `POST /api/projects` - Create project (requires authentication)
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:projectId` - Get project details
- `PUT /api/projects/:projectId` - Update project (admin only)
- `DELETE /api/projects/:projectId` - Delete project (admin only)
- `POST /api/projects/:projectId/members` - Add team member (admin only)
- `GET /api/projects/:projectId/members` - Get project members

### Task Endpoints
- `POST /api/tasks/:projectId/tasks` - Create task
- `GET /api/tasks/:projectId/tasks` - Get project tasks
- `GET /api/tasks/:projectId/tasks/:taskId` - Get task details
- `PUT /api/tasks/:projectId/tasks/:taskId` - Update task
- `DELETE /api/tasks/:projectId/tasks/:taskId` - Delete task
- `GET /api/tasks/dashboard/overview` - Get dashboard data

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, encrypted)
- `role` (VARCHAR: 'admin', 'member')
- `created_at`, `updated_at` (Timestamps)

### Projects Table
- `id` (Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `created_by` (Foreign Key to Users)
- `created_at`, `updated_at` (Timestamps)

### Project Members Table
- `id` (Primary Key)
- `project_id` (Foreign Key to Projects)
- `user_id` (Foreign Key to Users)
- `role` (VARCHAR: 'admin', 'member')

### Tasks Table
- `id` (Primary Key)
- `project_id` (Foreign Key to Projects)
- `title` (VARCHAR)
- `description` (TEXT)
- `assigned_to` (Foreign Key to Users)
- `status` (VARCHAR: 'todo', 'in_progress', 'done')
- `priority` (VARCHAR: 'low', 'medium', 'high')
- `due_date` (TIMESTAMP)
- `created_by` (Foreign Key to Users)
- `created_at`, `updated_at` (Timestamps)

## Usage Guide

### Creating an Account
1. Visit the signup page
2. Enter name, email, and password
3. Submit to create account and auto-login

### Creating a Project
1. Go to Dashboard
2. Fill in project name and description
3. Click "Create Project"
4. You'll automatically be added as admin

### Managing Tasks
1. Open a project from the dashboard
2. Create a new task with title, description, priority, and due date
3. Assign to team members
4. Move tasks across columns: To Do → In Progress → Done
5. Delete completed tasks as needed

### Managing Team Members
1. Open project details
2. In the "Project Members" section, enter user ID
3. Select role (Member or Admin)
4. Click "Add Member"

### Dashboard Overview
- View all your assigned tasks
- See task status breakdown
- Get alerted to overdue tasks
- Quick access to all projects

## Validation & Security

### Input Validation
- Email format validation
- Password minimum length (6 characters)
- Required field validation
- Task title validation

### Security Features
- JWT token-based authentication
- Password hashing with bcryptjs
- CORS enabled for controlled access
- Role-based access control
- Protected API endpoints

### Error Handling
- Comprehensive error messages
- HTTP status codes (400, 401, 403, 404, 500)
- Try-catch blocks on all operations
- User-friendly error displays

## Deployment on Railway

### Backend Deployment
1. Push code to GitHub
2. Connect Railway to GitHub repository
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Railway auto-deploys on push

### Frontend Deployment
1. Run `npm run build` to create production build
2. Set backend API URL to Railway backend URL
3. Deploy `dist/` folder to Railway
4. Configure environment for production API calls

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   └── taskController.js
│   │   ├── db/
│   │   │   ├── init.js
│   │   │   └── pool.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── projectRoutes.js
│   │       └── taskRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navigation.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── ProjectDetail.jsx
    │   ├── styles/
    │   │   ├── App.css
    │   │   ├── Auth.css
    │   │   ├── Navigation.css
    │   │   ├── Dashboard.css
    │   │   └── ProjectDetail.css
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live task updates
2. **File Attachments**: Upload files to tasks
3. **Comments**: Task comments and discussions
4. **Notifications**: Email and in-app notifications
5. **Analytics**: Project and team performance metrics
6. **Time Tracking**: Task time estimation and tracking
7. **Export**: PDF/Excel export for tasks and projects
8. **Mobile App**: React Native mobile application

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists or migrations run

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Clear localStorage and re-login

### Frontend API Errors
- Verify backend is running on port 5000
- Check CORS settings
- Verify token is being sent in headers

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For support, email support@teamtaskmanager.com or create an issue in the GitHub repository.

---

**Built with ❤️ for better team collaboration**
