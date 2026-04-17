import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { getEventsForDate } from '../../utils/dataProcessor';
import EventChip from './EventChip';
import Tooltip, { DateTooltip, EventTooltip } from '../ui/tooltip';

function MonthView({ 
  currentDate, 
  events, 
  settings, 
  onEventClick, 
  onEventModalOpen, 
  onEventPreviewOpen, 
  onDayEventsOpen,
  onDateClick,
  mini = false
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: settings.weekStartsOn });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: settings.weekStartsOn });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Adjust weekdays based on settings
  if (settings.weekStartsOn === 1) {
    weekDays.push(weekDays.shift()); // Move Sunday to end
  }

  // Mini view - compact like YearView but for current month only
  if (mini) {
    const miniWeekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    if (settings.weekStartsOn === 1) {
      miniWeekDays.push(miniWeekDays.shift());
    }

    return (
      <div className="h-full p-4">
        <h3 className="text-lg font-semibold mb-3 text-center">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <div className="grid grid-cols-7 gap-1 max-w-full">
          {/* Mini weekday headers */}
          {miniWeekDays.map((day, index) => (
            <div key={index} className="text-xs text-center text-muted-foreground p-1">
              {day}
            </div>
          ))}
          
        {/* Mini calendar days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
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

            const interactionMode = settings.eventInteractionMode || 'auto';
            const allowPreviewModal = interactionMode !== 'tooltip';

            const dayComponent = (
              <div
                className={`
                  text-xs p-1 text-center relative cursor-pointer hover:bg-muted/50 rounded min-h-5
                  ${!isCurrentMonth ? 'text-muted-foreground' : ''}
                  ${isTodayDate ? 'bg-blue-100 dark:bg-blue-950/30' : ''}
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

  // Regular month view
  return (
    <div className="h-full flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`
                border-r border-b border-border p-2 min-h-24 flex flex-col
                ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                ${isTodayDate ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
              `}
            >
              {/* Day number with date tooltip */}
              {settings.showDateTooltips ? (
                <DateTooltip date={day} onDateClick={onDateClick}>
                  <div className={`
                    text-sm font-medium mb-1 cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5
                    ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                </DateTooltip>
              ) : (
                <div 
                  className={`
                    text-sm font-medium mb-1 cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5
                    ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}
                  `}
                  onClick={() => onDateClick && onDateClick(day)}
                >
                  {format(day, 'd')}
                </div>
              )}

              {/* Events */}
              <div className="flex-1 space-y-1 min-w-0">
                {dayEvents.slice(0, settings.dayMaxEvents || 3).map((event) => {
                  // Determine the appropriate click handler based on interaction mode
                  const getEventClickHandler = () => {
                    const mode = settings.eventInteractionMode || 'auto';
                    if (mode === 'tooltip') {
                      // Tooltip mode: only trigger Sigma actions, no modal
                      return () => onEventClick && onEventClick(event.id, format(day, 'yyyy-MM-dd'), event);
                    } else {
                      // Modal, both, or auto modes: open modal
                      return () => onEventModalOpen && onEventModalOpen(event);
                    }
                  };

                  const eventChip = (
                    <EventChip
                      event={event}
                      onClick={getEventClickHandler()}
                      compact={true}
                    />
                  );

                  // Respect interaction mode settings
                  if (!settings.showEventTooltips || settings.eventInteractionMode === 'modal') {
                    return <div key={`${event.id}-${day.toISOString()}`} className="min-w-0 w-full">{eventChip}</div>;
                  }

                  return (
                    <EventTooltip 
                      key={`${event.id}-${day.toISOString()}`} 
                      event={event}
                      delay={settings.tooltipDelay}
                      triggerClassName="block w-full min-w-0"
                    >
                      {eventChip}
                    </EventTooltip>
                  );
                })}
                {dayEvents.length > (settings.dayMaxEvents || 3) && (
                  <div 
                    className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => onDayEventsOpen && onDayEventsOpen(day, dayEvents)}
                  >
                    +{dayEvents.length - (settings.dayMaxEvents || 3)} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthView; 