import { useNavigate } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation({ user, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-left">
        <h1 className="logo">📋 TTM</h1>
      </div>
      <div className="nav-center">
        <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
      </div>
      <div className="nav-right">
        <span className="user-info">{user?.name}</span>
        <span className="role-badge">{user?.role}</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navigation;
