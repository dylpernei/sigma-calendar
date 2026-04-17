import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { getEventsForDate } from '../../utils/dataProcessor';
import EventChip from './EventChip';
import { DateTooltip, EventTooltip } from '../ui/tooltip';

function WeekView({ 
  currentDate, 
  events, 
  settings, 
  onEventClick, 
  onEventModalOpen, 
  onEventPreviewOpen, 
  onDateClick,
  mini = false
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Mini view - more compact for mobile
  if (mini) {
    return (
      <div className="h-full flex flex-col p-2">
        {/* Compact week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day) => {
            const dayEvents = getEventsForDate(events, day);
            const dayComponent = (
              <div 
                className={`
                  text-center p-1 border border-border rounded cursor-pointer hover:bg-muted/50
                  ${isToday(day) ? 'bg-blue-100 dark:bg-blue-950/30' : ''}
                `}
                onClick={() => onDateClick && onDateClick(day)}
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {format(day, 'EEE')}
                </div>
                <div className={`
                  text-sm font-semibold
                  ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''}
                `}>
                  {format(day, 'd')}
                </div>
                {dayEvents.length > 0 && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            );

            return settings.showDateTooltips ? (
              <DateTooltip key={day.toISOString()} date={day} onDateClick={onDateClick}>
                {dayComponent}
              </DateTooltip>
            ) : (
              <div key={day.toISOString()}>
                {dayComponent}
              </div>
            );
          })}
        </div>
        
        {/* Compact event list */}
        <div className="flex-1 overflow-auto">
          {days.map((day) => {
            const dayEvents = getEventsForDate(events, day);
            if (dayEvents.length === 0) return null;
            
            return (
              <div key={day.toISOString()} className="mb-3">
                <h4 className="text-sm font-medium mb-1">
                  {format(day, 'EEEE, MMM d')}
                </h4>
                <div className="space-y-1 pl-2">
                  {dayEvents.slice(0, 3).map((event) => {
                    const mode = settings.eventInteractionMode || 'auto';
                    const handleClick = () => {
                      if (mode === 'tooltip') {
                        // Tooltip mode: only trigger Sigma actions, no modal
                        onEventClick && onEventClick(event.id, format(day, 'yyyy-MM-dd'), event);
                      } else {
                        // Modal, both, or auto modes: open modal
                        onEventModalOpen && onEventModalOpen(event);
                      }
                    };

                    return (
                      <div 
                        key={`${event.id}-${day.toISOString()}`}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.color, color: event.textColor || 'white' }}
                        onClick={handleClick}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      +{dayEvents.length - 3} more
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

  // Regular week view
  return (
    <div className="h-full flex flex-col">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((day) => {
          const dayHeader = (
            <div className="p-3 text-center border-r border-border last:border-r-0 cursor-pointer hover:bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground">
                {format(day, 'EEE')}
              </div>
              <div className={`
                text-lg font-semibold mt-1
                ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''}
              `}>
                {format(day, 'd')}
              </div>
            </div>
          );

          return settings.showDateTooltips ? (
            <DateTooltip key={day.toISOString()} date={day} onDateClick={onDateClick}>
              {dayHeader}
            </DateTooltip>
          ) : (
            <div key={day.toISOString()} onClick={() => onDateClick && onDateClick(day)}>
              {dayHeader}
            </div>
          );
        })}
      </div>

      {/* Week grid */}
      <div className="flex-1 grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day);

          return (
            <div
              key={day.toISOString()}
              className={`
                border-r border-border p-2 min-h-full flex flex-col
                ${isToday(day) ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
              `}
            >
              <div className="space-y-1 min-w-0">
                {dayEvents.map((event) => {
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
                      compact={false}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView; 