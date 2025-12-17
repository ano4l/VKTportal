import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'normal',
    assigned_to: '',
    due_date: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/admin/users')
      ]);
      setTasks(tasksRes.data);
      const employeeUsers = usersRes.data.filter(u => u.role === 'employee');
      setUsers(employeeUsers);
      
      if (employeeUsers.length === 0) {
        setError('No employees found. Please create employee accounts first.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.assigned_to) {
      setError('Title and assigned employee are required');
      return;
    }

    try {
      // Convert assigned_to to number
      const taskData = {
        ...formData,
        assigned_to: parseInt(formData.assigned_to, 10),
        due_date: formData.due_date || null
      };
      await axios.post('/api/tasks', taskData);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', status: 'pending', priority: 'normal', assigned_to: '', due_date: '' });
      fetchData();
    } catch (err) {
      console.error('Task creation error:', err);
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Convert assigned_to to number
      const taskData = {
        ...formData,
        assigned_to: parseInt(formData.assigned_to, 10),
        due_date: formData.due_date || null
      };
      await axios.put(`/api/tasks/${editingTask.id}`, taskData);
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'pending', priority: 'normal', assigned_to: '', due_date: '' });
      fetchData();
    } catch (err) {
      console.error('Task update error:', err);
      setError(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to,
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', status: 'pending', priority: 'normal', assigned_to: '', due_date: '' });
    setError('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-gray-600 text-white';
      case 'in_progress': return 'bg-gray-500 text-white';
      case 'pending': return 'bg-gray-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-300';
      case 'high': return 'text-orange-300';
      case 'normal': return 'text-gray-300';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white animate-pulse">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Task Manager</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
        >
          + Create Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="glass-transparent rounded-xl p-8 text-center text-white/70">
            No tasks found. Create your first task!
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="glass-card rounded-xl p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white flex-1">{task.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-white/80 text-sm mb-3">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-white/70">
                    <div>
                      <span className="font-medium">Assigned to:</span> {task.assigned_to_name || 'Unknown'}
                    </div>
                    {task.due_date && (
                      <div>
                        <span className="font-medium">Due:</span> {format(new Date(task.due_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    <div className={getPriorityColor(task.priority)}>
                      <span className="font-medium">Priority:</span> {task.priority}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {format(new Date(task.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="glass-button px-3 py-1.5 text-sm text-white rounded-lg hover:scale-105 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="glass-button px-3 py-1.5 text-sm text-red-300 rounded-lg hover:scale-105 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create Task'}
              </h3>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdate : handleCreate} className="space-y-4">
              {error && (
                <div className="glass-transparent border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-lg text-white min-h-[100px]"
                  rows="4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Assign To *</label>
                  {users.length === 0 ? (
                    <div className="glass-transparent border border-yellow-500/50 rounded-lg p-3 text-yellow-300 text-sm">
                      No employees found. Please create employee accounts first in the Users tab.
                    </div>
                  ) : (
                    <select
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="glass-input w-full px-4 py-2 rounded-lg text-white"
                      required
                    >
                      <option value="">Select employee</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id} className="bg-gray-800">
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-lg text-white"
                  >
                    <option value="pending" className="bg-gray-800">Pending</option>
                    <option value="in_progress" className="bg-gray-800">In Progress</option>
                    <option value="completed" className="bg-gray-800">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-lg text-white"
                  >
                    <option value="low" className="bg-gray-800">Low</option>
                    <option value="normal" className="bg-gray-800">Normal</option>
                    <option value="high" className="bg-gray-800">High</option>
                    <option value="urgent" className="bg-gray-800">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="glass-input w-full px-4 py-2 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="glass-button px-6 py-2 text-white rounded-lg hover:scale-105 transition-all flex-1"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="glass-transparent px-6 py-2 text-white/70 rounded-lg hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;

