import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import UserManagement from '../components/UserManagement';
import AssignmentModal from '../components/AssignmentModal';
import ProjectManagement from '../components/ProjectManagement';
import MeetingManagement from '../components/MeetingManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, meetingsRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/meetings')
      ]);
      setProjects(projectsRes.data);
      setMeetings(meetingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
  };

  const closeAssignment = () => {
    setSelectedItem(null);
    setItemType(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-strong rounded-2xl p-8 text-white animate-pulse">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <header className="glass-transparent border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 animate-slide-in">
              <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">VK</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">VirtuKey</h1>
                <p className="text-xs text-white/70">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 animate-slide-in">
              <a
                href="/dashboard"
                className="text-sm text-white/90 hover:text-white font-medium transition-colors"
              >
                View Dashboard
              </a>
              <span className="text-sm text-white/90">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="glass-button px-4 py-2 text-sm text-white rounded-xl hover:scale-105 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Admin Dashboard</h2>
          <p className="text-white/80">Manage users, projects, and assignments</p>
        </div>

        {/* Tabs */}
        <div className="glass-transparent rounded-xl p-2 mb-6 animate-fade-in animate-delay-200">
          <nav className="flex space-x-2">
            {['users', 'projects', 'meetings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? 'glass text-white scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="animate-fade-in animate-delay-200">
            <UserManagement onUpdate={fetchData} />
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="animate-fade-in animate-delay-200">
            <ProjectManagement projects={projects} onUpdate={fetchData} />
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="animate-fade-in animate-delay-200">
            <MeetingManagement meetings={meetings} onUpdate={fetchData} />
          </div>
        )}
      </main>

      {/* Assignment Modal */}
      {selectedItem && (
        <AssignmentModal
          item={selectedItem}
          itemType={itemType}
          onClose={closeAssignment}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
