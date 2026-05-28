import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { getEventsForDate } from '../../utils/dataProcessor';
import EventChip from './EventChip';
import { DateTooltip, EventTooltip } from '../ui/tooltip';
import { computeWeekBars, BAR_HEIGHT, LANE_GAP } from '../../utils/weekBars';

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

  // Regular week view — all events render as continuous horizontal bands.
  const allBars = computeWeekBars(days, events);
  const usedLanes = allBars.reduce((m, b) => Math.max(m, b.lane + 1), 0);
  const barsRowHeight = usedLanes * (BAR_HEIGHT + LANE_GAP) + (usedLanes > 0 ? LANE_GAP * 2 : 0);

  const getEventClickHandler = (event, day) => {
    const mode = settings.eventInteractionMode || 'auto';
    if (mode === 'tooltip') {
      return () => onEventClick && onEventClick(event.id, format(day, 'yyyy-MM-dd'), event);
    }
    return () => onEventModalOpen && onEventModalOpen(event);
  };

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

      {/* All events as horizontal bands */}
      <div
        className="relative flex-1"
        style={{ minHeight: `${barsRowHeight}px` }}
      >
        {/* Column backgrounds */}
        {days.map((day, i) => (
          <div
            key={`col-${day.toISOString()}`}
            className={`absolute top-0 bottom-0 ${i < 6 ? 'border-r border-border' : ''} ${
              isToday(day) ? 'bg-blue-50 dark:bg-blue-950/20' : ''
            }`}
            style={{ left: `${(i / 7) * 100}%`, width: `${(1 / 7) * 100}%` }}
          />
        ))}

        {/* Event bars */}
        {allBars.map((bar) => {
          const { event, startCol, endCol, lane, clippedStart, clippedEnd } = bar;
          const span = endCol - startCol + 1;
          const left = `calc(${(startCol / 7) * 100}% + 4px)`;
          const width = `calc(${(span / 7) * 100}% - 8px)`;
          const top = `${LANE_GAP + lane * (BAR_HEIGHT + LANE_GAP)}px`;

          const handleClick = getEventClickHandler(event, event.start);
          const chip = (
            <EventChip
              event={event}
              onClick={handleClick}
              compact={false}
              multiDay={endCol > startCol}
              clippedStart={clippedStart}
              clippedEnd={clippedEnd}
            />
          );
          const wrapped = (!settings.showEventTooltips || settings.eventInteractionMode === 'modal')
            ? chip
            : (
              <EventTooltip event={event} delay={settings.tooltipDelay} triggerClassName="block w-full">
                {chip}
              </EventTooltip>
            );

          return (
            <div
              key={`${event.id}-${lane}`}
              className="absolute"
              style={{ left, width, top, height: `${BAR_HEIGHT}px` }}
            >
              {wrapped}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView; 