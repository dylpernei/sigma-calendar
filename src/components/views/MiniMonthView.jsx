import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { getEventsForDate } from '../../utils/dataProcessor';
import Tooltip, { DateTooltip } from '../ui/tooltip';

function MiniMonthView({ 
  month, 
  events, 
  settings, 
  onEventClick, 
  onEventPreviewOpen, 
  onDateClick 
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: settings.weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: settings.weekStartsOn });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-center">
        {format(month, 'MMMM')}
      </h3>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Mini weekday headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-xs text-center text-muted-foreground p-1">
            {day}
          </div>
        ))}
        
        {/* Mini calendar days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day);
          const isCurrentMonth = isSameMonth(day, month);
          const isTodayDate = isToday(day);
          const interactionMode = settings.eventInteractionMode || 'auto';
          const allowPreviewModal = interactionMode !== 'tooltip';

          const tooltipContent = dayEvents.length > 0 ? (
            <div className="text-center">
              <div className="font-semibold mb-1">
                {format(day, 'EEEE, MMMM d')}
              </div>
              <div className="text-xs text-gray-300 dark:text-gray-600 mb-2">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </div>
              {dayEvents.slice(0, 3).map(event => (
                <div key={event.id} className="text-xs mb-1">
                  <span 
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: event.color }}
                  />
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          ) : null;

          const dayComponent = (
            <div
              className={`
                text-xs p-1 text-center relative cursor-pointer hover:bg-muted/50
                ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                ${isTodayDate ? 'bg-blue-100 dark:bg-blue-950/30 rounded' : ''}
              `}
              onClick={() => {
                if (dayEvents.length > 0) {
                  if (allowPreviewModal) {
                    onEventPreviewOpen && onEventPreviewOpen(dayEvents[0]);
                  } else {
                    onEventClick && onEventClick(dayEvents[0].id, format(day, 'yyyy-MM-dd'), dayEvents[0]);
                  }
                } else {
                  onDateClick && onDateClick(day);
                }
              }}
            >
              {format(day, 'd')}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
              )}
            </div>
          );

          return (
            <div key={day.toISOString()} className="text-center">
              {dayEvents.length > 0 && tooltipContent && settings.showEventTooltips ? (
                <Tooltip content={tooltipContent} delay={settings.tooltipDelay}>
                  {dayComponent}
                </Tooltip>
              ) : settings.showDateTooltips ? (
                <DateTooltip date={day} onDateClick={onDateClick}>
                  {dayComponent}
                </DateTooltip>
              ) : (
                dayComponent
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MiniMonthView; 