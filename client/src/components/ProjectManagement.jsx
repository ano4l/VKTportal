import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const ProjectManagement = ({ projects, onUpdate, showModal = false, onClose }) => {
  const [showCreateModal, setShowCreateModal] = useState(showModal);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'upcoming',
    start_date: '',
    end_date: ''
  });
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/projects', formData);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', status: 'upcoming', start_date: '', end_date: '' });
      if (onUpdate) onUpdate();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated comments and assignments.')) return;

    try {
      await axios.delete(`/api/projects/${id}`);
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  // If used as modal, render just the form
  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
        <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-scale-in modal-content">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Create Project</h3>
            <button
              onClick={() => {
                setShowCreateModal(false);
                if (onClose) onClose();
              }}
              className="glass-button w-8 h-8 rounded-lg text-white hover:scale-110 transition-all duration-300 text-xl"
            >
              ×
            </button>
          </div>

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
              <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white"
                >
                  <option value="upcoming" className="bg-gray-800">Upcoming</option>
                  <option value="current" className="bg-gray-800">Current</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="glass-input w-full px-4 py-3 rounded-xl text-white"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  if (onClose) onClose();
                }}
                className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Projects</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300 text-sm font-medium"
        >
          Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-ultra-transparent rounded-xl p-8 text-center text-white/70">
          No projects yet
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="glass-transparent rounded-xl p-6 animate-fade-in hover:bg-white/10 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{project.title}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${
                      project.status === 'current' 
                        ? 'bg-gray-600/40 text-gray-200 border-gray-500/50'
                        : 'bg-gray-500/40 text-gray-200 border-gray-400/50'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-white/80 text-sm mb-2">{project.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-white/70">
                    {project.start_date && (
                      <span>Start: {format(new Date(project.start_date), 'MMM dd, yyyy')}</span>
                    )}
                    {project.end_date && (
                      <span>End: {format(new Date(project.end_date), 'MMM dd, yyyy')}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-gray-400 hover:text-gray-300 text-sm transition-colors ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Create Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="glass-button w-8 h-8 rounded-lg text-white hover:scale-110 transition-all duration-300 text-xl"
              >
                ×
              </button>
            </div>

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
                <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                  >
                    <option value="upcoming" className="bg-gray-800">Upcoming</option>
                    <option value="current" className="bg-gray-800">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;

