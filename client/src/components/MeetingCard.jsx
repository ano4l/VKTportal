import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MeetingCard = ({ meeting, onClick, onDelete }) => {
  const { user } = useAuth();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this meeting? This will also delete all associated comments and assignments.')) return;

    try {
      await axios.delete(`/api/meetings/${meeting.id}`);
      if (onDelete) onDelete();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete meeting');
    }
  };
  return (
    <div
      onClick={onClick}
      className="glass-transparent rounded-xl p-6 cursor-pointer group hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors">
          {meeting.title}
        </h4>
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-gray-300 text-xs transition-colors"
            title="Delete meeting"
          >
            ×
          </button>
        )}
      </div>

      {meeting.description && (
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{meeting.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-white/80">
          <span className="font-medium mr-2">📅</span>
          {format(new Date(meeting.meeting_date), 'MMM dd, yyyy • h:mm a')}
        </div>

        {meeting.location && (
          <div className="flex items-center text-white/80">
            <span className="font-medium mr-2">📍</span>
            {meeting.location}
          </div>
        )}

        {meeting.created_by_name && (
          <div className="flex items-center text-white/60 text-xs mt-3">
            <span className="font-medium mr-2">Created by:</span>
            {meeting.created_by_name}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;
