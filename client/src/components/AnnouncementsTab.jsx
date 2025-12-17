import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const AnnouncementsTab = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    expires_at: '',
    target_user_ids: []
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.filter(u => u.role === 'employee'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/announcements', {
        ...formData,
        target_user_ids: formData.target_user_ids.length > 0 ? formData.target_user_ids : undefined
      });
      setShowCreateModal(false);
      setFormData({ title: '', content: '', priority: 'normal', expires_at: '', target_user_ids: [] });
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await axios.delete(`/api/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete announcement');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-gray-700/40 text-gray-200 border-gray-600/50';
      case 'high':
        return 'bg-gray-600/40 text-gray-200 border-gray-500/50';
      default:
        return 'bg-gray-500/40 text-gray-200 border-gray-400/50';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-white/70 animate-pulse">Loading announcements...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Announcements</h3>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300 text-sm font-medium"
          >
            Create Announcement
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="glass-ultra-transparent rounded-xl p-8 text-center text-white/70">
          No announcements at this time
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`glass-transparent rounded-xl p-6 border-2 ${getPriorityColor(announcement.priority)} animate-fade-in hover:bg-white/10 transition-all duration-300`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-1">
                    {announcement.title}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-white/70 mb-3 flex-wrap">
                    <span>By {announcement.created_by_name}</span>
                    <span>•</span>
                    <span>{format(new Date(announcement.created_at), 'MMM dd, yyyy')}</span>
                    {announcement.expires_at && (
                      <>
                        <span>•</span>
                        <span>Expires: {format(new Date(announcement.expires_at), 'MMM dd, yyyy')}</span>
                      </>
                    )}
                    {announcement.target_user_ids && announcement.target_user_ids.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-gray-300">Directed to {announcement.target_user_ids.length} employee(s)</span>
                      </>
                    )}
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-white/90 whitespace-pre-wrap">{announcement.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-4">Create Announcement</h3>

            {error && (
              <div className="glass-card bg-gray-700/40 border-gray-600/50 text-gray-200 px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Target Employees (Optional - leave empty for all employees)
                </label>
                <div className="glass-transparent rounded-xl p-3 max-h-40 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-white/70 text-sm">No employees found</p>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.target_user_ids.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  target_user_ids: [...formData.target_user_ids, user.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  target_user_ids: formData.target_user_ids.filter(id => id !== user.id)
                                });
                              }
                            }}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-white text-sm">{user.name} ({user.email})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formData.target_user_ids.length > 0 && (
                  <p className="text-white/70 text-xs mt-2">
                    This announcement will only be visible to {formData.target_user_ids.length} selected employee(s)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                  >
                    <option value="normal" className="bg-gray-800">Normal</option>
                    <option value="high" className="bg-gray-800">High</option>
                    <option value="urgent" className="bg-gray-800">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', content: '', priority: 'normal', expires_at: '', target_user_ids: [] });
                    setError('');
                  }}
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTab;

