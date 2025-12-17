import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const TasksTab = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, completed

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

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
    return <div className="text-center py-8 text-white/70 animate-pulse">Loading tasks...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-white">My Tasks</h3>
        <div className="flex gap-2">
          {['all', 'pending', 'in_progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'glass text-white'
                  : 'glass-transparent text-white/70 hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="glass-ultra-transparent rounded-xl p-8 text-center text-white/70">
          {filter === 'all' ? 'No tasks assigned to you yet' : `No ${filter.replace('_', ' ')} tasks`}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className={`glass-card rounded-xl p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
                    {task.due_date && (
                      <div>
                        <span className="font-medium">Due:</span>{' '}
                        <span className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-300' : ''}>
                          {format(new Date(task.due_date), 'MMM dd, yyyy')}
                        </span>
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
                <div className="flex flex-col gap-2">
                  {task.status !== 'completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                      className="glass-input px-3 py-2 rounded-lg text-white text-sm"
                    >
                      <option value="pending" className="bg-gray-800">Pending</option>
                      <option value="in_progress" className="bg-gray-800">In Progress</option>
                      <option value="completed" className="bg-gray-800">Completed</option>
                    </select>
                  )}
                  {task.status === 'completed' && (
                    <span className="px-3 py-2 text-sm text-white/70 text-center">Completed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksTab;

