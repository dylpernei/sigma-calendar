import React from 'react';
import { format } from 'date-fns';
import { getEventsForDate } from '../../utils/dataProcessor';
import EventCard from './EventCard';

// Compact event card for mini view
function MiniEventCard({ event, onClick, onSecondaryClick }) {
  return (
    <div className="border border-border rounded-md p-2 hover:shadow-sm transition-shadow">
      <div 
        className="cursor-pointer"
        onClick={() => onClick && onClick()}
      >
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm truncate flex-1">{event.title}</h4>
          <span 
            className="inline-block w-3 h-3 rounded-full ml-2 flex-shrink-0"
            style={{ backgroundColor: event.color }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {event.allDay 
            ? 'All day' 
            : `${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`
          }
        </div>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>
    </div>
  );
}

function DayView({ 
  currentDate, 
  events, 
  settings, 
  onEventClick, 
  onEventModalOpen, 
  onEventPreviewOpen, 
  onDateClick,
  mini = false
}) {
  const dayEvents = getEventsForDate(events, currentDate);

  // Mini view - compact for smaller viewports
  if (mini) {
    return (
      <div className="h-full p-3 overflow-auto">
        <div className="w-full">
          <div className="mb-3 text-center">
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'EEEE, MMMM d')}
            </h3>
          </div>
          <div className="space-y-2">
            {dayEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-sm text-muted-foreground">No events for this day</div>
              </div>
            ) : (
              dayEvents.map((event) => (
                <MiniEventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventModalOpen && onEventModalOpen(event)}
                  onSecondaryClick={() => onEventClick && onEventClick(event.id, format(currentDate, 'yyyy-MM-dd'), event)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular day view
  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No events for this day</div>
            </div>
          ) : (
            dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventModalOpen && onEventModalOpen(event)}
                onSecondaryClick={() => onEventClick && onEventClick(event.id, format(currentDate, 'yyyy-MM-dd'), event)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DayView; 