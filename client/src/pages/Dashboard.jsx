import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import MeetingCard from '../components/MeetingCard';
import CommentSection from '../components/CommentSection';
import CalendarWidget from '../components/CalendarWidget';
import AnnouncementsTab from '../components/AnnouncementsTab';
import RequisitionsTab from '../components/RequisitionsTab';
import ProjectManagement from '../components/ProjectManagement';
import MeetingManagement from '../components/MeetingManagement';
import NotesAndRemindersTab from '../components/NotesAndRemindersTab';
import TasksTab from '../components/TasksTab';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentProjects, setCurrentProjects] = useState([]);
  const [upcomingProjects, setUpcomingProjects] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [currentRes, upcomingRes, meetingsRes] = await Promise.all([
        axios.get('/api/projects/current'),
        axios.get('/api/projects/upcoming'),
        axios.get('/api/meetings/upcoming')
      ]);

      setCurrentProjects(currentRes.data);
      setUpcomingProjects(upcomingRes.data);
      setUpcomingMeetings(meetingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
  };

  const closeComments = () => {
    setSelectedItem(null);
    setItemType(null);
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
    <div className="min-h-screen animate-fade-in pb-20 md:pb-0">
      {/* Header - Mobile optimized */}
      <header className="glass-transparent border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 animate-slide-in">
              <div className="w-8 h-8 sm:w-10 sm:h-10 glass rounded-xl flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">VK</span>
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white">VirtuKey</h1>
                <p className="text-[10px] sm:text-xs text-white/70 hidden sm:block">Technologies</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 animate-slide-in">
              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  className="text-xs sm:text-sm text-white/90 hover:text-white font-medium transition-colors hidden sm:inline"
                >
                  Admin Portal
                </a>
              )}
              <span className="text-xs sm:text-sm text-white/90 hidden sm:inline">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="glass-button px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white rounded-xl hover:scale-105 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">Dashboard</h2>
          <p className="text-sm sm:text-base text-white/80">Overview of your projects and meetings</p>
        </div>

        {/* Tabs - Mobile scrollable */}
        <div className="glass-transparent rounded-xl p-1 sm:p-2 mb-4 sm:mb-6 animate-fade-in animate-delay-200 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-2 min-w-max sm:min-w-0">
            {['overview', 'tasks', 'announcements', 'requisitions', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 capitalize whitespace-nowrap ${
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in animate-delay-300">
            {/* Current Projects */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Current Projects</h3>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="glass-button px-3 py-1.5 text-xs text-white rounded-lg hover:scale-105 transition-all duration-300"
                    >
                      + Add Project
                    </button>
                  )}
                </div>
                {currentProjects.length === 0 ? (
                  <div className="glass-ultra-transparent rounded-xl p-8 text-center text-white/70">
                    No current projects
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentProjects.map((project, index) => (
                      <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <ProjectCard
                          project={project}
                          onClick={() => handleItemClick(project, 'project')}
                          onDelete={fetchData}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Upcoming Projects</h3>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="glass-button px-3 py-1.5 text-xs text-white rounded-lg hover:scale-105 transition-all duration-300"
                    >
                      + Add Project
                    </button>
                  )}
                </div>
                {upcomingProjects.length === 0 ? (
                  <div className="glass-ultra-transparent rounded-xl p-8 text-center text-white/70">
                    No upcoming projects
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingProjects.map((project, index) => (
                      <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <ProjectCard
                          project={project}
                          onClick={() => handleItemClick(project, 'project')}
                          onDelete={fetchData}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Full width on mobile */}
            <div className="space-y-4 sm:space-y-6">
              <CalendarWidget />
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowMeetingModal(true)}
                      className="glass-button px-3 py-1.5 text-xs text-white rounded-lg hover:scale-105 transition-all duration-300"
                    >
                      + Add Meeting
                    </button>
                  )}
                </div>
                {upcomingMeetings.length === 0 ? (
                  <div className="glass-ultra-transparent rounded-xl p-6 text-center text-white/70">
                    No upcoming meetings
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMeetings.map((meeting, index) => (
                      <div key={meeting.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <MeetingCard
                          meeting={meeting}
                          onClick={() => handleItemClick(meeting, 'meeting')}
                          onDelete={fetchData}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-fade-in animate-delay-200">
            <TasksTab />
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="animate-fade-in animate-delay-200">
            <AnnouncementsTab />
          </div>
        )}

        {activeTab === 'requisitions' && (
          <div className="animate-fade-in animate-delay-200">
            <RequisitionsTab />
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="animate-fade-in animate-delay-200">
            <NotesAndRemindersTab />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-menu">
        <div className="flex justify-around items-center">
          {['overview', 'tasks', 'announcements', 'requisitions', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                activeTab === tab
                  ? 'text-white glass'
                  : 'text-white/60'
              }`}
            >
              <span className="text-xs font-medium capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Comment Section Modal */}
      {selectedItem && (
        <CommentSection
          item={selectedItem}
          itemType={itemType}
          onClose={closeComments}
          onUpdate={fetchData}
        />
      )}

      {/* Project Creation Modal */}
      {showProjectModal && (
        <ProjectManagement
          projects={[]}
          showModal={true}
          onUpdate={() => {
            fetchData();
          }}
          onClose={() => setShowProjectModal(false)}
        />
      )}

      {/* Meeting Creation Modal */}
      {showMeetingModal && (
        <MeetingManagement
          meetings={[]}
          showModal={true}
          onUpdate={() => {
            fetchData();
          }}
          onClose={() => setShowMeetingModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
