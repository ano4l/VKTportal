import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ item, itemType, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [item, itemType]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = itemType === 'project' 
        ? { project_id: item.id }
        : { meeting_id: item.id };
      
      const response = await axios.get('/api/comments', { params });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const data = {
        content: newComment,
        [itemType === 'project' ? 'project_id' : 'meeting_id']: item.id
      };

      await axios.post('/api/comments', data);
      setNewComment('');
      fetchComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`/api/comments/${commentId}`);
      fetchComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              {item.description && (
                <p className="text-white/80 text-sm">{item.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="glass-button w-8 h-8 rounded-lg text-white hover:scale-110 transition-all duration-300 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-white/70 py-8 animate-pulse">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-white/70 py-8">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="glass-transparent p-4 rounded-xl animate-fade-in hover:bg-white/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-white text-sm">
                        {comment.user_name}
                      </span>
                      <span className="text-white/60 text-xs ml-2">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy • h:mm a')}
                      </span>
                    </div>
                    {comment.user_id === user?.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-gray-300 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-white/90 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-6 border-t border-white/20">
          <form onSubmit={handleSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows="3"
              className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
