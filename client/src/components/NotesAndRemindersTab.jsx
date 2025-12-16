import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

const NotesAndRemindersTab = () => {
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activeView, setActiveView] = useState('notes'); // 'notes' or 'reminders'
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editingReminder, setEditingReminder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [noteForm, setNoteForm] = useState({ title: '', content: '', color: 'default' });
  const [reminderForm, setReminderForm] = useState({ 
    title: '', 
    description: '', 
    reminder_date: '', 
    priority: 'normal' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, remindersRes] = await Promise.all([
        axios.get('/api/notes'),
        axios.get('/api/reminders')
      ]);
      setNotes(notesRes.data);
      setReminders(remindersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await axios.put(`/api/notes/${editingNote.id}`, noteForm);
      } else {
        await axios.post('/api/notes', noteForm);
      }
      setShowNoteModal(false);
      setEditingNote(null);
      setNoteForm({ title: '', content: '', color: 'default' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save note');
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      if (editingReminder) {
        await axios.put(`/api/reminders/${editingReminder.id}`, reminderForm);
      } else {
        await axios.post('/api/reminders', reminderForm);
      }
      setShowReminderModal(false);
      setEditingReminder(null);
      setReminderForm({ title: '', description: '', reminder_date: '', priority: 'normal' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save reminder');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await axios.delete(`/api/notes/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete note');
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await axios.delete(`/api/reminders/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete reminder');
    }
  };

  const handleToggleReminder = async (reminder) => {
    try {
      await axios.put(`/api/reminders/${reminder.id}`, {
        ...reminder,
        is_completed: reminder.is_completed ? 0 : 1
      });
      fetchData();
    } catch (error) {
      alert('Failed to update reminder');
    }
  };

  const getReminderStatus = (reminder) => {
    if (reminder.is_completed) return 'completed';
    const date = new Date(reminder.reminder_date);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'upcoming';
  };

  const colorClasses = {
    default: 'border-white/20',
    blue: 'border-blue-500/50 bg-blue-500/10',
    green: 'border-green-500/50 bg-green-500/10',
    yellow: 'border-yellow-500/50 bg-yellow-500/10',
    purple: 'border-purple-500/50 bg-purple-500/10',
    red: 'border-red-500/50 bg-red-500/10'
  };

  const priorityColors = {
    low: 'text-blue-400',
    normal: 'text-gray-400',
    high: 'text-yellow-400',
    urgent: 'text-red-400'
  };

  if (loading) {
    return (
      <div className="glass-ultra-transparent rounded-xl p-8 text-center text-white/70 animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Toggle */}
      <div className="glass-transparent rounded-xl p-1 sm:p-2 flex gap-1 sm:gap-2">
        <button
          onClick={() => setActiveView('notes')}
          className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            activeView === 'notes'
              ? 'glass text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Notes ({notes.length})
        </button>
        <button
          onClick={() => setActiveView('reminders')}
          className={`flex-1 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            activeView === 'reminders'
              ? 'glass text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Reminders ({reminders.filter(r => !r.is_completed).length})
        </button>
      </div>

      {/* Notes View */}
      {activeView === 'notes' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Personal Notes</h3>
            <button
              onClick={() => {
                setEditingNote(null);
                setNoteForm({ title: '', content: '', color: 'default' });
                setShowNoteModal(true);
              }}
              className="glass-button px-3 sm:px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
            >
              + New Note
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="glass-ultra-transparent rounded-xl p-6 sm:p-8 text-center text-white/70">
              No notes yet. Create your first note!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`glass-transparent rounded-xl p-3 sm:p-4 border-2 ${colorClasses[note.color] || colorClasses.default} hover:bg-white/10 transition-all duration-300`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white text-sm sm:text-base flex-1">{note.title || 'Untitled'}</h4>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setNoteForm({ title: note.title || '', content: note.content, color: note.color || 'default' });
                          setShowNoteModal(true);
                        }}
                        className="text-white/60 hover:text-white text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-white/60 hover:text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                  <div className="mt-2 text-xs text-white/50">
                    {format(new Date(note.updated_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reminders View */}
      {activeView === 'reminders' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Reminders</h3>
            <button
              onClick={() => {
                setEditingReminder(null);
                setReminderForm({ title: '', description: '', reminder_date: '', priority: 'normal' });
                setShowReminderModal(true);
              }}
              className="glass-button px-3 sm:px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
            >
              + New Reminder
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="glass-ultra-transparent rounded-xl p-6 sm:p-8 text-center text-white/70">
              No reminders yet. Create your first reminder!
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {reminders.map((reminder) => {
                const status = getReminderStatus(reminder);
                const isOverdue = status === 'overdue' && !reminder.is_completed;
                
                return (
                  <div
                    key={reminder.id}
                    className={`glass-transparent rounded-xl p-3 sm:p-4 border-2 ${
                      reminder.is_completed
                        ? 'border-gray-600/50 opacity-60'
                        : isOverdue
                        ? 'border-red-500/50 bg-red-500/10'
                        : status === 'today'
                        ? 'border-yellow-500/50 bg-yellow-500/10'
                        : 'border-white/20'
                    } hover:bg-white/10 transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={reminder.is_completed === 1}
                          onChange={() => handleToggleReminder(reminder)}
                          className="mt-1 w-4 h-4 rounded border-white/30 bg-transparent text-white focus:ring-white/50"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold text-sm sm:text-base ${
                              reminder.is_completed ? 'line-through text-white/50' : 'text-white'
                            }`}>
                              {reminder.title}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[reminder.priority] || priorityColors.normal} bg-white/10`}>
                              {reminder.priority}
                            </span>
                          </div>
                          {reminder.description && (
                            <p className="text-white/70 text-xs sm:text-sm mb-2">{reminder.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>📅 {format(new Date(reminder.reminder_date), 'MMM dd, yyyy • h:mm a')}</span>
                            {status === 'today' && !reminder.is_completed && (
                              <span className="text-yellow-400 font-medium">• Today</span>
                            )}
                            {status === 'tomorrow' && !reminder.is_completed && (
                              <span className="text-blue-400 font-medium">• Tomorrow</span>
                            )}
                            {isOverdue && (
                              <span className="text-red-400 font-medium">• Overdue</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingReminder(reminder);
                            setReminderForm({
                              title: reminder.title,
                              description: reminder.description || '',
                              reminder_date: format(new Date(reminder.reminder_date), "yyyy-MM-dd'T'HH:mm"),
                              priority: reminder.priority
                            });
                            setShowReminderModal(true);
                          }}
                          className="text-white/60 hover:text-white text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-white/60 hover:text-white text-xs sm:text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-scale-in modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{editingNote ? 'Edit Note' : 'Create Note'}</h3>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setEditingNote(null);
                  setNoteForm({ title: '', content: '', color: 'default' });
                }}
                className="glass-button w-8 h-8 rounded-lg text-white hover:scale-110 transition-all duration-300 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  placeholder="Note title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Content</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  required
                  rows={8}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-none"
                  placeholder="Write your note here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['default', 'blue', 'green', 'yellow', 'purple', 'red'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, color })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        noteForm.color === color
                          ? 'glass text-white scale-105'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteModal(false);
                    setEditingNote(null);
                    setNoteForm({ title: '', content: '', color: 'default' });
                  }}
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  {editingNote ? 'Update' : 'Create'} Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl animate-scale-in modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{editingReminder ? 'Edit Reminder' : 'Create Reminder'}</h3>
              <button
                onClick={() => {
                  setShowReminderModal(false);
                  setEditingReminder(null);
                  setReminderForm({ title: '', description: '', reminder_date: '', priority: 'normal' });
                }}
                className="glass-button w-8 h-8 rounded-lg text-white hover:scale-110 transition-all duration-300 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Title</label>
                <input
                  type="text"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                  placeholder="Reminder title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Description (Optional)</label>
                <textarea
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                  rows={4}
                  className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50 resize-none"
                  placeholder="Additional details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={reminderForm.reminder_date}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })}
                    required
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Priority</label>
                  <select
                    value={reminderForm.priority}
                    onChange={(e) => setReminderForm({ ...reminderForm, priority: e.target.value })}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white"
                  >
                    <option value="low" className="bg-gray-800">Low</option>
                    <option value="normal" className="bg-gray-800">Normal</option>
                    <option value="high" className="bg-gray-800">High</option>
                    <option value="urgent" className="bg-gray-800">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReminderModal(false);
                    setEditingReminder(null);
                    setReminderForm({ title: '', description: '', reminder_date: '', priority: 'normal' });
                  }}
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glass-button px-4 py-2 text-white rounded-xl hover:scale-105 transition-all duration-300"
                >
                  {editingReminder ? 'Update' : 'Create'} Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesAndRemindersTab;

