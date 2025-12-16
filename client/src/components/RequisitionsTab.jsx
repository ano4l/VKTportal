import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const RequisitionsTab = () => {
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'ZAR',
    type: 'monetary',
    priority: 'normal',
    requested_date: '',
    required_date: '',
    justification: ''
  });
  const [statusData, setStatusData] = useState({
    status: 'pending',
    admin_notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const response = await axios.get('/api/requisitions');
      setRequisitions(response.data);
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/requisitions', formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        amount: '',
        currency: 'ZAR',
        type: 'monetary',
        priority: 'normal',
        requested_date: '',
        required_date: '',
        justification: ''
      });
      fetchRequisitions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create requisition');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.put(`/api/requisitions/${selectedRequisition.id}/status`, statusData);
      setSelectedRequisition(null);
      setStatusData({ status: 'pending', admin_notes: '' });
      fetchRequisitions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this requisition?')) return;

    try {
      await axios.delete(`/api/requisitions/${id}`);
      fetchRequisitions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete requisition');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-gray-600/40 text-gray-200 border-gray-500/50';
      case 'rejected':
        return 'bg-gray-700/40 text-gray-300 border-gray-600/50';
      case 'processing':
        return 'bg-gray-500/40 text-gray-200 border-gray-400/50';
      case 'completed':
        return 'bg-gray-600/40 text-gray-200 border-gray-500/50';
      default:
        return 'bg-gray-500/30 text-gray-200 border-gray-400/50';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-white/70 animate-pulse">Loading requisitions...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Payment Requisitions</h3>
        {user?.role !== 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300 text-sm font-medium"
          >
            New Requisition
          </button>
        )}
      </div>

      {requisitions.length === 0 ? (
        <div className="glass-ultra-transparent rounded-xl p-8 text-center text-white/70">
          No requisitions at this time
        </div>
      ) : (
        <div className="space-y-4">
          {requisitions.map((req, index) => (
            <div
              key={req.id}
              className="glass-transparent rounded-xl p-6 animate-fade-in hover:bg-white/10 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{req.title}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-sm text-white/80 mb-2">
                    <span className="font-medium">Amount:</span> {req.currency} {parseFloat(req.amount).toLocaleString()}
                    {' • '}
                    <span className="font-medium">Type:</span> {req.type}
                    {' • '}
                    <span className="font-medium">Priority:</span> {req.priority}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="text-xs text-white/60">
                      Requested by: {req.user_name} ({req.user_email})
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {user?.role === 'admin' && req.status === 'pending' && (
                    <button
                      onClick={() => {
                        setSelectedRequisition(req);
                        setStatusData({ status: 'approved', admin_notes: req.admin_notes || '' });
                      }}
                      className="glass-button px-3 py-1 text-xs text-white rounded-lg hover:scale-105 transition-all duration-300"
                    >
                      Review
                    </button>
                  )}
                  {(user?.role === 'admin' || (req.status === 'pending' && req.user_id === user?.id)) && (
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="px-3 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-white/90 mb-3">{req.description}</p>
              {req.justification && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-white/80">Justification: </span>
                  <span className="text-sm text-white/90">{req.justification}</span>
                </div>
              )}
              {req.admin_notes && (
                <div className="mb-3 p-3 glass rounded-lg">
                  <span className="text-sm font-medium text-white/80">Admin Notes: </span>
                  <span className="text-sm text-white/90">{req.admin_notes}</span>
                </div>
              )}
              <div className="text-xs text-white/60">
                Requested: {format(new Date(req.requested_date), 'MMM dd, yyyy')}
                {req.required_date && ` • Required: ${format(new Date(req.required_date), 'MMM dd, yyyy')}`}
                {req.processed_at && ` • Processed: ${format(new Date(req.processed_at), 'MMM dd, yyyy')}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-4">New Payment Requisition</h3>

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
                  required
                  rows={4}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  >
                    <option value="ZAR">ZAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  >
                    <option value="monetary">Monetary</option>
                    <option value="resource">Resource</option>
                    <option value="equipment">Equipment</option>
                    <option value="training">Training</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Requested Date</label>
                  <input
                    type="date"
                    value={formData.requested_date}
                    onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Required Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.required_date}
                    onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Justification (Optional)</label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={3}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-virtukey-dark text-white rounded-md hover:bg-opacity-90"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal (Admin) */}
      {selectedRequisition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-4">Update Requisition Status</h3>

            {error && (
              <div className="glass-card bg-gray-700/40 border-gray-600/50 text-gray-200 px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Admin Notes</label>
                <textarea
                  value={statusData.admin_notes}
                  onChange={(e) => setStatusData({ ...statusData, admin_notes: e.target.value })}
                  rows={4}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequisition(null);
                    setStatusData({ status: 'pending', admin_notes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-virtukey-dark text-white rounded-md hover:bg-opacity-90"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequisitionsTab;

