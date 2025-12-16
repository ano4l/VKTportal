import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProjectCard = ({ project, onClick, onDelete }) => {
  const { user } = useAuth();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated comments and assignments.')) return;

    try {
      await axios.delete(`/api/projects/${project.id}`);
      if (onDelete) onDelete();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'current':
        return 'bg-gray-600/40 text-gray-200 border-gray-500/50';
      case 'upcoming':
        return 'bg-gray-500/40 text-gray-200 border-gray-400/50';
      default:
        return 'bg-gray-500/30 text-gray-200 border-gray-400/50';
    }
  };

  return (
    <div
      onClick={onClick}
      className="glass-transparent rounded-xl p-6 cursor-pointer group hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors">
          {project.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-gray-300 text-xs transition-colors"
              title="Delete project"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-white/70">
        {project.start_date && (
          <div className="flex items-center">
            <span className="font-medium mr-1">Start:</span>
            {format(new Date(project.start_date), 'MMM dd, yyyy')}
          </div>
        )}
        {project.end_date && (
          <div className="flex items-center">
            <span className="font-medium mr-1">End:</span>
            {format(new Date(project.end_date), 'MMM dd, yyyy')}
          </div>
        )}
        {project.created_by_name && (
          <div className="flex items-center">
            <span className="font-medium mr-1">By:</span>
            {project.created_by_name}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
