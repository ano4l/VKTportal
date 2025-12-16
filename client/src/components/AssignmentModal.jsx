import { useState, useEffect } from 'react';
import axios from 'axios';

const AssignmentModal = ({ item, itemType, onClose }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCurrentAssignments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAssignments = async () => {
    try {
      const endpoint = itemType === 'project'
        ? `/api/admin/projects/${item.id}/assignments`
        : `/api/admin/meetings/${item.id}/assignments`;
      
      const response = await axios.get(endpoint);
      setSelectedUsers(response.data.map(u => u.id));
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleToggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const endpoint = itemType === 'project'
        ? `/api/admin/projects/${item.id}/assign`
        : `/api/admin/meetings/${item.id}/assign`;
      
      await axios.post(endpoint, { user_ids: selectedUsers });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign users');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-virtukey-dark mb-2">
                Assign Users to {item.title}
              </h3>
              <p className="text-sm text-gray-600">
                Select employees to assign to this {itemType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-virtukey-dark text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleToggleUser(user.id)}
                    className="mr-3 h-4 w-4 text-virtukey-dark focus:ring-virtukey-dark border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-virtukey-dark">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin'
                        ? 'bg-virtukey-accent-purple text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </label>
              ))}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="px-4 py-2 bg-virtukey-dark text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;

