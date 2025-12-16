import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import axios from 'axios';

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [currentDate]);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('/api/meetings');
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMeetingsForDate = (date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.meeting_date);
      return isSameDay(meetingDate, date);
    });
  };

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const todayMeetings = selectedDate ? getMeetingsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="text-center text-white/70 animate-pulse">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="glass-ultra-transparent rounded-xl p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={previousMonth}
          className="glass-button p-2 rounded-lg text-white hover:scale-110 transition-all duration-300"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button
          onClick={nextMonth}
          className="glass-button p-2 rounded-lg text-white hover:scale-110 transition-all duration-300"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-white/70 py-2">
            {day}
          </div>
        ))}

        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10" />
        ))}

        {daysInMonth.map(day => {
          const dayMeetings = getMeetingsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`h-10 text-sm rounded-lg transition-all duration-300 ${
                isToday
                  ? 'glass text-white font-semibold scale-110 border-2 border-white/30'
                  : isSelected
                  ? 'glass-transparent text-white border border-white/20'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}`}
            >
              <div className="flex flex-col items-center">
                <span>{format(day, 'd')}</span>
                {dayMeetings.length > 0 && (
                  <span className="text-xs">•</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-white/20 animate-fade-in">
          <h4 className="text-sm font-semibold text-white mb-2">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h4>
          {todayMeetings.length === 0 ? (
            <p className="text-sm text-white/70">No meetings scheduled</p>
          ) : (
            <div className="space-y-2">
              {todayMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  className="glass-transparent p-2 rounded-lg text-sm animate-scale-in hover:bg-white/10 transition-all duration-300"
                >
                  <div className="font-medium text-white">{meeting.title}</div>
                  <div className="text-xs text-white/70">
                    {format(new Date(meeting.meeting_date), 'h:mm a')}
                    {meeting.location && ` • ${meeting.location}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
